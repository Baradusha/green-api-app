import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuthStore } from "../store/authStore";
import { Message } from "../components/Message";
import { MessageInput } from "../components/MessageInput";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { messagesAPI } from "../core/greenApi";
import { ChatMessage } from "../types/types";

interface ChatProps {
  onBack: () => void;
}

interface MessageType {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: number;
}

export const Chat = ({ onBack }: ChatProps) => {
  const phoneNumber = useAuthStore((state) => state.phoneNumber);

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chatId = useMemo(() => `${phoneNumber}@c.us`, [phoneNumber]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const pollingInterval = useRef<ReturnType<typeof setInterval>>();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const formatMessages = useCallback(
    (chatMessages: ChatMessage[]): MessageType[] => {
      if (!Array.isArray(chatMessages) || !chatMessages.length) return [];

      return chatMessages
        .filter((msg) => {
          if (!msg?.type || !msg?.timestamp) return false;
          return !!(
            msg.textMessage ||
            msg.extendedTextMessage?.text ||
            msg.messageData?.textMessageData?.textMessage
          );
        })
        .map((msg) => ({
          id: `${msg.timestamp}_${Math.random()}`,
          text:
            msg.textMessage ||
            msg.extendedTextMessage?.text ||
            msg.messageData?.textMessageData?.textMessage ||
            "",
          isMe: msg.type === "outgoing",
          timestamp: msg.timestamp,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
    },
    []
  );

  const loadChatHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getChatHistory(chatId);
      setMessages((prev) => {
        const newMessages = formatMessages(response || []);
        const uniqueMessages = newMessages.filter(
          (newMsg) => !prev.some((prevMsg) => prevMsg.id === newMsg.id)
        );
        return [...prev, ...uniqueMessages];
      });
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
      setError("Не удалось загрузить историю сообщений");
    } finally {
      setLoading(false);
    }
  }, [chatId, formatMessages]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      try {
        const newMessage: MessageType = {
          id: `${currentTimestamp}_${Math.random()}`,
          text: message,
          isMe: true,
          timestamp: currentTimestamp,
        };

        setMessages((prev) => [...prev, newMessage]);
        await messagesAPI.sendMessage({ chatId, message });
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        setError("Не удалось отправить сообщение");
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.id !== `${currentTimestamp}_${Math.random()}`
          )
        );
      }
    },
    [chatId]
  );

  const receiveMessages = useCallback(async () => {
    try {
      const notification = await messagesAPI.receiveNotification();
      if (!notification) return;

      const { body, receiptId } = notification;

      if (
        (body.typeWebhook === "incomingMessageReceived" ||
          body.typeWebhook === "outgoingMessageReceived") &&
        body.senderData?.chatId === chatId
      ) {
        const messageText =
          body.messageData?.textMessageData?.textMessage ||
          body.messageData?.extendedTextMessageData?.text;

        if (messageText) {
          const timestamp = body.timestamp || Math.floor(Date.now() / 1000);
          setMessages((prev) => {
            const newMessage: MessageType = {
              id: `${timestamp}_${Math.random()}`,
              text: messageText,
              isMe: body.typeWebhook === "outgoingMessageReceived",
              timestamp,
            };
            return [...prev, newMessage];
          });
        }
      }

      await messagesAPI.deleteNotification(receiptId);
    } catch (error) {
      console.error("Ошибка при получении сообщений:", error);
    }
  }, [chatId]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const state = await messagesAPI.getStateInstance();
        if (state.stateInstance !== "authorized") {
          setError(
            "Инстанс не авторизован. Проверьте QR-код в личном кабинете Green API"
          );
          return;
        }

        const settings = await messagesAPI.getSettings();
        if (settings.webhookUrl) {
          setError("Отключите Webhook URL в настройках инстанса");
          return;
        }
        if (!settings.incomingWebhook) {
          setError(
            "Включите получение уведомлений о входящих сообщениях в настройках инстанса"
          );
          return;
        }

        await messagesAPI.clearNotificationQueue();
        await loadChatHistory();

        pollingInterval.current = setInterval(receiveMessages, 5000);
      } catch (error) {
        console.error("Ошибка при инициализации чата:", error);
        setError("Ошибка при проверке состояния инстанса");
      }
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      initChat();
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [loadChatHistory, receiveMessages]);

  const messagesList = useMemo(
    () =>
      messages.map((msg) => (
        <Message
          key={msg.id}
          text={msg.text}
          isMe={msg.isMe}
          timestamp={msg.timestamp}
        />
      )),
    [messages]
  );

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
          {error}
        </Typography>
      );
    }

    if (!messages.length) {
      return (
        <Typography color="textSecondary" sx={{ mt: 4, textAlign: "center" }}>
          Нет сообщений
        </Typography>
      );
    }

    return (
      <Box sx={{ px: 2 }}>
        {messagesList}
        <div ref={messagesEndRef} />
      </Box>
    );
  }, [loading, error, messages.length, messagesList]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "#128c7e" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">+{phoneNumber}</Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#efeae2",
          backgroundImage:
            "linear-gradient(rgba(229, 221, 213, 0.85), rgba(229, 221, 213, 0.85))",
          overflow: "auto",
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderContent()}
      </Box>

      <MessageInput onSend={handleSendMessage} />
    </Box>
  );
};
