import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Lock,
  Menu,
  Mic,
  MicOff,
  Moon,
  Send,
  Sparkles,
  Square,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { useSpeech } from "../hooks/useSpeech";
import { useTheme } from "../hooks/useTheme";
import type { LocalMessage } from "../pages/ChatPage";

// Minimal markdown renderer (no external deps)
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        parts.push(<em key={key++}>{italicMatch[2]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="bg-muted-foreground/10 px-1 rounded text-xs font-mono break-all"
          >
            {codeMatch[1]}
          </code>,
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }
      const nextSpecial = remaining.search(/(\*|_|`)/);
      if (nextSpecial > 0) {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      } else {
        parts.push(remaining);
        break;
      }
    }
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={i}
          className="bg-muted rounded-lg p-2.5 overflow-x-auto my-2 max-w-full border border-border"
        >
          <code
            className="text-xs font-mono whitespace-pre-wrap break-all text-foreground"
            data-lang={lang}
          >
            {codeLines.join("\n")}
          </code>
        </pre>,
      );
      i++;
      continue;
    }

    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      elements.push(
        <h3 key={i} className="font-semibold text-foreground mt-3 mb-1 text-sm">
          {parseInline(h3[1])}
        </h3>,
      );
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      elements.push(
        <h2
          key={i}
          className="font-semibold text-foreground text-sm sm:text-base mt-3 mb-1"
        >
          {parseInline(h2[1])}
        </h2>,
      );
      i++;
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      elements.push(
        <h1
          key={i}
          className="font-bold text-foreground text-base sm:text-lg mt-3 mb-1"
        >
          {parseInline(h1[1])}
        </h1>,
      );
      i++;
      continue;
    }

    const ulItem = line.match(/^[-*]\s+(.+)/);
    if (ulItem) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const m = lines[i].match(/^[-*]\s+(.+)/);
        items.push(
          <li key={i} className="ml-3 list-disc">
            {parseInline(m![1])}
          </li>,
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1 space-y-0.5">
          {items}
        </ul>,
      );
      continue;
    }

    const olItem = line.match(/^\d+\.\s+(.+)/);
    if (olItem) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const m = lines[i].match(/^\d+\.\s+(.+)/);
        items.push(
          <li key={i} className="ml-3 list-decimal">
            {parseInline(m![1])}
          </li>,
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1 space-y-0.5">
          {items}
        </ol>,
      );
      continue;
    }

    if (line.match(/^(-{3,}|\*{3,})$/)) {
      elements.push(<hr key={i} className="my-3 border-border" />);
      i++;
      continue;
    }

    const bq = line.match(/^>\s*(.*)/);
    if (bq) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-1"
        >
          {parseInline(bq[1])}
        </blockquote>,
      );
      i++;
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    elements.push(
      <p key={i} className="leading-relaxed break-words">
        {parseInline(line)}
      </p>,
    );
    i++;
  }

  return (
    <div className="text-xs sm:text-sm space-y-0.5 min-w-0 w-full">
      {elements}
    </div>
  );
}

interface Props {
  messages: LocalMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  speech: ReturnType<typeof useSpeech>;
  voiceMode: boolean;
  onVoiceModeChange: (v: boolean) => void;
  conversationTitle: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSpeakMessage: (text: string) => void;
}

export default function ChatPanel({
  messages,
  isLoading,
  onSend,
  speech,
  voiceMode,
  onVoiceModeChange,
  conversationTitle,
  onToggleSidebar,
  onSpeakMessage,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicDown = () => {
    if (!speech.isSupported || isRecording) return;
    setIsRecording(true);
    speech.startRecording((text) => {
      setIsRecording(false);
      if (text.trim()) onSend(text.trim());
    });
  };

  const handleMicUp = () => {
    if (isRecording) speech.stopRecording();
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-background min-w-0 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-2.5 sm:py-4 border-b border-border bg-card shadow-[0_1px_8px_0_oklch(0_0_0/0.06)] flex-shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1.5 rounded-lg hover:bg-muted"
          data-ocid="chat.toggle"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground text-xs sm:text-sm tracking-tight truncate">
              Dr. Deeks
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
              <span className="truncate">
                {conversationTitle !== "Dr. Deeks"
                  ? conversationTitle
                  : "AI Assistant · Always ready"}
              </span>
            </p>
          </div>
        </div>

        {/* Controls — only on sm+ */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {/* Voice toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onVoiceModeChange(!voiceMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    voiceMode
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-ocid="voice.toggle"
                >
                  {voiceMode ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {voiceMode ? "Voice mode on" : "Voice mode off"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  data-ocid="theme.toggle"
                  aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDark ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isDark ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground/50 cursor-default flex-shrink-0">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Messages are end-to-end encrypted</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-4 min-w-0">
        {messages.length === 0 && !isLoading && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 text-center py-8 sm:py-20 px-2 min-w-0"
            data-ocid="chat.empty_state"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-[0_4px_24px_oklch(0.62_0.22_280/0.3)] flex-shrink-0">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base tracking-tight">
                Ask Dr. Deeks Anything
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-[240px] sm:max-w-xs leading-relaxed">
                Health, science, tech, coding, life advice — I can help with
                anything.
              </p>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-1 w-full max-w-[260px] xs:max-w-sm">
              {[
                "Sar dard ka ilaj",
                "Python code likhdo",
                "Neend nahi aati?",
                "Best diet tips",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSend(prompt)}
                  className="text-[11px] sm:text-xs text-left px-3 py-2 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground truncate"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-1.5 sm:gap-3 min-w-0 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
              data-ocid={`messages.item.${i + 1}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="gradient-bg text-white text-[10px] sm:text-xs font-bold">
                    D
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`min-w-0 group relative ${
                  msg.role === "user"
                    ? "max-w-[88%] sm:max-w-[75%] bg-foreground text-background rounded-2xl rounded-tr-sm px-3 py-2 sm:py-3"
                    : "max-w-[92%] sm:max-w-[78%] bg-card text-foreground rounded-2xl rounded-tl-sm px-3 py-2 sm:py-3 shadow-xs border border-border"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownContent content={msg.content} />
                ) : (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                    {msg.content}
                  </p>
                )}
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => onSpeakMessage(msg.content)}
                    className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded-full p-1 shadow-xs"
                    data-ocid={`messages.toggle.${i + 1}`}
                  >
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-muted text-foreground text-[10px] sm:text-xs font-bold">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div
            className="flex gap-1.5 sm:gap-3 justify-start min-w-0"
            data-ocid="chat.loading_state"
          >
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarFallback className="gradient-bg text-white text-[10px] sm:text-xs font-bold">
                D
              </AvatarFallback>
            </Avatar>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-3 space-y-2 w-32 sm:w-48">
              <Skeleton className="h-2.5 sm:h-3 w-full rounded" />
              <Skeleton className="h-2.5 sm:h-3 w-3/4 rounded" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-2 pb-3 pt-1.5 sm:px-4 sm:pb-5 sm:pt-2 bg-card border-t border-border flex-shrink-0">
        <div className="flex items-end gap-1.5 sm:gap-2 bg-card rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-2 sm:py-3 border border-border shadow-[0_2px_12px_0_oklch(0_0_0/0.08)] focus-within:border-primary/50 focus-within:shadow-[0_2px_16px_0_oklch(0.62_0.22_280/0.15)] transition-all duration-200 min-w-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm min-h-[20px] sm:min-h-[24px] max-h-24 sm:max-h-40 p-0 placeholder:text-muted-foreground/60 min-w-0"
            rows={1}
            data-ocid="chat.textarea"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            {speech.isSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onMouseDown={handleMicDown}
                      onMouseUp={handleMicUp}
                      onTouchStart={handleMicDown}
                      onTouchEnd={handleMicUp}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isRecording
                          ? "bg-destructive/10 text-destructive animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-ocid="chat.toggle"
                    >
                      {isRecording ? (
                        <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Hold to record voice</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="gradient-bg text-white border-0 disabled:opacity-30 rounded-lg sm:rounded-xl px-2 sm:px-3 h-7 sm:h-9 hover:opacity-90 transition-opacity shadow-sm flex-shrink-0"
              data-ocid="chat.submit_button"
            >
              {isLoading ? (
                <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
              ) : (
                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5 hidden sm:block">
          Made with ❤️ by Deepak Rajput from Punjab, India
        </p>
      </div>
    </div>
  );
}
