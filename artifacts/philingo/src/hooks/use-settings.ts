import { useQuery } from '@tanstack/react-query';

const BASE = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

/** Shared hook — fetches /api/settings; always fresh (no-store) so admin changes appear immediately */
export function useSettings() {
  const { data = {} } = useQuery<Record<string, string>>({
    queryKey: ['site-settings'],
    queryFn: () => fetch(`${BASE}/api/settings`, { cache: 'no-store' }).then(r => r.ok ? r.json() : {}),
    staleTime: 0,
  });
  return data;
}
