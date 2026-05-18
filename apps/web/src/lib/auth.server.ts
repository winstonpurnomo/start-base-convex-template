import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

const [convexUrl, convexSiteUrl] = [
  process.env.VITE_CONVEX_URL,
  process.env.VITE_CONVEX_SITE_URL,
];
if (!convexUrl || !convexSiteUrl) {
  throw new Error("Missing vars");
}

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl,
  convexSiteUrl,
});
