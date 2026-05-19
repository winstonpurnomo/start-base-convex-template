import { Google } from "@ridemountainpig/svgl-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { toastManager } from "@workspace/ui/components/toast";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth";
import { useAppForm } from "@/lib/form";

export const Route = createFileRoute("/auth/(redir)/signin")({
  component: SignInPage,
});

function SignInPage() {
  const { rt } = Route.useSearch();
  const [step, setStep] = useState<"email" | "password">("email");

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: z.object({
        email: z.email(),
        password: z.string().min(8, {
          error: "Password must be at least 8 characters long",
        }),
      }),
    },
    onSubmit: ({ value }) =>
      authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: rt ?? "/auth/organization",
        },
        {
          onError: (error) => {
            toastManager.add({
              title: "Failed to sign in",
              description: error.error.message,
            });
          },
        }
      ),
  });

  return (
    <div className="min-h-svh bg-background flex flex-col items-center justify-between px-4 py-16">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/logo.svg"
            width={48}
            height={48}
            alt="Logo"
            className="dark:invert"
          />
        </div>

        {/* Heading */}
        <h1 className="text-foreground text-2xl font-semibold mb-8">
          Sign in to Acme
        </h1>

        {/* Card */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === "email") {
                setStep("password");
                return;
              }
              form.handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            {/* Email field */}
            <form.AppField name="email">
              {(field) => (
                <field.InputField field="email" label="Email" type="email" />
              )}
            </form.AppField>

            {/* Password field — revealed after email step */}
            {step === "password" && (
              <div className="motion-preset-slide-up motion-duration-200">
                <form.AppField name="password">
                  {(field) => (
                    <field.InputField
                      field="password"
                      label="Password"
                      type="password"
                    />
                  )}
                </form.AppField>
              </div>
            )}

            {/* Continue / Sign in button */}
            {step === "email" ? (
              <Button
                size="lg"
                className="w-full mt-2"
                onClick={() => setStep("password")}
              >
                Continue
              </Button>
            ) : (
              <form.AppForm>
                <form.SubmitButton
                  label="Sign in"
                  size="lg"
                  className="w-full mt-2"
                />
              </form.AppForm>
            )}
          </form>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Google SSO */}
          <button className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-transparent hover:bg-muted px-3 h-9 text-sm font-medium text-foreground transition-colors cursor-pointer">
            <Google width={18} height={18} />
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Get started
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-sm text-muted-foreground/70">
        Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
