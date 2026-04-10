import api from "./axios";

export type Client = {
  id: string;
  name: string;
  email: string;
  address: string;
  company: string;
  message: string;
  created_at: string;
  updated_at: string;
};

export type ClientsResponse = {
  status: number;
  data: Client[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextPage: number;
  previousPage: number;
  nextDisabled: boolean;
  previousDisabled: boolean;
  message: string;
};

export interface DomainMetric {
  domain: string;
  score: number;
  status: string;
  baseline: number;
  delta: number;
  deltaStatus: string;
  zScore: number;
  drift: string;
  onWatchlist: boolean;
  triggerPhase2: boolean;
}

export interface WeeklyMetricEntry {
  week: number;
  submittedAt: string;
  nkpi_score: number;
  sleep: number;
  recovery: number;
  clarity: number;
  flow: number;
  identity: number;
  friction: number;
  reflection: string;
  domains: DomainMetric[];
  analysis: {
    summary: {
      overallStatus: string;
      pattern: string;
      primaryIssue: DomainMetric;
      secondaryIssue?: DomainMetric;
      primaryIssueText: string;
      secondaryIssueText: string;
    };
  };
  phase2: {
    triggered: boolean;
    targetDomain: string;
    subscale: string | null;
    score: number | null;
  };
}

export type ClientFullDetails = {
  // Legacy identity support (might be present in wrapper)
  client?: {
    id: string;
    name: string;
    email: string;
    status: string;
    joinedAt: string;
  };
  // New "Reliable" structure starts here
  mode: string;
  userState: string;
  nkpi: number;
  draftStatus: string;
  progress: {
    completed: number;
    total: number;
  };
  baseline: {
    status: string;
    completedAt: string;
    score: number;
    domains: {
      mean: number;
      score: number;
      domain: string;
    }[];
  };
  calibration: {
    status: string;
    currentWeek: number;
    totalWeeks: number;
    isLocked: boolean;
    remainingTime: number;
    isWeekSubmitted: boolean;
    weeklyMetrics: WeeklyMetricEntry[];
  };
  weeklyStatus: {
    currentWeek: number;
    isCurrentWeekSubmitted: boolean;
    isLocked: boolean;
    phase2Pending: boolean;
    phase2Week: number | null;
  };
  summary: string;
  recommendations: string[];
  primaryIssue: DomainMetric;
  secondaryIssue?: DomainMetric;
  lastUpdate?: string;
};


export const getClients = async (
  page: number,
  search: string,
  status: string
): Promise<ClientsResponse> => {
  const response = await api.get("/admins/get-clients", {
    params: { page, search, status },
  });
  return response.data;
};

export const JoinedClientList = async (
  page: number,
  search: string,
  status: string
): Promise<ClientsResponse> => {
  const response = await api.get("/admins/active-clients", {
    params: { page, search, status },
  });
  return response.data;
};

export const getClientFullDetails = async (
  clientId: string
): Promise<ClientFullDetails> => {
  const response = await api.get(`/admins/client-full-details/${clientId}`);
  // The API returns { success, data: { ... } }
  return response.data.data;
};

export const getClientByToken = async (token: string) => {
  const response = await api.get(`/auth/client-by-token/${token}`);
  return response.data;
};

export const signupClient = async (data: any) => {
  const response = await api.post("/auth/signup-client", data);
  return response.data;
};

export const sendInvite = async (clientId: string) => {
  const response = await api.post("/admins/send-invite", { clientId });
  return response.data;
};


