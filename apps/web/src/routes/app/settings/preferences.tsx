import { createFileRoute } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useTheme } from "tanstack-theme-kit";

export const Route = createFileRoute("/app/settings/preferences")({
  component: RouteComponent,
});

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function RouteComponent() {
  const { theme, setTheme, themes } = useTheme();

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
            <Select
              value={theme}
              onValueChange={(v) => {
                if (v) {
                  setTheme(v);
                }
              }}
              itemToStringLabel={(v) => v.at(0)?.toUpperCase() + v.slice(1)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {themeLabels[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
