import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Registration, Session } from "@/types";
import { registrationsAPI } from "@/services/registration.service";
import { sessionsAPI } from "@/services/sessions.service";

interface SessionState {
  sessions: Session[];
  userRegistrations: Registration[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  fetchUserRegistrations: () => Promise<void>;
  searchSessions: (query: string) => Promise<Session[]>;
  registerForSession: (sessionId: string) => Promise<void>;
  cancelRegistration: (registrationId: string) => Promise<void>;
  getSessionById: (id: string) => Promise<Session | null>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      userRegistrations: [],
      isLoading: false,
      error: null,

      fetchSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await sessionsAPI.getAllSessions();
          set({
            sessions,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching sessions:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch sessions",
            isLoading: false,
          });
        }
      },

      fetchUserRegistrations: async () => {
        set({ isLoading: true, error: null });
        try {
          const registrations = await registrationsAPI.getUserRegistrations();
          set({
            userRegistrations: registrations,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching user registrations:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch registrations",
            isLoading: false,
          });
        }
      },

      searchSessions: async (query: string): Promise<Session[]> => {
        try {
          return await sessionsAPI.searchSessions(query);
        } catch (error) {
          console.error("Error searching sessions:", error);
          return [];
        }
      },

      registerForSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          await sessionsAPI.registerForSession(sessionId);

          // Refresh user registrations to include the new registration
          await get().fetchUserRegistrations();

          set({ isLoading: false });
        } catch (error) {
          console.error("Error registering for session:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to register for session",
            isLoading: false,
          });
          throw error;
        }
      },

      cancelRegistration: async (registrationId: string) => {
        set({ isLoading: true, error: null });
        try {
          await registrationsAPI.cancelRegistration(registrationId);

          // Remove the cancelled registration from local state
          set((state) => ({
            userRegistrations: state.userRegistrations.filter(
              (registration) => registration.id !== registrationId
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error cancelling registration:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to cancel registration",
            isLoading: false,
          });
          throw error;
        }
      },

      getSessionById: async (id: string): Promise<Session | null> => {
        try {
          return await sessionsAPI.getSessionById(id);
        } catch (error) {
          console.error("Error fetching session by ID:", error);
          return null;
        }
      },
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
