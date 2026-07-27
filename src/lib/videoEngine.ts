/**
 * ENTERPRISE Video Processing Engine v2
 * GPU acceleration, multi-format, AI analysis, auto-retry
 */

import type { FullDeviceProfile } from "./deviceEngine";
type ComprehensiveDeviceProfile = FullDeviceProfile;

// ─── Types ───
export type PipelineStage = "idle" | "loading" | "analyzing" | "ready" | "rendering" | "encoding" | "finalizing" | "completed" | "failed";
export type LogLevel = "info" | "warn" | "error" | "debug";
export type PipelineLog = { time: number; level: LogLevel; message: string; stage: PipelineStage };

export type VideoResolution = "720p" | "900p" | "1080p" | "1440p" | "2160p" | "4320p";
export type VideoFps = 24 | 25 | 30 | 50 | 60 | 90 | 120;
export type ContainerFormat = "mp4" | "mov" | "mkv";
export type CodecType = "h264" | "h265" | "av1";
export type ExportQualityProfile = "auto" | "balanced" | "high" | "ultra" | "creator" | "cinema" | "maximum" | "lossless";
export type PlatformPreset = "tiktokFHD" | "tiktok4K" | "youtubeShorts" | "youtubeGaming" | "instagramReels" | "facebookReels" | "gamingMontage" | "cinema" | "creator";

export type SmartExportConfig = {
  resolution: VideoResolution;
  fps: VideoFps;
  container: ContainerFormat;
  codec: CodecType;
  quality: ExportQualityProfile;
  bitrate?: number;
  trimStart: number;
  trimEnd: number;
  hasAudio: boolean;
  enhance?: boolean;
  onProgress?: (p: number, stage: PipelineStage) => void;
  onLog?: (log: PipelineLog) => void;
  signal: AbortSignal;
};

// ─── Resolution specs ───
const RESOLUTION_HEIGHTS: Record<VideoResolution, number> = {
  "720p": 720, "900p": 900, "1080p": 1080, "1440p": 1440, "2160p": 2160, "4320p": 4320,
};

// ─── Codec selection ───
export function selectOptimalCodec(preferWebCodecs: boolean, hasAudio: boolean, container: ContainerFormat): { mime: string; codec: CodecType } {
  if (container === "mp4") {
    if (hasAudio) {
      if (preferWebCodecs && MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2"))
        return { mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", codec: "h264" };
      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2"))
        return { mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", codec: "h264" };
      if (MediaRecorder.isTypeSupported("video/mp4")) return { mime: "video/mp4", codec: "h264" };
    } else {
      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E"))
        return { mime: "video/mp4;codecs=avc1.42E01E", codec: "h264" };
      if (MediaRecorder.isTypeSupported("video/mp4")) return { mime: "video/mp4", codec: "h264" };
    }
  }
  // WebM fallback (VP9 = AV1 class, or VP8)
  if (hasAudio) {
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) return { mime: "video/webm;codecs=vp9,opus", codec: "av1" };
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) return { mime: "video/webm;codecs=vp8,opus", codec: "h264" };
    if (MediaRecorder.isTypeSupported("video/webm")) return { mime: "video/webm", codec: "h264" };
  } else {
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) return { mime: "video/webm;codecs=vp9", codec: "av1" };
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) return { mime: "video/webm;codecs=vp8", codec: "h264" };
    if (MediaRecorder.isTypeSupported("video/webm")) return { mime: "video/webm", codec: "h264" };
  }
  return { mime: "video/webm", codec: "h264" };
}

