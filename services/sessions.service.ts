import  { Session } from "@/types";
import  { apiRequest } from "./api";

// Sessions API (keeping existing structure)
export const sessionsAPI = {
  getAllSessions: async (): Promise<Session[]> => {
    return apiRequest("/sessions");
  },

  searchSessions: async (query: string): Promise<Session[]> => {
    return apiRequest(`/sessions/search?query=${encodeURIComponent(query)}`);
  },

  getSessionById: async (id: string): Promise<Session> => {
    return apiRequest(`/sessions/${id}`);
  },

  registerForSession: async (sessionId: string): Promise<any> => {
    return apiRequest(`/sessions/${sessionId}/register`, {
      method: "POST",
    });
  },
};