import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { messagesAPI } from "../core/greenApi";

interface PhoneFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

export const PhoneForm = ({ onBack, onSubmit }: PhoneFormProps) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setStorePhoneNumber = useAuthStore((state) => state.setPhoneNumber);

  const isValidPhone = useMemo(() => /^\d{10,15}$/.test(phone), [phone]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidPhone) {
        setError("Введите корректный номер телефона");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await messagesAPI.checkWhatsapp(phone);
        if (response.existsWhatsapp) {
          setStorePhoneNumber(phone);
          onSubmit();
        } else {
          setError("Номер не привязан к WhatsApp");
        }
      } catch (error) {
        console.error("Ошибка при проверке WhatsApp:", error);
        setError("Ошибка при проверке номера");
      } finally {
        setLoading(false);
      }
    },
    [phone, onSubmit, setStorePhoneNumber, isValidPhone]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 15);
      setPhone(value);
      setError("");
    },
    []
  );

  const helperText = useMemo(() => {
    if (error) return error;
    if (phone && !isValidPhone)
      return "Номер должен содержать от 10 до 15 цифр";
    return "";
  }, [error, phone, isValidPhone]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", maxWidth: 400 }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Введите номер телефона
      </Typography>

      <TextField
        fullWidth
        label="Номер телефона"
        value={phone}
        onChange={handlePhoneChange}
        margin="normal"
        required
        error={!!error || (!!phone && !isValidPhone)}
        disabled={loading}
        helperText={helperText}
        InputProps={{
          startAdornment: <InputAdornment position="start">+</InputAdornment>,
          inputMode: "numeric",
        }}
      />

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ flex: 1 }}
          disabled={loading}
        >
          Назад
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={{ flex: 1 }}
          disabled={loading || !isValidPhone}
        >
          {loading ? <CircularProgress size={24} /> : "Подтвердить"}
        </Button>
      </Box>
    </Box>
  );
};
