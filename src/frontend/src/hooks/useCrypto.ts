import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aura_ai_enc_key";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function generateKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

async function importKey(base64: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(base64);
  return window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export function useCrypto() {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [keyBase64, setKeyBase64] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const key = await importKey(stored);
          setCryptoKey(key);
          setKeyBase64(stored);
        } catch {
          const key = await generateKey();
          const exported = await exportKey(key);
          localStorage.setItem(STORAGE_KEY, exported);
          setCryptoKey(key);
          setKeyBase64(exported);
        }
      } else {
        const key = await generateKey();
        const exported = await exportKey(key);
        localStorage.setItem(STORAGE_KEY, exported);
        setCryptoKey(key);
        setKeyBase64(exported);
      }
      setIsReady(true);
    };
    init();
  }, []);

  const encrypt = useCallback(
    async (plaintext: string): Promise<string> => {
      if (!cryptoKey) throw new Error("Crypto key not ready");
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        encoded,
      );
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);
      return arrayBufferToBase64(combined.buffer);
    },
    [cryptoKey],
  );

  const decrypt = useCallback(
    async (cipherBase64: string): Promise<string> => {
      if (!cryptoKey) throw new Error("Crypto key not ready");
      try {
        const combined = new Uint8Array(base64ToArrayBuffer(cipherBase64));
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        const decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv },
          cryptoKey,
          ciphertext,
        );
        return new TextDecoder().decode(decrypted);
      } catch {
        // Return raw if decryption fails (unencrypted legacy)
        return atob(cipherBase64);
      }
    },
    [cryptoKey],
  );

  const importKeyFromBase64 = useCallback(async (base64: string) => {
    const key = await importKey(base64);
    localStorage.setItem(STORAGE_KEY, base64);
    setCryptoKey(key);
    setKeyBase64(base64);
  }, []);

  return { encrypt, decrypt, isReady, keyBase64, importKeyFromBase64 };
}
