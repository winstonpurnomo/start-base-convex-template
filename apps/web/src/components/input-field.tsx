import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import type * as React from "react";

import { useFieldContext } from "@/lib/form/context";

type InputFieldValue = string | number;

export function InputField<T extends string | number>({
  field,
  label,
  description,
  showValidIndicator,
  type,
}: {
  field: string;
  label: string;
  description?: string;
  showValidIndicator?: boolean;
  type?: React.ComponentProps<typeof Input>["type"];
}) {
  const fieldCtx = useFieldContext<T>();
  const isNumberField = typeof fieldCtx.state.value === "number";
  const inferredInputType = (
    isNumberField ? "number" : "text"
  ) as T extends number ? "number" : "text";

  const toFieldValue = (value: string): T => {
    if (isNumberField) {
      return Number(value) as T;
    }
    return value as T;
  };

  const { value } = fieldCtx.state;
  const hasValue =
    typeof value === "number" ? !Number.isNaN(value) : value.trim().length > 0;
  const showErrors =
    fieldCtx.state.meta.isTouched &&
    fieldCtx.state.meta.errors.length > 0 &&
    fieldCtx.state.meta.isBlurred;
  const showValidating =
    !!showValidIndicator && fieldCtx.state.meta.isValidating;
  const showValidCheck =
    !!showValidIndicator &&
    fieldCtx.state.meta.isTouched &&
    hasValue &&
    !fieldCtx.state.meta.isValidating &&
    fieldCtx.state.meta.errors.length === 0;

  return (
    <Field>
      <FieldLabel htmlFor={field}>{label}</FieldLabel>
      <div className="relative">
        <Input
          type={type ?? inferredInputType}
          id={field}
          className={cn((showValidCheck || showValidating) && "pr-8")}
          value={fieldCtx.state.value as InputFieldValue}
          onChange={(e) => fieldCtx.handleChange(toFieldValue(e.target.value))}
          onBlur={fieldCtx.handleBlur}
        />
        {showValidating && (
          <Spinner className="text-muted-foreground pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2" />
        )}
        {showValidCheck && (
          <CheckIcon
            aria-label="valid"
            className="text-emerald-600 pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2"
          />
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {showErrors && <FieldError errors={fieldCtx.state.meta.errors} />}
    </Field>
  );
}
