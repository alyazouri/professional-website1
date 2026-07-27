/**
 * Studio v3 — Multi-clip timeline editor with real MP4 / MOV export.
 *
 * Highlights vs. v1:
 *   • Real MP4 / MOV / WebM export (WebCodecs + mp4-muxer)
 *   • Multi-clip timeline (cut, split, reorder, delete)
 *   • Real music / audio upload + mixing
 *   • LUT color grading (built-in + .cube files)
 *   • AI Kill / Headshot detection -> auto-clips
 *   • Faster preview (decoupled from export)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict, Lang } from "../lib/i18n";
import { Chip, Field, GoldButton, GhostButton, Progress, Input as TextInput } from "./ui";
import { addRecent } from "../lib/storage";
import JSZip from "jszip";
import { fullAIAnalysis, type VideoAIReport } from "../lib/videoAI";
import {
  Upload, Play, Pause, Download, Film, Sparkles, Zap, Volume2, VolumeX,
  Scissors, Wand2, Music, Type, RotateCcw, FlipHorizontal2, RotateCw, Layers,
  CheckCircle2, Loader2, Trash2, Plus, Crosshair, Target,
  Gauge, ImageIcon, Smile, Palette,
} from "lucide-react";
import { cn } from "../utils/cn";
import { exportTimeline, recommendedBitrate, loadAudioFile, detectCapabilities, type ExportClip, type AudioTrack, type ExportContainer, type ExportCodec } from "../lib/exportEngine";
import { getPresetLUTs, parseCubeLUT, applyLUT, type LUT } from "../lib/lut";
import { detectHighlights, buildAutoClips, type HighlightEvent } from "../lib/highlightDetector";

// ───── Types ─────
type Filter =
  | "none"
  // CLARITY
  | "clarity_uhd" | "clarity_hdr" | "clarity_crisp" | "clarity_punch"
  // CINEMA
  | "cinema_cinematic" | "cinema_noir" | "cinema_blockbuster" | "cinema_indie" | "cinema_vintage"
  // COLOR
  | "color_teal_orange" | "color_warm" | "color_cool" | "color_pastel" | "color_vibrant" | "color_muted"
  // ATMOSPHERE
  | "atmosphere_golden" | "atmosphere_cyberpunk" | "atmosphere_sunset" | "atmosphere_neon" | "atmosphere_dreamy" | "atmosphere_dark"
  // SFX
  | "sfx_bw" | "sfx_glitch" | "sfx_sepia" | "sfx_invert" | "sfx_thermal" | "sfx_xray";

type TransitionType = "crossfade" | "dipblack" | "wipe" | "slide" | "zoom";
type Aspect = { id: string; label: string; ratio: number | null; w: number; h: number };
type Quality = "720" | "1080" | "1440" | "4k";
type TextOverlay = { id: string; text: string; x: number; y: number; size: number; color: string; stroke: string };

// One segment on the multi-clip timeline
type TimelineClip = {
  id: string;
  start: number; // seconds in source
  end: number;
  transitionIn: TransitionType | "none";
  transitionDuration: number;
};

// Uploaded audio track
type UploadedAudio = {
  id: string;
  name: string;
  buffer: AudioBuffer;
  volume: number;
  offset: number;
  duckOriginal: boolean;
};

const FILTERS: { id: Filter; name: string; nameAr: string; css: string; group: "clarity" | "cinema" | "color" | "atmosphere" | "sfx" }[] = [
  { id: "none",                  group: "clarity",    name: "Original",        nameAr: "الأصلي",            css: "none" },
  // CLARITY
  { id: "clarity_uhd",           group: "clarity",    name: "Ultra HD",        nameAr: "دقة فائقة",         css: "contrast(1.3) saturate(1.25) brightness(1.05)" },
  { id: "clarity_hdr",           group: "clarity",    name: "HDR Boost",       nameAr: "تعزيز HDR",         css: "contrast(1.6) saturate(1.4) brightness(1.1)" },
  { id: "clarity_crisp",         group: "clarity",    name: "Crisp",           nameAr: "حاد",                css: "contrast(1.4) saturate(1.15) brightness(1.02)" },
  { id: "clarity_punch",         group: "clarity",    name: "Punchy",          nameAr: "قوي",                css: "contrast(1.5) saturate(1.5) brightness(1.05)" },
  // CINEMA
  { id: "cinema_cinematic",      group: "cinema",     name: "Cinema",          nameAr: "سينما",              css: "contrast(1.25) saturate(0.85) brightness(0.92) sepia(0.1)" },
  { id: "cinema_noir",           group: "cinema",     name: "Film Noir",       nameAr: "نوار",               css: "contrast(1.8) saturate(0) brightness(0.85)" },
  { id: "cinema_blockbuster",    group: "cinema",     name: "Blockbuster",     nameAr: "بلوكباستر",          css: "contrast(1.35) saturate(1.2) brightness(0.95) hue-rotate(-5deg)" },
  { id: "cinema_indie",          group: "cinema",     name: "Indie Film",      nameAr: "فيلم مستقل",         css: "contrast(1.1) saturate(0.7) brightness(0.95) sepia(0.05)" },
  { id: "cinema_vintage",        group: "cinema",     name: "Vintage 70s",     nameAr: "كلاسيكي 70s",        css: "contrast(0.95) saturate(0.7) brightness(0.95) sepia(0.4)" },
  // COLOR GRADING
  { id: "color_teal_orange",     group: "color",      name: "Teal & Orange",   nameAr: "أزرق وبرتقالي",      css: "saturate(1.4) contrast(1.2) hue-rotate(-10deg)" },
  { id: "color_warm",            group: "color",      name: "Warm",            nameAr: "دافئ",               css: "hue-rotate(-15deg) saturate(1.3) brightness(1.08)" },
  { id: "color_cool",            group: "color",      name: "Cool",            nameAr: "بارد",               css: "hue-rotate(20deg) saturate(1.2) brightness(1.02)" },
  { id: "color_pastel",          group: "color",      name: "Pastel",          nameAr: "باستيل",             css: "saturate(0.7) brightness(1.1) contrast(0.95)" },
  { id: "color_vibrant",         group: "color",      name: "Vibrant",         nameAr: "نابض",               css: "saturate(1.7) contrast(1.15) brightness(1.05)" },
  { id: "color_muted",           group: "color",      name: "Muted",           nameAr: "خافت",               css: "saturate(0.55) contrast(1.05) brightness(0.98)" },
  // ATMOSPHERE
  { id: "atmosphere_golden",     group: "atmosphere", name: "Golden Hour",     nameAr: "الساعة الذهبية",     css: "sepia(0.3) saturate(1.4) brightness(1.1)" },
  { id: "atmosphere_cyberpunk",  group: "atmosphere", name: "Cyberpunk",       nameAr: "سايبربانك",         css: "hue-rotate(30deg) saturate(1.8) contrast(1.4)" },
  { id: "atmosphere_sunset",     group: "atmosphere", name: "Sunset",          nameAr: "غروب",               css: "hue-rotate(-20deg) saturate(1.5) brightness(1.05) sepia(0.15)" },
  { id: "atmosphere_neon",       group: "atmosphere", name: "Neon",            nameAr: "نيون",               css: "saturate(2) contrast(1.3) hue-rotate(15deg)" },
  { id: "atmosphere_dreamy",     group: "atmosphere", name: "Dreamy",          nameAr: "حالم",               css: "saturate(0.8) brightness(1.12) contrast(0.92) blur(0.3px)" },
  { id: "atmosphere_dark",       group: "atmosphere", name: "Dark Cinematic",  nameAr: "داكن سينمائي",       css: "contrast(1.35) saturate(0.95) brightness(0.78)" },
  // SFX
  { id: "sfx_bw",                group: "sfx",        name: "Black & White",   nameAr: "أبيض وأسود",         css: "grayscale(1) contrast(1.3)" },
  { id: "sfx_glitch",            group: "sfx",        name: "Glitch",          nameAr: "تشويش",              css: "contrast(1.3) saturate(1.5) hue-rotate(10deg)" },
  { id: "sfx_sepia",             group: "sfx",        name: "Sepia",           nameAr: "بني عتيق",           css: "sepia(0.85) contrast(1.1) brightness(0.98)" },
  { id: "sfx_invert",            group: "sfx",        name: "Invert",          nameAr: "معكوس",              css: "invert(1)" },
  { id: "sfx_thermal",           group: "sfx",        name: "Thermal",         nameAr: "حراري",              css: "hue-rotate(180deg) saturate(2.5) contrast(1.4)" },
  { id: "sfx_xray",              group: "sfx",        name: "X-Ray",           nameAr: "أشعة سينية",         css: "invert(1) grayscale(1) contrast(1.4)" },
];

const ASPECTS: Aspect[] = [
  { id: "orig", label: "Original", ratio: null, w: 16, h: 9 },
  { id: "tiktok", label: "TikTok 9:16", ratio: 9 / 16, w: 9, h: 16 },
  { id: "insta1", label: "Insta 1:1", ratio: 1, w: 1, h: 1 },
  { id: "insta45", label: "Insta 4:5", ratio: 4 / 5, w: 4, h: 5 },
  { id: "yt", label: "YouTube 16:9", ratio: 16 / 9, w: 16, h: 9 },
];

const QUALITIES: { id: Quality; label: string; px: number }[] = [
  { id: "720", label: "720p", px: 720 },
  { id: "1080", label: "1080p", px: 1080 },
  { id: "1440", label: "1440p", px: 1440 },
  { id: "4k", label: "4K", px: 2160 },
];

const CONTAINERS: { id: ExportContainer; label: string; codec: ExportCodec }[] = [
  { id: "mp4", label: "MP4 (H.264) — Universal", codec: "h264" },
  { id: "mov", label: "MOV (H.264) — Apple", codec: "h264" },
  { id: "webm", label: "WebM (VP9) — Web", codec: "vp9" },
  { id: "mkv", label: "MKV (H.264) — Open", codec: "h264" },
];

// ───── Component ─────
export function Studio({ t, lang }: { t: Dict; lang: Lang }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  // Look & feel
  const [filter, setFilter] = useState<Filter>("none");
  const [aspect, setAspect] = useState<Aspect>(ASPECTS[0]);
  const [quality, setQuality] = useState<Quality>("1080");
  const [container, setContainer] = useState<ExportContainer>("mp4");
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [mirrored, setMirrored] = useState(false);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [zoom, setZoom] = useState(1);

  // Adjust
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(0);

  // Playback
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Multi-clip timeline (replaces simple trim)
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Text overlays + caption
  const [captionText, setCaptionText] = useState("");
  const [showCaption, setShowCaption] = useState(false);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);

  // Effects (extended in V4)
  const [effects, setEffects] = useState({
    // Classic
    vignette: false, glitch: false, grain: false, scanlines: false, rgbSplit: false, filmBurn: false,
    // V4 NEW ✨
    lightLeak: false,    // soft pink/orange leak
    dust: false,         // floating dust particles
    chromatic: false,    // chromatic aberration on edges
    pixelate: false,     // mosaic / 8-bit
    mirror: false,       // horizontal mirror
    kaleido: false,      // kaleidoscope
    edge: false,         // edge detection
    duotone: false,      // 2-tone gradient map
    bloom: false,        // light bloom
    snow: false,         // snowfall overlay
    rain: false,         // rain overlay
    bokeh: false,        // soft bokeh circles
  });

  // LUT
  const presetLUTs = useMemo(() => getPresetLUTs(), []);
  const [customLUTs, setCustomLUTs] = useState<LUT[]>([]);
  const [selectedLUTId, setSelectedLUTId] = useState<string>("lut_neutral");
  const [lutIntensity, setLUTIntensity] = useState(1.0);
  const activeLUT = useMemo(
    () => [...presetLUTs, ...customLUTs].find((l) => l.id === selectedLUTId) || presetLUTs[0],
    [presetLUTs, customLUTs, selectedLUTId],
  );

  // Audio tracks
  const [audioTracks, setAudioTracks] = useState<UploadedAudio[]>([]);
  const [originalAudioVolume, setOriginalAudioVolume] = useState(1.0);

  // Cinematic
  const [cinematicBars, setCinematicBars] = useState(false);
  const [barsRatio, setBarsRatio] = useState(0.1);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  // V4 NEW TOOLS
  const [playbackSpeed, setPlaybackSpeed] = useState(1);     // 0.25x → 4x
  const [watermarkText, setWatermarkText] = useState("");    // logo / @user
  const [watermarkPos, setWatermarkPos] = useState<"tl" | "tr" | "bl" | "br">("br");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.6);
  const [stickerEmoji, setStickerEmoji] = useState<string>("");  // single emoji overlay
  const [stickerSize, setStickerSize] = useState(80);
  const [colorTempK, setColorTempK] = useState(0);            // -100..+100 warmth shift
  const [colorTintM, setColorTintM] = useState(0);            // -100..+100 magenta/green shift
  const [pixelateAmt, setPixelateAmt] = useState(8);          // 4..32 pixel size
  const [duotoneHue1, setDuotoneHue1] = useState("#d4af37"); // shadow color
  const [duotoneHue2, setDuotoneHue2] = useState("#0a0a0a"); // highlight color
  const [bloomIntensity, setBloomIntensity] = useState(0.5);  // 0..1
  const [shake, setShake] = useState(0);                      // 0..1 camera shake
  const [stabilize, setStabilize] = useState(false);          // light stabilization (digital)

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState("");
  const [completedExports, setCompletedExports] = useState<{ key: string; label: string; url: string; ext: string; size: number }[]>([]);

  // AI
  const [aiReport, setAiReport] = useState<VideoAIReport | null>(null);
  const [aiStage, setAiStage] = useState<string>("");
  const [aiProgress, setAiProgress] = useState(0);
  const [aiRunning, setAiRunning] = useState(false);
  const [highlights, setHighlights] = useState<HighlightEvent[]>([]);

  // UI
  const [selectedTool, setSelectedTool] = useState<string>("media");
  const exportAbortRef = useRef<AbortController | null>(null);
  const exportCaps = useMemo(() => detectCapabilities(), []);

  function applyQuickLook(preset: "reels" | "cinema" | "esports" | "clean") {
    if (preset === "reels") {
      setFilter("atmosphere_neon");
      setEffects((e) => ({ ...e, bloom: true, bokeh: true, glitch: false }));
      setSaturation(18); setContrast(12); setBrightness(4); setColorTempK(18);
    } else if (preset === "cinema") {
      setFilter("cinema_cinematic");
      setEffects((e) => ({ ...e, vignette: true, grain: true, filmBurn: false, bloom: true }));
      setCinematicBars(true); setBarsRatio(0.12); setColorTempK(10); setContrast(8); setSaturation(-4);
    } else if (preset === "esports") {
      setFilter("clarity_hdr");
      setEffects((e) => ({ ...e, vignette: false, grain: false, scanlines: false, rgbSplit: false, bloom: false }));
      setSharpen(18); setContrast(16); setBrightness(6); setSaturation(12); setColorTempK(0);
    } else {
      setFilter("none");
      setBrightness(0); setContrast(0); setSaturation(0); setHue(0); setBlur(0); setSharpen(0);
      setColorTempK(0); setColorTintM(0); setCinematicBars(false);
      setEffects({ vignette: false, glitch: false, grain: false, scanlines: false, rgbSplit: false, filmBurn: false, lightLeak: false, dust: false, chromatic: false, pixelate: false, mirror: false, kaleido: false, edge: false, duotone: false, bloom: false, snow: false, rain: false, bokeh: false });
    }
  }

  // ───── File ─────
  function onFile(f: File) {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setVideoUrl(url);
    setClips([]);
    setSelectedClipId(null);
    setHighlights([]);
    setAiReport(null);
    setCompletedExports([]);
  }

  // ───── Video listeners ─────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration);
      // initialize timeline with one full-length clip if empty
      setClips((c) => (c.length === 0 ? [{ id: `c-${Date.now()}`, start: 0, end: v.duration, transitionIn: "none", transitionDuration: 0 }] : c));
    };
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [videoUrl]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = muted;
      v.playbackRate = playbackRate;
    }
  }, [muted, playbackRate, videoUrl]);

  // V4: sync UI "playbackSpeed" → video element
  useEffect(() => {
    setPlaybackRate(playbackSpeed);
  }, [playbackSpeed]);

  // ───── Preview rendering (24fps) ─────
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !videoUrl) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let raf = 0;
    let last = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (ts: number) => {
      raf = requestAnimationFrame(draw);
      if (ts - last < interval) return;
      last = ts;
      drawFrame(ctx, canvas, video, {
        aspect, filter, brightness, contrast, saturation, hue, blur, sharpen,
        mirrored, rotation, zoom, overlays, effects, showCaption, captionText,
        lut: activeLUT, lutIntensity,
        previewMode: true,
        cinematicBars, barsRatio, fadeIn, fadeOut,
        duration, currentTime: video.currentTime,
        highlights,
        // V4 NEW
        colorTempK, colorTintM, pixelateAmt,
        duotoneHue1, duotoneHue2, bloomIntensity, shake,
        stickerEmoji, stickerSize,
        watermarkText, watermarkPos, watermarkOpacity,
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [videoUrl, filter, aspect, brightness, contrast, saturation, hue, blur, sharpen,
      mirrored, rotation, zoom, overlays, effects, showCaption, captionText, activeLUT, lutIntensity,
      cinematicBars, barsRatio, fadeIn, fadeOut, duration, currentTime, highlights,
      colorTempK, colorTintM, pixelateAmt, duotoneHue1, duotoneHue2, bloomIntensity, shake,
      stickerEmoji, stickerSize, watermarkText, watermarkPos, watermarkOpacity]);

  // ───── Timeline operations ─────
  function addClipAtPlayhead() {
    const v = videoRef.current; if (!v) return;
    const t = v.currentTime;
    const end = Math.min(duration, t + 5);
    setClips((c) => [...c, { id: `c-${Date.now()}`, start: t, end, transitionIn: "crossfade", transitionDuration: 0.6 }]);
  }
  function splitClipAtPlayhead() {
    const v = videoRef.current; if (!v) return;
    const t = v.currentTime;
    setClips((cs) => {
      const out: TimelineClip[] = [];
      for (const c of cs) {
        if (t > c.start && t < c.end) {
          out.push({ ...c, end: t });
          out.push({ id: `c-${Date.now()}-b`, start: t, end: c.end, transitionIn: "none", transitionDuration: 0 });
        } else out.push(c);
      }
      return out;
    });
  }
  function deleteClip(id: string) {
    setClips((c) => c.filter((x) => x.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  }
  function moveClip(id: string, dir: -1 | 1) {
    setClips((c) => {
      const i = c.findIndex((x) => x.id === id);
      if (i < 0) return c;
      const j = i + dir;
      if (j < 0 || j >= c.length) return c;
      const out = [...c];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });
  }
  function updateClip(id: string, patch: Partial<TimelineClip>) {
    setClips((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  // ───── Audio file upload ─────
  async function handleAudioUpload(f: File) {
    try {
      const buf = await loadAudioFile(f);
      setAudioTracks((a) => [
        ...a,
        { id: `aud-${Date.now()}`, name: f.name, buffer: buf, volume: 0.8, offset: 0, duckOriginal: false },
      ]);
    } catch (e) {
      console.error(e);
      alert(lang === "ar" ? "فشل تحميل الصوت" : "Audio load failed");
    }
  }

  function removeAudioTrack(id: string) {
    setAudioTracks((a) => a.filter((x) => x.id !== id));
  }

  function updateAudioTrack(id: string, patch: Partial<UploadedAudio>) {
    setAudioTracks((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  // ───── LUT upload ─────
  async function handleLUTUpload(f: File) {
    try {
      const text = await f.text();
      const lut = parseCubeLUT(text, `lut-${Date.now()}`, f.name.replace(/\.cube$/i, ""));
      if (!lut) {
        alert(lang === "ar" ? "ملف LUT غير صالح" : "Invalid LUT file");
        return;
      }
      setCustomLUTs((c) => [...c, lut]);
      setSelectedLUTId(lut.id);
    } catch {
      alert(lang === "ar" ? "فشل قراءة LUT" : "Failed to read LUT");
    }
  }

  // ───── AI ─────
  async function runAIEdition() {
    const v = videoRef.current; if (!v || !file) return;
    setAiRunning(true); setAiProgress(0); setAiStage(lang === "ar" ? "تحليل الفيديو..." : "Analyzing video...");
    try {
      const report = await fullAIAnalysis(v, (stage, p) => {
        setAiStage(
          stage === "frames"
            ? (lang === "ar" ? "تحليل المشاهد..." : "Analyzing frames...")
            : (lang === "ar" ? "تحليل الصوت..." : "Analyzing audio..."),
        );
        setAiProgress(stage === "frames" ? p * 40 : 40 + p * 30);
      });
      setAiReport(report);
      setAiStage(lang === "ar" ? "كشف اللحظات المميزة..." : "Detecting highlights...");
      const evs = await detectHighlights(v, {
        sampleFps: 3,
        onProgress: (p) => setAiProgress(70 + p * 0.3),
      });
      setHighlights(evs);
      setAiProgress(100);
      addRecent({ type: "video", label: `AI: ${evs.length} highlights (${report.highlights.length} bright moments)` });
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "فشل التحليل" : "Analysis failed");
    } finally {
      setTimeout(() => { setAiRunning(false); setAiProgress(0); setAiStage(""); }, 1500);
    }
  }

  function applyAISuggestions() {
    if (!aiReport) return;
    const a = aiReport.suggestedAdjustments;
    setBrightness(a.brightness);
    setContrast(a.contrast);
    setSaturation(a.saturation);
    setSharpen(a.sharpen);
    if (FILTERS.find((f) => f.id === aiReport.suggestedFilter)) setFilter(aiReport.suggestedFilter as Filter);
  }

  function buildAutoMontage() {
    if (highlights.length === 0) {
      alert(lang === "ar" ? "لم يتم العثور على لحظات مميزة" : "No highlights found yet — run AI first");
      return;
    }
    const auto = buildAutoClips(highlights, { lead: 2, trail: 1.5 });
    if (auto.length === 0) {
      alert(lang === "ar" ? "اللحظات أقل من العتبة" : "Highlights below threshold");
      return;
    }
    const newClips: TimelineClip[] = auto.map((c, i) => ({
      id: `auto-${Date.now()}-${i}`,
      start: c.start,
      end: c.end,
      transitionIn: i === 0 ? "none" : "crossfade",
      transitionDuration: i === 0 ? 0 : 0.5,
    }));
    setClips(newClips);
  }

  // ───── Export ─────
  async function doExport() {
    if (!file || clips.length === 0) return;
    const video = videoRef.current!;
    setExporting(true); setExportProgress(0); setExportStatus("");
    setCompletedExports([]);
    exportAbortRef.current?.abort();
    exportAbortRef.current = new AbortController();

    // Resolve dimensions
    const qPx = QUALITIES.find((q) => q.id === quality)!.px;
    const vw = video.videoWidth, vh = video.videoHeight;
    let tw = vw, th = vh;
    const tAspect = aspect.ratio;
    if (tAspect) {
      if (vw / vh > tAspect) { th = vh; tw = Math.round(vh * tAspect); }
      else { tw = vw; th = Math.round(vw / tAspect); }
    }
    if (th > qPx) { const s = qPx / th; th = qPx; tw = Math.round(tw * s); }
    tw = Math.max(128, tw - (tw % 2));
    th = Math.max(128, th - (th % 2));

    // Build exportClips & audio tracks
    const exportClips: ExportClip[] = clips.map((c, i) => ({
      start: c.start,
      end: c.end,
      transitionIn: i === 0 ? "none" : (c.transitionIn === "none" ? "none" : c.transitionIn),
      transitionDuration: i === 0 ? 0 : c.transitionDuration,
    }));

    const extraTracks: AudioTrack[] = audioTracks.map((a) => ({
      buffer: a.buffer,
      volume: a.volume,
      offset: a.offset,
      duckOriginal: a.duckOriginal,
    }));

    const codec = CONTAINERS.find((c) => c.id === container)?.codec ?? "h264";

    try {
      setExportStatus(lang === "ar" ? "تجهيز محرك التصدير..." : "Initializing encoder...");
      const result = await exportTimeline({
        width: tw,
        height: th,
        fps: 30,
        bitrate: recommendedBitrate(tw, th, 30, "high"),
        container,
        codec,
        clips: exportClips,
        keepOriginalAudio: !muted,
        originalAudioVolume,
        extraTracks,
        source: video,
        signal: exportAbortRef.current.signal,
        drawFrame: (ctx, canvas, _outTime, _srcT, _clipI, _alpha) => {
          drawFrame(ctx as CanvasRenderingContext2D, canvas as HTMLCanvasElement, video, {
            aspect, filter, brightness, contrast, saturation, hue, blur, sharpen,
            mirrored, rotation, zoom, overlays, effects, showCaption, captionText,
            lut: activeLUT, lutIntensity,
            previewMode: false,
            cinematicBars, barsRatio, fadeIn, fadeOut,
            duration: exportClips.reduce((s, c) => s + (c.end - c.start), 0),
            currentTime: _outTime,
            highlights: [],
            colorTempK, colorTintM, pixelateAmt,
            duotoneHue1, duotoneHue2, bloomIntensity, shake,
            stickerEmoji, stickerSize,
            watermarkText, watermarkPos, watermarkOpacity,
          });
        },
        onProgress: (p, stage) => {
          setExportProgress(p);
          setExportStatus(stage);
        },
      });

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      const base = file.name.replace(/\.[^.]+$/, "") || "alyazouri-export";
      a.href = url;
      a.download = `${base}-${quality}.${result.filename.split(".").pop()}`;
      a.click();
      setCompletedExports([{
        key: "main",
        label: `${result.container.toUpperCase()} • ${result.codec.toUpperCase()} • ${quality}p`,
        url,
        ext: result.filename.split(".").pop() || "mp4",
        size: result.sizeBytes,
      }]);
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
      addRecent({ type: "export", label: `${file.name} → ${result.container.toUpperCase()} ${quality}p` });
    } catch (e) {
      console.error(e);
      alert(`${lang === "ar" ? "فشل التصدير" : "Export failed"}: ${(e as Error).message}`);
    } finally {
      setExporting(false);
      setTimeout(() => { setExportProgress(0); setExportStatus(""); }, 2000);
    }
  }

  function cancelExport() {
    exportAbortRef.current?.abort();
  }

  async function exportZipAllFormats() {
    if (!file || clips.length === 0) return;
    const video = videoRef.current!;
    setExporting(true); setCompletedExports([]);
    const zip = new JSZip();
    const containers: ExportContainer[] = ["mp4", "mov", "webm"];
    const results: { name: string; size: number }[] = [];

    for (let i = 0; i < containers.length; i++) {
      const c = containers[i];
      setExportStatus(lang === "ar" ? `تصدير ${i + 1}/${containers.length}: ${c.toUpperCase()}` : `Export ${i + 1}/${containers.length}: ${c.toUpperCase()}`);
      try {
        const qPx = QUALITIES.find((q) => q.id === quality)!.px;
        const vw = video.videoWidth, vh = video.videoHeight;
        let tw = vw, th = vh;
        if (aspect.ratio) {
          if (vw / vh > aspect.ratio) { th = vh; tw = Math.round(vh * aspect.ratio); }
          else { tw = vw; th = Math.round(vw / aspect.ratio); }
        }
        if (th > qPx) { const s = qPx / th; th = qPx; tw = Math.round(tw * s); }
        tw = Math.max(128, tw - (tw % 2));
        th = Math.max(128, th - (th % 2));

        const result = await exportTimeline({
          width: tw, height: th, fps: 30,
          bitrate: recommendedBitrate(tw, th, 30, "high"),
          container: c,
          codec: CONTAINERS.find((x) => x.id === c)?.codec ?? "h264",
          clips: clips.map((cl, idx) => ({
            start: cl.start, end: cl.end,
            transitionIn: idx === 0 ? "none" : cl.transitionIn === "none" ? "none" : cl.transitionIn,
            transitionDuration: idx === 0 ? 0 : cl.transitionDuration,
          })),
          keepOriginalAudio: !muted,
          originalAudioVolume,
          extraTracks: audioTracks.map((a) => ({ buffer: a.buffer, volume: a.volume, offset: a.offset })),
          source: video,
          drawFrame: (ctx, canvas, outTime) =>
            drawFrame(ctx as CanvasRenderingContext2D, canvas as HTMLCanvasElement, video, {
              aspect, filter, brightness, contrast, saturation, hue, blur, sharpen,
              mirrored, rotation, zoom, overlays, effects, showCaption, captionText,
              lut: activeLUT, lutIntensity, previewMode: false,
              cinematicBars, barsRatio, fadeIn, fadeOut,
              duration: 0, currentTime: outTime, highlights: [],
              colorTempK, colorTintM, pixelateAmt,
              duotoneHue1, duotoneHue2, bloomIntensity, shake,
              stickerEmoji, stickerSize,
              watermarkText, watermarkPos, watermarkOpacity,
            }),
          onProgress: (p) => {
            setExportProgress(((i + p / 100) / containers.length) * 100);
          },
        });
        const fname = `${file.name.replace(/\.[^.]+$/, "")}.${result.filename.split(".").pop()}`;
        zip.file(fname, result.blob);
        results.push({ name: fname, size: result.sizeBytes });
      } catch (e) {
        console.warn(`Container ${c} failed`, e);
      }
    }

    setExportStatus(lang === "ar" ? "ضغط ZIP..." : "Zipping...");
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}-all-formats.zip`;
    a.click();
    setCompletedExports(results.map((r, i) => ({ key: `z-${i}`, label: r.name, url: "", ext: "zip", size: r.size })));
    setExporting(false);
    setExportProgress(100);
    setTimeout(() => { setExportProgress(0); setExportStatus(""); URL.revokeObjectURL(url); }, 5000);
  }

  // ───── UI ─────
  const SIDEBAR: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: "media",    label: lang === "ar" ? "وسائط"  : "Media",     icon: <Film className="h-5 w-5" /> },
    { id: "filters",  label: lang === "ar" ? "فلتر"     : "Filters",   icon: <Sparkles className="h-5 w-5" /> },
    { id: "lut",      label: "LUT",                                  icon: <Layers className="h-5 w-5" /> },
    { id: "adjust",   label: lang === "ar" ? "تعديل"    : "Adjust",    icon: <Wand2 className="h-5 w-5" /> },
    { id: "color",    label: lang === "ar" ? "الألوان" : "Color",     icon: <Palette className="h-5 w-5" /> },
    { id: "effects",  label: lang === "ar" ? "مؤثرات"   : "Effects",   icon: <Zap className="h-5 w-5" /> },
    { id: "speed",    label: lang === "ar" ? "السرعة"   : "Speed",     icon: <Gauge className="h-5 w-5" /> },
    { id: "text",     label: lang === "ar" ? "نص"         : "Text",      icon: <Type className="h-5 w-5" /> },
    { id: "sticker",  label: lang === "ar" ? "ملصقات"   : "Stickers",  icon: <Smile className="h-5 w-5" /> },
    { id: "watermark",label: lang === "ar" ? "علامة"     : "Watermark", icon: <ImageIcon className="h-5 w-5" /> },
    { id: "audio",    label: lang === "ar" ? "صوت"        : "Audio",     icon: <Music className="h-5 w-5" /> },
    { id: "timeline", label: lang === "ar" ? "تايملاين"  : "Timeline",  icon: <Scissors className="h-5 w-5" /> },
    { id: "ai",       label: "AI Studio",                            icon: <Sparkles className="h-5 w-5" /> },
    { id: "export",   label: lang === "ar" ? "تصدير"    : "Export",    icon: <Download className="h-5 w-5" /> },
  ];

  return (
    <div className="fade-up">
      <div className="flex h-[calc(100vh-160px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-[rgba(212,175,55,0.2)] bg-black/40 theme-light:bg-white/40">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.15)] bg-black/60 px-4 py-2.5 theme-light:bg-white/80">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gold-grad text-[#1a1612]"><Film className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-bold text-gold-grad">{t.studio.title} v4</div>
              <div className="text-[10px] opacity-60">
                {file ? `${file.name} • ${clips.length} clip${clips.length !== 1 ? "s" : ""}` : (lang === "ar" ? "مشروع جديد" : "New Project")}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <button onClick={() => {
                if (confirm(lang === "ar" ? "إغلاق المشروع؟" : "Close project?")) {
                  setFile(null);
                  if (videoUrl) URL.revokeObjectURL(videoUrl);
                  setVideoUrl(""); setClips([]); setAudioTracks([]); setHighlights([]); setAiReport(null);
                }
              }} className="rounded-lg border border-[rgba(212,175,55,0.3)] px-3 py-1.5 text-xs hover:border-[rgba(212,175,55,0.6)]">
                ✕ {lang === "ar" ? "إغلاق" : "Close"}
              </button>
            )}
            <GoldButton onClick={doExport} disabled={!file || exporting || clips.length === 0}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? `${Math.round(exportProgress)}%` : (lang === "ar" ? "تصدير" : "Export")}
            </GoldButton>
          </div>
        </div>

        {!file ? (
          <UploadHomeScreen lang={lang} onFile={onFile} />
        ) : (
          <div className="flex min-h-0 flex-1">
            {/* Left Sidebar */}
            <div className="flex w-20 flex-col overflow-y-auto border-r border-[rgba(212,175,55,0.15)] bg-black/40 p-2 theme-light:bg-white/60">
              {SIDEBAR.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition",
                    selectedTool === tool.id ? "bg-gold-grad text-[#1a1612]" : "hover:bg-white/5 text-white/70",
                  )}
                >
                  {tool.icon}
                  <span className="text-[9px] font-bold uppercase tracking-wide">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Center - Preview + Timeline */}
            <div className="flex min-w-0 flex-1 flex-col bg-black/60 theme-light:bg-white/20">
              <div className="flex flex-1 items-center justify-center overflow-hidden p-3">
                <div className="relative h-full max-h-full overflow-hidden rounded-xl border border-[rgba(212,175,55,0.2)] bg-black" style={{ aspectRatio: aspect.ratio ? `${aspect.w}/${aspect.h}` : undefined, maxHeight: "100%", width: "auto" }}>
                  <video ref={videoRef} src={videoUrl} className="hidden" playsInline crossOrigin="anonymous" />
                  <canvas ref={previewCanvasRef} className="h-full w-full object-contain" />
                  {exporting && (
                    <div className="absolute inset-0 grid place-items-center bg-black/80">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold-grad" />
                        <div className="mt-2 text-sm text-gold-grad">{exportStatus}</div>
                        <div className="mt-1 text-xs text-white/70">{Math.round(exportProgress)}%</div>
                        <button onClick={cancelExport} className="mt-3 rounded-lg border border-rose-400/40 px-3 py-1 text-xs text-rose-300">
                          {lang === "ar" ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transport + Multi-clip Timeline */}
              <div className="border-t border-[rgba(212,175,55,0.15)] bg-black/60 p-3 theme-light:bg-white/60">
                <div className="mb-2 flex items-center gap-2">
                  <button onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) v.play(); else v.pause(); }} className="grid h-9 w-9 place-items-center rounded-full bg-gold-grad text-[#1a1612]">
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(212,175,55,0.3)]">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range" min={0} max={duration || 0} step={0.01}
                      value={currentTime}
                      onChange={(e) => { const v = videoRef.current; if (v) v.currentTime = Number(e.target.value); }}
                      className="gold-range w-full"
                    />
                  </div>
                  <div className="min-w-[85px] text-right font-mono text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</div>
                </div>

                {/* Quick clip actions */}
                <div className="mb-2 flex items-center gap-1.5">
                  <button onClick={addClipAtPlayhead} className="rounded-md border border-[rgba(212,175,55,0.3)] bg-black/40 px-2 py-1 text-[10px] hover:border-[rgba(212,175,55,0.7)]"><Plus className="mr-1 inline h-3 w-3" />{lang === "ar" ? "مقطع" : "Clip"}</button>
                  <button onClick={splitClipAtPlayhead} className="rounded-md border border-[rgba(212,175,55,0.3)] bg-black/40 px-2 py-1 text-[10px] hover:border-[rgba(212,175,55,0.7)]"><Scissors className="mr-1 inline h-3 w-3" />{lang === "ar" ? "قص" : "Split"}</button>
                  <span className="ml-auto text-[10px] opacity-60">{clips.length} {lang === "ar" ? "مقاطع" : "clips"}</span>
                </div>

                {/* Multi-clip strip */}
                <div className="space-y-1.5">
                  {clips.map((c, i) => {
                    const w = duration > 0 ? ((c.end - c.start) / duration) * 100 : 100 / Math.max(1, clips.length);
                    const left = duration > 0 ? (c.start / duration) * 100 : 0;
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "group relative flex items-center gap-1 rounded-md border bg-black/40 px-2 py-1.5 text-[10px]",
                          selectedClipId === c.id ? "border-[rgba(212,175,55,0.8)]" : "border-[rgba(212,175,55,0.2)]",
                        )}
                        onClick={() => setSelectedClipId(c.id)}
                      >
                        <span className="w-5 font-bold opacity-60">#{i + 1}</span>
                        <div className="relative h-5 flex-1 rounded bg-white/5">
                          <div
                            className="absolute h-full rounded bg-gold-grad/40"
                            style={{ left: `${left}%`, width: `${w}%` }}
                          />
                          <div className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${(currentTime / Math.max(0.01, duration)) * 100}%` }} />
                        </div>
                        <span className="font-mono">{formatTime(c.start)}→{formatTime(c.end)}</span>
                        <button onClick={(e) => { e.stopPropagation(); moveClip(c.id, -1); }} className="opacity-50 hover:opacity-100">▲</button>
                        <button onClick={(e) => { e.stopPropagation(); moveClip(c.id, 1); }} className="opacity-50 hover:opacity-100">▼</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteClip(c.id); }} className="text-rose-400 opacity-60 hover:opacity-100"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    );
                  })}
                </div>

                {highlights.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                    {highlights.slice(0, 10).map((h, idx) => (
                      <button
                        key={idx}
                        onClick={() => { const v = videoRef.current; if (v) v.currentTime = h.time; }}
                        className={cn(
                          "rounded-md border px-2 py-0.5",
                          h.type === "headshot" ? "border-amber-400/60 text-amber-300" :
                            h.type === "kill" ? "border-rose-400/60 text-rose-300" :
                              h.type === "explosion" ? "border-orange-400/60 text-orange-300" :
                                "border-[rgba(212,175,55,0.3)] text-white/70",
                        )}
                      >
                        {h.type === "headshot" ? "🎯" : h.type === "kill" ? "💀" : h.type === "explosion" ? "💥" : "•"} {formatTime(h.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Properties Panel */}
            <div className="flex w-80 flex-col overflow-y-auto border-l border-[rgba(212,175,55,0.15)] bg-black/40 theme-light:bg-white/60">
              <div className="border-b border-[rgba(212,175,55,0.15)] bg-black/40 px-4 py-2.5 theme-light:bg-white/80">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep/80">{lang === "ar" ? "الخصائص" : "Properties"}</div>
                <div className="text-sm font-bold text-gold-grad">{SIDEBAR.find((tool) => tool.id === selectedTool)?.label}</div>
              </div>
              <div className="flex-1 space-y-3 p-4">

                {selectedTool === "media" && (
                  <>
                    <Field label={lang === "ar" ? "نسبة العرض" : "Aspect Ratio"}>
                      <div className="grid grid-cols-3 gap-1.5">{ASPECTS.map((a) => <Chip key={a.id} active={aspect.id === a.id} onClick={() => setAspect(a)}>{a.label.split(" ")[0]}</Chip>)}</div>
                    </Field>
                    <Field label={lang === "ar" ? "الجودة" : "Quality"}>
                      <div className="flex flex-wrap gap-1.5">{QUALITIES.map((q) => <Chip key={q.id} active={quality === q.id} onClick={() => setQuality(q.id)}>{q.label}</Chip>)}</div>
                    </Field>
                    <Field label={lang === "ar" ? "صيغة التصدير" : "Export Container"}>
                      <div className="space-y-1">
                        {CONTAINERS.map((c) => (
                          <button key={c.id} onClick={() => setContainer(c.id)} className={cn("flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-[11px]", container === c.id ? "border-gold-grad bg-gold-grad/10" : "border-[rgba(212,175,55,0.15)]")}>
                            <span className="font-mono font-bold">{c.label}</span>
                            {container === c.id && <CheckCircle2 className="h-3 w-3 text-gold-grad" />}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label={lang === "ar" ? "تحويل" : "Transform"}>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setMirrored((m) => !m)} className={cn("chip rounded-xl px-3 py-2 text-sm", mirrored && "chip-active")}><FlipHorizontal2 className="mr-1 inline h-3.5 w-3.5" />{lang === "ar" ? "قلب" : "Mirror"}</button>
                        <button onClick={() => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270)} className={cn("chip rounded-xl px-3 py-2 text-sm", rotation !== 0 && "chip-active")}><RotateCw className="mr-1 inline h-3.5 w-3.5" />Rotate</button>
                      </div>
                      <SliderRow label={lang === "ar" ? "تكبير" : "Zoom"} value={zoom} setValue={setZoom} min={1} max={2} />
                    </Field>
                  </>
                )}

                {selectedTool === "filters" && (
                  <div className="grid grid-cols-2 gap-1.5">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-xs transition text-start",
                          filter === f.id ? "border-gold-grad bg-gold-grad/15 font-bold text-gold-grad" : "border-[rgba(212,175,55,0.15)] bg-white/[0.02] hover:border-[rgba(212,175,55,0.4)]",
                        )}
                      >
                        <span>{lang === "ar" ? f.nameAr : f.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedTool === "lut" && (
                  <div className="space-y-3">
                    <Field label={lang === "ar" ? "مكتبة LUT" : "LUT Library"}>
                      <div className="grid gap-1">
                        {[...presetLUTs, ...customLUTs].map((l) => (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLUTId(l.id)}
                            className={cn(
                              "flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px]",
                              selectedLUTId === l.id ? "border-gold-grad bg-gold-grad/15" : "border-[rgba(212,175,55,0.15)]",
                            )}
                          >
                            <span>{lang === "ar" ? l.nameAr : l.name}</span>
                            {selectedLUTId === l.id && <CheckCircle2 className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <SliderRow label={lang === "ar" ? "شدة LUT" : "LUT Intensity"} value={Math.round(lutIntensity * 100)} setValue={(v) => setLUTIntensity(v / 100)} min={0} max={100} />
                    <label className="block cursor-pointer rounded-lg border border-dashed border-[rgba(212,175,55,0.4)] px-3 py-2 text-center text-xs hover:border-[rgba(212,175,55,0.7)]">
                      <Upload className="mr-1 inline h-3 w-3" />
                      {lang === "ar" ? "رفع ملف .cube" : "Upload .cube file"}
                      <input type="file" accept=".cube" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLUTUpload(f); }} />
                    </label>
                  </div>
                )}

                {selectedTool === "adjust" && (
                  <div className="space-y-4">
                    <SliderRow label="Brightness" value={brightness} setValue={setBrightness} min={-50} max={50} />
                    <SliderRow label="Contrast" value={contrast} setValue={setContrast} min={-50} max={50} />
                    <SliderRow label="Saturation" value={saturation} setValue={setSaturation} min={-50} max={50} />
                    <SliderRow label="Hue" value={hue} setValue={setHue} min={-180} max={180} />
                    <SliderRow label="Blur" value={blur} setValue={setBlur} min={0} max={10} />
                    <SliderRow label="Sharpness" value={sharpen} setValue={setSharpen} min={0} max={50} />
                    <GhostButton onClick={() => { setBrightness(0); setContrast(0); setSaturation(0); setHue(0); setBlur(0); setSharpen(0); setFilter("none"); }}><RotateCcw className="h-4 w-4" />{lang === "ar" ? "إعادة" : "Reset"}</GhostButton>
                  </div>
                )}

                {selectedTool === "effects" && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">{lang === "ar" ? "دخيلة" : "Classic"}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <ToggleChip label={lang === "ar" ? "تمويه الحواف" : "Vignette"} active={effects.vignette} onClick={() => setEffects((e) => ({ ...e, vignette: !e.vignette }))} />
                        <ToggleChip label={lang === "ar" ? "تشويش" : "Glitch"} active={effects.glitch} onClick={() => setEffects((e) => ({ ...e, glitch: !e.glitch }))} />
                        <ToggleChip label={lang === "ar" ? "حبيبات" : "Grain"} active={effects.grain} onClick={() => setEffects((e) => ({ ...e, grain: !e.grain }))} />
                        <ToggleChip label={lang === "ar" ? "خطوط مسح" : "Scanlines"} active={effects.scanlines} onClick={() => setEffects((e) => ({ ...e, scanlines: !e.scanlines }))} />
                        <ToggleChip label={lang === "ar" ? "انفصال RGB" : "RGB Split"} active={effects.rgbSplit} onClick={() => setEffects((e) => ({ ...e, rgbSplit: !e.rgbSplit }))} />
                        <ToggleChip label={lang === "ar" ? "حرق فيلم" : "Film Burn"} active={effects.filmBurn} onClick={() => setEffects((e) => ({ ...e, filmBurn: !e.filmBurn }))} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">{lang === "ar" ? "جديد أسطوري V4 ✨" : "V4 Legendary ✨"}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <ToggleChip label={lang === "ar" ? "تسرّب ضوء" : "Light Leak"} active={effects.lightLeak} onClick={() => setEffects((e) => ({ ...e, lightLeak: !e.lightLeak }))} />
                        <ToggleChip label={lang === "ar" ? "غبار" : "Dust"} active={effects.dust} onClick={() => setEffects((e) => ({ ...e, dust: !e.dust }))} />
                        <ToggleChip label={lang === "ar" ? "انحراف ألوان" : "Chromatic"} active={effects.chromatic} onClick={() => setEffects((e) => ({ ...e, chromatic: !e.chromatic }))} />
                        <ToggleChip label={lang === "ar" ? "بكسل" : "Pixelate"} active={effects.pixelate} onClick={() => setEffects((e) => ({ ...e, pixelate: !e.pixelate }))} />
                        <ToggleChip label={lang === "ar" ? "عكس أفقي" : "Mirror"} active={effects.mirror} onClick={() => setEffects((e) => ({ ...e, mirror: !e.mirror }))} />
                        <ToggleChip label={lang === "ar" ? "كاليدوسكوب" : "Kaleido"} active={effects.kaleido} onClick={() => setEffects((e) => ({ ...e, kaleido: !e.kaleido }))} />
                        <ToggleChip label={lang === "ar" ? "رسم حواف" : "Edge"} active={effects.edge} onClick={() => setEffects((e) => ({ ...e, edge: !e.edge }))} />
                        <ToggleChip label={lang === "ar" ? "ثنائي اللون" : "Duotone"} active={effects.duotone} onClick={() => setEffects((e) => ({ ...e, duotone: !e.duotone }))} />
                        <ToggleChip label={lang === "ar" ? "توهج" : "Bloom"} active={effects.bloom} onClick={() => setEffects((e) => ({ ...e, bloom: !e.bloom }))} />
                        <ToggleChip label={lang === "ar" ? "ثلج" : "Snow"} active={effects.snow} onClick={() => setEffects((e) => ({ ...e, snow: !e.snow }))} />
                        <ToggleChip label={lang === "ar" ? "مطر" : "Rain"} active={effects.rain} onClick={() => setEffects((e) => ({ ...e, rain: !e.rain }))} />
                        <ToggleChip label={lang === "ar" ? "بوكي" : "Bokeh"} active={effects.bokeh} onClick={() => setEffects((e) => ({ ...e, bokeh: !e.bokeh }))} />
                      </div>
                    </div>
                    {effects.pixelate && (
                      <SliderRow label={lang === "ar" ? "حجم البكسل" : "Pixel size"} value={pixelateAmt} setValue={setPixelateAmt} min={4} max={32} />
                    )}
                    {effects.bloom && (
                      <SliderRow label={lang === "ar" ? "شدة التوهج" : "Bloom intensity"} value={Math.round(bloomIntensity * 100)} setValue={(v) => setBloomIntensity(v / 100)} min={0} max={100} />
                    )}
                    {effects.duotone && (
                      <div className="flex gap-2 items-center text-xs">
                        <span className="opacity-70">{lang === "ar" ? "ظلال" : "Shadow"}</span>
                        <input type="color" value={duotoneHue1} onChange={(e) => setDuotoneHue1(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
                        <span className="opacity-70 ml-2">{lang === "ar" ? "إبراز" : "Highlight"}</span>
                        <input type="color" value={duotoneHue2} onChange={(e) => setDuotoneHue2(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
                      </div>
                    )}
                    <GhostButton onClick={() => setEffects({ vignette: false, glitch: false, grain: false, scanlines: false, rgbSplit: false, filmBurn: false, lightLeak: false, dust: false, chromatic: false, pixelate: false, mirror: false, kaleido: false, edge: false, duotone: false, bloom: false, snow: false, rain: false, bokeh: false })}>
                      <RotateCcw className="h-4 w-4" />{lang === "ar" ? "إعادة" : "Reset All"}
                    </GhostButton>
                  </div>
                )}

                {selectedTool === "color" && (
                  <div className="space-y-3">
                    <div className="text-xs opacity-70">{lang === "ar" ? "أدوات تدرج لوني سينمائي" : "Cinematic color-grading tools"}</div>
                    <SliderRow label={lang === "ar" ? "درجة الحرارة (دفء/برودة)" : "Temperature (warm/cool)"} value={colorTempK} setValue={setColorTempK} min={-100} max={100} />
                    <SliderRow label={lang === "ar" ? "الصبغة (أخضر/أحمر)" : "Tint (green/magenta)"} value={colorTintM} setValue={setColorTintM} min={-100} max={100} />
                    <div className="pt-2 border-t border-[rgba(212,175,55,0.1)]">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">{lang === "ar" ? "مفتاح سريع للجو العام" : "Quick atmosphere"}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-amber-500/10 px-2 py-2 text-[10px] font-bold hover:bg-amber-500/20" onClick={() => { setColorTempK(40); setColorTintM(-10); }}>☀️ Sunny</button>
                        <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-blue-500/10 px-2 py-2 text-[10px] font-bold hover:bg-blue-500/20" onClick={() => { setColorTempK(-50); setColorTintM(15); }}>❄️ Cold</button>
                        <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-yellow-500/10 px-2 py-2 text-[10px] font-bold hover:bg-yellow-500/20" onClick={() => { setColorTempK(70); setColorTintM(20); }}>🌅 Golden</button>
                      </div>
                    </div>
                    <GhostButton onClick={() => { setColorTempK(0); setColorTintM(0); }}><RotateCcw className="h-4 w-4" />{lang === "ar" ? "إعادة" : "Reset"}</GhostButton>
                  </div>
                )}

                {selectedTool === "speed" && (
                  <div className="space-y-3">
                    <div className="text-xs opacity-70">{lang === "ar" ? "اختر سرعة تشغيل المعاينة والتصدير" : "Choose playback + export speed"}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => setPlaybackSpeed(s)}
                          className={cn(
                            "rounded-lg border px-2 py-2.5 text-xs font-bold transition",
                            playbackSpeed === s
                              ? "border-gold-grad bg-gold-grad/20 text-gold-grad shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                              : "border-[rgba(212,175,55,0.15)] bg-white/[0.02] hover:bg-yellow-500/10"
                          )}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <div className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-yellow-500/5 p-3 text-[11px] leading-relaxed opacity-80">
                      {playbackSpeed < 1
                        ? (lang === "ar" ? "🎞️ حركة بطيئة رائعة للحظات الإثارة!" : "🎞️ Slow-motion is great for action highlights!")
                        : playbackSpeed > 1
                        ? (lang === "ar" ? "⚡ سريع — مثالي للتايملابس" : "⚡ Fast — perfect for time-lapse")
                        : (lang === "ar" ? "⏯️ السرعة العادية" : "⏯️ Normal playback")}
                    </div>
                    <div className="pt-2 border-t border-[rgba(212,175,55,0.1)] space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{lang === "ar" ? "تأثيرات حركية" : "Motion effects"}</div>
                      <SliderRow label={lang === "ar" ? "اهتزاز الكاميرا" : "Camera shake"} value={Math.round(shake * 100)} setValue={(v) => setShake(v / 100)} min={0} max={100} />
                      <ToggleChip label={lang === "ar" ? "تثبيت رقمي" : "Stabilization"} active={stabilize} onClick={() => setStabilize((v) => !v)} />
                    </div>
                  </div>
                )}

                {selectedTool === "sticker" && (
                  <div className="space-y-3">
                    <div className="text-xs opacity-70">{lang === "ar" ? "أضف إيموجي أو رمز" : "Pick an emoji sticker"}</div>
                    <div className="grid grid-cols-8 gap-1">
                      {["🔥", "💥", "🎯", "👑", "⚡", "😈", "🌟", "💣", "💯", "🎮", "🥇", "❤️", "🙌", "🔫", "🏆", "✅", "❌", "🚀", "💢", "😎", "👀", "🌈", "✨", "🤩"].map((e) => (
                        <button key={e} onClick={() => setStickerEmoji(stickerEmoji === e ? "" : e)}
                          className={cn(
                            "aspect-square rounded-lg border text-xl transition",
                            stickerEmoji === e ? "border-gold-grad bg-gold-grad/20 scale-110" : "border-[rgba(212,175,55,0.15)] bg-white/[0.02] hover:bg-yellow-500/10"
                          )}>{e}</button>
                      ))}
                    </div>
                    {stickerEmoji && <SliderRow label={lang === "ar" ? "الحجم" : "Size"} value={stickerSize} setValue={setStickerSize} min={40} max={200} />}
                    {stickerEmoji && <GhostButton onClick={() => setStickerEmoji("")}><Trash2 className="h-4 w-4" />{lang === "ar" ? "إزالة" : "Remove"}</GhostButton>}
                  </div>
                )}

                {selectedTool === "watermark" && (
                  <div className="space-y-3">
                    <div className="text-xs opacity-70">{lang === "ar" ? "أضف علامتك التجارية / اسم المستخدم" : "Add your logo / @username"}</div>
                    <Field label={lang === "ar" ? "النص" : "Text"}>
                      <TextInput value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="@your_handle" />
                    </Field>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1.5">{lang === "ar" ? "الموقع" : "Position"}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {(["tl", "tr", "bl", "br"] as const).map((p) => (
                          <button key={p} onClick={() => setWatermarkPos(p)}
                            className={cn("rounded-lg border px-3 py-2 text-xs font-bold",
                              watermarkPos === p ? "border-gold-grad bg-gold-grad/20" : "border-[rgba(212,175,55,0.15)] bg-white/[0.02] hover:bg-yellow-500/10"
                            )}>
                            {p === "tl" ? (lang === "ar" ? "↗ أعلى يسار" : "↖ Top Left")
                              : p === "tr" ? (lang === "ar" ? "↖ أعلى يمين" : "↗ Top Right")
                              : p === "bl" ? (lang === "ar" ? "↘ أسفل يسار" : "↙ Bottom Left")
                              : (lang === "ar" ? "↙ أسفل يمين" : "↘ Bottom Right")}
                          </button>
                        ))}
                      </div>
                    </div>
                    <SliderRow label={lang === "ar" ? "الشفافية" : "Opacity"} value={Math.round(watermarkOpacity * 100)} setValue={(v) => setWatermarkOpacity(v / 100)} min={20} max={100} />
                    <div className="pt-2 border-t border-[rgba(212,175,55,0.1)] space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{lang === "ar" ? "سينمائي" : "Cinematic frame"}</div>
                      <ToggleChip label={lang === "ar" ? "أشرطة سينمائية" : "Cinematic bars"} active={cinematicBars} onClick={() => setCinematicBars((v) => !v)} />
                      {cinematicBars && <SliderRow label={lang === "ar" ? "سمك الأشرطة" : "Bar thickness"} value={Math.round(barsRatio * 100)} setValue={(v) => setBarsRatio(v / 100)} min={5} max={20} />}
                      <SliderRow label={lang === "ar" ? "تلاشي دخول" : "Fade in"} value={Math.round(fadeIn * 10) / 10} setValue={(v) => setFadeIn(v)} min={0} max={3} />
                      <SliderRow label={lang === "ar" ? "تلاشي خروج" : "Fade out"} value={Math.round(fadeOut * 10) / 10} setValue={(v) => setFadeOut(v)} min={0} max={3} />
                    </div>
                  </div>
                )}

                {selectedTool === "text" && (
                  <div className="space-y-3">
                    <Field label={lang === "ar" ? "ترجمة" : "Caption"}>
                      <TextInput value={captionText} onChange={(e) => { setCaptionText(e.target.value); setShowCaption(e.target.value.length > 0); }} placeholder={lang === "ar" ? "اكتب النص..." : "Type text..."} />
                    </Field>
                    <div>
                      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gold-deep/80">{lang === "ar" ? "نصوص" : "Overlays"}</div>
                      {overlays.map((o) => (
                        <div key={o.id} className="mb-2 rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] p-2">
                          <TextInput value={o.text} onChange={(e) => setOverlays((ov) => ov.map((x) => x.id === o.id ? { ...x, text: e.target.value } : x))} />
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <input type="color" value={o.color} onChange={(e) => setOverlays((ov) => ov.map((x) => x.id === o.id ? { ...x, color: e.target.value } : x))} className="h-7 w-8 cursor-pointer rounded" />
                            <input type="range" min={12} max={120} value={o.size} onChange={(e) => setOverlays((ov) => ov.map((x) => x.id === o.id ? { ...x, size: Number(e.target.value) } : x))} className="gold-range flex-1" />
                            <button onClick={() => setOverlays((ov) => ov.filter((x) => x.id !== o.id))} className="text-xs text-rose-400">✕</button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setOverlays((ov) => [...ov, { id: String(Date.now()), text: lang === "ar" ? "نص جديد" : "New Text", x: 50, y: 50, size: 48, color: "#ffffff", stroke: "#000000" }])} className="btn-ghost w-full rounded-xl px-3 py-2 text-xs">+ {lang === "ar" ? "إضافة نص" : "Add Text"}</button>
                    </div>
                  </div>
                )}

                {selectedTool === "audio" && (
                  <div className="space-y-3">
                    <Field label={lang === "ar" ? "صوت الفيديو الأصلي" : "Original Video Audio"}>
                      <div className="flex items-center gap-2">
                        <Chip active={!muted} onClick={() => setMuted(false)}><Volume2 className="mr-1 inline h-3 w-3" />On</Chip>
                        <Chip active={muted} onClick={() => setMuted(true)}><VolumeX className="mr-1 inline h-3 w-3" />Mute</Chip>
                      </div>
                      {!muted && <SliderRow label={lang === "ar" ? "المستوى" : "Volume"} value={Math.round(originalAudioVolume * 100)} setValue={(v) => setOriginalAudioVolume(v / 100)} min={0} max={150} />}
                    </Field>
                    <Field label={lang === "ar" ? "موسيقى/صوت إضافي" : "Music / Extra Audio"}>
                      <label className="block cursor-pointer rounded-lg border border-dashed border-[rgba(212,175,55,0.4)] px-3 py-2 text-center text-xs hover:border-[rgba(212,175,55,0.7)]">
                        <Upload className="mr-1 inline h-3 w-3" />
                        {lang === "ar" ? "رفع MP3/WAV" : "Upload MP3/WAV"}
                        <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioUpload(f); }} />
                      </label>
                      {audioTracks.map((a) => (
                        <div key={a.id} className="mt-2 rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] p-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-bold">{a.name}</span>
                            <button onClick={() => removeAudioTrack(a.id)} className="text-rose-400"><Trash2 className="h-3 w-3" /></button>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="w-16 text-[10px]">{lang === "ar" ? "مستوى" : "Volume"}</span>
                            <input type="range" min={0} max={150} value={Math.round(a.volume * 100)} onChange={(e) => updateAudioTrack(a.id, { volume: Number(e.target.value) / 100 })} className="gold-range flex-1" />
                            <span className="w-10 text-right font-mono">{Math.round(a.volume * 100)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="w-16 text-[10px]">{lang === "ar" ? "بداية" : "Offset"}</span>
                            <input type="number" min={0} step={0.1} value={a.offset} onChange={(e) => updateAudioTrack(a.id, { offset: Number(e.target.value) })} className="w-20 rounded bg-black/40 px-1 py-0.5 text-[10px]" />
                            <span className="text-[10px] opacity-60">s</span>
                            <span className="ml-auto text-[10px] opacity-60">{formatTime(a.buffer.duration)}</span>
                          </div>
                        </div>
                      ))}
                    </Field>
                  </div>
                )}

                {selectedTool === "timeline" && (
                  <div className="space-y-3">
                    <div className="text-xs opacity-70">
                      {lang === "ar" ? "اضغط Split لقص المقطع عند نقطة التشغيل" : "Press Split to cut clip at playhead"}
                    </div>
                    {selectedClipId && clips.find((c) => c.id === selectedClipId) && (
                      <div className="space-y-2 rounded-lg border border-gold-grad/40 bg-black/40 p-2">
                        <div className="text-[10px] uppercase tracking-wider text-gold-grad">{lang === "ar" ? "المقطع المحدد" : "Selected Clip"}</div>
                        {(() => {
                          const c = clips.find((x) => x.id === selectedClipId)!;
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <label>
                                  <span className="opacity-60">Start</span>
                                  <input type="number" step={0.05} min={0} max={duration} value={c.start.toFixed(2)} onChange={(e) => updateClip(c.id, { start: Math.max(0, Math.min(c.end - 0.1, Number(e.target.value))) })} className="w-full rounded bg-black/40 px-1 py-0.5" />
                                </label>
                                <label>
                                  <span className="opacity-60">End</span>
                                  <input type="number" step={0.05} min={0} max={duration} value={c.end.toFixed(2)} onChange={(e) => updateClip(c.id, { end: Math.max(c.start + 0.1, Math.min(duration, Number(e.target.value))) })} className="w-full rounded bg-black/40 px-1 py-0.5" />
                                </label>
                              </div>
                              <div>
                                <div className="text-[10px] opacity-60">Transition In</div>
                                <div className="flex flex-wrap gap-1">
                                  {(["none", "crossfade", "dipblack", "wipe", "slide", "zoom"] as const).map((tp) => (
                                    <Chip key={tp} active={c.transitionIn === tp} onClick={() => updateClip(c.id, { transitionIn: tp })}>{tp}</Chip>
                                  ))}
                                </div>
                              </div>
                              {c.transitionIn !== "none" && (
                                <SliderRow label="Transition Duration" value={Math.round(c.transitionDuration * 10)} setValue={(v) => updateClip(c.id, { transitionDuration: v / 10 })} min={1} max={20} />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {selectedTool === "ai" && (
                  <div className="space-y-3">
                    <GoldButton onClick={runAIEdition} disabled={aiRunning} className="w-full">
                      {aiRunning ? (<><Loader2 className="h-4 w-4 animate-spin" />{aiStage} ({Math.round(aiProgress)}%)</>) : (<><Sparkles className="h-4 w-4" />{lang === "ar" ? "تحليل ذكي كامل + كشف Kill/Headshot" : "Run AI + Detect Kills"}</>)}
                    </GoldButton>
                    {aiRunning && <Progress value={aiProgress} />}
                    <div className="grid grid-cols-2 gap-2">
                      <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-2 py-2 text-xs font-bold hover:bg-yellow-500/10" onClick={() => applyQuickLook("reels")}>{lang === "ar" ? "ستايل ريلز" : "Reels Look"}</button>
                      <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-2 py-2 text-xs font-bold hover:bg-yellow-500/10" onClick={() => applyQuickLook("cinema")}>{lang === "ar" ? "ستايل سينما" : "Cinema Look"}</button>
                      <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-2 py-2 text-xs font-bold hover:bg-yellow-500/10" onClick={() => applyQuickLook("esports")}>{lang === "ar" ? "ستايل جيمينج" : "Esports Look"}</button>
                      <button className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-2 py-2 text-xs font-bold hover:bg-yellow-500/10" onClick={() => applyQuickLook("clean")}>{lang === "ar" ? "تنظيف" : "Clean Reset"}</button>
                    </div>
                    {aiReport && !aiRunning && (
                      <>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <AnalysisRow k="Brightness" v={`${aiReport.avgBrightness}`} />
                          <AnalysisRow k="Saturation" v={`${aiReport.avgSaturation}%`} />
                          <AnalysisRow k="Sharpness" v={`${aiReport.avgSharpness}%`} />
                          <AnalysisRow k="Hue" v={`${aiReport.dominantHue}°`} />
                          <AnalysisRow k="Highlights" v={`${highlights.length}`} />
                          <AnalysisRow k="Bright pts" v={`${aiReport.highlights.length}`} />
                        </div>
                        <GoldButton onClick={applyAISuggestions} className="w-full"><Wand2 className="h-4 w-4" />{lang === "ar" ? "طبّق الاقتراحات" : "Apply Suggestions"}</GoldButton>
                        {highlights.length > 0 && (
                          <GoldButton onClick={buildAutoMontage} className="w-full"><Target className="h-4 w-4" />{lang === "ar" ? "إنشاء مونتاج تلقائي" : "Auto-Montage from Kills"}</GoldButton>
                        )}
                        {highlights.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase tracking-wider opacity-60">Detected Events</div>
                            {highlights.slice(0, 8).map((h, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded-md border border-[rgba(212,175,55,0.15)] bg-white/[0.02] px-2 py-1 text-[10px]">
                                <span>{h.type === "headshot" ? "🎯" : h.type === "kill" ? "💀" : h.type === "explosion" ? "💥" : "•"} {h.type}</span>
                                <span className="font-mono opacity-70">{formatTime(h.time)} • {Math.round(h.confidence * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {selectedTool === "export" && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-[rgba(212,175,55,0.15)] bg-white/[0.02] p-2 text-[11px]">
                      <div className="mb-2 grid grid-cols-2 gap-1 rounded-md border border-[rgba(212,175,55,0.08)] bg-black/20 p-2 text-[10px]">
                        <span>WebCodecs:</span><span className="font-mono">{exportCaps.webCodecs ? "YES" : "NO"}</span>
                        <span>MP4 native:</span><span className="font-mono">{exportCaps.mp4Native ? "YES" : "NO"}</span>
                        <span>WebM MR:</span><span className="font-mono">{exportCaps.webmMr ? "YES" : "NO"}</span>
                        <span>Bitrate:</span><span className="font-mono">{(recommendedBitrate(aspect.ratio ? Math.round(QUALITIES.find((q) => q.id === quality)!.px * aspect.w / aspect.h) : Math.round((videoRef.current?.videoWidth || 1920) * (QUALITIES.find((q) => q.id === quality)!.px / Math.max(1, videoRef.current?.videoHeight || 1080))), QUALITIES.find((q) => q.id === quality)!.px, 30, "high") / 1_000_000).toFixed(1)} Mbps</span>
                      </div>
                      <div className="font-bold text-gold-grad">
                        <Crosshair className="mr-1 inline h-3 w-3" />
                        {lang === "ar" ? "إعدادات التصدير" : "Export Settings"}
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-1 opacity-80">
                        <span>Container:</span><span className="font-mono">{container.toUpperCase()}</span>
                        <span>Quality:</span><span className="font-mono">{quality}p</span>
                        <span>Clips:</span><span className="font-mono">{clips.length}</span>
                        <span>Audio tracks:</span><span className="font-mono">{audioTracks.length + (muted ? 0 : 1)}</span>
                      </div>
                    </div>
                    <GoldButton onClick={doExport} disabled={exporting || clips.length === 0} className="w-full">
                      {exporting ? (<><Loader2 className="h-4 w-4 animate-spin" />{Math.round(exportProgress)}%</>) : (<><Download className="h-4 w-4" />{lang === "ar" ? "تصدير الآن" : "Export Now"}</>)}
                    </GoldButton>
                    <GhostButton onClick={exportZipAllFormats} disabled={exporting || clips.length === 0}>
                      <Layers className="h-4 w-4" />{lang === "ar" ? "تصدير كل الصيغ (ZIP)" : "Export All Formats (ZIP)"}
                    </GhostButton>
                    {exporting && <Progress value={exportProgress} />}
                    {exportStatus && <div className="text-xs opacity-70">{exportStatus}</div>}
                    {completedExports.length > 0 && !exporting && (
                      <div className="space-y-1">
                        {completedExports.map((r) => (
                          <div key={r.key} className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-1.5 text-xs">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" />{r.label}</span>
                            <span className="font-mono opacity-70">{(r.size / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ───── Sub-components ─────
function UploadHomeScreen({ lang, onFile }: { lang: Lang; onFile: (f: File) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-auto p-6">
      <div className="w-full max-w-4xl space-y-6">
        <label htmlFor="studio-upload" className="block cursor-pointer rounded-2xl border-2 border-dashed border-[rgba(212,175,55,0.4)] bg-gradient-to-br from-black/60 to-black/30 p-12 text-center transition hover:border-[rgba(212,175,55,0.8)] hover:bg-black/50 theme-light:from-white/60 theme-light:to-white/40">
          <Upload className="mx-auto h-16 w-16 text-gold-grad" />
          <div className="mt-4 text-2xl font-black text-gold-grad">{lang === "ar" ? "ارفع فيديو للبدء" : "Upload Video to Start"}</div>
          <div className="mt-2 text-sm opacity-70">
            {lang === "ar"
              ? "تصدير MP4 / MOV / WebM حقيقي على جميع أنظمة التشغيل"
              : "Real MP4 / MOV / WebM export — works on every OS"}
          </div>
        </label>
        <input id="studio-upload" type="file" accept="video/*,.mkv,.webm,.mp4,.mov,.m4v,.avi,.flv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </div>
  );
}

function SliderRow({ label, value, setValue, min, max }: { label: string; value: number; setValue: (n: number) => void; min: number; max: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-deep/80">{label}</span>
        <span className="font-mono text-sm text-gold-grad">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))} className="gold-range w-full" />
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={cn("chip inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm", active && "chip-active")}>{label}</button>;
}

function AnalysisRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="uppercase tracking-wider opacity-60">{k}</span>
      <span className="font-bold text-gold-grad">{v}</span>
    </div>
  );
}

// ───── Frame drawer (preview + export) ─────
type DrawOpts = {
  aspect: Aspect; filter: Filter;
  brightness: number; contrast: number; saturation: number; hue: number; blur: number; sharpen: number;
  mirrored: boolean; rotation: 0 | 90 | 180 | 270; zoom: number;
  overlays: TextOverlay[];
  effects: {
    vignette: boolean; glitch: boolean; grain: boolean; scanlines: boolean; rgbSplit: boolean; filmBurn: boolean;
    lightLeak: boolean; dust: boolean; chromatic: boolean; pixelate: boolean; mirror: boolean; kaleido: boolean;
    edge: boolean; duotone: boolean; bloom: boolean; snow: boolean; rain: boolean; bokeh: boolean;
  };
  /** V4 NEW */
  colorTempK?: number;       // -100..+100
  colorTintM?: number;       // -100..+100
  pixelateAmt?: number;      // px size
  duotoneHue1?: string;      // hex
  duotoneHue2?: string;      // hex
  bloomIntensity?: number;   // 0..1
  shake?: number;            // 0..1
  stickerEmoji?: string;
  stickerSize?: number;
  watermarkText?: string;
  watermarkPos?: "tl" | "tr" | "bl" | "br";
  watermarkOpacity?: number;
  showCaption: boolean; captionText: string;
  lut: LUT; lutIntensity: number;
  previewMode: boolean;
  cinematicBars: boolean; barsRatio: number;
  fadeIn: number; fadeOut: number;
  duration: number; currentTime: number;
  highlights: HighlightEvent[];
};

function drawFrame(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  video: HTMLVideoElement,
  opts: DrawOpts,
) {
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 720;
  let cw = vw, ch = vh;
  if (opts.rotation === 90 || opts.rotation === 270) [cw, ch] = [ch, cw];
  const tAspect = opts.aspect.ratio;
  if (tAspect) {
    if (cw / ch > tAspect) cw = Math.round(ch * tAspect);
    else ch = Math.round(cw / tAspect);
  }
  const maxPrev = opts.previewMode ? 1280 : 3840;
  if (Math.max(cw, ch) > maxPrev) {
    const s = maxPrev / Math.max(cw, ch);
    cw = Math.round(cw * s); ch = Math.round(ch * s);
  }
  canvas.width = cw; canvas.height = ch;

  // Draw transformed video
  ctx.save();
  ctx.translate(cw / 2, ch / 2);
  if (opts.mirrored) ctx.scale(-1, 1);
  ctx.rotate((opts.rotation * Math.PI) / 180);
  ctx.scale(opts.zoom, opts.zoom);
  ctx.translate(-cw / 2, -ch / 2);
  const srcAspect = vw / vh, dstAspect = cw / ch;
  let sx = 0, sy = 0, sw = vw, sh = vh;
  if (srcAspect > dstAspect) { sw = Math.round(vh * dstAspect); sx = Math.round((vw - sw) / 2); }
  else { sh = Math.round(vw / dstAspect); sy = Math.round((vh - sh) / 2); }
  (ctx as any).drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
  ctx.restore();

  // Pixel-level operations
  const filterDef = FILTERS.find((f) => f.id === opts.filter);
  const hasFilter = filterDef && filterDef.css !== "none";
  const hasAdj = opts.brightness || opts.contrast || opts.saturation || opts.hue || opts.sharpen;
  const hasLUT = opts.lut && opts.lut.id !== "lut_neutral";

  if (hasFilter || hasAdj || hasLUT || opts.effects.grain) {
    try {
      const img = ctx.getImageData(0, 0, cw, ch);
      const d = img.data;

      // Parse filter params
      let fBright = 1, fContrast = 1, fSaturate = 1, fSepia = 0, fHueRot = 0, fGray = 0;
      if (hasFilter && filterDef) {
        const css = filterDef.css;
        const m = (re: RegExp) => { const r = css.match(re); return r ? parseFloat(r[1]) : null; };
        fBright = m(/brightness\(([0-9.]+)\)/) ?? 1;
        fContrast = m(/contrast\(([0-9.]+)\)/) ?? 1;
        fSaturate = m(/saturate?\(([0-9.]+)\)/) ?? 1;
        fSepia = m(/sepia\(([0-9.]+)\)/) ?? 0;
        fHueRot = m(/hue-rotate\((-?[0-9.]+)deg\)/) ?? 0;
        fGray = m(/grayscale\(([0-9.]+)\)/) ?? 0;
      }
      const totalBright = fBright * ((100 + opts.brightness) / 100);
      const totalContrast = fContrast * ((100 + opts.contrast) / 100) * (opts.sharpen > 0 ? (100 + opts.sharpen * 0.3) / 100 : 1);
      const totalSaturate = fSaturate * ((100 + opts.saturation) / 100);
      const totalHue = fHueRot + opts.hue;
      const hueRad = totalHue * Math.PI / 180;
      const cosH = Math.cos(hueRad), sinH = Math.sin(hueRad);

      for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];
        if (fGray > 0) { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = r + (gray - r) * fGray; g = g + (gray - g) * fGray; b = b + (gray - b) * fGray; }
        if (fSepia > 0) { const sr = 0.393 * r + 0.769 * g + 0.189 * b; const sg = 0.349 * r + 0.686 * g + 0.168 * b; const sb = 0.272 * r + 0.534 * g + 0.131 * b; r = r + (sr - r) * fSepia; g = g + (sg - g) * fSepia; b = b + (sb - b) * fSepia; }
        if (totalHue !== 0) {
          const nr = r * (0.213 + cosH * 0.787 - sinH * 0.213) + g * (0.715 - cosH * 0.715 - sinH * 0.715) + b * (0.072 - cosH * 0.072 + sinH * 0.928);
          const ng = r * (0.213 - cosH * 0.213 + sinH * 0.143) + g * (0.715 + cosH * 0.285 + sinH * 0.140) + b * (0.072 - cosH * 0.072 - sinH * 0.283);
          const nb = r * (0.213 - cosH * 0.213 - sinH * 0.787) + g * (0.715 - cosH * 0.715 + sinH * 0.715) + b * (0.072 + cosH * 0.928 + sinH * 0.072);
          r = nr; g = ng; b = nb;
        }
        r *= totalBright; g *= totalBright; b *= totalBright;
        r = (r - 128) * totalContrast + 128; g = (g - 128) * totalContrast + 128; b = (b - 128) * totalContrast + 128;
        if (totalSaturate !== 1) { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = gray + (r - gray) * totalSaturate; g = gray + (g - gray) * totalSaturate; b = gray + (b - gray) * totalSaturate; }
        // Grain
        if (opts.effects.grain) { const n = (Math.random() - 0.5) * 15; r += n; g += n; b += n; }
        // V4: Color temperature / tint
        if (opts.colorTempK && opts.colorTempK !== 0) {
          const tk = opts.colorTempK / 100; // -1..+1
          r += tk * 25;  // warm ↑ red
          b -= tk * 25;  // warm ↓ blue
        }
        if (opts.colorTintM && opts.colorTintM !== 0) {
          const tm = opts.colorTintM / 100; // -1..+1
          g -= tm * 20;   // +1 = magenta (less green), -1 = green
        }
        // V4: Duotone (map by luminance)
        if (opts.effects.duotone && opts.duotoneHue1 && opts.duotoneHue2) {
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const c1 = hexToRgb(opts.duotoneHue1);
          const c2 = hexToRgb(opts.duotoneHue2);
          r = c1.r + (c2.r - c1.r) * lum;
          g = c1.g + (c2.g - c1.g) * lum;
          b = c1.b + (c2.b - c1.b) * lum;
        }
        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
      // Apply LUT
      if (hasLUT) applyLUT(img, opts.lut, opts.lutIntensity);
      ctx.putImageData(img, 0, 0);
    } catch (e) {
      console.warn("pixel ops failed", e);
    }
  }

  // Composited overlays
  if (opts.effects.vignette) {
    const grad = (ctx as CanvasRenderingContext2D).createRadialGradient(cw / 2, ch / 2, cw * 0.3, cw / 2, ch / 2, cw * 0.8);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (opts.effects.rgbSplit) {
    (ctx as any).globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255,0,0,0.08)";
    ctx.fillRect(4, 0, cw, ch);
    ctx.fillStyle = "rgba(0,0,255,0.08)";
    ctx.fillRect(-4, 0, cw, ch);
    (ctx as any).globalCompositeOperation = "source-over";
  }
  if (opts.effects.scanlines) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let y = 0; y < ch; y += 3) ctx.fillRect(0, y, cw, 1);
  }
  if (opts.effects.filmBurn) {
    const t = Date.now() * 0.001;
    const alpha = 0.08 + Math.abs(Math.sin(t)) * 0.12;
    const grad = (ctx as CanvasRenderingContext2D).createRadialGradient(cw * 0.2, ch * 0.3, 0, cw * 0.2, ch * 0.3, cw * 0.6);
    grad.addColorStop(0, `rgba(255, 170, 60, ${alpha})`);
    grad.addColorStop(1, "rgba(255, 170, 60, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (opts.effects.glitch) {
    const t = Date.now();
    if (Math.sin(t * 0.01) > 0.7) {
      const sliceH = Math.round(ch * (0.05 + Math.random() * 0.1));
      const y = Math.floor(Math.random() * (ch - sliceH));
      try {
        const img = ctx.getImageData(0, y, cw, sliceH);
        ctx.putImageData(img, Math.round((Math.random() - 0.5) * 20), y);
      } catch {}
    }
  }

  // ====== V4 NEW EFFECTS ======
  // Light Leak
  if (opts.effects.lightLeak) {
    const t = Date.now() * 0.0008;
    const cx = cw * (0.7 + Math.sin(t) * 0.15);
    const cy = ch * (0.2 + Math.cos(t * 0.7) * 0.1);
    const grad = (ctx as CanvasRenderingContext2D).createRadialGradient(cx, cy, 0, cx, cy, cw * 0.7);
    grad.addColorStop(0, "rgba(255, 180, 120, 0.35)");
    grad.addColorStop(0.5, "rgba(255, 100, 80, 0.15)");
    grad.addColorStop(1, "rgba(255, 100, 80, 0)");
    (ctx as any).globalCompositeOperation = "screen";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    (ctx as any).globalCompositeOperation = "source-over";
  }

  // Bokeh
  if (opts.effects.bokeh) {
    (ctx as any).globalCompositeOperation = "screen";
    for (let i = 0; i < 18; i++) {
      const seed = (i * 13.7 + Date.now() * 0.00005) % 1;
      const x = (seed * 1.3 + i * 0.1) % 1 * cw;
      const y = ((seed * 3.7 + i * 0.07) % 1) * ch;
      const r = 8 + ((i * 7) % 22);
      const g = (ctx as CanvasRenderingContext2D).createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,230,150,0.4)");
      g.addColorStop(1, "rgba(255,230,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    (ctx as any).globalCompositeOperation = "source-over";
  }

  // Dust particles
  if (opts.effects.dust) {
    const t = Date.now() * 0.001;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 30; i++) {
      const seed = i * 17.31;
      const x = ((seed + t * 8) % cw + cw) % cw;
      const y = ((seed * 1.3 + t * 18) % ch + ch) % ch;
      const r = 0.5 + ((i * 5) % 2);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Snow
  if (opts.effects.snow) {
    const t = Date.now() * 0.001;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 80; i++) {
      const seed = i * 7.13;
      const x = ((seed + Math.sin(t + i) * 30 + t * 12) % cw + cw) % cw;
      const y = ((seed * 2.1 + t * 80) % ch + ch) % ch;
      const r = 1 + ((i * 3) % 3);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Rain
  if (opts.effects.rain) {
    const t = Date.now() * 0.001;
    ctx.strokeStyle = "rgba(180,210,240,0.55)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 100; i++) {
      const seed = i * 11.7;
      const x = ((seed + t * 50) % cw + cw) % cw;
      const y = ((seed * 2 + t * 600) % ch + ch) % ch;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 16); ctx.stroke();
    }
  }

  // Chromatic aberration
  if (opts.effects.chromatic) {
    try {
      const src = ctx.getImageData(0, 0, cw, ch);
      const dst = ctx.createImageData(cw, ch);
      const s = src.data, ds = dst.data;
      const off = 3;
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const i = (y * cw + x) * 4;
          const xR = Math.min(cw - 1, x + off);
          const xB = Math.max(0, x - off);
          ds[i]     = s[(y * cw + xR) * 4];
          ds[i + 1] = s[i + 1];
          ds[i + 2] = s[(y * cw + xB) * 4 + 2];
          ds[i + 3] = s[i + 3];
        }
      }
      ctx.putImageData(dst, 0, 0);
    } catch {}
  }

  // Pixelate (mosaic)
  if (opts.effects.pixelate) {
    const size = Math.max(2, opts.pixelateAmt ?? 8);
    try {
      // Down-sample then up-sample via temp canvas
      const tw = Math.max(2, Math.round(cw / size)), th = Math.max(2, Math.round(ch / size));
      const oc = new OffscreenCanvas(tw, th);
      const otx = oc.getContext("2d") as OffscreenCanvasRenderingContext2D;
      otx.imageSmoothingEnabled = false;
      otx.drawImage(canvas as HTMLCanvasElement, 0, 0, tw, th);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(oc as unknown as CanvasImageSource, 0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
    } catch {}
  }

  // Edge detection
  if (opts.effects.edge) {
    try {
      const src = ctx.getImageData(0, 0, cw, ch);
      const dst = ctx.createImageData(cw, ch);
      const s = src.data, ds = dst.data;
      for (let y = 1; y < ch - 1; y++) {
        for (let x = 1; x < cw - 1; x++) {
          const i = (y * cw + x) * 4;
          const gx = -s[i - 4] + s[i + 4];
          const gy = -s[i - cw * 4] + s[i + cw * 4];
          const v = Math.min(255, Math.sqrt(gx * gx + gy * gy));
          ds[i] = ds[i + 1] = ds[i + 2] = v;
          ds[i + 3] = 255;
        }
      }
      ctx.putImageData(dst, 0, 0);
    } catch {}
  }

  // Mirror (horizontal flip)
  if (opts.effects.mirror) {
    try {
      const half = Math.floor(cw / 2);
      const left = ctx.getImageData(0, 0, half, ch);
      // mirror left side onto right side
      const oc = new OffscreenCanvas(half, ch);
      const otx = oc.getContext("2d") as OffscreenCanvasRenderingContext2D;
      otx.putImageData(left, 0, 0);
      ctx.save();
      ctx.translate(cw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(oc as unknown as CanvasImageSource, 0, 0);
      ctx.restore();
    } catch {}
  }

  // Kaleidoscope (6 slices)
  if (opts.effects.kaleido) {
    try {
      const slice = Math.floor(cw / 3);
      const src = ctx.getImageData(0, 0, slice, ch);
      const oc = new OffscreenCanvas(slice, ch);
      (oc.getContext("2d") as OffscreenCanvasRenderingContext2D).putImageData(src, 0, 0);
      ctx.clearRect(slice, 0, cw - slice, ch);
      // mirror twice
      ctx.save();
      ctx.translate(2 * slice, 0); ctx.scale(-1, 1);
      ctx.drawImage(oc as unknown as CanvasImageSource, 0, 0);
      ctx.restore();
      ctx.drawImage(oc as unknown as CanvasImageSource, 2 * slice, 0);
    } catch {}
  }

  // Bloom (lift highlights)
  if (opts.effects.bloom) {
    const intensity = opts.bloomIntensity ?? 0.5;
    (ctx as any).globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(255,240,210,${0.08 + intensity * 0.18})`;
    ctx.fillRect(0, 0, cw, ch);
    (ctx as any).globalCompositeOperation = "source-over";
  }

  // Camera shake (translate by small random amount)
  if (opts.shake && opts.shake > 0) {
    const intensity = opts.shake * 8;
    const t = Date.now() * 0.02;
    const dx = Math.sin(t * 1.7) * intensity + (Math.random() - 0.5) * intensity * 0.5;
    const dy = Math.cos(t * 1.3) * intensity + (Math.random() - 0.5) * intensity * 0.5;
    try {
      const img = ctx.getImageData(0, 0, cw, ch);
      ctx.clearRect(0, 0, cw, ch);
      ctx.putImageData(img, Math.round(dx), Math.round(dy));
    } catch {}
  }

  // Caption
  if (opts.showCaption && opts.captionText) {
    const fs = Math.max(18, Math.round(cw / 24));
    ctx.font = `bold ${fs}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = Math.round(fs / 10);
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.fillStyle = "#fff";
    ctx.strokeText(opts.captionText, cw / 2, ch - Math.round(ch * 0.08));
    ctx.fillText(opts.captionText, cw / 2, ch - Math.round(ch * 0.08));
  }
  // Overlays
  for (const o of opts.overlays) {
    const fs = Math.max(16, Math.round((o.size / 100) * (cw / 8)));
    ctx.font = `bold ${fs}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const x = (o.x / 100) * cw, y = (o.y / 100) * ch;
    ctx.lineWidth = Math.max(2, Math.round(fs / 12));
    ctx.strokeStyle = o.stroke;
    ctx.fillStyle = o.color;
    ctx.strokeText(o.text, x, y);
    ctx.fillText(o.text, x, y);
  }
  // V4: Sticker (emoji overlay) — single, large, centered-ish
  if (opts.stickerEmoji) {
    const sz = (opts.stickerSize ?? 80) / 100 * (Math.min(cw, ch) * 0.5);
    ctx.font = `${Math.round(sz)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(opts.stickerEmoji, cw / 2, ch / 2);
  }

  // V4: Watermark text
  if (opts.watermarkText) {
    const fs = Math.max(14, Math.round(cw / 36));
    ctx.font = `bold ${fs}px Inter, system-ui, sans-serif`;
    const pad = Math.round(cw / 40);
    const w = ctx.measureText(opts.watermarkText).width;
    const pos = opts.watermarkPos ?? "br";
    let x = cw - w - pad, y = ch - pad;
    if (pos === "tl") { x = pad; y = fs + pad; ctx.textAlign = "start"; ctx.textBaseline = "alphabetic"; }
    else if (pos === "tr") { x = cw - pad; y = fs + pad; ctx.textAlign = "end"; ctx.textBaseline = "alphabetic"; }
    else if (pos === "bl") { x = pad; y = ch - pad; ctx.textAlign = "start"; ctx.textBaseline = "alphabetic"; }
    else { x = cw - pad; y = ch - pad; ctx.textAlign = "end"; ctx.textBaseline = "alphabetic"; }
    const op = opts.watermarkOpacity ?? 0.6;
    ctx.lineWidth = Math.round(fs / 8);
    ctx.strokeStyle = `rgba(0,0,0,${0.7 * op})`;
    ctx.fillStyle = `rgba(255,255,255,${op})`;
    ctx.strokeText(opts.watermarkText, x, y);
    ctx.fillText(opts.watermarkText, x, y);
    // reset
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  // Cinematic bars
  if (opts.cinematicBars && opts.barsRatio > 0) {
    const barH = Math.round(ch * opts.barsRatio);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, barH);
    ctx.fillRect(0, ch - barH, cw, barH);
  }
  // Fade
  if ((opts.fadeIn || opts.fadeOut)) {
    let alpha = 0;
    if (opts.fadeIn > 0 && opts.currentTime < opts.fadeIn) alpha = 1 - opts.currentTime / opts.fadeIn;
    else if (opts.fadeOut > 0 && opts.duration > 0) {
      const timeLeft = opts.duration - opts.currentTime;
      if (timeLeft < opts.fadeOut) alpha = 1 - timeLeft / opts.fadeOut;
    }
    if (alpha > 0.01) {
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, cw, ch);
    }
  }
  // Live highlight markers on preview
  if (opts.previewMode && opts.highlights.length > 0) {
    const now = opts.currentTime;
    const near = opts.highlights.find((h) => Math.abs(h.time - now) < 0.3);
    if (near) {
      const color = near.type === "headshot" ? "#fbbf24" : near.type === "kill" ? "#f43f5e" : "#fb923c";
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(4, cw / 200);
      ctx.strokeRect(8, 8, cw - 16, ch - 16);
      ctx.font = `bold ${Math.max(20, cw / 30)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "left";
      ctx.fillText(near.type.toUpperCase(), 20, 40);
      ctx.restore();
    }
  }
}

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// V4: hex "#rrggbb" → { r, g, b }
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
