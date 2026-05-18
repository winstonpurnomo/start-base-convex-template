import { Button } from "@workspace/ui/components/button";
import type React from "react";

import { useFormContext } from "@/lib/form/context";

type SubmitButtonProps = {
  label: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export function SubmitButton({ label, ...props }: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.isValid, state.isSubmitting]}>
      {([isValid, isSubmitting]) => (
        <Button disabled={!isValid || isSubmitting} type="submit" {...props}>
          {isSubmitting ? "Submitting..." : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
