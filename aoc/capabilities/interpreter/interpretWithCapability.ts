import { runInterpreter } from '../../../interpreter/aiInterpreter';
import type { AIInterpreterResponse } from '../../../interpreter/interpreterTypes';

type InterpreterInput = {
  query: string;
  context?: Record<string, unknown>;
};

type InterpretWithCapabilityRequest = {
  resource: string;
  input: InterpreterInput;
};

function normalizeResource(resource: string): string {
  const [type, ref, ...rest] = resource.trim().split(':');
  if (!type || !ref || rest.length > 0) {
    throw new Error('Interpreter resource must be a canonical "type:ref" string.');
  }
  return `${type}:${ref}`;
}

function resolveCapabilityData(
  request: InterpretWithCapabilityRequest,
  normalizedResource: string
): unknown {
  const context = request.input.context ?? {};
  const resourceMap =
    context.resources && typeof context.resources === 'object' && !Array.isArray(context.resources)
      ? (context.resources as Record<string, unknown>)
      : undefined;

  if (resourceMap && normalizedResource in resourceMap) {
    return resourceMap[normalizedResource];
  }

  if (normalizedResource in context) {
    return context[normalizedResource];
  }

  if (
    context.hrkeyReference &&
    typeof context.hrkeyReference === 'object' &&
    !Array.isArray(context.hrkeyReference)
  ) {
    const hrkeyReference = context.hrkeyReference as Record<string, unknown>;
    if (normalizedResource in hrkeyReference) {
      return hrkeyReference[normalizedResource];
    }
  }

  throw new Error(`No capability-resolved data found for resource ${normalizedResource}.`);
}

function denyResponse(code: string, message: string): AIInterpreterResponse {
  return {
    allowed: false,
    error: { code, message },
    usage: { usageCount: 0 }
  };
}

export function interpretWithCapability(
  request: InterpretWithCapabilityRequest
): AIInterpreterResponse {
  try {
    const normalizedResource = normalizeResource(request.resource);
    const data = resolveCapabilityData(request, normalizedResource);

    return {
      allowed: true,
      result: {
        interpretation: runInterpreter(request.input.query, data),
        metadata: {
          resource: normalizedResource,
          source:
            request.input.context?.hrkeyReference !== undefined
              ? 'hrkey-reference'
              : 'capability-context'
        }
      },
      usage: { usageCount: 0 }
    };
  } catch (error) {
    return denyResponse('INTERPRETER_EXECUTION_FAILED', (error as Error).message);
  }
}

export { runInterpreter };
