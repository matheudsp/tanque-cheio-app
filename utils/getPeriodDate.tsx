export type Period = "year" | "month" | "semester";

export const getPeriodDates = (period: Period) => {
  const endDate = new Date();
  const startDate = new Date();
  switch (period) {
    case "year":
      startDate.setDate(endDate.getMonth() - 12);
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
