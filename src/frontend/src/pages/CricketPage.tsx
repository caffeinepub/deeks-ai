import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Trophy, WifiOff } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";

const RAPIDAPI_KEY = "c1245152bamshd41c09579ec09cep1f4171jsn3c30fca858d0";
const RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com";
const TAVILY_KEY = "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";

interface MatchScore {
  inngs1?: { runs?: number; wickets?: number; overs?: string };
  inngs2?: { runs?: number; wickets?: number; overs?: string };
}

interface MatchInfo {
  matchId: number;
  seriesName: string;
  matchDesc: string;
  matchFormat: string;
  startDate: string;
  state: string;
  status: string;
  team1: { teamName: string; teamSName: string };
  team2: { teamName: string; teamSName: string };
  venueInfo?: { ground: string; city: string };
}

interface Match {
  matchInfo: MatchInfo;
  matchScore?: MatchScore;
}

interface MatchCategory {
  seriesAdWrapper?: { seriesName: string };
  seriesName?: string;
  matches: Match[];
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

function formatScore(score?: {
  runs?: number;
  wickets?: number;
  overs?: string;
}) {
  if (!score) return null;
  const runs = score.runs ?? 0;
  const wickets = score.wickets;
  const overs = score.overs;
  if (wickets !== undefined && wickets < 10) {
    return `${runs}/${wickets}${overs ? ` (${overs})` : ""}`;
  }
  return `${runs}${overs ? ` (${overs})` : ""}`;
}

function MatchCard({ match }: { match: Match }) {
  const { matchInfo, matchScore } = match;
  const isLive = matchInfo.state?.toLowerCase() === "live";
  const score1 = matchScore?.inngs1;
  const score2 = matchScore?.inngs2;
  const team1Score = formatScore(score1);
  const team2Score = formatScore(score2);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isLive
          ? "border-green-500/40 bg-green-500/5 shadow-[0_0_20px_oklch(0.65_0.17_145/0.08)]"
          : "border-border/50 bg-card/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                Live
              </span>
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            {matchInfo.matchFormat} · {matchInfo.matchDesc}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
          {matchInfo.seriesName?.length > 20
            ? `${matchInfo.seriesName.slice(0, 20)}…`
            : matchInfo.seriesName}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">
                {matchInfo.team1.teamSName.slice(0, 2)}
              </span>
            </div>
            <span className="font-semibold text-sm">
              {matchInfo.team1.teamSName}
            </span>
          </div>
          {team1Score && (
            <span className="font-mono font-bold text-sm">{team1Score}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted-foreground">
                {matchInfo.team2.teamSName.slice(0, 2)}
              </span>
            </div>
            <span className="font-semibold text-sm">
              {matchInfo.team2.teamSName}
            </span>
          </div>
          {team2Score && (
            <span className="font-mono font-bold text-sm">{team2Score}</span>
          )}
        </div>
      </div>

      {matchInfo.status && (
        <div
          className={`mt-3 pt-3 border-t border-border/30 text-xs ${
            isLive ? "text-green-400" : "text-muted-foreground"
          }`}
        >
          {matchInfo.status}
        </div>
      )}

      {matchInfo.venueInfo && (
        <div className="mt-1 text-[10px] text-muted-foreground/60">
          📍 {matchInfo.venueInfo.ground}, {matchInfo.venueInfo.city}
        </div>
      )}
    </div>
  );
}

function TavilyResultCard({ result }: { result: TavilyResult }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-4">
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-sm text-primary hover:underline block mb-2"
      >
        {result.title}
      </a>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
        {result.content}
      </p>
    </div>
  );
}

interface Props {
  onBack: () => void;
}

export default function CricketPage({ onBack }: Props) {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [tavilyResults, setTavilyResults] = useState<TavilyResult[] | null>(
    null,
  );
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "recent" | "upcoming">(
    "live",
  );
  const { isDark, toggleTheme } = useTheme();

  const fetchMatches = useCallback(
    async (type: "live" | "recent" | "upcoming") => {
      const resp = await fetch(
        `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${type}`,
        {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        },
      );
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const data = await resp.json();
      const allMatches: Match[] = [];
      for (const category of (data.typeMatches || []) as MatchCategory[]) {
        for (const seriesWrapper of (
          category as unknown as { seriesMatches: unknown[] }
        ).seriesMatches || []) {
          const series =
            (
              seriesWrapper as {
                seriesAdWrapper?: { seriesName: string; matches: unknown[] };
                seriesName?: string;
                matches?: unknown[];
              }
            ).seriesAdWrapper ||
            (seriesWrapper as { seriesName?: string; matches?: unknown[] });
          for (const m of (
            series as {
              matches?: { matchInfo?: MatchInfo; matchScore?: MatchScore }[];
            }
          ).matches || []) {
            if (m.matchInfo) {
              allMatches.push({
                matchInfo: {
                  ...m.matchInfo,
                  seriesName:
                    (series as { seriesName?: string }).seriesName ||
                    m.matchInfo.seriesName ||
                    "",
                },
                matchScore: m.matchScore,
              });
            }
          }
        }
      }
      return allMatches;
    },
    [],
  );

  const fetchTavilyFallback = useCallback(async () => {
    const tryQuery = async (query: string) => {
      try {
        const resp = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_KEY,
            query,
            search_depth: "basic",
            max_results: 6,
            include_answer: false,
          }),
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        return data.results?.length > 0 ? data.results : null;
      } catch {
        return null;
      }
    };
    const results =
      (await tryQuery("IPL 2025 live cricket score today")) ||
      (await tryQuery("IPL today match result scorecard"));
    if (results) {
      setTavilyResults(results);
      setUsingFallback(true);
    } else {
      setError("Cricket data unavailable. Please try again later.");
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);
    setTavilyResults(null);
    try {
      const [live, recent, upcoming] = await Promise.allSettled([
        fetchMatches("live"),
        fetchMatches("recent"),
        fetchMatches("upcoming"),
      ]);
      if (live.status === "fulfilled") setLiveMatches(live.value);
      if (recent.status === "fulfilled") setRecentMatches(recent.value);
      if (upcoming.status === "fulfilled") setUpcomingMatches(upcoming.value);
      setLastUpdated(new Date());

      const allFailed =
        live.status === "rejected" &&
        recent.status === "rejected" &&
        upcoming.status === "rejected";

      if (allFailed) {
        // Try Tavily fallback
        await fetchTavilyFallback();
        setLastUpdated(new Date());
      }
    } catch {
      await fetchTavilyFallback();
    } finally {
      setLoading(false);
    }
  }, [fetchMatches, fetchTavilyFallback]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 60000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const currentMatches =
    activeTab === "live"
      ? liveMatches
      : activeTab === "recent"
        ? recentMatches
        : upcomingMatches;

