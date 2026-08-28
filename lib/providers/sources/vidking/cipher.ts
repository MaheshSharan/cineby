// Vidking / Speedrace decryption algorithm (keystream generator & XOR cipher)

const HL = [
  1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
  2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
  1925078388, 2162078206, 2614888103, 3248222580,
];

const F_CONSTS = [1732584193, 4023233417, 2562383102, 271733878];
const JS_SIZE = 61;
const SF_COUNT = 8;
const MS_CONST = 2654435769;
const MAGIC_PREFIX = [109, 118, 109, 49]; // "mvm1" magic header

function isEvenProduct(val: number): boolean {
  return ((val * (val + 1)) & 1) === 0;
}

function isOddProduct(val: number): boolean {
  return ((val * (val + 1)) & 1) === 1;
}

function ciMix(val: number): number {
  let l = val >>> 0;
  l ^= l >>> 16;
  l = Math.imul(l, 2246822507) >>> 0;
  l ^= l >>> 13;
  l = Math.imul(l, 3266489909) >>> 0;
  l ^= l >>> 16;
  return l >>> 0;
}

function psRotate(val: number, shift: number): number {
  const l = val >>> 0;
  const o = shift & 31;
  return o === 0 ? l >>> 0 : ((l << o) | (l >>> (32 - o))) >>> 0;
}

function computeAf(seed: string): number {
  let o = F_CONSTS[0] >>> 0;
  for (let e = 0; e < seed.length; e++) {
    o = psRotate((o ^ Math.imul(seed.charCodeAt(e), HL[e & 15])) >>> 0, 5);
  }
  return ciMix(o);
}

function computeWf(seed: string): number[] {
  const o = new Array<number>(256);
  for (let i = 0; i < 256; i++) o[i] = i;
  let e = 0;
  for (let i = 0; i < 256; i++) {
    e = (e + o[i] + seed.charCodeAt(i % seed.length)) & 255;
    const r = o[i];
    o[i] = o[e];
    o[e] = r;
  }
  return o;
}

function computeVf(seed: string): number {
  let o = 2166136261;
  for (let e = 0; e < seed.length; e++) {
    o = Math.imul(o ^ seed.charCodeAt(e), 16777619) >>> 0;
  }
  return ciMix(o);
}

function nfMix(l: number, o: number, e: number): number {
  return (((l ^ o) >>> 0) | ((l & o & e) >>> 0)) >>> 0;
}

interface StateObj {
  S: number[];
  acc: number;
}

function initKeystreamState(seed: string, tmdbId: number): StateObj {
  if (isOddProduct(seed.length)) {
    return { S: computeWf(seed), acc: computeAf(seed) };
  }

  const e = new Array<number>(JS_SIZE);
  let i = ciMix(computeVf(seed) ^ ciMix((tmdbId >>> 0) ^ MS_CONST)) >>> 0;

  for (let r = 0; r < SF_COUNT; r++) {
    if (isEvenProduct(r)) {
      const n = i % JS_SIZE;
      i = psRotate((i + MS_CONST) >>> 0, 7 + (r & 7));
      e[n] = (i ^ ciMix(i)) >>> 0;
      i = ciMix((i + n) >>> 0);
    } else {
      e[r] = HL[r & 15];
    }
  }

  return { S: e, acc: ciMix(i ^ 2779096485) >>> 0 };
}

function stepKeystream(state: StateObj, step: number): number {
  const e = state.S;
  const i = state.acc;
  const r = i % JS_SIZE;
  const n = 0 - (r in e ? 1 : 0);
  const u = (e[r] ?? 0) >>> 0;
  const d = Math.imul(MS_CONST, step + 1) >>> 0;
  let g = nfMix(i, (u ^ d) >>> 0, n);
  g = (psRotate((g + i) >>> 0, r & 31) ^ psRotate(i, (Math.imul(r, 7) & 31))) >>> 0;
  const nextAcc = ciMix((g + MS_CONST) >>> 0);
  e[r] = nextAcc >>> 0;
  state.acc = nextAcc;
  return nextAcc >>> 0;
}

function generateKeystream(seed: string, tmdbId: number, length: number): Uint8Array {
  const state = initKeystreamState(seed, tmdbId);
  const result = new Uint8Array(length);
  let step = 0;

  for (let u = 0; u < length; ) {
    const d = stepKeystream(state, step++);
    result[u++] = d & 255;
    if (u < length) result[u++] = (d >>> 8) & 255;
    if (u < length) result[u++] = (d >>> 16) & 255;
    if (u < length) result[u++] = (d >>> 24) & 255;
  }

  return result;
}

function base64UrlToBytes(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(str.length / 4) * 4, "=");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function decryptVidkingPayload<T = unknown>(ciphertext: string, seed: string, tmdbId: number): T {
  const cipherBytes = base64UrlToBytes(ciphertext);
  const keystream = generateKeystream(seed, tmdbId, cipherBytes.length);

  for (let n = 0; n < cipherBytes.length; n++) {
    cipherBytes[n] ^= keystream[n];
  }

  for (let n = 0; n < MAGIC_PREFIX.length; n++) {
    if (cipherBytes[n] !== MAGIC_PREFIX[n]) {
      throw new Error("Vidking decrypt failed: bad seed or payload header mismatch");
    }
  }

  const jsonStr = new TextDecoder("utf-8").decode(cipherBytes.subarray(MAGIC_PREFIX.length));
  return JSON.parse(jsonStr) as T;
}
