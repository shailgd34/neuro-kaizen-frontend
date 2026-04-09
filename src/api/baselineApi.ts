import api from "./axios";

export const savePhase2Progress = async (payload: { page: number }) => {
  const response = await api.post("/clients/phase2-progress", payload);
  return response.data;
};


export const getAssessmentQuestions = async (
  page: number,
  type: "baseline" | "weekly" = "baseline",
  week: number = 0,
  domain?: string,
  limit: number = 8
) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type,
    week: String(week)
  });

  if (domain) query.set("domain", domain);

  const response = await api.get(`/clients/questions?${query.toString()}`);
  return response.data;
};



type SubmitAnswerPayload = {
  questionId: string;
  answer: number;
  domain: string;
  type?: "baseline" | "weekly";
};

export const submitAnswer = async (payload: SubmitAnswerPayload) => {
  const response = await api.post(
    "/clients/questions-respond",
    payload
  );

  return response.data;
};

type AssessmentType = "baseline" | "weekly" | "phase2";

export const submitAssessment = async (type: AssessmentType, extra?: { domain?: string; week?: number }) => {
  return api.post("/clients/submit-assignment", { type, ...extra });
};

export const getBaselineResults = async () => {
  const response = await api.get("/clients/scores");
  return response.data;
};

type DomainScore = {
  mean: number;
  score: number;
  domain: string;
};

type WeeklyItem = {
  week: number;
  status: "completed" | "pending" | "draft";
  nkpi: number | null;
  submittedAt: string | null;
  isCurrentWeek: boolean;
  domainScores: DomainScore[];
};

type WeeklyHistoryResponse = {
  success: boolean;
  message: string;
  data: WeeklyItem[];
  upcoming?: {
    week: number;
    startTime: string;
    location?: string;
  };
};
export const getWeeklyHistory = async (): Promise<WeeklyHistoryResponse> => {
  const response = await api.get("/clients/assignment-history");
  return response.data;
};


export const insertQuestion = async (data: any) => {
  const response = await api.post("/admin/insert-question", data);
  return response.data;
};

export const restartAssignment = async () => {
  const response = await api.post("/clients/restart-assignment");
  return response.data;
};

export const getQuestions = async ({
  page,
  search,
  domain,
  week,
}: {
  page: number;
  search?: string;
  domain?: string;
  week?: string;
}) => {
  const response = await api.get("/admins/get-questions", {
    params: {
      page,
      limit: 10,
      search,
      domain,
      week,
    },
  });

  return response.data;
};

export const deleteQuestion = async (id: string) => {
  const res = await api.delete(`/admins/delete-question/${id}`);
  return res.data;
};

export const updateQuestion = async (data: any) => {
  const res = await api.put(`/admins/update-question/${data.id}`, data);
  return res.data;
};


type WeeklyPayload = {
  week?: number;
  domain?: string;
  sleep?: number;
  recovery?: number;
  clarity?: number;
  friction?: number;
  flow?: number;
  identity?: number;
  reflection?: string;
};

export const submitWeeklyCheckin = async (payload: WeeklyPayload) => {
  const response = await api.post(
    "/clients/weekly-metrics",
    payload
  );

  return response.data;
};

export const updateDomainScore = async (payload: { week: number; domain: string }) => {
  console.log("📡 API CALL: updateDomainScore", payload);
  const response = await api.post("/clients/updateDomainScore", payload);
  return response.data;
};