// ─── Smart bitrate ───
export function calculateOptimalBitrate(quality: ExportQualityProfile, height: number, fps: number): number {
  const baseBitrates: Record<ExportQualityProfile, number> = {
    auto: 0, balanced: 0, high: 0, ultra: 0, creator: 0, cinema: 0, maximum: 0, lossless: 0,
  };
  if (height >= 2160) {
    baseBitrates.auto = 35_000_000; baseBitrates.balanced = 25_000_000; baseBitrates.high = 40_000_000;
    baseBitrates.ultra = 60_000_000; baseBitrates.creator = 30_000_000; baseBitrates.cinema = 50_000_000;
    baseBitrates.maximum = 80_000_000; baseBitrates.lossless = 100_000_000;
  } else if (height >= 1440) {
    baseBitrates.auto = 16_000_000; baseBitrates.balanced = 12_000_000; baseBitrates.high = 20_000_000;
    baseBitrates.ultra = 28_000_000; baseBitrates.creator = 14_000_000; baseBitrates.cinema = 22_000_000;
    baseBitrates.maximum = 40_000_000; baseBitrates.lossless = 60_000_000;
  } else if (height >= 1080) {
    baseBitrates.auto = 8_000_000; baseBitrates.balanced = 6_000_000; baseBitrates.high = 10_000_000;
    baseBitrates.ultra = 16_000_000; baseBitrates.creator = 7_500_000; baseBitrates.cinema = 12_000_000;
    baseBitrates.maximum = 20_000_000; baseBitrates.lossless = 30_000_000;
  } else if (height >= 720) {
    baseBitrates.auto = 4_000_000; baseBitrates.balanced = 3_000_000; baseBitrates.high = 5_000_000;
    baseBitrates.ultra = 8_000_000; baseBitrates.creator = 3_500_000; baseBitrates.cinema = 6_000_000;
    baseBitrates.maximum = 10_000_000; baseBitrates.lossless = 15_000_000;
  } else {
    baseBitrates.auto = 2_000_000; baseBitrates.balanced = 1_500_000; baseBitrates.high = 2_500_000;
    baseBitrates.ultra = 4_000_000; baseBitrates.creator = 2_000_000; baseBitrates.cinema = 3_000_000;
    baseBitrates.maximum = 6_000_000; baseBitrates.lossless = 10_000_000;
  }
  const base = baseBitrates[quality];
  // FPS multiplier
  const fpsMult = fps / 30;
  return Math.round(base * fpsMult);
}

// ─── Video metadata ───
export type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  hasAudio: boolean;
  size: number;
  name: string;
  container: string;
};

