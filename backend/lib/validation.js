import { AppError } from './errors';

// Zod issue -> stable code that the front can translate
function issueCode(issue) {
  const missing = issue.input === undefined || issue.input === null;
  switch (issue.code) {
    case 'invalid_type':
      return missing ? 'REQUIRED' : 'INVALID_TYPE';
    case 'too_small':
      return issue.minimum === 1 && issue.origin === 'string' ? 'REQUIRED' : 'TOO_SHORT';
    case 'too_big':
      return 'TOO_LONG';
    case 'invalid_format':
      return issue.format === 'email' ? 'INVALID_EMAIL' : issue.format === 'uuid' ? 'INVALID_ID' : 'INVALID_FORMAT';
    case 'invalid_value':
      return missing ? 'REQUIRED' : 'INVALID_VALUE';
    default:
      return issue.params?.code || 'INVALID';
  }
}

export function toFieldErrors(zodError) {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    code: issueCode(issue),
    message: issue.message,
  }));
}

// Validates data with a Zod schema, throws LL_VALIDATION_422 with one entry per invalid field
export function validate(schema, data) {
  // reportInput keeps issue.input, used to tell a missing field from a wrong type
  const result = schema.safeParse(data, { reportInput: true });
  if (!result.success) {
    throw new AppError('LL_VALIDATION_422', { errors: toFieldErrors(result.error) });
  }
  return result.data;
}

// Reads the JSON body of a request and validates it
export async function parseBody(request, schema) {
  let data;
  try {
    data = await request.json();
  } catch {
    throw new AppError('LL_VALIDATION_422', {
      detail: "Le contenu envoyé n'est pas lisible.",
      errors: [{ field: 'body', code: 'INVALID_JSON', message: "Le contenu envoyé n'est pas lisible." }],
    });
  }
  return validate(schema, data);
}
