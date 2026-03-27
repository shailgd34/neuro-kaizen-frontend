import api from "./axios";

export const getUsers = () =>
  api.get("/users");

export const createUser = (data: any) =>
  api.post("/users", data);

export const deleteUser = (id: string) =>
  api.delete(`/users/${id}`);