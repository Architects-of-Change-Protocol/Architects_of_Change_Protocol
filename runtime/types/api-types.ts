export type RuntimeEndpoint =
  | '/enforcement/evaluate'
  | '/execution/authorize'
  | '/capability/mint';

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
