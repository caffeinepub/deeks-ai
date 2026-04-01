import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import ChatPage from "./pages/ChatPage";
import CricketPage from "./pages/CricketPage";
import LandingPage from "./pages/LandingPage";

export type Page = "landing" | "chat" | "cricket";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  useTheme();

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onStart={() => setPage("chat")}
          onCricket={() => setPage("cricket")}
        />
      )}
      {page === "chat" && (
        <ChatPage
          onBack={() => setPage("landing")}
          onCricket={() => setPage("cricket")}
        />
      )}
      {page === "cricket" && <CricketPage onBack={() => setPage("chat")} />}
      <Toaster />
    </>
  );
}