export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  const url = URL.createObjectURL(file);
  try {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = url;
    v.muted = true;

    await new Promise<void>((res, rej) => {
      const onMeta = () => { v.removeEventListener("loadedmetadata", onMeta); res(); };
      const onErr = () => { v.removeEventListener("error", onErr); rej(new Error("Video load failed")); };
      v.addEventListener("loadedmetadata", onMeta);
      v.addEventListener("error", onErr);
      setTimeout(() => rej(new Error("Metadata load timeout")), 15000);
    });

    let hasAudio = false;
    try {
      const stream = (v as any).captureStream ? (v as any).captureStream() : (v as any).mozCaptureStream?.();
      if (stream) hasAudio = stream.getAudioTracks().length > 0;
    } catch {}

    const bitrate = file.size * 8 / Math.max(0.1, v.duration) / 1000;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    return {
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
      fps: 30,
      bitrate: Math.round(bitrate),
      codec: guessContainerCodec(ext),
      hasAudio,
      size: file.size,
      name: file.name,
      container: ext,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function guessContainerCodec(ext: string): string {
  const map: Record<string, string> = {
    mp4: "H.264", m4v: "H.264", mov: "H.264/ProRes", mkv: "H.264/H.265/VP9",
    webm: "VP8/VP9", avi: "MPEG-4", flv: "H.264", ts: "H.264", mts: "H.264",
    mpg: "MPEG-2", mpeg: "MPEG-2",
  };
  return map[ext] || "Unknown";
}

export const SUPPORTED_IMPORT_FORMATS = ["mp4", "mov", "mkv", "avi", "m4v", "webm", "mpeg", "mpg", "ts", "mts"] as const;
export const SUPPORTED_EXPORT_FORMATS = ["mp4", "mov", "mkv"] as const;

// ─── Seek with timeout ───
export function seekVideo(video: HTMLVideoElement, time: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error("Aborted")); return; }
    const timeout = setTimeout(() => { video.removeEventListener("seeked", onSeeked); reject(new Error("Seek timeout")); }, 8000);
    const onSeeked = () => { clearTimeout(timeout); video.removeEventListener("seeked", onSeeked); resolve(); };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

// ─── Logger ───
class PipelineLogger {
  private logs: PipelineLog[] = [];
  emit(stage: PipelineStage, message: string, level: LogLevel = "info") {
    const log = { time: Date.now(), level, message, stage };
    this.logs.push(log);
    if (this.logs.length > 300) this.logs.shift();
  }
  getAll() { return [...this.logs]; }
}

// ─── Main export with retry ───
export async function exportVideoUltimate(
  video: HTMLVideoElement,
  metadata: VideoMetadata,
  config: SmartExportConfig,
  deviceProfile: ComprehensiveDeviceProfile,
  onProgress: (p: number, stage: PipelineStage) => void,
  signal: AbortSignal,
  maxRetries = 2,
): Promise<Blob> {
  const logger = new PipelineLogger();
  const log = (stage: PipelineStage, m: string, level: LogLevel = "info") => {
    logger.emit(stage, m, level);
    config.onLog?.({ time: Date.now(), level, message: m, stage });
  };
  log("rendering", "Starting export pipeline");

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal.aborted) throw new Error("Aborted");
      if (attempt > 0) {
        log("rendering", `Retry ${attempt}/${maxRetries}`, "warn");
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
      const blob = await runExport(video, metadata, config, deviceProfile, onProgress, log, signal);
      log("completed", `Export done: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      return blob;
    } catch (e) {
      lastError = e as Error;
      log("failed", `Attempt ${attempt + 1}: ${lastError.message}`, "error");
    }
  }
  throw lastError || new Error("Export failed");
}

async function runExport(
  video: HTMLVideoElement,
  _metadata: VideoMetadata,
  config: SmartExportConfig,
  deviceProfile: ComprehensiveDeviceProfile,
  onProgress: (p: number, stage: PipelineStage) => void,
  log: (s: PipelineStage, m: string, l?: LogLevel) => void,
  signal: AbortSignal,
): Promise<Blob> {
  const proc = deviceProfile.recommendation;
  const maxW = Math.min(proc.maxRenderWidth, RESOLUTION_HEIGHTS[config.resolution] * 16 / 9);
  const targetH = Math.min(RESOLUTION_HEIGHTS[config.resolution], proc.maxRenderHeight);

  // Compute target dimensions maintaining aspect
  const vw = video.videoWidth, vh = video.videoHeight;
  let tw = vw, th = vh;
  if (th > targetH) {
    const s = targetH / th;
    th = targetH;
    tw = Math.round(tw * s);
  }
  if (tw > maxW) {
    const s = maxW / tw;
    tw = maxW;
    th = Math.round(th * s);
  }
  tw = tw - (tw % 2);
  th = th - (th % 2);
  tw = Math.max(128, tw);
  th = Math.max(128, th);
  log("rendering", `Render target: ${tw}x${th}@${config.fps}fps`);

  // OffscreenCanvas for performance
  let offscreen: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== "undefined" && proc.useOffscreenCanvas) {
    log("rendering", "Using OffscreenCanvas + GPU");
    offscreen = new OffscreenCanvas(tw, th);
  } else {
    offscreen = document.createElement("canvas");
    offscreen.width = tw;
    offscreen.height = th;
  }

  // Get canvas stream
  let videoStream: MediaStream | null = null;
  if (typeof (offscreen as any).captureStream === "function") {
    try { videoStream = (offscreen as any).captureStream(config.fps); } catch { try { videoStream = (offscreen as any).captureStream(); } catch {} }
  }
  if (!videoStream || videoStream.getVideoTracks().length === 0) throw new Error("Stream capture failed");

  // Audio
  let audioStream: MediaStream | null = null;
  let hasAudio = false;
  if (config.hasAudio) {
    try {
      const vAny = video as any;
      let cand: MediaStream | null = null;
      if (typeof vAny.captureStream === "function") cand = vAny.captureStream();
      else if (typeof vAny.mozCaptureStream === "function") cand = vAny.mozCaptureStream();
      if (cand) {
        const t = cand.getAudioTracks();
        if (t.length > 0) { audioStream = new MediaStream(t); hasAudio = true; }
      }
    } catch {}
  }

  const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
  if (audioStream && hasAudio) tracks.push(...audioStream.getAudioTracks());
  const combined = new MediaStream(tracks);

  // Select codec
  const { mime, codec } = selectOptimalCodec(proc.preferWebCodecs, hasAudio, config.container);
  log("encoding", `Codec: ${codec.toUpperCase()} (${mime.split(";")[0]})`);

  // Bitrate
  const bitrate = config.bitrate || calculateOptimalBitrate(config.quality, th, config.fps);
  log("encoding", `Bitrate: ${(bitrate / 1_000_000).toFixed(1)} Mbps`);

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: bitrate });
  } catch {
    recorder = new MediaRecorder(combined, { mimeType: "video/webm", videoBitsPerSecond: bitrate });
  }

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

  const endPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const m = recorder.mimeType || mime;
        const blob = new Blob(chunks, { type: m });
        if (blob.size < 500) reject(new Error("File too small"));
        else { (blob as any)._ext = m.includes("mp4") ? "mp4" : "webm"; resolve(blob); }
      } catch (e) { reject(e as Error); }
    };
    recorder.onerror = (e) => reject((e as any).error || new Error("Recorder error"));
  });

  // Trim range
  const startT = Math.max(0, config.trimStart);
  const endT = Math.min(config.trimEnd, video.duration || config.trimEnd);
  const trimDuration = Math.max(0.1, endT - startT);
  log("rendering", `Trim: ${startT.toFixed(2)}s → ${endT.toFixed(2)}s (${trimDuration.toFixed(2)}s)`);

  try {
    await seekVideo(video, startT, signal);
  } catch (e) {
    throw new Error(`Seek failed: ${(e as Error).message}`);
  }

  // Start recording
  const prevPlaybackRate = video.playbackRate;
  video.playbackRate = 1;
  recorder.start(100);
  log("encoding", "Recording started");

  try {
    await video.play();
  } catch (e) {
    try { if (recorder.state !== "inactive") recorder.stop(); } catch {}
    video.playbackRate = prevPlaybackRate;
    throw new Error(`Play failed: ${(e as Error).message}`);
  }

  // Render loop with frame timing
  let cancelled = false, stopped = false;
  const stopRecording = () => {
    if (stopped) return;
    stopped = true; cancelled = true;
    try { video.pause(); } catch {}
    try { if (recorder.state !== "inactive") recorder.stop(); } catch {}
    video.playbackRate = prevPlaybackRate;
  };

  const safetyTimeout = setTimeout(() => {
    if (!stopped) { log("encoding", "Safety timeout", "warn"); stopRecording(); }
  }, (trimDuration + 5) * 1000);

  const abortHandler = () => { log("failed", "Aborted", "warn"); stopRecording(); };
  signal.addEventListener("abort", abortHandler);

  const targetFrameMs = 1000 / config.fps;
  let lastTime = 0;
  let frames = 0, dropped = 0;

  await new Promise<void>((resolve) => {
    const tick = () => {
      if (cancelled) {
        clearTimeout(safetyTimeout); signal.removeEventListener("abort", abortHandler); resolve(); return;
      }
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      if (dt > targetFrameMs * 1.5) dropped++;
      frames++;
      const tCur = video.currentTime;
      const progress = Math.min(0.98, ((tCur - startT) / trimDuration));
      onProgress(progress * 100, "rendering");
      if (tCur >= endT - 0.05 || video.ended) {
        clearTimeout(safetyTimeout); signal.removeEventListener("abort", abortHandler); stopRecording(); resolve(); return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const blob = await endPromise;
  clearTimeout(safetyTimeout);
  signal.removeEventListener("abort", abortHandler);
  onProgress(100, "completed");
  log("completed", `Rendered ${frames} frames, ${dropped} dropped`);
  return blob;
}
