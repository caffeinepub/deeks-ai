import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Key,
  Lock,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSetApiKey } from "../hooks/useQueries";
import type { useSpeech } from "../hooks/useSpeech";

interface Props {
  open: boolean;
  onClose: () => void;
  cryptoKey: string;
  onImportKey: (key: string) => Promise<void>;
  speech: ReturnType<typeof useSpeech>;
}

export default function SettingsModal({
  open,
  onClose,
  cryptoKey,
  onImportKey,
  speech,
}: Props) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("aura_groq_key") || "",
  );
  const [showKey, setShowKey] = useState(false);
  const [tavilyKey, setTavilyKey] = useState(
    () => localStorage.getItem("deeks_tavily_key") || "",
  );
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [importKeyValue, setImportKeyValue] = useState("");
  const setApiKeyMutation = useSetApiKey();

  const handleSaveTavilyKey = () => {
    localStorage.setItem("deeks_tavily_key", tavilyKey);
    toast.success("Tavily API key saved");
  };

  const handleSaveApiKey = async () => {
    localStorage.setItem("aura_groq_key", apiKey);
    try {
      await setApiKeyMutation.mutateAsync(apiKey);
    } catch {
      // Non-admin users can't set backend key, that's ok
    }
    toast.success("API key saved");
  };

  const handleExportKey = () => {
    const blob = new Blob([cryptoKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aura-encryption-key.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Encryption key exported");
  };

  const handleImportKey = async () => {
    if (!importKeyValue.trim()) return;
    try {
      await onImportKey(importKeyValue.trim());
      toast.success("Encryption key imported");
      setImportKeyValue("");
    } catch {
      toast.error("Invalid key format");
    }
  };

  const handleClearData = () => {
    localStorage.removeItem("aura_groq_key");
    localStorage.removeItem("aura_ai_enc_key");
    toast.success("All local data cleared");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="settings.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              Groq API Key (Free)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="pr-10"
                  data-ocid="settings.input"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                type="button"
                onClick={handleSaveApiKey}
                size="sm"
                data-ocid="settings.save_button"
              >
                Save
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Free key milegi yahan se — 14,400 free requests per day, no
                credit card:
              </p>
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                console.groq.com
              </a>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              Tavily API Key (Web Search)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showTavilyKey ? "text" : "password"}
                  value={tavilyKey}
                  onChange={(e) => setTavilyKey(e.target.value)}
                  placeholder="tvly-..."
                  className="pr-10"
                  data-ocid="settings.input"
                />
                <button
                  type="button"
                  onClick={() => setShowTavilyKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showTavilyKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                type="button"
                onClick={handleSaveTavilyKey}
                size="sm"
                data-ocid="settings.save_button"
              >
                Save
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Free key milegi yahan se — 1000 free searches/month, no credit
                card:
              </p>
              <a
                href="https://app.tavily.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                app.tavily.com
              </a>
            </div>
          </div>

          <Separator />

          {speech.isSupported && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5" />
                Voice Settings
              </Label>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Voice</Label>
                <Select
                  value={String(speech.selectedVoiceIndex)}
                  onValueChange={(v) => speech.setSelectedVoiceIndex(Number(v))}
                >
                  <SelectTrigger data-ocid="settings.select">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {speech.voices.map((v, i) => (
                      <SelectItem key={`${v.name}-${i}`} value={String(i)}>
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Speed: {speech.speechRate.toFixed(1)}x
                </Label>
                <Slider
                  value={[speech.speechRate]}
                  onValueChange={([v]) => speech.setSpeechRate(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Encryption Key
            </Label>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
                {cryptoKey || "Generating..."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportKey}
                className="flex-1 gap-1.5"
                data-ocid="settings.secondary_button"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("import-key-input")?.focus()
                }
                className="flex-1 gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="import-key-input"
                value={importKeyValue}
                onChange={(e) => setImportKeyValue(e.target.value)}
                placeholder="Paste key to import..."
                className="flex-1 text-xs"
                data-ocid="settings.textarea"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleImportKey}
                disabled={!importKeyValue.trim()}
                data-ocid="settings.submit_button"
              >
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Warning: Importing a new key will make previous messages
              unreadable.
            </p>
          </div>

          <Separator />

          <div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClearData}
              className="w-full gap-2"
              data-ocid="settings.delete_button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Local Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
