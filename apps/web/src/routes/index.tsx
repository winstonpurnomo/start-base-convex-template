import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import { useTheme } from "tanstack-theme-kit";

export const Route = createFileRoute("/")({ component: LandingPage });

const COLS = 48;
const ROWS = 20;
const CELL = 20;

// Lightness levels from the light theme palette (oklch, 0–1)
const LEVELS = [0.922, 0.97, 0.985, 1, 0.708, 0.556, 0.439];

function noise(x: number, y: number, t: number) {
  // simple smooth noise via overlapping sine waves
  return (
    Math.sin(x * 0.3 + t * 0.8) * Math.cos(y * 0.4 + t * 0.6) +
    Math.sin((x + y) * 0.25 + t * 0.5) * 0.5 +
    Math.cos(x * 0.15 - y * 0.2 + t * 0.3) * 0.5
  );
}

function PixelGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let raf: number;
    const start = performance.now();

    function draw() {
      const t = (performance.now() - start) / 1000;
      if (!canvas || !ctx) {
        return;
      }

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          const n = noise(col, row, t);
          // map -2..2 → 0..1
          const normalized = (n + 2) / 4;
          const idx = Math.floor(normalized * (LEVELS.length - 1));
          const l = LEVELS[Math.min(idx, LEVELS.length - 1)];
          const lightness = Math.round(l * 100);
          ctx.fillStyle = `oklch(${lightness}% 0 0)`;
          ctx.fillRect(col * CELL, row * CELL, CELL - 1, CELL - 1);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        className="w-full"
        style={{ imageRendering: "pixelated" }}
        aria-label="Animated pixel grid"
      />
    </div>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const themes = ["light", "dark", "system"] as const;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            "px-3 py-1 rounded-full text-xs capitalize transition-colors",
            theme === t
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-svh flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
        <nav className="flex items-center gap-8">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </button>
        </nav>
        <Link
          to="/"
          aria-label="Home"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 6L6 24L24 42L42 24L24 6Z" fill="currentColor" />
            <path
              d="M24 14L14 24L24 34L34 24L24 14Z"
              fill="var(--background)"
            />
          </svg>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/auth/signin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link to="/auth/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 px-8 pt-16 pb-0 max-w-7xl mx-auto w-full">
        {/* Headline */}
        <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.02] tracking-tight text-foreground max-w-4xl mb-8">
          Ship faster.
          <br />
          Build better.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          A production-ready starter with Convex, TanStack Router, and a full
          component library — so you can focus on what makes your product
          unique.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6 mb-20">
          <Link to="/auth/signup">
            <Button size="lg">Start free trial</Button>
          </Link>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            See how it works
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <PixelGrid />
      </main>

      {/* Bottom CTA */}
      <section className="px-8 pt-32 pb-24 max-w-7xl mx-auto w-full">
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tight text-foreground max-w-3xl mb-6">
          Ready to ship your next project faster?
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Join hundreds of teams already building on this stack — everything
          wired up so you can focus on your product from day one.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/auth/signup">
            <Button size="lg">Start free trial</Button>
          </Link>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            Book a demo
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar">
        <div className="px-8 py-16 max-w-7xl mx-auto w-full grid grid-cols-[1fr_auto] gap-16">
          {/* Newsletter */}
          <div className="max-w-sm">
            <div className="text-sm font-medium text-foreground mb-3">
              Stay in the loop
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Get product updates and release notes delivered to your inbox.
            </p>
            <div className="flex items-center border-b border-border pb-2 gap-2">
              <input
                type="email"
                placeholder="Email"
                aria-label="Email for newsletter"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                type="button"
                aria-label="Subscribe to newsletter"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-4 gap-12">
            {[
              {
                heading: "Product",
                links: ["Features", "Pricing", "Integrations", "Changelog"],
              },
              {
                heading: "Company",
                links: ["About", "Careers", "Blog", "Press Kit"],
              },
              {
                heading: "Resources",
                links: ["Help Center", "API Docs", "Status", "Contact"],
              },
              {
                heading: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Security"],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div className="text-sm font-medium text-foreground mb-4">
                  {heading}
                </div>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-border">
          <span className="text-sm text-muted-foreground">
            © 2026 Acme, Inc.
          </span>
          <div className="flex items-center gap-5">
            <ThemeSelector />
            {/* X / Twitter */}
            <button
              aria-label="X / Twitter"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.6 1h2.3L9.8 6.8 16 15h-4.3l-3.7-4.8L3.6 15H1.3l5.5-6.2L0 1h4.4l3.3 4.4L12.6 1zm-.8 12.6h1.3L4.3 2.3H2.9l8.9 11.3z" />
              </svg>
            </button>
            {/* GitHub */}
            <button
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </button>
            {/* YouTube */}
            <button
              aria-label="YouTube"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.84 4.75s-.16-1.1-.64-1.58c-.61-.64-1.3-.64-1.61-.68C11.24 2.32 8 2.32 8 2.32s-3.24 0-5.59.17c-.32.04-1 .04-1.61.68C.32 3.65.16 4.75.16 4.75S0 6.04 0 7.32v1.2c0 1.28.16 2.57.16 2.57s.16 1.1.64 1.58c.61.64 1.41.62 1.77.68C3.84 13.52 8 13.52 8 13.52s3.24 0 5.59-.19c.32-.04 1-.04 1.61-.68.48-.48.64-1.58.64-1.58S16 9.8 16 8.52v-1.2c0-1.28-.16-2.57-.16-2.57zM6.35 10.16V5.66l4.33 2.26-4.33 2.24z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
