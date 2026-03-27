import api from "./axios";

/* =========================
   GET PROFILE
========================= */
export const getProfile = async () => {
  const res = await api.get("/clients/get-profile");
  return res.data;
};

/* =========================
   UPDATE PROFILE (MULTIPART)
========================= */
export const updateProfile = async (payload: any) => {
  const formData = new FormData();

  formData.append("name", payload.name || "");
  formData.append("email", payload.email || "");
  formData.append("phone", payload.phone || "");
  formData.append("address", payload.address || "");
  formData.append("city", payload.city || "");
  formData.append("state", payload.state || "");
  formData.append("country", payload.country || "");
  formData.append("zip_code", payload.zip_code || "");

  if (payload.profile_image instanceof File) {
    formData.append("profile_image", payload.profile_image); // ✅ REAL FILE
  }

  const res = await api.put("/clients/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* =========================
   UPDATE PASSWORD
========================= */
export const updatePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await api.post("clients/change-password", payload);
  return res.data;
};



/* =========================
   UPDATE PROFILE (MULTIPART)
========================= */
export const updateProfileAdmin = async (payload: any) => {
  const formData = new FormData();

  formData.append("name", payload.name || "");
  formData.append("email", payload.email || "");
  formData.append("phone", payload.phone || "");
  formData.append("address", payload.address || "");
  formData.append("city", payload.city || "");
  formData.append("state", payload.state || "");
  formData.append("country", payload.country || "");
  formData.append("zip_code", payload.zip_code || "");

  if (payload.profile_image) {
    formData.append("profile_image", payload.profile_image);
  }

  const res = await api.put("admins/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

/* =========================
   UPDATE PASSWORD
========================= */
export const updatePasswordAdmin = async (payload: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await api.post("admins/change-password", payload);
  return res.data;
};