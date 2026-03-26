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
  Plus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Conversation, ConversationId } from "../backend";

interface Props {
  conversations: Conversation[];
  activeConvId: ConversationId | null;
  onSelect: (id: ConversationId) => void;
  onNewChat: () => void;
  onDelete: (id: ConversationId) => void;
  onSettings: () => void;
  onBack: () => void;
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
}: Props) {
  const [hoveredId, setHoveredId] = useState<ConversationId | null>(null);
  const { today, yesterday, older } = groupConversations(conversations);

  const renderItem = (conv: Conversation, index: number) => {
    const isActive = conv.id === activeConvId;
    const isHovered = conv.id === hoveredId;
    return (
      <div
        key={conv.id.toString()}
        className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        }`}
        onMouseEnter={() => setHoveredId(conv.id)}
        onMouseLeave={() => setHoveredId(null)}
        data-ocid={`conversations.item.${index + 1}`}
      >
        <button
          type="button"
          className="flex flex-1 items-center gap-2 min-w-0 text-left bg-transparent border-none p-0"
          onClick={() => onSelect(conv.id)}
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
          <span className="flex-1 text-sm truncate">{conv.title}</span>
        </button>
        {isHovered && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.id);
            }}
            className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors flex-shrink-0"
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
        <p className="text-xs font-medium text-sidebar-foreground/40 px-3 mb-1.5 uppercase tracking-wider">
          {title}
        </p>
        {items.map((c, i) => renderItem(c, startIndex + i))}
      </div>
    ) : null;

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-72">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <button
          type="button"
          onClick={onBack}
          className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          data-ocid="sidebar.link"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sidebar-foreground">
            Deeks AI
          </span>
        </div>
      </div>

      <div className="px-3 py-3">
        <Button
          type="button"
          onClick={onNewChat}
          className="w-full justify-start gap-2 gradient-bg text-white border-0 hover:opacity-90 transition-opacity text-sm"
          data-ocid="sidebar.primary_button"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 scrollbar-thin">
        {conversations.length === 0 ? (
          <div
            className="text-center text-sidebar-foreground/40 text-sm py-12"
            data-ocid="conversations.empty_state"
          >
            No conversations yet
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

      <div className="px-3 py-4 border-t border-sidebar-border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onSettings}
                className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm"
                data-ocid="sidebar.open_modal_button"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-center text-xs text-sidebar-foreground/30 mt-3 px-2">
          Made with ❤️ by Deepak Rajput
        </p>
      </div>
    </div>
  );
}
