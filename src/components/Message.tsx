import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

interface MessageProps {
  text: string;
  isMe: boolean;
  timestamp?: number;
}

const MessageContainer = styled(Box)<{ isMe: boolean }>(({ isMe }) => ({
  display: "flex",
  justifyContent: isMe ? "flex-end" : "flex-start",
  marginBottom: "8px",
  padding: "0 16px",
}));

const MessageBubble = styled(Box)<{ isMe: boolean }>(({ isMe }) => ({
  maxWidth: "60%",
  padding: "8px 12px",
  borderRadius: "8px",
  backgroundColor: isMe ? "#d9fdd3" : "#ffffff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.13)",
  position: "relative",
}));

const TimeText = styled(Typography)({
  fontSize: "0.75rem",
  color: "rgba(0, 0, 0, 0.6)",
  marginTop: "4px",
  textAlign: "right",
});

export const Message = ({ text, isMe, timestamp }: MessageProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <MessageContainer isMe={isMe}>
      <MessageBubble isMe={isMe}>
        <Typography variant="body1">{text}</Typography>
        {timestamp && (
          <TimeText variant="caption">{formatTime(timestamp)}</TimeText>
        )}
      </MessageBubble>
    </MessageContainer>
  );
};
