import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Brain,
  Globe,
  Lock,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onStart: () => void;
}

const features = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Intelligent Conversations",
    desc: "Ask anything — health, science, coding, math, creative writing, or life advice.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Multilingual",
    desc: "Communicate in English, Urdu, or Hindi. Dr. Deeks responds in your language.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Private by Default",
    desc: "Every conversation is encrypted end-to-end in your browser before storage.",
    color: "bg-primary/10 text-primary",
  },
];

const stats = [
  { value: "3+", label: "Languages" },
  { value: "E2E", label: "Encrypted" },
  { value: "Free", label: "To use" },
];

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-3 py-3 sm:px-8 sm:py-5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground text-base sm:text-lg tracking-tight truncate">
            Deeks AI
          </span>
        </div>
        <Button
          onClick={onStart}
          size="sm"
          className="gradient-bg text-white border-0 hover:opacity-90 transition-opacity gap-1 font-medium flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9"
          data-ocid="nav.primary_button"
        >
          <span className="hidden xs:inline sm:inline">Get Started</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 py-10 sm:py-20 lg:py-28 text-center overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto w-full min-w-0"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-primary/8 text-primary text-[10px] sm:text-sm mb-6 sm:mb-8 border border-primary/20 font-medium max-w-full">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">Powered by Groq · E2E Encrypted</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-[60px] font-bold text-foreground mb-4 sm:mb-5 leading-[1.15] tracking-[-0.02em] break-words">
            Your Personal <span className="gradient-text">AI Assistant</span>
          </h1>

          <p className="text-xs xs:text-sm sm:text-lg text-muted-foreground mb-7 sm:mb-10 max-w-lg mx-auto leading-relaxed px-1">
            Dr. Deeks answers anything — health, coding, science, life advice,
            and more. Available in English, Urdu, and Hindi.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center mb-8 sm:mb-10 px-1">
            <Button
              onClick={onStart}
              size="lg"
              className="gradient-bg text-white border-0 hover:opacity-90 transition-opacity px-5 sm:px-8 gap-2 font-semibold h-10 sm:h-12 text-sm sm:text-base w-full xs:w-auto"
              data-ocid="hero.primary_button"
            >
              Talk to Dr. Deeks <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-5 sm:px-8 h-10 sm:h-12 text-sm sm:text-base border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors w-full xs:w-auto"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              data-ocid="hero.secondary_button"
            >
              See Features
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-5 sm:gap-12 mb-5 sm:mb-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground">
            <Lock className="w-3 h-3 flex-shrink-0" />
            <span>All conversations encrypted in your browser</span>
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="bg-muted/40 py-10 sm:py-20 px-3 sm:px-6 border-t border-border overflow-x-hidden"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight break-words">
              Everything you need, one assistant
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
              No limits on topics. Ask Dr. Deeks anything, in any language.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-7 shadow-card border border-border"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${f.color} flex items-center justify-center mb-3 sm:mb-5 flex-shrink-0`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 tracking-tight text-sm sm:text-base">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col items-center gap-2 sm:gap-3"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="gradient-bg text-white border-0 hover:opacity-90 transition-opacity gap-2 font-semibold h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full xs:w-auto max-w-xs"
              data-ocid="features.primary_button"
            >
              <MessageSquare className="w-4 h-4" />
              Start a Conversation
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Free to use · No account required after login
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 sm:py-8 px-3 sm:px-6 border-t border-border text-center text-[10px] sm:text-sm text-muted-foreground space-y-1 sm:space-y-1.5">
        <p className="font-medium text-foreground/70">
          Made with ❤️ by Deepak Rajput from Punjab, India
        </p>
        <p>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
