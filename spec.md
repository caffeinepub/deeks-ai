# Deeks AI

## Current State
A full-stack AI chatbot app with Dr. Deeks as the AI assistant. Features:
- Chat with Groq API (llama3 models with fallback)
- Speech-to-speech (voice input/output)
- File/image upload and analysis
- Dark mode toggle
- AES-256 encrypted messages stored in ICP backend
- Conversations saved in sidebar (chat history already works)
- Responsive UI for all screen sizes

## Requested Changes (Diff)

### Add
1. **Copy button** on each assistant message - copies response text to clipboard, shows checkmark briefly
2. **Regenerate response** button on the last assistant message - re-runs AI with same context
3. **Code syntax highlighting** - color-coded syntax in code blocks (keywords, strings, comments) without external deps using a lightweight tokenizer
4. **Export chat** button in the top bar - downloads the current conversation as a .txt file
5. **Typing indicator** - replace skeleton loader with animated "Dr. Deeks is typing..." with bouncing dots

### Modify
- ChatPanel.tsx: Add copy + regenerate buttons to assistant message bubbles, add export button to top bar, replace skeleton loader with typing indicator animation, enhance code blocks with syntax highlighting
- ChatPage.tsx: Add `onRegenerate` callback to re-send the last user message

### Remove
Nothing removed

## Implementation Plan
1. In ChatPanel.tsx:
   - Add copy button (clipboard icon) on hover of assistant messages, shows checkmark for 2s after copy
   - Add regenerate button (RefreshCw icon) on hover of LAST assistant message only
   - Replace skeleton loading state with animated typing indicator (3 bouncing dots + "Dr. Deeks is typing..." text)
   - Add export button (Download icon) in top bar that exports current conversation as .txt
   - Enhance MarkdownContent code blocks with lightweight syntax highlighting (different colors for keywords, strings, comments, numbers)
2. In ChatPage.tsx:
   - Add `onRegenerate` prop and handler that removes last assistant message and re-calls sendMessage with the last user message content
