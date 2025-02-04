import { useAuthStore } from "../store/authStore";
import { createAPI } from "./instance";
import {
  ChatHistoryResponse,
  ReceiveNotificationResponse,
  SendMessageResponse,
  SendMessageRequest,
} from "../types/types";

export const messagesAPI = {
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    const response = await api.post<SendMessageResponse>(
      `/sendMessage/${apiTokenInstance}`,
      data
    );
    return response.data;
  },

  async receiveNotification(): Promise<ReceiveNotificationResponse | null> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    try {
      const response = await api.get<ReceiveNotificationResponse | null>(
        `/receiveNotification/${apiTokenInstance}`
      );
      return response.data;
    } catch (error) {
      console.error("Error receiving notification:", error);
      throw error;
    }
  },

  async deleteNotification(receiptId: number): Promise<boolean> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    const response = await api.delete(
      `/deleteNotification/${apiTokenInstance}/${receiptId}`
    );
    return response.data;
  },

  async getChatHistory(chatId: string): Promise<ChatHistoryResponse> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    const response = await api.post(`/getChatHistory/${apiTokenInstance}`, {
      chatId,
      count: 100,
    });

    const responseData = response.data as any;
    if (Array.isArray(responseData)) {
      return responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      return response.data.data;
    } else {
      console.error("Unexpected API response structure:", response);
      return [];
    }
  },

  async getContactInfo(chatId: string): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    const response = await api.post(`/getContactInfo/${apiTokenInstance}`, {
      chatId,
    });
    return response.data;
  },

  async getStateInstance(): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    try {
      const response = await api.get(`/getStateInstance/${apiTokenInstance}`);
      return response.data;
    } catch (error) {
      console.error("Error getting instance state:", error);
      throw error;
    }
  },

  async checkWhatsapp(phoneNumber: string): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    const response = await api.post(`/checkWhatsapp/${apiTokenInstance}`, {
      phoneNumber,
    });
    return response.data;
  },

  async getSettings(): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    try {
      const response = await api.get(`/getSettings/${apiTokenInstance}`);
      return response.data;
    } catch (error) {
      console.error("Error getting settings:", error);
      throw error;
    }
  },

  async getChats(): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    try {
      const response = await api.get(`/getChats/${apiTokenInstance}`);
      return response.data;
    } catch (error) {
      console.error("Error getting chats:", error);
      throw error;
    }
  },

  async getUnreadMessages(chatId: string): Promise<any> {
    const api = createAPI();
    const { apiTokenInstance } = useAuthStore.getState();

    try {
      const chats = await this.getChats();

      const chat = chats.find((c: any) => c.id === chatId);

      if (chat && chat.unreadCount > 0) {
        const messagesResponse = await api.post(
          `/getChatHistory/${apiTokenInstance}`,
          {
            chatId,
            count: chat.unreadCount,
          }
        );
        return messagesResponse.data;
      }

      return [];
    } catch (error) {
      console.error("Error checking unread messages:", error);
      throw error;
    }
  },

  async clearNotificationQueue(): Promise<void> {
    try {
      let notification = await this.receiveNotification();

      while (notification) {
        await this.deleteNotification(notification.receiptId);
        notification = await this.receiveNotification();
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  },
};
