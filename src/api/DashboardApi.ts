import api from "./axios";
import type { DashboardResponse } from "../types/dashboard";

export const getDashboardData = async () => {
  const response = await api.get("/clients/baseline-status");
  return response.data;
}

export const getDashboardAnalytics  = async (): Promise<DashboardResponse> => {
  const response = await api.get("/clients/performance-calibration"); 
  return response.data.data;
};
export const getDomainDetails = async (domainId: string) => {
  const response = await api.get(
    `/clients/get-domain-detail/${domainId}`
  );

  return response.data.data;
};