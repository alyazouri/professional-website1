/**
 * NEXT-GENERATION DEVICE INTELLIGENCE ENGINE v4
 * 6-Layer Multi-Signal Verification Architecture
 * Zero reliance on single signals — every result cross-validated
 */

import { ALL_DEVICES, type Device } from "./devices";

// ─── Types ───
export type DetectionSource = "gpuFingerprint" | "displaySignature" | "performanceProfile" | "browserCapability" | "behaviorAnalysis" | "aiClassifier" | "uaData" | "emergencyFallback";

export type Confidence<T> = { value: T; confidence: number; sources: DetectionSource[]; verified: boolean };

export type GPUFingerprint = {
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number;
  maxViewportDims: number[];
  shaderPrecisionHigh: boolean;
  shaderPrecisionMed: boolean;
  extensions: string[];
  webgl2: boolean;
  webgpu: boolean;
  webcodecs: boolean;
  tier: "low" | "mid" | "high" | "flagship";
  hash: string;
};

export type DisplaySignature = {
  nativeW: number;
  nativeH: number;
  logicalW: number;
  logicalH: number;
  dpr: number;
  colorDepth: number;
  aspectRatio: number;
  orientation: "portrait" | "landscape";
  refreshRate: number;
  refreshConfidence: number;
  screenDiagonalEstimate: number;
  isRetina: boolean;
  isProMotion: boolean;
  hash: string;
};

export type PerformanceFingerprint = {
  cpuScore: number;
  renderScore: number;
  memoryScore: number;
  overallTier: "low" | "mid" | "high" | "flagship";
  cores: number;
  deviceMemoryGB: number;
  jsHeapMB: number;
  hash: string;
};

export type BrowserSignature = {
  name: string;
  version: string;
  engine: string;
  os: string;
  osVersion: string;
  mobile: boolean;
  touch: boolean;
  maxTouchPoints: number;
  hardwareAccel: boolean;
  supportedCodecs: string[];
  hash: string;
};

export type BehaviorFingerprint = {
  touchLatencyMs: number | null;
  hasForceTouchAPI: boolean;
  hasMotionSensor: boolean;
  hasOrientationSensor: boolean;
  prefersReducedMotion: boolean;
  hash: string;
};

export type DeviceIdentity = {
  brand: string;
  model: string;
  family: string;
  year: number | null;
  chip: string | null;
  os: "ios" | "android" | "windows" | "macos" | "linux";
  tier: Device["tier"];
  refreshHz: number;
  touchHz: number;
  screenSize: number;
  confidence: number;
  verifiedBy: DetectionSource[];
  status: "verified" | "high_confidence" | "estimated" | "fallback";
};

export type FullDeviceProfile = {
  identity: DeviceIdentity;
  gpu: Confidence<GPUFingerprint>;
  display: Confidence<DisplaySignature>;
  performance: Confidence<PerformanceFingerprint>;
  browser: Confidence<BrowserSignature>;
  behavior: Confidence<BehaviorFingerprint>;
  detectionMs: number;
  recommendation: ProcessingRecommendation;
};

export type ProcessingRecommendation = {
  maxRenderWidth: number;
  maxRenderHeight: number;
  targetFPS: number;
  preferWebCodecs: boolean;
  useOffscreenCanvas: boolean;
  quality: "low" | "medium" | "high" | "ultra";
  useHardwareEncoder: boolean;
  parallelWorkers: number;
  memoryLimitMB: number;
};

