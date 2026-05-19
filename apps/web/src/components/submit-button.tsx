import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
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
          {isSubmitting ? <Spinner /> : label}
        </Button>
      )}
    </form.Subscribe>
  );
}
