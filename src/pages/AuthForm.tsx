import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState, useCallback, useMemo } from "react";
import { useAuthStore } from "../store/authStore";
import { messagesAPI } from "../core/greenApi";

export const AuthForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setStoreIdInstance = useAuthStore((state) => state.setIdInstance);
  const setStoreApiTokenInstance = useAuthStore(
    (state) => state.setApiTokenInstance
  );

  const isValid = useMemo(() => {
    return idInstance.length > 0 && apiTokenInstance.length > 0;
  }, [idInstance, apiTokenInstance]);

  const clearAuth = useCallback(() => {
    setStoreIdInstance("");
    setStoreApiTokenInstance("");
  }, [setStoreIdInstance, setStoreApiTokenInstance]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      setLoading(true);
      setError("");

      try {
        setStoreIdInstance(idInstance);
        setStoreApiTokenInstance(apiTokenInstance);

        const stateResponse = await messagesAPI.getStateInstance();
        if (stateResponse.stateInstance === "authorized") {
          onSuccess();
        } else {
          setError(
            "Инстанс не авторизован. Пожалуйста, проверьте QR код в личном кабинете Green API"
          );
          clearAuth();
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
        setError("Неверные учетные данные");
        clearAuth();
      } finally {
        setLoading(false);
      }
    },
    [
      idInstance,
      apiTokenInstance,
      onSuccess,
      setStoreIdInstance,
      setStoreApiTokenInstance,
      clearAuth,
      isValid,
    ]
  );

  const handleFieldChange = useCallback(
    (setter: (value: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value.trim());
        setError("");
      },
    []
  );

  const toggleShowToken = useCallback(() => {
    setShowToken((prev) => !prev);
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: "100%", maxWidth: 400 }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        Авторизация
      </Typography>

      <TextField
        fullWidth
        label="ID Instance"
        value={idInstance}
        onChange={handleFieldChange(setIdInstance)}
        margin="normal"
        required
        error={!!error}
        disabled={loading}
        autoComplete="off"
        spellCheck={false}
      />

      <TextField
        fullWidth
        label="API Token Instance"
        value={apiTokenInstance}
        onChange={handleFieldChange(setApiTokenInstance)}
        type={showToken ? "text" : "password"}
        margin="normal"
        required
        error={!!error}
        disabled={loading}
        autoComplete="off"
        spellCheck={false}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle token visibility"
                onClick={toggleShowToken}
                edge="end"
              >
                {showToken ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        disabled={loading || !isValid}
      >
        {loading ? <CircularProgress size={24} /> : "Продолжить"}
      </Button>
    </Box>
  );
};
