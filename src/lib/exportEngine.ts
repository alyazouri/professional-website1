/**
 * ─────────────────────────────────────────────────────────────────
 *  Universal Video Export Engine v3
 *  Real MP4 / MOV / WebM exports that play on ALL operating systems.
 *
 *  Strategy:
 *   1. WebCodecs API + mp4-muxer  ->  real H.264 / H.265 MP4 (or MOV).
 *      Works on Chrome 94+, Edge, Opera, recent Safari (17+).
 *      Produces a *real* MP4 container, not a renamed WebM.
 *   2. WebCodecs + webm-muxer     ->  proper VP9 WebM with audio.
 *   3. MediaRecorder fallback     ->  WebM/MP4 native (older browsers).
 *
 *  Audio is captured from the source video or from an optional
 *  external audio file (uploaded music) — mixed via WebAudio.
 * ─────────────────────────────────────────────────────────────────
 */

import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4Target } from "mp4-muxer";
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmTarget } from "webm-muxer";

// ───── Public Types ─────
export type ExportContainer = "mp4" | "mov" | "webm" | "mkv";
export type ExportCodec = "h264" | "h265" | "vp9" | "av1";

export type ExportClip = {
  /** seconds from start of source */
  start: number;
  /** seconds from start of source */
  end: number;
  /** apply transition into THIS clip from previous one */
  transitionIn?: "none" | "crossfade" | "dipblack" | "wipe" | "slide" | "zoom";
  transitionDuration?: number;
};

export type AudioTrack = {
  /** an AudioBuffer for an uploaded music/voice track */
  buffer?: AudioBuffer;
  /** volume 0..1 */
  volume: number;
  /** offset in output timeline (seconds) */
  offset: number;
  /** if true, original video audio is muted while this plays */
  duckOriginal?: boolean;
};

export type ExportSettings = {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  container: ExportContainer;
  codec: ExportCodec;
  /** ordered list of clips composing the final timeline */
  clips: ExportClip[];
  /** include original video audio */
  keepOriginalAudio: boolean;
  originalAudioVolume: number;
  /** extra music/voice tracks to mix */
  extraTracks: AudioTrack[];
  /** per-frame draw callback — caller paints to provided canvas */
  drawFrame: (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    canvas: HTMLCanvasElement | OffscreenCanvas,
    timeInOutput: number,
    sourceVideoTime: number,
    clipIndex: number,
    transitionAlpha: number,
  ) => void;
  /** the source video element (already loaded) */
  source: HTMLVideoElement;
  onProgress?: (p: number, stage: string) => void;
  signal?: AbortSignal;
};

export type ExportResult = {
  blob: Blob;
  filename: string;
  container: ExportContainer;
  codec: ExportCodec;
  durationMs: number;
  sizeBytes: number;
};

// ───── Capability detection ─────
export function detectCapabilities() {
  const hasWebCodecs =
    typeof (globalThis as any).VideoEncoder !== "undefined" &&
    typeof (globalThis as any).VideoFrame !== "undefined" &&
    typeof (globalThis as any).AudioEncoder !== "undefined";
  return {
    webCodecs: hasWebCodecs,
    mp4Native:
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2"),
    webmMr: typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/webm"),
  };
}

export async function isCodecConfigSupported(codec: string, w: number, h: number, fps: number): Promise<boolean> {
  if (!("VideoEncoder" in globalThis)) return false;
  try {
    const cfg = {
      codec,
      width: w,
      height: h,
      framerate: fps,
      bitrate: 5_000_000,
      hardwareAcceleration: "prefer-hardware" as const,
    };
    const r = await (globalThis as any).VideoEncoder.isConfigSupported(cfg);
    return !!r?.supported;
  } catch {
    return false;
  }
}

