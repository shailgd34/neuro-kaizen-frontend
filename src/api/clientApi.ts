import api from "./axios";

type Client = {
  id: string;
  name: string;
  email: string;
  address: string;
  company: string;
  message: string;
  created_at: string;
  updated_at: string;
};

type ClientsResponse = {
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

export const getClients = async (
  page: number,
  search: string,
  status: string
): Promise<ClientsResponse> => {
  console.log("API PARAMS:", { page, search, status }); // 👈 add here
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
  console.log("API PARAMS:", { page, search, status }); 
  const response = await api.get("/admins/active-clients", {
    params: { page, search, status },
  });

  return response.data;
};

export const sendInvite = async (id: string): Promise<any> => {
  const response = await api.post("/admins/send-invite", {
    id,
  });
  return response.data;
};

export const getClientByToken = async (token: string): Promise<any> => {
  const response = await api.get(`/admins/get-client/${token}`);
  return response.data;
};

export type SignupPayload = {
  id: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export const signupClient = async (body: SignupPayload): Promise<any> => {
  const response = await api.post(`/clients/signup`, body);
  return response.data;
};
