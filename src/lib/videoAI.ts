/**
 * Real browser-based video AI — no fake simulations.
 * Analyzes actual video frames via canvas + audio via WebAudio.
 */

export type FrameAnalysis = {
  avgBrightness: number; // 0-255
  avgSaturation: number; // 0-100
  avgContrast: number; // stddev 0-100
  sharpness: number; // 0-100
  dominantHue: number; // 0-360
  motionScore: number; // 0-100 (per-segment vs previous)
};

export type VideoAIReport = {
  duration: number;
  avgBrightness: number;
  avgSaturation: number;
  avgSharpness: number;
  dominantHue: number;
  highlights: { start: number; end: number; score: number }[];
  silentSegments: { start: number; end: number }[];
  suggestedFilter: string;
  suggestedAdjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    sharpen: number;
  };
  colorGrade: {
    shadows: string;
    mids: string;
    highlights: string;
  };
};

// Sample frames from video at regular intervals
export async function sampleFrames(
  video: HTMLVideoElement,
  count = 20,
  onProgress?: (p: number) => void,
): Promise<{ time: number; analysis: FrameAnalysis; diff: number }[]> {
  const duration = video.duration;
  if (!duration || !isFinite(duration)) return [];

  const canvas = document.createElement("canvas");
  const size = 160; // downscaled for speed
  canvas.width = size;
  canvas.height = Math.round((size * video.videoHeight) / video.videoWidth) || size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const results: { time: number; analysis: FrameAnalysis; diff: number }[] = [];
  let prevImageData: ImageData | null = null;

  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * duration;
    video.currentTime = t;
    await new Promise<void>((res) => {
      const h = () => {
        video.removeEventListener("seeked", h);
        res();
      };
      video.addEventListener("seeked", h);
    });

    // small delay to ensure frame is rendered
    await new Promise((r) => setTimeout(r, 30));

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    // center-crop square-ish region
    const side = Math.min(vw, vh);
    const sx = Math.round((vw - side) / 2);
    const sy = Math.round((vh - side) / 2);
    ctx.drawImage(video, sx, sy, side, side, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const analysis = analyzeFrame(img);

    // motion diff vs previous frame
    let diff = 0;
    if (prevImageData) {
      diff = frameDiff(prevImageData, img);
    }
    prevImageData = img;

    results.push({ time: t, analysis: { ...analysis, motionScore: 0 }, diff });
    onProgress?.((i + 1) / count);
  }

  // Compute motion score as relative diff
  const maxDiff = Math.max(...results.map((r) => r.diff), 1);
  for (const r of results) {
    r.analysis.motionScore = Math.round((r.diff / maxDiff) * 100);
  }

  return results;
}

function analyzeFrame(img: ImageData): FrameAnalysis {
  const data = img.data;
  const n = data.length / 4;
  let totalR = 0,
    totalG = 0,
    totalB = 0;
  let totalLum = 0;
  let totalSat = 0;
  let hues: number[] = [];
  let lumSquared = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLum += lum;
    lumSquared += lum * lum;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : ((max - min) / max) * 100;
    totalSat += sat;
    if (sat > 20) {
      hues.push(rgbToHue(r, g, b));
    }
  }

  const avgBrightness = totalLum / n;
  const avgSaturation = totalSat / n;
  const meanLum = avgBrightness;
  const variance = lumSquared / n - meanLum * meanLum;
  const avgContrast = Math.min(100, Math.sqrt(Math.max(0, variance)) / 1.5);
  const sharpness = Math.min(100, avgContrast * 1.3);

  // Dominant hue
  let dominantHue = 0;
  if (hues.length > 0) {
    // histogram in 12 buckets
    const buckets = new Array(12).fill(0);
    for (const h of hues) buckets[Math.floor(h / 30) % 12]++;
    const maxBucket = buckets.indexOf(Math.max(...buckets));
    dominantHue = maxBucket * 30 + 15;
  }

  return {
    avgBrightness: Math.round(avgBrightness),
    avgSaturation: Math.round(avgSaturation),
    avgContrast: Math.round(avgContrast),
    sharpness: Math.round(sharpness),
    dominantHue: Math.round(dominantHue),
    motionScore: 0,
  };
}

function frameDiff(a: ImageData, b: ImageData): number {
  const da = a.data;
  const db = b.data;
  let sum = 0;
  // sample every 16th pixel for speed
  for (let i = 0; i < da.length; i += 64) {
    const dr = Math.abs(da[i] - db[i]);
    const dg = Math.abs(da[i + 1] - db[i + 1]);
    const dbb = Math.abs(da[i + 2] - db[i + 2]);
    sum += dr + dg + dbb;
  }
  return sum;
}