// ───── Resolve best WebCodecs config ─────
async function pickBestVideoEncoderConfig(
  container: ExportContainer,
  preferredCodec: ExportCodec,
  w: number,
  h: number,
  fps: number,
): Promise<{ codec: string; family: ExportCodec } | null> {
  const candidates: { codec: string; family: ExportCodec; containers: ExportContainer[] }[] = [];
  // H.264 - best universal compatibility (plays everywhere)
  candidates.push({ codec: "avc1.640028", family: "h264", containers: ["mp4", "mov", "mkv"] }); // High@4.0
  candidates.push({ codec: "avc1.42E01E", family: "h264", containers: ["mp4", "mov", "mkv"] }); // Baseline@3.0
  // H.265 - smaller files, modern devices
  candidates.push({ codec: "hev1.1.6.L93.B0", family: "h265", containers: ["mp4", "mov", "mkv"] });
  candidates.push({ codec: "hvc1.1.6.L93.B0", family: "h265", containers: ["mp4", "mov", "mkv"] });
  // VP9 - WebM
  candidates.push({ codec: "vp09.00.10.08", family: "vp9", containers: ["webm", "mkv"] });
  // AV1
  candidates.push({ codec: "av01.0.04M.08", family: "av1", containers: ["webm", "mp4", "mkv"] });

  // Filter by container
  const valid = candidates.filter((c) => c.containers.includes(container));
  // Prefer requested family first
  valid.sort((a, b) => {
    if (a.family === preferredCodec && b.family !== preferredCodec) return -1;
    if (b.family === preferredCodec && a.family !== preferredCodec) return 1;
    return 0;
  });

  for (const c of valid) {
    if (await isCodecConfigSupported(c.codec, w, h, fps)) return { codec: c.codec, family: c.family };
  }
  return null;
}

// ───── Audio mixing (Web Audio offline render) ─────
async function renderMixedAudio(
  source: HTMLVideoElement,
  clips: ExportClip[],
  keepOriginal: boolean,
  originalVolume: number,
  extraTracks: AudioTrack[],
  sampleRate = 48000,
): Promise<AudioBuffer | null> {
  // Total output duration
  const totalDuration = clips.reduce((s, c) => s + Math.max(0, c.end - c.start), 0);
  if (totalDuration <= 0) return null;

  const channels = 2;
  const offline = new OfflineAudioContext(channels, Math.ceil(totalDuration * sampleRate), sampleRate);

  // ─ Source video audio (decoded by capturing into MediaElementSource then back to buffer
  //   isn't trivial offline; instead we decode the underlying file via fetch on the src URL.)
  if (keepOriginal && source.src) {
    try {
      const res = await fetch(source.src);
      const arr = await res.arrayBuffer();
      const decoded = await offline.decodeAudioData(arr.slice(0));
      let outTime = 0;
      for (const c of clips) {
        const dur = Math.max(0, c.end - c.start);
        if (dur <= 0) continue;
        const src = offline.createBufferSource();
        src.buffer = decoded;
        const gain = offline.createGain();
        gain.gain.value = originalVolume;
        src.connect(gain).connect(offline.destination);
        src.start(outTime, c.start, dur);
        outTime += dur;
      }
    } catch {
      /* video has no decodable audio track in current container (e.g. MKV/AV1) */
    }
  }

  // ─ Extra uploaded tracks
  for (const tr of extraTracks) {
    if (!tr.buffer) continue;
    const src = offline.createBufferSource();
    src.buffer = tr.buffer;
    const gain = offline.createGain();
    gain.gain.value = tr.volume;
    src.connect(gain).connect(offline.destination);
    src.start(Math.max(0, tr.offset));
  }

  try {
    return await offline.startRendering();
  } catch {
    return null;
  }
}

// ───── Convert AudioBuffer to interleaved Float32 / Int16 ─────
function audioBufferToPCMI16(buf: AudioBuffer): { data: Int16Array; sampleRate: number; channels: number } {
  const ch = buf.numberOfChannels;
  const len = buf.length;
  const out = new Int16Array(len * ch);
  for (let c = 0; c < ch; c++) {
    const samples = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      out[i * ch + c] = (s * 0x7fff) | 0;
    }
  }
  return { data: out, sampleRate: buf.sampleRate, channels: ch };
}

