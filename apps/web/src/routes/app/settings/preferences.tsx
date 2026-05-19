import { createFileRoute } from "@tanstack/react-router";
import {
  CardGroup,
  CardGroupItem,
  CardGroupItemControl,
  CardGroupItemDescription,
  CardGroupItemLabel,
  CardGroupItemTitle,
  CardGroupLabel,
} from "@workspace/ui/components/card-group";
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
      <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
      <div>
        <CardGroupLabel>Appearance</CardGroupLabel>
        <CardGroup>
          <CardGroupItem>
            <CardGroupItemLabel>
              <CardGroupItemTitle>Color theme</CardGroupItemTitle>
              <CardGroupItemDescription>
                Select the color theme for the interface
              </CardGroupItemDescription>
            </CardGroupItemLabel>
            <CardGroupItemControl>
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
            </CardGroupItemControl>
          </CardGroupItem>
        </CardGroup>
      </div>
    </div>
  );
}
