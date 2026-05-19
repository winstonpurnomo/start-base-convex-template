import { createFormHook } from "@tanstack/react-form";

import { InputField } from "@/components/input-field";
import { SubmitButton } from "@/components/submit-button";
import { fieldContext, formContext } from "@/lib/form/context";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
  },
  formComponents: {
    SubmitButton,
  },
});
