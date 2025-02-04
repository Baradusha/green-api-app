import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const createAPI = () => {
  const { idInstance } = useAuthStore.getState();

  return axios.create({
    baseURL: `https://7103.api.greenapi.com/waInstance${idInstance}`,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
