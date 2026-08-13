export function logError(context: string, error: unknown): void {
  // Application logging strategy: server-side structured context, never leaked to the client.
  console.error(`[${context}]`, error);
}