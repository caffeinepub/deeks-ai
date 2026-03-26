import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Lock, Mic, Stethoscope, Zap } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onStart: () => void;
}

const features = [
  {
    icon: <Stethoscope className="w-6 h-6" />,
    title: "Health Consultation",
    desc: "Ask about symptoms, diseases, medications, and get clear, easy-to-understand advice.",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Wellness & Nutrition",
    desc: "Get personalized tips on diet, fitness, mental health, and healthy lifestyle habits.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "Voice Conversation",
    desc: "Speak your symptoms and hear responses aloud. Fully hands-free and natural.",
    gradient: "from-indigo-500 to-purple-600",
  },
];

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-foreground text-lg">
            Deeks AI
          </span>
        </div>
        <Button
          onClick={onStart}
          className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 transition-colors"
          data-ocid="nav.primary_button"
        >
          Get Started
        </Button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm mb-8 border border-emerald-200">
            <Zap className="w-3.5 h-3.5" />
            Powered by Groq · End-to-End Encrypted
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Personal{" "}
            <span className="text-emerald-500">Health Expert</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Dr. Deeks gives you instant health advice on symptoms, wellness,
            nutrition, and more — in English, Urdu, or Hindi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onStart}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 transition-colors px-8 gap-2"
              data-ocid="hero.primary_button"
            >
              Talk to Deeks AI <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8"
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

          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            All conversations encrypted in your browser before storage
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="bg-muted/40 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              What Deeks AI can help with
            </h2>
            <p className="text-muted-foreground">
              Trusted health guidance, available 24/7.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 shadow-card border border-border"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5`}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground space-y-2">
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