// ───── Main entry: WebCodecs pipeline (real MP4/MOV) ─────
async function exportWithWebCodecs(settings: ExportSettings): Promise<ExportResult> {
  const {
    width, height, fps, bitrate, container, codec, clips,
    drawFrame, source, onProgress, signal,
    keepOriginalAudio, originalAudioVolume, extraTracks,
  } = settings;

  // Compute total output duration
  const totalSec = clips.reduce((s, c) => s + Math.max(0, c.end - c.start), 0);
  if (totalSec <= 0) throw new Error("Empty timeline");

  const cfg = await pickBestVideoEncoderConfig(container, codec, width, height, fps);
  if (!cfg) throw new Error("No supported WebCodecs config");

  onProgress?.(0, "Preparing audio");

  // Render mixed audio (offline)
  const mixedAudio = await renderMixedAudio(source, clips, keepOriginalAudio, originalAudioVolume, extraTracks);

  onProgress?.(3, "Initializing muxer");

  // ─ Choose muxer
  type AnyMuxer = {
    addVideoChunk: (chunk: any, meta?: any) => void;
    addAudioChunk: (chunk: any, meta?: any) => void;
    finalize: () => void;
    target: { buffer: ArrayBuffer };
  };

  let muxer: AnyMuxer;
  let mimeType: string;
  let extension: string;

  if (container === "webm") {
    const target = new WebmTarget();
    const wm = new WebmMuxer({
      target,
      video: { codec: cfg.family === "vp9" ? "V_VP9" : "V_AV1", width, height, frameRate: fps },
      audio: mixedAudio
        ? { codec: "A_OPUS", numberOfChannels: mixedAudio.numberOfChannels, sampleRate: mixedAudio.sampleRate }
        : undefined,
      firstTimestampBehavior: "offset",
    });
    muxer = wm as unknown as AnyMuxer;
    mimeType = "video/webm";
    extension = "webm";
  } else {
    // mp4 / mov / mkv  -> mp4-muxer (writes valid MP4 box that QuickTime accepts as .mov too)
    const target = new Mp4Target();
    const mp4 = new Mp4Muxer({
      target,
      video: {
        codec: cfg.family === "h264" ? "avc" : cfg.family === "h265" ? "hevc" : cfg.family === "av1" ? "av1" : "avc",
        width,
        height,
        frameRate: fps,
      },
      audio: mixedAudio
        ? { codec: "aac", numberOfChannels: mixedAudio.numberOfChannels, sampleRate: mixedAudio.sampleRate }
        : undefined,
      fastStart: "in-memory",
      firstTimestampBehavior: "offset",
    });
    muxer = mp4 as unknown as AnyMuxer;
    mimeType = container === "mov" ? "video/quicktime" : "video/mp4";
    extension = container === "mkv" ? "mp4" /* mkv via mp4 muxer not supported, fallback */ : container;
  }

  // ─ Video Encoder
  const VideoEncoderCtor = (globalThis as any).VideoEncoder;
  const VideoFrameCtor = (globalThis as any).VideoFrame;

  const videoEncoder = new VideoEncoderCtor({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => console.error("VideoEncoder error", e),
  });

  videoEncoder.configure({
    codec: cfg.codec,
    width,
    height,
    framerate: fps,
    bitrate,
    bitrateMode: "variable",
    hardwareAcceleration: "prefer-hardware",
    latencyMode: "quality",
  });

  // ─ Audio Encoder (AAC for MP4/MOV, Opus for WebM)
  let audioEncoder: any = null;
  if (mixedAudio) {
    const AudioEncoderCtor = (globalThis as any).AudioEncoder;
    audioEncoder = new AudioEncoderCtor({
      output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
      error: (e: any) => console.error("AudioEncoder error", e),
    });
    const aCodec = container === "webm" ? "opus" : "mp4a.40.2";
    audioEncoder.configure({
      codec: aCodec,
      sampleRate: mixedAudio.sampleRate,
      numberOfChannels: mixedAudio.numberOfChannels,
      bitrate: 192_000,
    });
  }

  // ─ Render canvas
  const useOff = typeof OffscreenCanvas !== "undefined";
  const canvas: HTMLCanvasElement | OffscreenCanvas = useOff
    ? new OffscreenCanvas(width, height)
    : Object.assign(document.createElement("canvas"), { width, height });
  if (!useOff) {
    (canvas as HTMLCanvasElement).width = width;
    (canvas as HTMLCanvasElement).height = height;
  }
  const ctx = (canvas as any).getContext("2d", { alpha: false, desynchronized: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  // ─ Frame loop
  const frameInterval = 1 / fps;
  const totalFrames = Math.ceil(totalSec * fps);
  let frameIdx = 0;

  // We must seek the source video to each clip's start, then sample frames
  // by moving currentTime forward (offscreen, paused, deterministic).
  let outTime = 0;
  for (let clipI = 0; clipI < clips.length; clipI++) {
    if (signal?.aborted) throw new Error("Aborted");
    const clip = clips[clipI];
    const clipDur = Math.max(0, clip.end - clip.start);
    if (clipDur <= 0) continue;
    const clipFrames = Math.ceil(clipDur * fps);
    const transD = (clip.transitionDuration ?? 0) * (clipI > 0 ? 1 : 0);

    for (let f = 0; f < clipFrames; f++) {
      if (signal?.aborted) throw new Error("Aborted");
      const tInClip = f / fps;
      const srcT = Math.min(clip.end - 1e-3, clip.start + tInClip);

      // Deterministic seek
      source.currentTime = srcT;
      await waitForSeek(source);

      let transAlpha = 1;
      if (transD > 0 && tInClip < transD) transAlpha = tInClip / transD;

      drawFrame(ctx, canvas, outTime, srcT, clipI, transAlpha);

      const ts = Math.round(outTime * 1_000_000); // µs
      const frame = new VideoFrameCtor(canvas as any, { timestamp: ts, duration: Math.round(frameInterval * 1_000_000) });
      // Keyframe every ~2s
      const keyFrame = frameIdx % Math.round(fps * 2) === 0;
      videoEncoder.encode(frame, { keyFrame });
      frame.close();

      frameIdx++;
      outTime += frameInterval;

      if (frameIdx % 4 === 0) {
        const p = (frameIdx / totalFrames) * 90;
        onProgress?.(p, `Encoding frame ${frameIdx}/${totalFrames}`);
        // Yield to UI thread
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  onProgress?.(92, "Flushing video");
  await videoEncoder.flush();
  videoEncoder.close();

  // ─ Encode audio
  if (audioEncoder && mixedAudio) {
    onProgress?.(94, "Encoding audio");
    const AudioDataCtor = (globalThis as any).AudioData;
    const pcm = audioBufferToPCMI16(mixedAudio);
    // Chunk audio into 1024-sample frames
    const frameSize = 1024;
    const channels = mixedAudio.numberOfChannels;
    const total = pcm.data.length / channels;
    for (let i = 0; i < total; i += frameSize) {
      const n = Math.min(frameSize, total - i);
      const slice = pcm.data.subarray(i * channels, (i + n) * channels);
      const ad = new AudioDataCtor({
        format: "s16",
        sampleRate: mixedAudio.sampleRate,
        numberOfChannels: channels,
        numberOfFrames: n,
        timestamp: Math.round((i / mixedAudio.sampleRate) * 1_000_000),
        data: slice,
      });
      audioEncoder.encode(ad);
      ad.close();
    }
    await audioEncoder.flush();
    audioEncoder.close();
  }

  onProgress?.(97, "Finalizing container");
  muxer.finalize();

  const buf = (muxer as any).target.buffer as ArrayBuffer;
  const blob = new Blob([buf], { type: mimeType });
  onProgress?.(100, "Done");

  return {
    blob,
    filename: `export-${Date.now()}.${extension}`,
    container,
    codec: cfg.family,
    durationMs: totalSec * 1000,
    sizeBytes: blob.size,
  };
}

// ───── Wait for video seek to land ─────
function waitForSeek(v: HTMLVideoElement, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (v.readyState >= 2 && Math.abs(v.currentTime - v.currentTime) < 1e-4) {
      // already there
      resolve();
      return;
    }
    const to = setTimeout(() => {
      v.removeEventListener("seeked", onSeeked);
      reject(new Error("seek timeout"));
    }, timeoutMs);
    const onSeeked = () => {
      clearTimeout(to);
      v.removeEventListener("seeked", onSeeked);
      // small extra wait so decoded frame is on screen
      requestAnimationFrame(() => resolve());
    };
    v.addEventListener("seeked", onSeeked);
  });
}

// ───── MediaRecorder fallback (older browsers) ─────
async function exportWithMediaRecorder(settings: ExportSettings): Promise<ExportResult> {
  const { width, height, fps, bitrate, container, source, drawFrame, clips, onProgress, signal } = settings;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false })!;

  const videoStream = (canvas as any).captureStream(fps) as MediaStream;
  let audioStream: MediaStream | null = null;
  try {
    if ((source as any).captureStream) audioStream = (source as any).captureStream();
  } catch {}

  const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
  if (audioStream) tracks.push(...audioStream.getAudioTracks());
  const combined = new MediaStream(tracks);

  // Pick mime
  const tries =
    container === "mp4"
      ? ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4"]
      : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  const mime = tries.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

  const recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: bitrate });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const stopPromise = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = (e: any) => reject(e.error || new Error("recorder error"));
  });

  const totalSec = clips.reduce((s, c) => s + Math.max(0, c.end - c.start), 0);
  recorder.start(120);

  let outTime = 0;
  for (let i = 0; i < clips.length; i++) {
    if (signal?.aborted) break;
    const clip = clips[i];
    const dur = clip.end - clip.start;
    if (dur <= 0) continue;
    source.currentTime = clip.start;
    await waitForSeek(source);
    await source.play();

    const startT = performance.now();
    while (source.currentTime < clip.end - 0.02 && !source.ended) {
      if (signal?.aborted) break;
      drawFrame(ctx, canvas, outTime + (source.currentTime - clip.start), source.currentTime, i, 1);
      outTime = (performance.now() - startT) / 1000 + outTime;
      onProgress?.(Math.min(95, (outTime / totalSec) * 95), `Recording clip ${i + 1}/${clips.length}`);
      await new Promise((r) => requestAnimationFrame(r));
    }
    source.pause();
  }

  recorder.stop();
  await stopPromise;
  const actualMime = recorder.mimeType || mime;
  const ext = actualMime.includes("mp4") ? "mp4" : "webm";
  const blob = new Blob(chunks, { type: actualMime });
  return {
    blob,
    filename: `export-${Date.now()}.${ext}`,
    container: ext === "mp4" ? "mp4" : "webm",
    codec: ext === "mp4" ? "h264" : "vp9",
    durationMs: totalSec * 1000,
    sizeBytes: blob.size,
  };
}

