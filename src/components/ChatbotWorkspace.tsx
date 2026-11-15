import React, { useEffect, useRef, useState } from 'react';
import { Loader2, PlusCircle, Send, Zap } from 'lucide-react';
import type {
  ChatMessage,
  LanguageCode,
  PathStrategy,
  RobotSettings,
  RobotTelemetry,
} from '../types';
import { LANGUAGE_OPTIONS } from '../i18n/translations';
import type { TranslationStrings } from '../i18n/translations';

interface ChatbotWorkspaceProps {
  t: TranslationStrings;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  robotSettings: RobotSettings;
  telemetry: RobotTelemetry;
  coveragePercent: number;
  farmAreaAcres: number;
  pathStrategy: PathStrategy;
}

export const ChatbotWorkspace: React.FC<ChatbotWorkspaceProps> = ({
  t,
  language,
  onLanguageChange,
  robotSettings,
  telemetry,
  coveragePercent,
  farmAreaAcres,
  pathStrategy,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-0',
      role: 'model',
      text: t.chatWelcome,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [modelMode, setModelMode] = useState<'fast' | 'detailed'>('fast');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Update initial welcome message when user switches language before sending any messages
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome-')) {
        return [
          {
            ...prev[0],
            text: t.chatWelcome,
          },
        ];
      }
      return prev;
    });
  }, [t.chatWelcome]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: t.chatWelcome,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setErrorMsg(null);
  };

  const sendMessage = async (textToSend?: string) => {
    const trimmed = (textToSend ?? inputValue).trim();
    if (!trimmed || isStreaming) return;

    setErrorMsg(null);
    if (!textToSend) setInputValue('');

    const nowLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowLabel,
    };

    const assistantId = `model-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'model',
      text: '',
      timestamp: nowLabel,
    };

    const historyForApi = messages
      .filter((m) => !m.id.startsWith('welcome-'))
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, placeholderAssistant]);
    setIsStreaming(true);

    try {
      const tankPercent = Math.round(
        (telemetry.tankLitersRemaining /
          Math.max(1, robotSettings.tankCapacityLiters)) *
          100
      );

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          language,
          modelMode,
          robotContext: {
            dosageMlPerPlant: robotSettings.dosageMlPerPlant,
            tankPercent,
            tankLiters: Number(telemetry.tankLitersRemaining.toFixed(1)),
            tankCapacityLiters: robotSettings.tankCapacityLiters,
            batteryPercent: Math.round(telemetry.batteryPercent),
            batteryVoltage: telemetry.batteryVoltage,
            injectedWeedsCount: telemetry.injectedWeedsCount,
            boomWidthMeters: robotSettings.boomWidthMeters,
            targetSpeedKmh: robotSettings.targetSpeedKmh,
            coveragePercent,
            farmAreaAcres: Number(farmAreaAcres.toFixed(2)),
            pathStrategy,
            sprayerActive: robotSettings.sprayerActive,
          },
        }),
      });

      if (!response.ok || !response.body) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(
          (errPayload as { error?: string }).error ||
            'Unable to connect to Agri Sathi AI.'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('data:')) continue;
          const jsonStr = trimmedLine.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr) as {
              text?: string;
              done?: boolean;
              error?: string;
              model?: string;
            };

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, text: m.text + parsed.text }
                    : m
                )
              );
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to receive response.';
      setErrorMsg(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.text.length > 0));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E6DE] rounded-xl flex flex-col h-[calc(100vh-140px)] min-h-[540px] max-h-[780px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#E2E6DE] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBF9]">
        <div>
          <h1 className="text-base font-semibold text-[#111C16]">
            {t.chatTitle}
          </h1>
          <p className="text-xs text-[#4E5D53]">{t.chatSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language quick selector for chat */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            aria-label="Chat response language"
            className="bg-white border border-[#D4DBD1] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111C16] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.nativeLabel} ({opt.englishName})
              </option>
            ))}
          </select>

          {/* Fast Low-Latency vs Detailed Model Switch */}
          <div className="flex items-center gap-1 p-1 bg-[#EEF2EC] rounded-lg">
            <button
              type="button"
              onClick={() => setModelMode('fast')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                modelMode === 'fast'
                  ? 'bg-white text-[#111C16] shadow-xs'
                  : 'text-[#4E5D53] hover:text-[#111C16]'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-600" />
              {t.chatModelFast}
            </button>
            <button
              type="button"
              onClick={() => setModelMode('detailed')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                modelMode === 'detailed'
                  ? 'bg-white text-[#111C16] shadow-xs'
                  : 'text-[#4E5D53] hover:text-[#111C16]'
              }`}
            >
              {t.chatModelDetailed}
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4DBD1] bg-white text-xs font-medium text-[#111C16] hover:bg-[#F3F6F1] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {t.chatClear}
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F7F8F5]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[82%] md:max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#111C16] text-white'
                  : 'bg-white border border-[#E2E6DE] text-[#111C16]'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {msg.text || (
                  <span className="inline-flex items-center gap-2 text-[#4E5D53] text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
              <div
                className={`text-[10px] mt-1.5 font-mono tabular-nums ${
                  msg.role === 'user' ? 'text-white/60 text-right' : 'text-[#4E5D53]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={threadEndRef} />
      </div>

      {/* Quick Prompts Row */}
      <div className="px-5 py-2.5 border-t border-[#E2E6DE] bg-white flex items-center gap-2 overflow-x-auto">
        {t.quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={isStreaming}
            onClick={() => void sendMessage(prompt)}
            className="px-3 py-1.5 rounded-lg border border-[#D4DBD1] bg-[#FAFBF9] hover:bg-[#EEF2EC] text-xs text-[#111C16] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error Bar */}
      {errorMsg && (
        <div className="px-5 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage();
        }}
        className="p-4 border-t border-[#E2E6DE] bg-white flex items-center gap-3"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isStreaming}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D4DBD1] bg-[#FAFBF9] text-sm text-[#111C16] placeholder:text-[#6E7D73] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isStreaming}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {t.chatSend}
        </button>
      </form>
    </div>
  );
};
