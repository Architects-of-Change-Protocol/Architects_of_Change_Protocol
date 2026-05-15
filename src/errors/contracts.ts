export type ProtocolErrorCode =
  | "invalid_request"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "unavailable"
  | "internal";

export type ProtocolErrorContract = {
  code: ProtocolErrorCode;
  message: string;
  recoverable: boolean;
  details?: unknown;
};