  const iplMatches = currentMatches.filter(
    (m) =>
      m.matchInfo.seriesName?.toLowerCase().includes("ipl") ||
      m.matchInfo.seriesName?.toLowerCase().includes("indian premier"),
  );
  const otherMatches = currentMatches.filter(
    (m) =>
      !m.matchInfo.seriesName?.toLowerCase().includes("ipl") &&
      !m.matchInfo.seriesName?.toLowerCase().includes("indian premier"),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏏</span>
              <div>
                <h1 className="font-bold text-base leading-tight">
                  Cricket Live
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  {usingFallback ? "Web Search Results" : "Scores & Updates"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={loadAll}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs - only show when not in fallback mode */}
      {!usingFallback && (
        <div className="sticky top-[57px] z-20 bg-background/80 backdrop-blur-md border-b border-border/30">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex">
              {(["live", "recent", "upcoming"] as const).map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-all border-b-2 ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "live" && liveMatches.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live ({liveMatches.length})
                    </span>
                  )}
                  {tab !== "live" &&
                    (tab === "recent"
                      ? `Recent (${recentMatches.length})`
                      : `Upcoming (${upcomingMatches.length})`)}
                  {tab === "live" && liveMatches.length === 0 && "Live"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4 pb-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading cricket scores...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <WifiOff className="w-10 h-10 text-muted-foreground/40" />
            <div>
              <p className="font-semibold text-sm">Could not load scores</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadAll}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
            </Button>
          </div>
        )}

        {/* Tavily Fallback Results */}
        {!loading && usingFallback && tavilyResults && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h2 className="font-bold text-sm text-yellow-500">
                IPL 2025 Latest Updates
              </h2>
              <div className="flex-1 h-px bg-yellow-500/20" />
            </div>
            <p className="text-xs text-muted-foreground -mt-2 mb-3">
              Live scores not available right now. Showing latest news from the
              web.
            </p>
            {tavilyResults.map((result) => (
              <TavilyResultCard key={result.url} result={result} />
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          !usingFallback &&
          currentMatches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-4xl">🏏</span>
              <p className="font-semibold text-sm">
                {activeTab === "live"
                  ? "No live matches right now"
                  : activeTab === "recent"
                    ? "No recent matches found"
                    : "No upcoming matches scheduled"}
              </p>
              <p className="text-xs text-muted-foreground">Check back later!</p>
            </div>
          )}

        {!loading && !error && !usingFallback && currentMatches.length > 0 && (
          <div className="space-y-6">
            {iplMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-bold text-sm text-yellow-500">
                    IPL 2025
                  </h2>
                  <div className="flex-1 h-px bg-yellow-500/20" />
                </div>
                <div className="grid gap-3">
                  {iplMatches.map((m, i) => (
                    <MatchCard key={m.matchInfo.matchId || i} match={m} />
                  ))}
                </div>
              </section>
            )}

            {otherMatches.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🌍</span>
                  <h2 className="font-bold text-sm text-muted-foreground">
                    International & Other
                  </h2>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                <div className="grid gap-3">
                  {otherMatches.map((m, i) => (
                    <MatchCard key={m.matchInfo.matchId || i} match={m} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
