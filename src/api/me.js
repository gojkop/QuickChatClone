// client/src/api/me.js
import apiClient from "./index";

export async function bootstrapMe() {
  const { data } = await apiClient.post("/me/bootstrap");
  return data;
}
