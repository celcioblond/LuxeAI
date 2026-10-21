import { isAxiosError } from 'axios';

// Prefer the server's own message (e.g. "Only 3 available") over axios' generic one
export const toMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
};
