import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { useTheme } from "tanstack-theme-kit";

export const Route = createFileRoute("/app/settings/theme")({
  component: RouteComponent,
});

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function RouteComponent() {
  const { theme, setTheme, themes } = useTheme();

  const displayThemes = themes.includes("system")
    ? themes
    : [...themes, "system"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Theme</h1>
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Appearance
        </h2>
        <div className="rounded-lg border divide-y">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">Color theme</p>
              <p className="text-sm text-muted-foreground">
                Select the color theme for the interface
              </p>
            </div>
            <div className="flex items-center gap-2">
              {displayThemes.map((t) => (
                <Button
                  key={t}
                  variant={theme === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(t)}
                >
                  {themeLabels[t] ?? t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
