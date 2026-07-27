/**
 * Heuristic gameplay-highlight detection.
 *
 * This is NOT a server-side ML model — it runs entirely in the browser
 * and uses signal-processing heuristics that correlate with PUBG /
 * Free Fire / CODM gameplay events:
 *
 *   • Audio peaks               -> shots fired, explosions
 *   • Red flashes               -> hit markers / blood splatter
 *   • Bright yellow flashes     -> headshot indicator overlays
 *   • High motion + audio peak  -> kill moment
 *
 * Results are returned as a sorted list of timestamped events with a
 * confidence score (0..1) so the editor can suggest auto-trims.
 */

export type HighlightEvent = {
  time: number; // seconds
  type: "kill" | "headshot" | "explosion" | "hit" | "loud_moment";
  confidence: number; // 0..1
  intensity: number; // 0..100
};

export type HighlightOptions = {
  sampleFps?: number; // visual sampling rate (default 4)
  audioFrameMs?: number; // audio bin size (default 100ms)
  onProgress?: (p: number, stage: string) => void;
  signal?: AbortSignal;
};

// ───── Visual analysis ─────
async function sampleVisualSignals(video: HTMLVideoElement, fps: number, signal?: AbortSignal) {
  const duration = video.duration;
  if (!isFinite(duration) || duration <= 0) return { redFlashes: [], yellowFlashes: [], motion: [] };

  // Downscale for speed
  const W = 240;
  const H = Math.max(100, Math.round((W * video.videoHeight) / Math.max(1, video.videoWidth)));
  const cvs = document.createElement("canvas");
  cvs.width = W;
  cvs.height = H;
  const ctx = cvs.getContext("2d", { willReadFrequently: true })!;

  const step = 1 / fps;
  const frames: { t: number; red: number; yellow: number; lum: number; motion: number }[] = [];
  let prev: Uint8ClampedArray | null = null;

  for (let t = 0; t < duration; t += step) {
    if (signal?.aborted) break;
    video.currentTime = t;
    await new Promise<void>((res, rej) => {
      const to = setTimeout(() => rej(new Error("seek timeout")), 1500);
      const h = () => {
        clearTimeout(to);
        video.removeEventListener("seeked", h);
        res();
      };
      video.addEventListener("seeked", h);
    }).catch(() => {});

    ctx.drawImage(video, 0, 0, W, H);
    const img = ctx.getImageData(0, 0, W, H).data;

    // Hit markers: cluster of saturated red pixels (mostly in upper-middle screen)
    // Headshot markers: yellow-orange flashes
    let red = 0, yellow = 0, lum = 0, motion = 0;
    const total = W * H;
    for (let i = 0; i < img.length; i += 4) {
      const r = img[i], g = img[i + 1], b = img[i + 2];
      lum += 0.299 * r + 0.587 * g + 0.114 * b;
      // saturated red (hit indicator)
      if (r > 180 && g < 90 && b < 90) red++;
      // saturated warm yellow / orange (headshot pop)
      if (r > 220 && g > 160 && g < 230 && b < 110) yellow++;
      // simple motion via per-pixel diff vs prev frame, downsampled
      if (prev && (i & 12) === 0) {
        const dr = Math.abs(r - prev[i]);
        const dg = Math.abs(g - prev[i + 1]);
        const db = Math.abs(b - prev[i + 2]);
        motion += dr + dg + db;
      }
    }
    frames.push({
      t,
      red: red / total,
      yellow: yellow / total,
      lum: lum / total,
      motion: prev ? motion / total : 0,
    });
    prev = new Uint8ClampedArray(img);
  }
  return {
    redFlashes: frames.map((f) => ({ t: f.t, v: f.red })),
    yellowFlashes: frames.map((f) => ({ t: f.t, v: f.yellow })),
    motion: frames.map((f) => ({ t: f.t, v: f.motion })),
  };
}

// ───── Audio analysis ─────
async function sampleAudioPeaks(video: HTMLVideoElement, frameMs: number) {
  if (!video.src) return [];
  try {
    const res = await fetch(video.src);
    const arr = await res.arrayBuffer();
    const ctx = new OfflineAudioContext(1, 1, 22050);
    const buf = await ctx.decodeAudioData(arr.slice(0));
    const data = buf.getChannelData(0);
    const sr = buf.sampleRate;
    const block = Math.max(1, Math.round((sr * frameMs) / 1000));
    const out: { t: number; rms: number; peak: number }[] = [];
    for (let i = 0; i < data.length; i += block) {
      let sum = 0;
      let peak = 0;
      const end = Math.min(data.length, i + block);
      for (let j = i; j < end; j++) {
        const a = Math.abs(data[j]);
        sum += a * a;
        if (a > peak) peak = a;
      }
      const rms = Math.sqrt(sum / (end - i));
      out.push({ t: i / sr, rms, peak });
    }
    return out;
  } catch {
    return [];
  }
}

