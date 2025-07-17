// Auth DTOs
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  statusCode: number;
  statusMessage: string;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      provider: string;
      email: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    role: {
      id: string;
      code: string | null;
      name: string;
    };
    access_token: string;
    refresh_token: string;
    expires_in: number; // Token validity in seconds
    token_type: string; // "Bearer"
  };
}

export interface RegisterResponseDTO {
  statusCode: number;
  statusMessage: string;
  message: string;
  data: any;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
}

// Updated User interface to match backend structure
export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  picture?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  preferences?: {
    preferredInstructorId?: string;
    preferredCenterId?: string;
    preferredDays?: string[];
    preferredTimes?: string[];
  };
  // Role information
  role?: {
    id: string;
    code: string | null;
    name: string;
  };
}

// Token storage interface
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number; // Calculated expiration timestamp
}

export interface RegisterPushTokenDTO {
  token: string;
  device_type?: "ios" | "android" | "windows" | "macos" | "web";
}
