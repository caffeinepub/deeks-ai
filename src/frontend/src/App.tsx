import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import LandingPage from "./pages/LandingPage";

export type Page = "landing" | "chat";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  return (
    <>
      {page === "landing" && <LandingPage onStart={() => setPage("chat")} />}
      {page === "chat" && <ChatPage onBack={() => setPage("landing")} />}
      <Toaster />
    </>
  );
}
