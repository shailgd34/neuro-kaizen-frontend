import api from "./axios";

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  [x: string]: any;
  token: string;
  admin: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export const loginRequest = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post("/admins/login", data);
  return response.data.data;
};

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  password_confirmation: string;
}

export const forgotPasswordRequest = async (data: ForgotPasswordPayload) => {
  const response = await api.post("/admins/forgot-password", data);
  return response.data;
};

export const resetPasswordRequest = async (
  token: string,
  data: { newPassword: string; confirmPassword: string }
) => {
  const response = await api.post(
    `/admins/verify-reset-password/${token}`,
    data
  );

  return response.data;
};

export const resendResetLinkRequest = async (data: { email: string }) => {
  const response = await api.post("/admins/resend-link", data);
  return response.data;
};






export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export const signupRequest = async (data: SignupPayload) => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log("SIGNUP REQUEST:", data);

  return {
    success: true,
    message: "Account created",
  };
};
