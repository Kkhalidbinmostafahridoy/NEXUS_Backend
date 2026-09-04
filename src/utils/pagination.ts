export const pagination = (page?: string, limit?: string) => ({
  page: Math.max(Number(page) || 1, 1),
  limit: Math.min(Math.max(Number(limit) || 20, 1), 100),
});