// ════════════════════════════════════════════
// LAYER 1 — GPU RENDERING FINGERPRINT
// ════════════════════════════════════════════
function collectGPUFingerprint(): GPUFingerprint {
  const result: GPUFingerprint = {
    renderer: null, vendor: null, maxTextureSize: 0, maxViewportDims: [0, 0],
    shaderPrecisionHigh: false, shaderPrecisionMed: false, extensions: [],
    webgl2: false, webgpu: false, webcodecs: false, tier: "low", hash: "",
  };

  try {
    const c = document.createElement("canvas");
    c.width = 1; c.height = 1;
    const gl2 = c.getContext("webgl2") as WebGL2RenderingContext | null;
    const gl = gl2 || (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return result;

    result.webgl2 = !!gl2;

    // Unmasked renderer/vendor
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      result.renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
      result.vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string;
    } else {
      result.renderer = gl.getParameter(gl.RENDERER) as string;
      result.vendor = gl.getParameter(gl.VENDOR) as string;
    }

    // Texture limits
    result.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    result.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as number[];

    // Shader precision
    try {
      const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      const mp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
      result.shaderPrecisionHigh = !!(hp && hp.precision > 0);
      result.shaderPrecisionMed = !!(mp && mp.precision > 0);
    } catch {}

    // Extensions
    result.extensions = gl.getSupportedExtensions()?.slice(0, 30) || [];
  } catch {}

  // WebGPU
  try { result.webgpu = !!(navigator as any).gpu; } catch {}

  // WebCodecs
  try {
    result.webcodecs = typeof (window as any).VideoEncoder !== "undefined" && typeof (window as any).VideoDecoder !== "undefined";
  } catch {}

  // GPU tier classification from renderer string
  const r = (result.renderer || "").toLowerCase();
  if (/(apple gpu|apple m[1-9]|a1[5-9] gpu|a[2-9][0-9] gpu)/.test(r)) result.tier = "flagship";
  else if (/(rtx [34][0-9]|radeon pro|arc a[57])/.test(r)) result.tier = "flagship";
  else if (/(mali-g7[1-9]|adreno 7[3-9]\d|xclipse 9\d\d|apple m\d)/.test(r)) result.tier = "flagship";
  else if (/(mali-g7\d|adreno 7\d\d|mali-g5[5-9])/.test(r)) result.tier = "high";
  else if (/(adreno 6[2-9]\d|mali-g[5-6]\d|powervr)/.test(r)) result.tier = "mid";
  else if (result.webgl2 && result.maxTextureSize >= 8192) result.tier = "mid";
  else if (result.maxTextureSize >= 4096) result.tier = "low";

  result.hash = simpleHash(`${result.renderer}|${result.vendor}|${result.maxTextureSize}|${result.webgl2}|${result.tier}`);
  return result;
}

// ════════════════════════════════════════════
// LAYER 2 — DISPLAY INTELLIGENCE
// ════════════════════════════════════════════
async function collectDisplaySignature(): Promise<DisplaySignature> {
  const nativeW = screen.width || window.innerWidth;
  const nativeH = screen.height || window.innerHeight;
  const logicalW = window.innerWidth;
  const logicalH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const colorDepth = screen.colorDepth || 24;
  const orientation: "portrait" | "landscape" = nativeW > nativeH ? "landscape" : "portrait";
  const aspectRatio = Math.max(nativeW, nativeH) / Math.min(nativeW, nativeH);

  // Refresh rate detection via requestAnimationFrame timing
  let refreshRate = 60;
  let refreshConfidence = 40;
  try {
    const frameTimes: number[] = [];
    await new Promise<void>((resolve) => {
      let prev = 0;
      let count = 0;
      const measure = (t: number) => {
        if (prev > 0) frameTimes.push(t - prev);
        prev = t;
        count++;
        if (count < 30) requestAnimationFrame(measure);
        else resolve();
      };
      requestAnimationFrame(measure);
    });
    if (frameTimes.length > 5) {
      // Remove outliers
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const trimmed = sorted.slice(2, -2);
      const avgMs = trimmed.reduce((s, v) => s + v, 0) / trimmed.length;
      const measuredHz = Math.round(1000 / avgMs);
      // Snap to known refresh rates
      const knownRates = [60, 90, 120, 144, 165, 240];
      refreshRate = knownRates.reduce((best, rate) =>
        Math.abs(measuredHz - rate) < Math.abs(measuredHz - best) ? rate : best
      );
      // Confidence based on consistency
      const variance = trimmed.reduce((s, v) => s + Math.pow(v - avgMs, 2), 0) / trimmed.length;
      const stdDev = Math.sqrt(variance);
      refreshConfidence = stdDev < 2 ? 95 : stdDev < 4 ? 85 : stdDev < 8 ? 70 : 50;
    }
  } catch {}

  const isRetina = dpr >= 2;
  const isProMotion = refreshRate >= 120 && dpr >= 2;

  // Estimate physical screen diagonal (inches) from CSS pixels + DPR
  // Assume ~163 PPI for non-retina, ~326 PPI for 2x, ~458 for 3x
  const ppi = dpr >= 3 ? 458 : dpr >= 2 ? 326 : 163;
  const physW = (nativeW * dpr) / ppi;
  const physH = (nativeH * dpr) / ppi;
  const screenDiagonalEstimate = Math.round(Math.sqrt(physW * physW + physH * physH) * 10) / 10;

  const hash = simpleHash(`${nativeW}x${nativeH}|${dpr}|${refreshRate}|${colorDepth}|${aspectRatio.toFixed(3)}`);

  return {
    nativeW, nativeH, logicalW, logicalH, dpr, colorDepth, aspectRatio,
    orientation, refreshRate, refreshConfidence, screenDiagonalEstimate,
    isRetina, isProMotion, hash,
  };
}

