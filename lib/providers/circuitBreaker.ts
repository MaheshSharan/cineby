import {
  CIRCUIT_BREAKER_FAILURE_THRESHOLD,
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
} from "./constants";

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const circuitMap = new Map<string, CircuitState>();

export function isCircuitOpen(providerId: string): boolean {
  const state = circuitMap.get(providerId);
  if (!state || !state.isOpen) {
    return false;
  }

  // Check if cooldown period has passed
  if (Date.now() - state.lastFailureTime > CIRCUIT_BREAKER_RESET_TIMEOUT_MS) {
    state.isOpen = false;
    state.failures = 0;
    return false;
  }

  return true;
}

export function recordSuccess(providerId: string): void {
  const state = circuitMap.get(providerId);
  if (state) {
    state.failures = 0;
    state.isOpen = false;
  }
}

export function recordFailure(providerId: string): void {
  let state = circuitMap.get(providerId);
  if (!state) {
    state = { failures: 0, lastFailureTime: Date.now(), isOpen: false };
    circuitMap.set(providerId, state);
  }

  state.failures += 1;
  state.lastFailureTime = Date.now();

  if (state.failures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
    state.isOpen = true;
  }
}
