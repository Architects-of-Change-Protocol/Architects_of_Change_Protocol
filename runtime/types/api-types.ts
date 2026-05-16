export type RuntimeEndpoint =
  | '/enforcement/evaluate'
  | '/execution/authorize'
  | '/capability/mint'
  | '/access/request'
  | '/access/requests'
  | '/access/request/decision'
  | '/access/grants/active'
  | '/access/grant/revoke'
  | '/payout/execute'
  | '/payout/callback'
  | '/trust/credential/register'
  | '/trust/verify'
  | '/trust/consent/grant'
  | '/data/access'
  | '/audit/events'
  | '/usage/summary';

export type ApiRequest<T> = {
  requestId?: string;
  payload: T;
};

export type ErrorResponse = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
};

export type RuntimeMode = 'remote' | 'local';


export type {
  RuntimeTransportMetadata,
  RuntimeRequestEnvelope,
  RuntimeResponseEnvelope,
  RuntimeErrorEnvelope,
  RuntimeHandshakeEnvelope,
  RuntimeErrorCode,
} from './transport';
