/**
 * A small promise that resolves once the MSW worker is ready (or has decided
 * not to start because mocks are disabled). The Mock Service Worker only
 * intercepts requests after `worker.start()` resolves; if the app fires
 * fetches earlier, they slip through and the real network 404s.
 *
 * Pages and hooks should not normally `await` this directly. The shared
 * `apiFetch` helper takes care of it transparently so query hooks just work.
 */
import { env } from "@/config/env";

let resolveFn: () => void;

const promise = new Promise<void>((resolve) => {
  resolveFn = resolve;
});

if (typeof window === "undefined" || !env.useMock) {
  // On the server, or with mocks disabled, nothing has to start.
  resolveFn!();
}

export const mockReady = {
  promise,
  resolve: () => resolveFn!(),
};