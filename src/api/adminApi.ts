import api from "./axios";

export type ScoringConfig = {
  version: string;
  thresholds: {
    stableMin: string;
    stableMax: string;
    strainMin: string;
    strainMax: string;
    driftMin: string;
    driftMax: string;
    stabilizeMin: string;
  };
  calibration: {
    requiredWeeks: string;
    domainVariance: string;
    nkpiVariance: string;
  };
};

export const getScoringConfig = async (): Promise<ScoringConfig> => {
  const response = await api.get("/admins/getScoringConfig");
  return response.data.data || response.data;
};

export const upsertScoringConfig = async (config: ScoringConfig) => {
  const response = await api.post("/admins/upsertScoringConfig", config);
  return response.data.data || response.data;
};

export type ClientListingItem = {
  clientId: string;
  name: string;
  email: string;
  draftStatus: string;
  mode: string;
  userState: string;
  isBaselineSubmitted: boolean;
  progress: {
    completed: number;
    total: number;
  };
  weeks: {
    completedWeeks: number;
    currentWeek: number;
    totalWeeks: number;
  };
  phase2: {
    active: boolean;
    week: number | null;
  };
};

export type ItemResponse = {
  text: string;
  domain: string;
  answer: string;
  week?: number;
};

export type DomainScore = {
  domain: string;
  score: number;
  mean?: number;
  status: string;
  baseline: number;
  delta: number;
  zScore: number;
  drift: string;
};

export type FullReportResponse = {
  baseline: {
    responses: ItemResponse[];
    score: {
      domain_score: { mean: number; score: number; domain: string }[];
      nkpi_score: string;
      submitted_at: string;
    };
  };
  weekly: {
    week: number;
    nkpi: number;
    domains: DomainScore[];
    responses: ItemResponse[];
  }[];
  summary: string;
  recommendations: string[];
  primaryIssue: DomainScore | null;
  secondaryIssue: DomainScore | null;
  client?: { name: string; id: string; status: string }; // Optional since it might be missing in some wrappers
};

export const getClientsListing = async (page: number = 1, limit: number = 10, search: string = ""): Promise<{ data: ClientListingItem[], total: number }> => {
  const response = await api.get("/admins/getClientsListing", {
    params: { page, limit, search }
  });
  const resData = response.data.data || response.data;
  if (Array.isArray(resData)) {
    return { data: resData, total: resData.length };
  }
  return {
    data: resData.clients || resData.data || [],
    total: resData.total || (resData.clients || resData.data || []).length || 0
  };
};

export const getClientFullReport = async (clientId: string): Promise<FullReportResponse> => {
  const response = await api.get(`/admins/getClientFullReport/${clientId}`);
  return response.data.data || response.data;
};

export type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  ip: string;
};

export const getAuditLogs = async (page: number = 1, limit: number = 10): Promise<{ data: AuditLog[], total: number }> => {
  const response = await api.get("/admins/getAuditLogs", {
    params: { page, limit }
  });
  const resData = response.data.data;
  const pagination = response.data.pagination;

  return {
    data: resData || [],
    total: pagination?.total || (resData || []).length || 0
  };
};
