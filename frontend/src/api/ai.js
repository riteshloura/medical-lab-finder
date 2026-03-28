import api from "./axios";

/**
 * Trigger AI analysis for a report (cached on backend — safe to call multiple times).
 * POST /api/ai/analyze/report/{reportId}
 */
export const analyzeReport = async (reportId) => {
  const response = await api.post(`/ai/analyze/report/${reportId}`);
  return response.data;
};

/**
 * Force a fresh AI analysis, bypassing the backend cache.
 * POST /api/ai/analyze/report/{reportId}/refresh
 */
export const reanalyzeReport = async (reportId) => {
  const response = await api.post(`/ai/analyze/report/${reportId}/refresh`);
  return response.data;
};
