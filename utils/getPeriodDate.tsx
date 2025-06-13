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
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};
