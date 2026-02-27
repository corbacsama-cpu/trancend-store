/**
 * usePbData / usePbDataKeyed
 * ─────────────────────────────────────────────────────────────
 * Pure client-side fetching for PocketBase. No createResource,
 * no SSR serialization, no hydration cache conflicts.
 *
 * HOW IT WORKS:
 *  - createSignal holds the data (starts with `initial`)
 *  - onMount triggers the first fetch (client only, after hydration)
 *  - createEffect watches key changes for the keyed variant
 *
 * RESULT: PocketBase data is always fresh on first load AND reload.
 */
import { createSignal, createEffect, onMount, on } from "solid-js";
import { isServer } from "solid-js/web";

export function usePbData<T>(fetcher: () => Promise<T>, initial: T) {
  const [data,    setData]    = createSignal<T>(initial);
  const [loading, setLoading] = createSignal(false);

  if (!isServer) {
    onMount(async () => {
      setLoading(true);
      try {
        const res = await fetcher();
        setData(() => res as any);
      } catch (e) {
        console.error("usePbData fetch error:", e);
      } finally {
        setLoading(false);
      }
    });
  }

  return { data, loading };
}

export function usePbDataKeyed<K, T>(
  key: () => K,
  fetcher: (k: K) => Promise<T>,
  initial: T
) {
  const [data,    setData]    = createSignal<T>(initial);
  const [loading, setLoading] = createSignal(false);

  if (!isServer) {
    // on(key) makes the effect re-run only when key() changes
    createEffect(on(key, async (k) => {
      setLoading(true);
      try {
        const res = await fetcher(k);
        setData(() => res as any);
      } catch (e) {
        console.error("usePbDataKeyed fetch error:", e);
      } finally {
        setLoading(false);
      }
    }));
  }

  return { data, loading };
}
