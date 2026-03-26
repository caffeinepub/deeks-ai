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

export function useSpeech() {
  const [state, setState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
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
    recognition.lang = "en-US";

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
    (text: string) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
      }
      utterance.rate = speechRate;
      synthRef.current.speak(utterance);
    },
    [voices, selectedVoiceIndex, speechRate],
  );

  const cancelSpeech = useCallback(() => {
    synthRef.current?.cancel();
  }, []);

  return {
    state,
    transcript,
    isSupported,
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
