import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import { DEFAULT_API_KEYS, InMemoryApiKeyStore } from '../auth/apiKeys';
import { InMemoryRateLimiter } from '../limits/rateLimiter';
import { RuntimeLogger } from '../logging/logger';
import type { ApiResponse, RuntimeEndpoint } from '../types/api-types';
import { authAndLimit } from './middleware';
import { DEFAULT_RUNTIME_CORE, deriveDecision, executeRoute, maybeResolveUsageConsumerId, type RuntimeCore } from './routes';
import { isMeteredEndpoint } from '../usage';
import { enforceCapabilityAccess, type EnforcementMode } from '../enforcement';

const POST_ENDPOINTS: RuntimeEndpoint[] = [
  '/enforcement/evaluate',
  '/execution/authorize',
  '/capability/mint',
  '/payout/execute',
  '/payout/callback',
  '/trust/credential/register',
  '/trust/verify',
  '/trust/consent/grant',
  '/data/access',
];

const GET_ENDPOINTS: RuntimeEndpoint[] = ['/audit/events', '/usage/summary'];

export type RuntimeServerDeps = {
  apiKeyStore?: InMemoryApiKeyStore;
  rateLimiter?: InMemoryRateLimiter;
  logger?: RuntimeLogger;
  core?: RuntimeCore;
  capabilitySecret?: string;
  enforcementMode?: EnforcementMode;
};

function sendJson(response: ServerResponse, statusCode: number, body: ApiResponse<unknown>): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(body));
}

async function parseJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of request) {
    chunks.push(chunk as Uint8Array);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw.trim() === '') {
    throw new Error('Request body cannot be empty.');
  }

  return JSON.parse(raw);
}

function parseGetPayload(url: URL): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    payload[key] = value;
  }
  return payload;
}

export function createRuntimeServer(deps: RuntimeServerDeps = {}) {
  const apiKeyStore = deps.apiKeyStore ?? new InMemoryApiKeyStore(DEFAULT_API_KEYS);
  const rateLimiter = deps.rateLimiter ?? new InMemoryRateLimiter();
  const logger = deps.logger ?? new RuntimeLogger();
  const core = deps.core ?? DEFAULT_RUNTIME_CORE;
  const capabilitySecret = deps.capabilitySecret ?? process.env.AOC_CAPABILITY_SECRET ?? 'aoc_runtime_capability_secret';
  const enforcementMode = deps.enforcementMode ?? (process.env.ENFORCEMENT_MODE === 'strict' ? 'strict' : 'soft');

  return createServer(async (request, response) => {
    if (request.url === undefined) {
      return sendJson(response, 404, {
        success: false,
        error: { code: 'ROUTE_NOT_FOUND', message: 'Unknown endpoint.' },
      });
    }

    const url = new URL(request.url, 'http://localhost');
    const pathname = url.pathname as RuntimeEndpoint;
    const method = request.method ?? 'GET';

    const isPost = method === 'POST' && POST_ENDPOINTS.includes(pathname);
    const isGet = method === 'GET' && GET_ENDPOINTS.includes(pathname);
    if (!isPost && !isGet) {
      return sendJson(response, 404, {
        success: false,
        error: { code: 'ROUTE_NOT_FOUND', message: `Unknown endpoint: ${pathname}` },
      });
    }

    const authResult = authAndLimit(request.headers, apiKeyStore, rateLimiter);
    if (!authResult.success || authResult.data === undefined) {
      logger.log({
        requestId: 'unauthenticated',
        endpoint: pathname,
        decision: 'deny',
        reason_code: authResult.error?.code ?? 'AUTH_UNKNOWN',
      });
      return sendJson(response, 401, authResult);
    }

    const { requestId } = authResult.data;

    let payload: unknown;
    if (method === 'GET') {
      payload = parseGetPayload(url);
    } else {
      try {
        payload = await parseJson(request);
      } catch (error) {
        logger.log({ requestId, endpoint: pathname, decision: 'deny', reason_code: 'REQUEST_PARSE_ERROR' });
        return sendJson(response, 400, {
          success: false,
          error: {
            code: 'REQUEST_PARSE_ERROR',
            message: error instanceof Error ? error.message : 'Invalid JSON payload.',
          },
        });
      }
    }

    if (
      method === 'POST' &&
      (pathname === '/data/access' || pathname === '/payout/execute') &&
      payload !== null &&
      typeof payload === 'object'
    ) {
      const requestPayload = payload as { subject_hash?: unknown; consumer_id?: unknown };
      const subjectId = typeof requestPayload.subject_hash === 'string' ? requestPayload.subject_hash : undefined;
      const requesterId = typeof requestPayload.consumer_id === 'string' ? requestPayload.consumer_id : undefined;

      if (subjectId !== undefined && requesterId !== undefined) {
        const capabilityResult = enforceCapabilityAccess({
          endpoint: pathname,
          headers: request.headers,
          payload,
          subject_id: subjectId,
          requester_id: requesterId,
          mode: enforcementMode,
          capabilitySecret,
        });

        if (capabilityResult.auditEvent !== undefined) {
          core.capabilityAuditService.recordEvent(capabilityResult.auditEvent);
        }

        if (!capabilityResult.allowed) {
          logger.log({
            requestId,
            endpoint: pathname,
            decision: 'deny',
            reason_code: capabilityResult.authorization?.reason_code ?? capabilityResult.reason_code,
          });
          return sendJson(response, 403, {
            success: false,
            error: {
              code: 'CAPABILITY_ACCESS_DENIED',
              message: `Capability enforcement denied access (${capabilityResult.reason_code}).`,
            },
          });
        }
      }
    }

    const routeResult = executeRoute(pathname, payload, core);
    if (!routeResult.success || routeResult.data === undefined) {
      logger.log({
        requestId,
        endpoint: pathname,
        decision: 'deny',
        reason_code: routeResult.error?.code ?? 'PROTOCOL_ERROR',
      });
      return sendJson(response, 400, routeResult);
    }

    const decisionInfo = deriveDecision(pathname, routeResult.data);
    logger.log({
      requestId,
      endpoint: pathname,
      decision: decisionInfo.decision,
      reason_code: decisionInfo.reasonCode,
    });

    if (isMeteredEndpoint(pathname)) {
      const consumerId = maybeResolveUsageConsumerId(pathname, payload);
      if (consumerId !== undefined) {
        const occurredAt = new Date().toISOString();
        Promise.resolve()
          .then(() => {
            core.usageService.recordUsage({
              consumer_id: consumerId,
              endpoint: pathname,
              decision: decisionInfo.decision,
              reason_code: decisionInfo.reasonCode,
              usedAt: new Date(occurredAt),
            });

            core.monetizationService.recordUsageAsBillable({
              consumer_id: consumerId,
              resource: pathname,
              action: 'execute',
              quantity: 1,
              occurred_at: occurredAt,
            });
          })
          .catch(() => {
            logger.log({
              requestId,
              endpoint: pathname,
              decision: 'deny',
              reason_code: 'USAGE_METERING_ERROR',
            });
          });
      }
    }

    return sendJson(response, 200, routeResult);
  });
}
