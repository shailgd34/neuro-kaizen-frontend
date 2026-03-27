import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  role: "client" | "coach" | null;
  name: string | null;
  email: string | null;
  profile_image: string | null;
}

const initialState: AuthState = {
  token: sessionStorage.getItem("token"),
  role: sessionStorage.getItem("role") as "client" | "coach" | null,
  name: sessionStorage.getItem("name"),
  email: sessionStorage.getItem("email"),
  profile_image: sessionStorage.getItem("profile_image"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.profile_image = action.payload.profile_image;

      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("role", action.payload.role);
      sessionStorage.setItem("name", action.payload.name);
      sessionStorage.setItem("email", action.payload.email);
      sessionStorage.setItem("profile_image", action.payload.profile_image || "");
    },

    logout(state) {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
      state.profile_image = null;

      sessionStorage.clear();
    },

    setUser(state, action) {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.profile_image = action.payload.profile_image;

      sessionStorage.setItem("name", action.payload.name);
      sessionStorage.setItem("email", action.payload.email);
      sessionStorage.setItem("profile_image", action.payload.profile_image || "");
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;