import { getRedis } from "@/lib/redis";
import {
  CIRCUIT_BREAKER_FAILURE_THRESHOLD,
  CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
} from "./constants";

const CIRCUIT_KEY_PREFIX = "cb:provider:";

interface CircuitState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

async function getCircuitState(providerId: string): Promise<CircuitState | null> {
  const redis = getRedis();
  const key = `${CIRCUIT_KEY_PREFIX}${providerId}`;
  const data = await redis.get(key);
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data) as CircuitState;
  } catch {
    return null;
  }
}

async function setCircuitState(providerId: string, state: CircuitState): Promise<void> {
  const redis = getRedis();
  const key = `${CIRCUIT_KEY_PREFIX}${providerId}`;
  const ttl = Math.ceil(CIRCUIT_BREAKER_RESET_TIMEOUT_MS / 1000) + 60;
  await redis.setex(key, ttl, JSON.stringify(state));
}

export async function isCircuitOpen(providerId: string): Promise<boolean> {
  const state = await getCircuitState(providerId);
  if (!state || !state.isOpen) {
    return false;
  }

  if (Date.now() - state.lastFailureTime > CIRCUIT_BREAKER_RESET_TIMEOUT_MS) {
    await setCircuitState(providerId, {
      failures: 0,
      lastFailureTime: state.lastFailureTime,
      isOpen: false,
    });
    return false;
  }

  return true;
}

export async function recordSuccess(providerId: string): Promise<void> {
  const state = await getCircuitState(providerId);
  if (state) {
    await setCircuitState(providerId, {
      failures: 0,
      lastFailureTime: state.lastFailureTime,
      isOpen: false,
    });
  }
}

export async function recordFailure(providerId: string): Promise<void> {
  const state = await getCircuitState(providerId);
  const now = Date.now();

  const newState: CircuitState = state
    ? {
        failures: state.failures + 1,
        lastFailureTime: now,
        isOpen: state.failures + 1 >= CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      }
    : {
        failures: 1,
        lastFailureTime: now,
        isOpen: false,
      };

  await setCircuitState(providerId, newState);
}
