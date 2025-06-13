import { Lesson, Registration, Session } from "@/types";
import { sessionsAPI } from "./sessions.service";
import { registrationsAPI } from "./registration.service";

// Legacy API for backward compatibility - converts Sessions to Lessons
export const lessonsAPI = {
  getLessons: async (): Promise<Lesson[]> => {
    try {
      const sessions = await sessionsAPI.getAllSessions();
      return sessions.map(sessionToLesson);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      // Fallback to mock data in development
      const { lessons } = await import("@/constants/mockData");
      return lessons;
    }
  },

  getLessonById: async (id: string): Promise<Lesson> => {
    const session = await sessionsAPI.getSessionById(id);
    return sessionToLesson(session);
  },

  bookLesson: async (sessionId: string): Promise<Registration> => {
    return sessionsAPI.registerForSession(sessionId);
  },

  cancelLesson: async (registrationId: string): Promise<void> => {
    return registrationsAPI.cancelRegistration(registrationId);
  },
};

// Helper function to convert Session to Lesson for backward compatibility
const sessionToLesson = (session: Session): Lesson => {
  return {
    id: session.id,
    instructorId: session.instructor,
    centerId: "1", // Default center ID
    scenario: session.scenario || {
      scenarioID: parseInt(session.id),
      name: session.topic || "Driving Lesson",
      environmentType: "Urban",
      difficulty: "EASY",
    },
    date: new Date(session.date || session.datetime || session.created_at),
    duration: session.duration_minutes,
    status: session.status || "scheduled",
    topic: session.topic || "General Driving",
    notes: session.notes || "",
    price: session.price,
    location: session.location || "Driving Center",
    rating: undefined,
    feedback: undefined,
  };
};