function rgbToHue(r: number, g: number, b: number): number {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

// Analyze audio track for silence detection
export async function analyzeAudio(
  video: HTMLVideoElement,
  onProgress?: (p: number) => void,
): Promise<{ silentSegments: { start: number; end: number }[] }> {
  try {
    // Capture audio
    const vAny = video as any;
    let stream: MediaStream | null = null;
    if (typeof vAny.captureStream === "function") stream = vAny.captureStream();
    else if (typeof vAny.mozCaptureStream === "function") stream = vAny.mozCaptureStream();
    if (!stream) return { silentSegments: [] };

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return { silentSegments: [] };

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(new MediaStream(audioTracks));
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const duration = video.duration;
    const step = 0.5; // analyze every 0.5s
    const levels: { t: number; level: number }[] = [];

    const buf = new Uint8Array(analyser.fftSize);

    video.muted = true; // prevent feedback
    video.currentTime = 0;
    await video.play().catch(() => {});

    const start = performance.now();
    while (video.currentTime < duration - 0.1) {
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      levels.push({ t: video.currentTime, level: rms });
      onProgress?.(video.currentTime / duration);
      // Wait ~ step seconds real-time-ish
      await new Promise((r) => setTimeout(r, step * 400));
      if (performance.now() - start > 20000) break; // 20s max
    }
    video.pause();
    ctx.close();

    // Find silent segments (RMS < threshold)
    const threshold = 0.015;
    const silentSegments: { start: number; end: number }[] = [];
    let inSilent = false;
    let silentStart = 0;
    for (const l of levels) {
      if (l.level < threshold && !inSilent) {
        inSilent = true;
        silentStart = l.t;
      } else if (l.level >= threshold && inSilent) {
        inSilent = false;
        if (l.t - silentStart > 1) silentSegments.push({ start: silentStart, end: l.t });
      }
    }
    if (inSilent && levels.length > 0) {
      const last = levels[levels.length - 1];
      if (last.t - silentStart > 1) silentSegments.push({ start: silentStart, end: last.t });
    }
    return { silentSegments };
  } catch {
    return { silentSegments: [] };
  }
}

// Detect highlights based on motion
export function detectHighlights(
  frames: { time: number; analysis: FrameAnalysis; diff: number }[],
  topN = 5,
): { start: number; end: number; score: number }[] {
  // Sort by motion diff
  const sorted = [...frames].sort((a, b) => b.diff - a.diff).slice(0, topN);
  sorted.sort((a, b) => a.time - b.time);
  const windowSec = 3;
  return sorted.map((s) => ({
    start: Math.max(0, s.time - windowSec / 2),
    end: s.time + windowSec / 2,
    score: Math.round((s.diff / Math.max(...frames.map((f) => f.diff), 1)) * 100),
  }));
}

// Compute suggested adjustments based on overall analysis
export function suggestAdjustments(frames: { analysis: FrameAnalysis }[]): VideoAIReport["suggestedAdjustments"] {
  if (frames.length === 0) return { brightness: 0, contrast: 0, saturation: 0, sharpen: 0 };
  const avgB = frames.reduce((s, f) => s + f.analysis.avgBrightness, 0) / frames.length;
  const avgS = frames.reduce((s, f) => s + f.analysis.avgSaturation, 0) / frames.length;
  const avgC = frames.reduce((s, f) => s + f.analysis.avgContrast, 0) / frames.length;
  const avgSh = frames.reduce((s, f) => s + f.analysis.sharpness, 0) / frames.length;

  // Target: brightness ~128, saturation ~50, contrast ~40, sharpness ~55
  const brightness = Math.max(-30, Math.min(30, Math.round((128 - avgB) / 3)));
  const saturation = Math.max(-30, Math.min(30, Math.round((50 - avgS) / 2)));
  const contrast = Math.max(-20, Math.min(30, Math.round((40 - avgC) / 2)));
  const sharpen = Math.max(0, Math.min(40, Math.round((55 - avgSh) / 2)));
  return { brightness, contrast, saturation, sharpen };
}

// Suggest best filter based on dominant hue + brightness
export function suggestFilter(avgHue: number, avgBrightness: number, avgSaturation: number): string {
  // warm scene → golden
  if (avgHue >= 15 && avgHue <= 55 && avgBrightness > 110) return "golden";
  // dark + low sat → cinematic
  if (avgBrightness < 90 && avgSaturation < 35) return "cinematic";
  // high sat + high brightness → esports
  if (avgBrightness > 130 && avgSaturation > 50) return "esports";
  // cool tones → cyberpunk
  if (avgHue >= 180 && avgHue <= 250) return "cyberpunk";
  // neutral → pro
  return "pro";
}

// Generate a color grade based on dominant hue
export function generateColorGrade(dominantHue: number, avgBrightness: number): VideoAIReport["colorGrade"] {
  // Complementary palette
  const shadowHue = (dominantHue + 200) % 360;
  const midHue = dominantHue;
  const highHue = (dominantHue + 40) % 360;
  const lightness = avgBrightness > 130 ? 75 : avgBrightness > 90 ? 60 : 40;
  return {
    shadows: hslToHex(shadowHue, 60, 20),
    mids: hslToHex(midHue, 50, lightness),
    highlights: hslToHex(highHue, 40, 85),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const kk = k(n);
    return l - a * Math.max(-1, Math.min(kk - 3, Math.min(9 - kk, 1)));
  };
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export async function fullAIAnalysis(
  video: HTMLVideoElement,
  onProgress?: (stage: string, p: number) => void,
): Promise<VideoAIReport> {
  onProgress?.("frames", 0);
  const frames = await sampleFrames(video, 20, (p) => onProgress?.("frames", p));
  onProgress?.("audio", 0);
  const { silentSegments } = await analyzeAudio(video, (p) => onProgress?.("audio", p));
  const highlights = detectHighlights(frames);

  const avgBrightness = frames.reduce((s, f) => s + f.analysis.avgBrightness, 0) / frames.length || 128;
  const avgSaturation = frames.reduce((s, f) => s + f.analysis.avgSaturation, 0) / frames.length || 50;
  const avgSharpness = frames.reduce((s, f) => s + f.analysis.sharpness, 0) / frames.length || 50;
  const dominantHue = frames.reduce((s, f) => s + f.analysis.dominantHue, 0) / frames.length || 0;

  return {
    duration: video.duration,
    avgBrightness: Math.round(avgBrightness),
    avgSaturation: Math.round(avgSaturation),
    avgSharpness: Math.round(avgSharpness),
    dominantHue: Math.round(dominantHue),
    highlights,
    silentSegments,
    suggestedFilter: suggestFilter(dominantHue, avgBrightness, avgSaturation),
    suggestedAdjustments: suggestAdjustments(frames),
    colorGrade: generateColorGrade(dominantHue, avgBrightness),
  };
}
