export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}

export function logInfo(context: string, message: string, data?: unknown): void {
  if (data !== undefined) {
    console.log(`[${context}] ${message}`, data);
  } else {
    console.log(`[${context}] ${message}`);
  }
}

export function logDebug(context: string, message: string, data?: unknown): void {
  if (data !== undefined) {
    console.debug(`[${context}] ${message}`, data);
  } else {
    console.debug(`[${context}] ${message}`);
  }
}

export function logWarn(context: string, message: string, data?: unknown): void {
  if (data !== undefined) {
    console.warn(`[${context}] ${message}`, data);
  } else {
    console.warn(`[${context}] ${message}`);
  }
}