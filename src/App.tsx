import { useState } from "react";
import { Container, styled } from "@mui/material";
import { AuthForm } from "./pages/AuthForm";
import { PhoneForm } from "./pages/PhoneForm";
import { Chat } from "./pages/Chat";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  padding: 0;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handlePhoneSubmit = () => {
    setIsChatOpen(true);
  };

  if (isChatOpen) {
    return <Chat onBack={() => setIsChatOpen(false)} />;
  }

  return (
    <StyledContainer>
      {!isAuthenticated ? (
        <AuthForm onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <PhoneForm
          onBack={() => setIsAuthenticated(false)}
          onSubmit={handlePhoneSubmit}
        />
      )}
    </StyledContainer>
  );
}

export default App;
