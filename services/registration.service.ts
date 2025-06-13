import { Registration } from "@/types";
import { apiRequest } from "./api";

// Registrations API (keeping existing structure)
export const registrationsAPI = {
  getUserRegistrations: async (): Promise<Registration[]> => {
    try {
      return await apiRequest("/registrations", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Error fetching registrations:", error);
      return [];
    }
  },

  getRegistrationById: async (id: string): Promise<Registration> => {
    return apiRequest(`/registrations/${id}`);
  },

  cancelRegistration: async (id: string): Promise<void> => {
    return apiRequest(`/registrations/${id}`, {
      method: "DELETE",
    });
  },
};
