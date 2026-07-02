import { ZodTypeAny } from 'zod';

// Formik `validate` from a shared Zod schema — the SAME schema the server
// validates with (docs/TRADEOFFS.md §5). Produces a field→locale-key map,
// the exact shape the server's fail envelope carries, so local and
// server-side validation errors flow through one rendering path (tError).
export const zodToFormikValidate =
  (schema: ZodTypeAny) =>
  (values: unknown): Record<string, string> => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {};
    }
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!(path in errors)) {
        errors[path] = issue.message;
      }
    }
    return errors;
  };
