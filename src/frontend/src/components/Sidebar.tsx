import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Conversation, ConversationId } from "../backend";
import { useTheme } from "../hooks/useTheme";

interface Props {
  conversations: Conversation[];
  activeConvId: ConversationId | null;
  onSelect: (id: ConversationId) => void;
  onNewChat: () => void;
  onDelete: (id: ConversationId) => void;
  onSettings: () => void;
  onBack: () => void;
  onCricket?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

function groupConversations(conversations: Conversation[]) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;

  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const older: Conversation[] = [];

  for (const c of [...conversations].sort(
    (a, b) => Number(b.updatedAt) - Number(a.updatedAt),
  )) {
    const ts = Number(c.updatedAt) / 1_000_000;
    if (ts >= todayStart) today.push(c);
    else if (ts >= yesterdayStart) yesterday.push(c);
    else older.push(c);
  }
  return { today, yesterday, older };
}

export default function Sidebar({
  conversations,
  activeConvId,
  onSelect,
  onNewChat,
  onDelete,
  onSettings,
  onBack,
  onCricket,
  onClose,
  isMobile,
}: Props) {
  const [hoveredId, setHoveredId] = useState<ConversationId | null>(null);
  const { isDark, toggleTheme } = useTheme();
  const { today, yesterday, older } = groupConversations(conversations);

  const renderItem = (conv: Conversation, index: number) => {
    const isActive = conv.id === activeConvId;
    const isHovered = conv.id === hoveredId;
    return (
      <div
        key={conv.id.toString()}
        className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all min-w-0 ${
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
        }`}
        onMouseEnter={() => setHoveredId(conv.id)}
        onMouseLeave={() => setHoveredId(null)}
        data-ocid={`conversations.item.${index + 1}`}
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-2 min-w-0 text-left bg-transparent border-none p-0 overflow-hidden"
          onClick={() => onSelect(conv.id)}
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          <span className="flex-1 text-xs sm:text-sm truncate min-w-0">
            {conv.title}
          </span>
        </button>
        {isHovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.id);
            }}
            className="p-1 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0"
            data-ocid={`conversations.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  const Section = ({
    title,
    items,
    startIndex,
  }: { title: string; items: Conversation[]; startIndex: number }) =>
    items.length > 0 ? (
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-sidebar-foreground/30 px-2.5 mb-1.5 uppercase tracking-[0.12em]">
          {title}
        </p>
        {items.map((c, i) => renderItem(c, startIndex + i))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-[min(288px,85vw)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 sm:py-4 border-b border-sidebar-border flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-sidebar-accent"
          data-ocid="sidebar.link"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sidebar-foreground truncate tracking-tight text-sm">
            Deeks AI
          </span>
        </div>
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-sidebar-accent"
            data-ocid="sidebar.close_button"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="px-2.5 py-2.5">
        <Button
          type="button"
          onClick={onNewChat}
          className="w-full justify-start gap-2 gradient-bg text-white border-0 hover:opacity-90 transition-opacity text-xs sm:text-sm font-medium rounded-xl h-8 sm:h-9"
          data-ocid="sidebar.primary_button"
        >
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">New Chat</span>
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 px-1.5 scrollbar-thin min-h-0">
        {conversations.length === 0 ? (
          <div
            className="text-center text-sidebar-foreground/30 text-xs py-10 px-3"
            data-ocid="conversations.empty_state"
          >
            No conversations yet.
            <br />
            <span className="opacity-70">Start a new chat above.</span>
          </div>
        ) : (
          <>
            <Section title="Today" items={today} startIndex={0} />
            <Section
              title="Yesterday"
              items={yesterday}
              startIndex={today.length}
            />
            <Section
              title="Older"
              items={older}
              startIndex={today.length + yesterday.length}
            />
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="px-2.5 py-3 border-t border-sidebar-border flex-shrink-0">
        {/* Settings + Theme toggle row */}
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onSettings}
                  className="flex flex-1 items-center gap-2 px-2.5 py-2 rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all text-xs sm:text-sm min-w-0"
                  data-ocid="sidebar.open_modal_button"
                >
                  <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onCricket && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onCricket}
                    className="p-2 rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all flex-shrink-0"
                    aria-label="Cricket Scores"
                  >
                    <span className="text-sm">🏏</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Cricket Live</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all flex-shrink-0"
                  data-ocid="theme.toggle"
                  aria-label={
                    isDark ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {isDark ? (
                    <Sun className="w-3.5 h-3.5" />
                  ) : (
                    <Moon className="w-3.5 h-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isDark ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-center text-[9px] sm:text-[10px] text-sidebar-foreground/25 mt-2.5 px-2 leading-relaxed">
          Made with ❤️ by Deepak Rajput
          <br />
          from Punjab, India
        </p>
      </div>
    </div>
  );
}