// ───── Public export ─────
export async function exportTimeline(settings: ExportSettings): Promise<ExportResult> {
  const caps = detectCapabilities();
  if (caps.webCodecs) {
    try {
      return await exportWithWebCodecs(settings);
    } catch (e) {
      console.warn("WebCodecs export failed, falling back to MediaRecorder", e);
    }
  }
  if (caps.webmMr) return exportWithMediaRecorder(settings);
  throw new Error("No supported export path on this browser");
}

// ───── Audio file helpers ─────
export async function loadAudioFile(file: File, sampleRate = 48000): Promise<AudioBuffer> {
  const arr = await file.arrayBuffer();
  // Try OfflineAudioContext first (most accurate decode)
  const ctx = new OfflineAudioContext(2, sampleRate, sampleRate);
  return await ctx.decodeAudioData(arr);
}

// ───── Bitrate helper ─────
export function recommendedBitrate(width: number, height: number, fps: number, quality: "balanced" | "high" | "ultra" = "high"): number {
  const pixels = width * height;
  const fpsFactor = fps / 30;
  const qFactor = quality === "ultra" ? 1.5 : quality === "high" ? 1.0 : 0.65;
  // ~0.1 bits per pixel-frame for H.264 high quality
  return Math.round(pixels * fps * 0.1 * qFactor * fpsFactor * 0.5);
}
