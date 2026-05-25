import { useEffect, useState } from "react";

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Use this to prevent hydration mismatches when rendering data that comes
 * from client-side cache (e.g. React Query's persist cache in localStorage).
 * The server always renders the "not yet mounted" branch, and the client
 * switches to the real content after the first paint — keeping SSR HTML and
 * the initial client render identical.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
