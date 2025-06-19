export type Period = "week" | "month" | "semester";

export const getPeriodDates = (period: Period) => {
  const endDate = new Date();
  const startDate = new Date();
  switch (period) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "semester":
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case "month":
    default:
      startDate.setDate(endDate.getDate() - 30);
      break;
  }
  return {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
  };
};
