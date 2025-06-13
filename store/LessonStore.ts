import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lesson, Session, Registration } from "@/types";
import { lessonsAPI } from "@/services/lessons.service";
import { sessionsAPI } from "@/services/sessions.service";
import { registrationsAPI } from "@/services/registration.service";

interface LessonState {
  upcomingLessons: Lesson[];
  pastLessons: Lesson[];
  userRegistrations: Registration[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLessons: () => Promise<void>;
  fetchUserRegistrations: () => Promise<void>;
  bookLesson: (sessionId: string) => Promise<void>;
  cancelLesson: (registrationId: string) => Promise<void>;
  searchSessions: (query: string) => Promise<Session[]>;
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      upcomingLessons: [],
      pastLessons: [],
      userRegistrations: [],
      isLoading: false,
      error: null,

      fetchLessons: async () => {
        set({ isLoading: true, error: null });
        try {
          // Fetch all available sessions and convert to lessons
          const lessons = await lessonsAPI.getLessons();
          const now = new Date();
          
          set({
            upcomingLessons: lessons.filter(lesson => lesson.date > now),
            pastLessons: lessons.filter(lesson => lesson.date <= now),
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching lessons:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch lessons",
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
            error: error instanceof Error ? error.message : "Failed to fetch registrations",
            isLoading: false,
          });
        }
      },

      bookLesson: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const registration = await lessonsAPI.bookLesson(sessionId);
          
          // Refresh user registrations to include the new booking
          await get().fetchUserRegistrations();
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error booking lesson:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to book lesson",
            isLoading: false,
          });
          throw error;
        }
      },

      cancelLesson: async (registrationId: string) => {
        set({ isLoading: true, error: null });
        try {
          await lessonsAPI.cancelLesson(registrationId);
          
          // Remove the cancelled registration from local state
          set((state) => ({
            userRegistrations: state.userRegistrations.filter(
              (registration) => registration.id !== registrationId
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Cancel lesson error:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to cancel lesson",
            isLoading: false,
          });
          throw error;
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
    }),
    {
      name: "lesson-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
