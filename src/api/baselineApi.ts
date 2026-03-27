import api from "./axios";

// export const getBaselineQuestions = async (page: number) => {
//   const response = await api.get(
//     `/clients/questions?page=${page}&limit=8`,
//   );
//   return response.data;
// };

// export const getBaselineProgress = async () => {
//   const response = await api.get(
//     `/clients/questions?page=1&limit=8`
//   );

//   return response.data;
// };


export const getAssessmentQuestions = async (
  page: number,
  type: "baseline" | "weekly",
  week: number = 0
) => {
  const response = await api.get(
    `/clients/questions?page=${page}&limit=8&type=${type}&week=${week}`
  );

  return response.data;
};



type SubmitAnswerPayload = {
  questionId: string;
  answer: number;
  domain: string;
};

export const submitAnswer = async (payload: SubmitAnswerPayload) => {
  const response = await api.post(
    "/clients/questions-respond",
    payload
  );

  return response.data;
};

type AssessmentType = "baseline" | "weekly";

export const submitAssessment = async (type: AssessmentType) => {
  return api.post("/clients/submit-assignment", { type });
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
  week: number;
  sleep: number;
  recovery: number;
  clarity: number;
  friction: number;
  reflection?: string;
};

export const submitWeeklyCheckin = async (payload: WeeklyPayload) => {
  const response = await api.post(
    "/clients/weekly-metrics",
    payload
  );

  return response.data;
};