
// Auth DTOs
export interface RegisterUserDto {
  name:string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

// Updated response types to match your backend
export interface LoginResponseDto {
  statusCode: number;
  statusMessage: string;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
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
  data: {
    user: {
      id: string;
      name: string;
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
    expires_in: number;
    token_type: string;
  };
}

// Updated User interface to match backend structure
export interface User {
  id: string;
  name: string;
  email: string;
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

// API Error response structure
export interface ApiErrorResponse {
  statusCode: number;
  statusMessage: string;
  message: string;
  error?: string;
}

export interface Session {
  id: string;
  date: string; // ISO date string
  datetime?: string; // Alternative field name
  duration_minutes: number;
  max_capacity: number;
  price: number;
  instructor: string;
  created_at: string;
  // Additional fields that might be in your Session model
  scenario?: Scenario;
  location?: string;
  topic?: string;
  notes?: string;
  status?: string;
}

export interface Registration {
  id: string | number; // Allow both string and number IDs
  user_id?: string;
  session_id?: string;
  payment_status?: string;
  score?: number;
  payment_id?: string;
  created_at?: string;
  // Include session details when populated
  session?: Session;
  user?: User;
  // Additional fields from server response
  feedback?: string;
  transmissionType?: string;
  completed?: boolean;
  paid?: boolean;
}

// Legacy types for backward compatibility
export interface Scenario {
  scenarioID: number;
  name: string;
  environmentType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

// Map Session to legacy Lesson for frontend compatibility
export interface Lesson {
  id: string;
  instructorId: string;
  centerId: string;
  scenario: Scenario;
  date: Date;
  duration: number;
  status: string;
  topic: string;
  notes: string;
  price: number;
  location: string;
  rating?: number;
  feedback?: string;
}

// Add BookingFormData type for frontend forms
export interface BookingFormData {
  sessionId?: string;
  date?: Date;
  time?: string;
  duration?: number;
  instructorId?: string;
  topic?: string;
  notes?: string;
}
