import { create } from "zustand";

interface AuthState {
  idInstance: string;
  apiTokenInstance: string;
  phoneNumber: string;
  setIdInstance: (id: string) => void;
  setApiTokenInstance: (token: string) => void;
  setPhoneNumber: (phone: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  idInstance: "",
  setIdInstance: (id) => set({ idInstance: id }),

  apiTokenInstance: "",
  setApiTokenInstance: (token) => set({ apiTokenInstance: token }),

  phoneNumber: "",
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
}));
