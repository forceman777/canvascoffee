/**
 * Minimal Supabase client: calls Postgres functions through the REST endpoint
 * (`/rest/v1/rpc/<fn>`) with the PUBLIC anon key. No SDK needed.
 *
 * All writes go through SECURITY DEFINER functions that validate input and recompute
 * prices on the server (see supabase/migrations). Tables have RLS on and no public policies.
 */

const env = import.meta.env ?? ({} as Record<string, string | undefined>);
const url = env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '') || null;
const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim() || null;

export const backendConfigured = () => Boolean(url && anonKey);

export class BackendError extends Error {
  constructor(
    message: string,
    public readonly kind: 'not-configured' | 'network' | 'timeout' | 'rejected' | 'server',
  ) {
    super(message);
  }
}

/** Messages raised by the database functions, mapped to plain language. */
const knownErrors: Record<string, string> = {
  invalid_name: 'Check the name and try again.',
  invalid_phone: 'Check the phone number and try again.',
  invalid_address: 'Check the delivery address and try again.',
  invalid_items: 'Something in the order is no longer available. Review the order and try again.',
  empty_order: 'The order is empty.',
  invalid_date: 'Choose a valid date.',
  invalid_time: 'Choose a valid time.',
  invalid_party_size: 'Check the number of guests.',
  invalid_message: 'Check the message and try again.',
  rate_limited: 'Several requests were just sent from this number. Wait a few minutes and try again.',
};

export async function callRpc<T>(fn: string, args: Record<string, unknown>, timeoutMs = 15000): Promise<T> {
  if (!url || !anonKey) {
    throw new BackendError('Online submission is not connected yet.', 'not-configured');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new BackendError('The request took too long. Check your connection and try again.', 'timeout');
    }
    throw new BackendError('Could not reach the server. Check your connection and try again.', 'network');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let code = '';
    try {
      const body = await res.json();
      code = String(body?.message ?? '');
    } catch {
      /* ignore */
    }
    const friendly = knownErrors[code];
    if (friendly) throw new BackendError(friendly, 'rejected');
    throw new BackendError('The server could not process this request. Nothing was submitted. Try again shortly.', 'server');
  }
  return (await res.json()) as T;
}
