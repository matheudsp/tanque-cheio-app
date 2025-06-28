export interface responseBase {
  statusCode: number;
  statusMessage: string;
  message: string;
}

// API Error response structure
export interface ApiErrorResponse {
  statusCode: number;
  statusMessage: string;
  message: string;
  error?: string;
}
