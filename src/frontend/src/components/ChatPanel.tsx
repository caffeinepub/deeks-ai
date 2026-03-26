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
  Heart,
  Lock,
  Menu,
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { useSpeech } from "../hooks/useSpeech";
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
      // Bold **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      // Italic *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        parts.push(<em key={key++}>{italicMatch[2]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }
      // Inline code `text`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className="bg-muted-foreground/10 px-1 rounded text-xs font-mono"
          >
            {codeMatch[1]}
          </code>,
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }
      // Plain character
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

    // Code block
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
          className="bg-muted-foreground/10 rounded-lg p-3 overflow-x-auto my-2"
        >
          <code className="text-xs font-mono" data-lang={lang}>
            {codeLines.join("\n")}
          </code>
        </pre>,
      );
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      elements.push(
        <h3 key={i} className="font-semibold text-foreground mt-3 mb-1">
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
          className="font-semibold text-foreground text-base mt-3 mb-1"
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
        <h1 key={i} className="font-bold text-foreground text-lg mt-3 mb-1">
          {parseInline(h1[1])}
        </h1>,
      );
      i++;
      continue;
    }

    // Unordered list item
    const ulItem = line.match(/^[-*]\s+(.+)/);
    if (ulItem) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const m = lines[i].match(/^[-*]\s+(.+)/);
        items.push(
          <li key={i} className="ml-4 list-disc">
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

    // Ordered list item
    const olItem = line.match(/^\d+\.\s+(.+)/);
    if (olItem) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const m = lines[i].match(/^\d+\.\s+(.+)/);
        items.push(
          <li key={i} className="ml-4 list-decimal">
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

    // Horizontal rule
    if (line.match(/^(-{3,}|\*{3,})$/)) {
      elements.push(<hr key={i} className="my-3 border-border" />);
      i++;
      continue;
    }

    // Blockquote
    const bq = line.match(/^>\s*(.*)/);
    if (bq) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-2 border-emerald-400 pl-3 italic text-muted-foreground my-1"
        >
          {parseInline(bq[1])}
        </blockquote>,
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="leading-relaxed">
        {parseInline(line)}
      </p>,
    );
    i++;
  }

  return <div className="text-sm space-y-0.5">{elements}</div>;
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
    if (isRecording) {
      speech.stopRecording();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-background min-w-0">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-white">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="chat.toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground text-sm">Dr. Deeks</h2>
            <p className="text-xs text-muted-foreground truncate">
              {conversationTitle !== "Dr. Deeks"
                ? conversationTitle
                : "AI Assistant by Deepak Rajput"}
            </p>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onVoiceModeChange(!voiceMode)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceMode
                    ? "bg-emerald-50 text-emerald-600"
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground/60 cursor-default">
                <Lock className="w-4 h-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Messages are end-to-end encrypted</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 text-center py-20"
            data-ocid="chat.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Ask Dr. Deeks Anything
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Health, science, tech, coding, life advice — I can help with
                anything.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm w-full">
              {[
                "Sar dard ka ilaj",
                "Python code likhdo",
                "Neend nahi aati kya karoon?",
                "Best diet tips",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSend(prompt)}
                  className="text-xs text-left px-3 py-2 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-muted-foreground hover:text-emerald-700"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
              data-ocid={`messages.item.${i + 1}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                    D
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] group relative ${
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3"
                    : "bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownContent content={msg.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                )}
                {msg.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => onSpeakMessage(msg.content)}
                    className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border rounded-full p-1 shadow-xs"
                    data-ocid={`messages.toggle.${i + 1}`}
                  >
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div
            className="flex gap-3 justify-start"
            data-ocid="chat.loading_state"
          >
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">
                D
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 space-y-2 w-48">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 pb-5 pt-2 bg-white border-t border-border">
        <div className="flex items-end gap-2 bg-muted rounded-2xl px-4 py-3 border border-border focus-within:border-emerald-400 transition-colors">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Dr. Deeks anything..."
            className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm min-h-[24px] max-h-40 p-0"
            rows={1}
            data-ocid="chat.textarea"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
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
                      className={`p-2 rounded-lg transition-colors ${
                        isRecording
                          ? "bg-destructive/10 text-destructive animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-ocid="chat.toggle"
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 disabled:opacity-40 rounded-xl px-3 h-8"
              data-ocid="chat.submit_button"
            >
              {isLoading ? (
                <Square className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Made with ❤️ by Deepak Rajput from Punjab, India
        </p>
      </div>
    </div>
  );
}
