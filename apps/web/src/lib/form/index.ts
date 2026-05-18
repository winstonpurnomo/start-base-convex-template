import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "@/lib/form/context";
import { InputField } from "@/lib/input-field";
import { SubmitButton } from "@/lib/submit-button";

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