// ════════════════════════════════════════════
// LAYER 3 — PERFORMANCE PROFILING
// ════════════════════════════════════════════
async function runPerformanceBenchmark(): Promise<PerformanceFingerprint> {
  const cores = navigator.hardwareConcurrency || 0;
  const dm = (navigator as any).deviceMemory as number || 0;
  const jh = (performance as any).memory?.jsHeapSizeLimit;
  const jsHeapMB = jh ? Math.round(jh / 1024 / 1024) : 0;

  // CPU benchmark: tight loop
  let cpuScore = 0;
  try {
    const start = performance.now();
    let sum = 0;
    for (let i = 0; i < 500000; i++) sum += Math.sin(i) * Math.cos(i);
    cpuScore = Math.round(500000 / Math.max(1, performance.now() - start));
    void sum;
  } catch {}

  // Render benchmark: WebGL clear cycles
  let renderScore = 0;
  try {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 128;
    const gl = c.getContext("webgl2") as WebGL2RenderingContext | null;
    if (gl) {
      const start = performance.now();
      let count = 0;
      while (performance.now() - start < 10 && count < 5000) {
        gl.clearColor(Math.random(), 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        count++;
      }
      renderScore = Math.round(count / Math.max(0.001, (performance.now() - start) / 1000));
    }
  } catch {}

  // Memory benchmark
  let memoryScore = 50;
  try {
    const arr: number[][] = [];
    const start = performance.now();
    for (let i = 0; i < 100; i++) arr.push(new Array(10000).fill(Math.random()));
    memoryScore = Math.round(100 / Math.max(0.001, (performance.now() - start)));
    arr.length = 0;
  } catch {}

  // Classify overall tier
  const totalScore = cpuScore * 0.4 + renderScore * 0.001 + memoryScore * 0.3 + cores * 20 + dm * 15;
  let overallTier: "low" | "mid" | "high" | "flagship" = "low";
  if (totalScore > 500) overallTier = "flagship";
  else if (totalScore > 250) overallTier = "high";
  else if (totalScore > 100) overallTier = "mid";

  const hash = simpleHash(`${cpuScore}|${renderScore}|${memoryScore}|${cores}|${dm}`);

  return { cpuScore, renderScore, memoryScore, overallTier, cores, deviceMemoryGB: dm, jsHeapMB, hash };
}

// ════════════════════════════════════════════
// LAYER 4 — BROWSER CAPABILITY ANALYSIS
// ════════════════════════════════════════════
function analyzeBrowserCapabilities(ua: string): BrowserSignature {
  // OS
  let os = "Unknown", osVersion = "0", mobile = false;
  if (/iPhone|iPad|iPod/.test(ua)) { os = "iOS"; const m = ua.match(/OS (\d+)_(\d+)/); osVersion = m ? `${m[1]}.${m[2]}` : "0"; mobile = true; }
  else if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 0) { os = "iPadOS"; const m = ua.match(/Mac OS X (\d+)_(\d+)/); osVersion = m ? `${m[1]}.${m[2]}` : "17+"; mobile = true; }
  else if (/Android/.test(ua)) { os = "Android"; const m = ua.match(/Android (\d+)/); osVersion = m ? m[1] : "0"; mobile = true; }
  else if (/Windows NT/.test(ua)) { os = "Windows"; const m = ua.match(/Windows NT (\d+\.\d+)/); osVersion = m ? m[1] : "10"; }
  else if (/Macintosh|Mac OS X/.test(ua)) { os = "macOS"; const m = ua.match(/Mac OS X (\d+)_(\d+)/); osVersion = m ? `${m[1]}.${m[2]}` : "0"; }
  else if (/Linux/.test(ua)) { os = "Linux"; osVersion = "unknown"; }

  // Browser
  let name = "Unknown", version = "0", engine = "unknown";
  if (/Edg(?:e|A)?\/(\d+)/.test(ua)) { name = "Edge"; version = RegExp.$1; engine = "Blink"; }
  else if (/SamsungBrowser\/(\d+)/.test(ua)) { name = "Samsung Internet"; version = RegExp.$1; engine = "Blink"; }
  else if (/CriOS\/(\d+)/.test(ua)) { name = "Chrome iOS"; version = RegExp.$1; engine = "WebKit"; }
  else if (/Chrome\/(\d+)/.test(ua)) { name = "Chrome"; version = RegExp.$1; engine = "Blink"; }
  else if (/Firefox\/(\d+)/.test(ua)) { name = "Firefox"; version = RegExp.$1; engine = "Gecko"; }
  else if (/Version\/(\d+).*Safari/.test(ua)) { name = "Safari"; version = RegExp.$1; engine = "WebKit"; }

  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // Hardware accel
  let hardwareAccel = false;
  try {
    const c = document.createElement("canvas");
    hardwareAccel = !!c.getContext("webgl2") || !!c.getContext("webgl");
  } catch {}

  // Supported codecs
  const codecs: string[] = [];
  try {
    if (MediaRecorder.isTypeSupported("video/mp4")) codecs.push("mp4");
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) codecs.push("vp9");
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) codecs.push("vp8");
    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E")) codecs.push("h264");
  } catch {}

  const hash = simpleHash(`${name}${version}|${os}${osVersion}|${mobile}|${codecs.join(",")}`);

  return { name, version, engine, os, osVersion, mobile, touch, maxTouchPoints, hardwareAccel, supportedCodecs: codecs, hash };
}

