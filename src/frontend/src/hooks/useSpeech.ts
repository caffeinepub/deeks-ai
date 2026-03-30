import { useCallback, useEffect, useRef, useState } from "react";

type SpeechState = "idle" | "recording" | "processing";

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const HINGLISH_WORDS =
  /\b(bhai|yaar|kya|hai|nahi|aur|agar|toh|bhi|haan|accha|theek|sahi|dekh|chal|bol|karo|karta|karte|mein|mujhe|tumhe|aap|hum|tum|woh|isko|usko|lekin|matlab|seedha|sirf|bahut|thoda|kuch|kaisa|kaise|kyun|jab|tab|abhi|phir|pehle|baad|upar|neeche|sab|koi|kab|yeh|woh|iss|us|unka|mera|tera|apna|gaya|aaya|hua|hoga|hoti|hota|raha|rahi|lena|dena|bata|pata|samajh|lagta|lagti|chahiye|milega|milti|bilkul|zarur|shayad|zaroor|duniya|zindagi|dost|ghar|kaam|paisa|log|cheez|jagah|wala|wali|wale|liye|saath|baat|baar|din|raat|waqt|taraf|tarah)\b/i;

const PUNJABI_WORDS =
  /\b(ki|hun|karda|kardi|karo|nahi|haan|oye|veer|paji|bhenji|puttar|dass|dasde|chalda|chaldi|aaja|jaa|aa|ja|ve|ni|ne|nu|da|di|de|ton|nal|utte|thalle|agge|pichhe|sanu|tenu|menu|assi|tussi|ohna|ena|kinna|kithey|kithe|kidhar|idhar|udhar|ohh|ahh|arre|soch|kar|karo|hoya|hoyi|hoye|lagda|lagdi|chahida|chahidi|milna|milda|pauna|paunda|khana|peena|sona|uthna|jaana|aana|karna|rehna|bolna|sunn|dekh|samajh|yaar|dost|ghar|kam|paisa)\b/i;

type LangDetection = "en" | "hi" | "pa";

function detectLang(text: string): LangDetection {
  // Gurmukhi script = Punjabi
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  // Devanagari script = Hindi
  if (/[\u0900-\u097F]/.test(text)) return "hi";

  const words = text.split(/\s+/);
  const punjabiCount = words.filter((w) => PUNJABI_WORDS.test(w)).length;
  const hindiCount = words.filter((w) => HINGLISH_WORDS.test(w)).length;

  if (punjabiCount > hindiCount && punjabiCount >= 2) return "pa";
  if (hindiCount >= 2 || (words.length <= 4 && hindiCount >= 1)) return "hi";
  return "en";
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: LangDetection,
  selectedIndex: number,
): { voice: SpeechSynthesisVoice | null; lang: string } {
  if (lang === "pa") {
    const pa = voices.find((v) => v.lang.startsWith("pa"));
    if (pa) return { voice: pa, lang: "pa-IN" };
    // Fallback to hi-IN which sounds closer to Punjabi than English
    const hi = voices.find((v) => v.lang.startsWith("hi"));
    if (hi) return { voice: hi, lang: "hi-IN" };
    return { voice: voices[selectedIndex] ?? null, lang: "hi-IN" };
  }
  if (lang === "hi") {
    const hi = voices.find((v) => v.lang.startsWith("hi"));
    if (hi) return { voice: hi, lang: "hi-IN" };
    return { voice: voices[selectedIndex] ?? null, lang: "hi-IN" };
  }
  return { voice: voices[selectedIndex] ?? null, lang: "en-US" };
}

export function useSpeech() {
  const [state, setState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState(1.0);

  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI && window.speechSynthesis) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length > 0) setVoices(v);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const startRecording = useCallback((onResult: (text: string) => void) => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "";

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setState("idle");
      onResult(text);
    };
    recognition.onerror = () => setState("idle");
    recognition.onend = () => setState("idle");

    recognitionRef.current = recognition;
    recognition.start();
    setState("recording");
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState("processing");
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();

      const detectedLang = detectLang(text);
      const { voice, lang } = pickVoice(
        voices,
        detectedLang,
        selectedVoiceIndex,
      );

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang = lang;
      utterance.rate = speechRate;
      // Slightly warmer pitch for Hindi/Punjabi
      utterance.pitch = detectedLang !== "en" ? 1.1 : 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    },
    [voices, selectedVoiceIndex, speechRate],
  );

  const cancelSpeech = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    state,
    transcript,
    isSupported,
    isSpeaking,
    voices,
    selectedVoiceIndex,
    setSelectedVoiceIndex,
    speechRate,
    setSpeechRate,
    startRecording,
    stopRecording,
    speak,
    cancelSpeech,
  };
}
