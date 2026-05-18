import type { UseThemeProps } from "tanstack-theme-kit";

declare module "tanstack-theme-kit" {
  export declare const useTheme: () => UseThemeProps;
}