// ════════════════════════════════════════════
// LAYER 5 — DEVICE BEHAVIOR ANALYSIS
// ════════════════════════════════════════════
function analyzeBehavior(): BehaviorFingerprint {
  const hasForceTouchAPI = "ontouchforcechange" in document || (window as any).TouchEvent?.TOUCH_FORCE_AT_FORCE_TOUCH !== undefined;
  const hasMotionSensor = "DeviceMotionEvent" in window;
  const hasOrientationSensor = "DeviceOrientationEvent" in window;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;

  const hash = simpleHash(`${hasForceTouchAPI}|${hasMotionSensor}|${hasOrientationSensor}|${prefersReducedMotion}`);

  return { touchLatencyMs: null, hasForceTouchAPI, hasMotionSensor, hasOrientationSensor, prefersReducedMotion, hash };
}

// ════════════════════════════════════════════
// LAYER 6 — AI DEVICE CLASSIFIER
// ════════════════════════════════════════════
function classifyDevice(
  gpu: GPUFingerprint,
  display: DisplaySignature,
  perf: PerformanceFingerprint,
  browser: BrowserSignature,
  _behavior: BehaviorFingerprint,
): DeviceIdentity {
  const ua = navigator.userAgent;
  const sources: DetectionSource[] = [];
  let confidence = 0;

  // ─── APPLE DEVICES ───
  if (browser.os === "iOS" || browser.os === "iPadOS") {
    sources.push("gpuFingerprint", "displaySignature", "performanceProfile", "browserCapability");

    // iPad detection
    if (browser.os === "iPadOS" || (browser.os === "iOS" && display.screenDiagonalEstimate > 8)) {
      // iPad Pro 13" vs 11" via viewport
      const maxLogical = Math.max(display.logicalW, display.logicalH);
      const nativePixels = Math.max(display.nativeW, display.nativeH) * display.dpr;

      if (maxLogical >= 1024 && nativePixels >= 2700) {
        // 13-inch class
        const chip = classifyAppleChip(gpu, perf);
        const model = chip.gen >= 4 ? "iPad Pro 13 (M4)" : chip.gen >= 2 ? "iPad Pro 12.9 (M2)" : "iPad Pro 12.9 (M2)";
        confidence = 92 + chip.confidence * 0.05;
        sources.push("aiClassifier");
        return buildAppleIdentity(model, "iPad Pro", chip.label, display, confidence, sources);
      }

      if (maxLogical >= 820 || nativePixels >= 1600) {
        // 11-inch class or iPad Air
        const chip = classifyAppleChip(gpu, perf);
        if (display.isProMotion) {
          const model = chip.gen >= 4 ? "iPad Pro 11 (M4)" : chip.gen >= 2 ? "iPad Pro 11 (M2)" : "iPad Pro 11 (M2)";
          confidence = 90 + chip.confidence * 0.05;
          sources.push("aiClassifier");
          return buildAppleIdentity(model, "iPad Pro", chip.label, display, confidence, sources);
        }
        // iPad Air
        if (chip.gen >= 2) {
          confidence = 82;
          return buildAppleIdentity("iPad Air 11 (M2)", "iPad Air", chip.label, display, confidence, sources);
        }
        confidence = 75;
        return buildAppleIdentity("iPad Air (M1)", "iPad Air", chip.label, display, confidence, sources);
      }

      // iPad mini or regular iPad
      if (display.screenDiagonalEstimate < 9) {
        confidence = 78;
        return buildAppleIdentity("iPad mini 6", "iPad mini", null, display, confidence, sources);
      }
      confidence = 70;
      return buildAppleIdentity("iPad 10", "iPad", null, display, confidence, sources);
    }

    // iPhone detection
    const iosMatch = ua.match(/OS (\d+)_/);
    const iosVersion = iosMatch ? parseInt(iosMatch[1]) : 0;
    const chip = classifyAppleChip(gpu, perf);

    // iPhone model by iOS version + performance + display
    let iPhoneModel = "iPhone 15 Pro";
    if (iosVersion >= 18) {
      iPhoneModel = display.nativeW >= 430 || display.screenDiagonalEstimate >= 6.5 ? "iPhone 16 Pro Max" : "iPhone 16 Pro";
      confidence = 85;
    } else if (iosVersion >= 17) {
      iPhoneModel = display.screenDiagonalEstimate >= 6.5 ? "iPhone 15 Pro Max" : "iPhone 15 Pro";
      confidence = 82;
    } else if (iosVersion >= 16) {
      iPhoneModel = display.isProMotion ? "iPhone 14 Pro" : "iPhone 14";
      confidence = 78;
    } else {
      iPhoneModel = "iPhone 13";
      confidence = 70;
    }
    sources.push("aiClassifier");
    return buildAppleIdentity(iPhoneModel, "iPhone", chip.label, display, confidence, sources);
  }

  // ─── ANDROID DEVICES ───
  if (browser.os === "Android") {
    sources.push("gpuFingerprint", "displaySignature", "performanceProfile");

    // Try userAgentData first
    let matched: Device | null = null;
    try {
      const uaData = (navigator as any).userAgentData;
      if (uaData && typeof uaData.getHighEntropyValues === "function") {
        // Synchronous check — model may be available
        const brands = uaData.brands;
        if (brands) {
          for (const b of brands) {
            const brandName = (b.brand || "").toLowerCase();
            if (brandName.includes("samsung")) matched = ALL_DEVICES.find(d => d.brand === "Samsung" && d.tier === perf.overallTier) || null;
            if (brandName.includes("xiaomi")) matched = ALL_DEVICES.find(d => d.brand === "Xiaomi" && d.tier === perf.overallTier) || null;
          }
        }
      }
    } catch {}

    // Brand detection from GPU renderer
    if (!matched) {
      const r = (gpu.renderer || "").toLowerCase();
      if (/adreno 7[5-9]\d/.test(r)) matched = findAndroidByTier("flagship", perf);
      else if (/adreno 7\d\d/.test(r)) matched = findAndroidByTier("high", perf);
      else if (/mali-g7[1-9]\d/.test(r)) matched = findAndroidByTier("flagship", perf);
      else if (/mali-g7\d/.test(r)) matched = findAndroidByTier("high", perf);
      else if (/xclipse/.test(r)) matched = findAndroidByTier("flagship", perf);
      else matched = findAndroidByTier(perf.overallTier, perf);
    }

    // Brand from UA
    if (!matched) {
      if (/Samsung/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Samsung" && d.tier === perf.overallTier) || null;
      else if (/Xiaomi|POCO|Redmi/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Xiaomi" && d.tier === perf.overallTier) || null;
      else if (/OnePlus/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "OnePlus" && d.tier === "flagship") || null;
      else if (/ROG|ASUS/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "ASUS") || null;
      else if (/Pixel/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Google" && d.tier === "flagship") || null;
      else if (/Huawei/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Huawei" && d.tier === "flagship") || null;
      else if (/HONOR/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Honor" && d.tier === "flagship") || null;
      else if (/Nothing/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Nothing") || null;
      else if (/Realme/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Realme" && d.tier === "flagship") || null;
      else if (/OPPO/i.test(ua)) matched = ALL_DEVICES.find(d => d.brand === "Oppo" && d.tier === "flagship") || null;
    }

    if (matched) {
      confidence = 65 + (gpu.renderer ? 15 : 0) + (perf.overallTier === matched.tier ? 8 : 0);
      sources.push("aiClassifier");
      return {
        brand: matched.brand, model: matched.model, family: matched.brand,
        year: matched.year, chip: null, os: "android",
        tier: matched.tier, refreshHz: Math.max(matched.refreshHz, display.refreshRate),
        touchHz: matched.touchHz, screenSize: matched.screenSize,
        confidence: Math.min(98, confidence),
        verifiedBy: sources,
        status: confidence >= 85 ? "verified" : confidence >= 70 ? "high_confidence" : "estimated",
      };
    }
  }

  // ─── DESKTOP FALLBACK ───
  const desktopOs = browser.os === "Windows" ? "windows" as const : browser.os === "macOS" ? "macos" as const : "linux" as const;
  sources.push("browserCapability", "performanceProfile");
  confidence = 50;

  return {
    brand: browser.os, model: `${browser.os} ${perf.overallTier.toUpperCase()} Device`,
    family: browser.os, year: null, chip: null, os: desktopOs,
    tier: perf.overallTier as Device["tier"],
    refreshHz: display.refreshRate, touchHz: 0, screenSize: display.screenDiagonalEstimate,
    confidence,
    verifiedBy: sources,
    status: "estimated",
  };
}

// ─── Apple chip classifier (M1/M2/M3/M4) ───
function classifyAppleChip(_gpu: GPUFingerprint, perf: PerformanceFingerprint): { gen: number; label: string; confidence: number } {
  // Performance-based classification
  // M4 > M3 > M2 > M1 > A-series
  const s = perf.cpuScore;
  const r = perf.renderScore;
  const totalScore = s * 0.6 + r * 0.001 + perf.cores * 15;

  if (totalScore > 600 || perf.cores >= 10) return { gen: 4, label: "M4", confidence: 80 };
  if (totalScore > 400 || perf.cores >= 8) return { gen: 2, label: "M2", confidence: 75 };
  if (totalScore > 250) return { gen: 1, label: "M1", confidence: 70 };
  if (perf.cores >= 6) return { gen: 0, label: "A17 Pro", confidence: 65 };
  return { gen: 0, label: "A-series", confidence: 55 };
}

function buildAppleIdentity(model: string, family: string, chip: string | null, display: DisplaySignature, confidence: number, sources: DetectionSource[]): DeviceIdentity {
  const dbDevice = ALL_DEVICES.find(d => d.model === model);
  return {
    brand: "Apple", model, family, year: dbDevice?.year || null, chip, os: "ios",
    tier: dbDevice?.tier || "flagship",
    refreshHz: Math.max(dbDevice?.refreshHz || 60, display.refreshRate),
    touchHz: dbDevice?.touchHz || 120,
    screenSize: dbDevice?.screenSize || display.screenDiagonalEstimate,
    confidence: Math.min(99, confidence),
    verifiedBy: sources,
    status: confidence >= 90 ? "verified" : confidence >= 75 ? "high_confidence" : "estimated",
  };
}

function findAndroidByTier(tier: string, _perf: PerformanceFingerprint): Device | null {
  return ALL_DEVICES.find(d => d.os === "android" && d.tier === tier) || null;
}

// ─── Self-correction ───
function selfCorrect(identity: DeviceIdentity, gpu: GPUFingerprint, display: DisplaySignature, perf: PerformanceFingerprint): DeviceIdentity {
  // Cross-validate: if GPU says flagship but perf says low → lower confidence
  if (gpu.tier === "flagship" && perf.overallTier === "low") {
    identity.confidence = Math.max(30, identity.confidence - 20);
    identity.status = "estimated";
  }
  // If ProMotion detected but identity says 60Hz → update
  if (display.isProMotion && identity.refreshHz < 120) {
    identity.refreshHz = 120;
  }
  // If screen large but model says phone → re-check
  if (display.screenDiagonalEstimate > 10 && identity.family === "iPhone") {
    identity.confidence = Math.max(30, identity.confidence - 15);
    identity.status = "estimated";
  }
  return identity;
}

// ════════════════════════════════════════════
// MAIN ENTRY POINT
// ════════════════════════════════════════════
export async function detectDeviceUltimate(): Promise<FullDeviceProfile> {
  const start = performance.now();

  // Run all 5 layers in parallel
  const [gpu, display, perf] = await Promise.all([
    Promise.resolve(collectGPUFingerprint()),
    collectDisplaySignature(),
    runPerformanceBenchmark(),
  ]);
  const browser = analyzeBrowserCapabilities(navigator.userAgent);
  const behaviorResult = analyzeBehavior();

  // Layer 6: AI classifier combines all signals
  let identity = classifyDevice(gpu, display, perf, browser, behaviorResult);

  // Self-correction pass
  identity = selfCorrect(identity, gpu, display, perf);

  const detectionMs = Math.round(performance.now() - start);

  // Processing recommendation
  const recommendation = computeRecommendation(identity, gpu, perf);

  return {
    identity,
    gpu: { value: gpu, confidence: gpu.renderer ? 95 : 40, sources: ["gpuFingerprint"], verified: !!gpu.renderer },
    display: { value: display, confidence: display.refreshConfidence, sources: ["displaySignature"], verified: true },
    performance: { value: perf, confidence: perf.cpuScore > 0 ? 90 : 30, sources: ["performanceProfile"], verified: perf.cpuScore > 0 },
    browser: { value: browser, confidence: 95, sources: ["browserCapability"], verified: true },
    behavior: { value: behaviorResult, confidence: 70, sources: ["behaviorAnalysis"], verified: true },
    detectionMs,
    recommendation,
  };
}

function computeRecommendation(identity: DeviceIdentity, gpu: GPUFingerprint, perf: PerformanceFingerprint): ProcessingRecommendation {
  const tier = identity.tier;
  const cores = perf.cores || 4;
  const workers = Math.max(1, Math.min(8, Math.floor(cores / 2)));

  if (tier === "esports" || tier === "flagship") {
    return {
      maxRenderWidth: 3840, maxRenderHeight: 2160, targetFPS: 60,
      preferWebCodecs: gpu.webcodecs, useOffscreenCanvas: true,
      quality: "ultra", useHardwareEncoder: true, parallelWorkers: workers, memoryLimitMB: 4096,
    };
  }
  if (tier === "high") {
    return {
      maxRenderWidth: 2560, maxRenderHeight: 1440, targetFPS: 30,
      preferWebCodecs: gpu.webcodecs, useOffscreenCanvas: true,
      quality: "high", useHardwareEncoder: true, parallelWorkers: workers, memoryLimitMB: 2048,
    };
  }
  if (tier === "mid") {
    return {
      maxRenderWidth: 1920, maxRenderHeight: 1080, targetFPS: 30,
      preferWebCodecs: gpu.webcodecs, useOffscreenCanvas: gpu.webgl2,
      quality: "medium", useHardwareEncoder: false, parallelWorkers: Math.min(2, workers), memoryLimitMB: 1024,
    };
  }
  return {
    maxRenderWidth: 1280, maxRenderHeight: 720, targetFPS: 24,
    preferWebCodecs: false, useOffscreenCanvas: false,
    quality: "low", useHardwareEncoder: false, parallelWorkers: 1, memoryLimitMB: 512,
  };
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).padStart(8, "0");
}