// ───── Z-score helpers ─────
function zscore(values: { t: number; v: number }[]) {
  const n = values.length;
  if (n === 0) return values.map((x) => ({ t: x.t, z: 0 }));
  const mean = values.reduce((s, x) => s + x.v, 0) / n;
  const variance = values.reduce((s, x) => s + (x.v - mean) ** 2, 0) / Math.max(1, n);
  const std = Math.sqrt(variance) || 1;
  return values.map((x) => ({ t: x.t, z: (x.v - mean) / std }));
}

// ───── Main ─────
export async function detectHighlights(
  video: HTMLVideoElement,
  opts: HighlightOptions = {},
): Promise<HighlightEvent[]> {
  const fps = opts.sampleFps ?? 4;
  const frameMs = opts.audioFrameMs ?? 100;

  opts.onProgress?.(2, "Visual analysis");
  const visual = await sampleVisualSignals(video, fps, opts.signal);
  opts.onProgress?.(55, "Audio analysis");
  const audio = await sampleAudioPeaks(video, frameMs);
  opts.onProgress?.(85, "Scoring events");

  // Convert to z-scores for thresholding
  const zRed = zscore(visual.redFlashes.map((f) => ({ t: f.t, v: f.v })));
  const zYellow = zscore(visual.yellowFlashes.map((f) => ({ t: f.t, v: f.v })));
  const zMotion = zscore(visual.motion.map((f) => ({ t: f.t, v: f.v })));
  const zAudio = zscore(audio.map((f) => ({ t: f.t, v: f.peak })));

  // Build event list by scanning visual frames and looking up audio peak near each
  const events: HighlightEvent[] = [];
  const audioAt = (t: number) => {
    if (!zAudio.length) return 0;
    const idx = Math.min(zAudio.length - 1, Math.round((t / frameMs) * 1000));
    return zAudio[idx]?.z ?? 0;
  };

  for (let i = 0; i < zRed.length; i++) {
    const r = zRed[i].z;
    const y = zYellow[i]?.z ?? 0;
    const m = zMotion[i]?.z ?? 0;
    const a = audioAt(zRed[i].t);

    // Headshot: yellow flash + audio peak
    if (y > 1.5 && a > 1.2) {
      events.push({
        time: zRed[i].t,
        type: "headshot",
        confidence: Math.min(1, (y * 0.4 + a * 0.4 + m * 0.2) / 3 + 0.4),
        intensity: Math.round(Math.min(100, (y + a + m) * 18)),
      });
      continue;
    }
    // Kill: red flash + audio peak + motion
    if (r > 1.3 && a > 1.0 && m > 0.5) {
      events.push({
        time: zRed[i].t,
        type: "kill",
        confidence: Math.min(1, (r * 0.4 + a * 0.4 + m * 0.2) / 3 + 0.3),
        intensity: Math.round(Math.min(100, (r + a + m) * 16)),
      });
      continue;
    }
    // Explosion: huge audio peak + motion
    if (a > 2.2 && m > 0.8) {
      events.push({
        time: zRed[i].t,
        type: "explosion",
        confidence: Math.min(1, (a * 0.6 + m * 0.4) / 3 + 0.25),
        intensity: Math.round(Math.min(100, (a + m) * 18)),
      });
      continue;
    }
    // Hit: red flash only
    if (r > 1.7) {
      events.push({
        time: zRed[i].t,
        type: "hit",
        confidence: Math.min(1, r / 4 + 0.2),
        intensity: Math.round(Math.min(100, r * 22)),
      });
      continue;
    }
    // Loud moment (still useful for trimming)
    if (a > 2.0) {
      events.push({
        time: zRed[i].t,
        type: "loud_moment",
        confidence: Math.min(1, a / 5 + 0.1),
        intensity: Math.round(Math.min(100, a * 20)),
      });
    }
  }

  // De-duplicate: merge events within 0.6s
  events.sort((a, b) => a.time - b.time);
  const merged: HighlightEvent[] = [];
  for (const e of events) {
    const last = merged[merged.length - 1];
    if (last && e.time - last.time < 0.6) {
      // keep the strongest one
      if (e.confidence > last.confidence) merged[merged.length - 1] = e;
    } else merged.push(e);
  }

  opts.onProgress?.(100, "Done");
  return merged.filter((e) => e.confidence >= 0.4);
}

// ───── Build auto-clip plan from highlights ─────
export function buildAutoClips(events: HighlightEvent[], opts?: { lead?: number; trail?: number }): { start: number; end: number; type: HighlightEvent["type"] }[] {
  const lead = opts?.lead ?? 2.0;
  const trail = opts?.trail ?? 1.5;
  const clips: { start: number; end: number; type: HighlightEvent["type"] }[] = [];
  for (const e of events) {
    if (e.confidence < 0.55) continue;
    clips.push({ start: Math.max(0, e.time - lead), end: e.time + trail, type: e.type });
  }
  // Merge overlapping clips
  clips.sort((a, b) => a.start - b.start);
  const merged: typeof clips = [];
  for (const c of clips) {
    const last = merged[merged.length - 1];
    if (last && c.start <= last.end + 0.2) {
      last.end = Math.max(last.end, c.end);
    } else merged.push({ ...c });
  }
  return merged;
}
