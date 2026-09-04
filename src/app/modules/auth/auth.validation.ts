const invalid = (message: string) => Object.assign(new Error(message), { statusCode: 400 });

const credentials = (value: unknown) => {
  const body = (value as { body?: Record<string, unknown> }).body;
  if (!body || typeof body.email !== "string" || !/^\S+@\S+\.\S+$/.test(body.email))
    throw invalid("A valid email is required");
  if (typeof body.password !== "string" || body.password.length < 10)
    throw invalid("Password must be at least 10 characters");
  return value;
};

export const authValidation = {
  register: {
    parse: (value: unknown) => {
      credentials(value);
      const name = (value as { body: Record<string, unknown> }).body.name;
      if (typeof name !== "string" || name.trim().length < 2)
        throw invalid("Name must contain at least 2 characters");
      return value;
    },
  },
  login: { parse: credentials },
  refresh: {
    parse: (value: unknown) => {
      const token = (value as { body?: Record<string, unknown> }).body?.refreshToken;
      if (typeof token !== "string" || !token) throw invalid("refreshToken is required");
      return value;
    },
  },
};
