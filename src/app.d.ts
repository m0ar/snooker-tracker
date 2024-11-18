// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Platform {
      // env: {
      //     COUNTER: DurableObjectNamespace;
      // };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
