# 🔥 SENSITIVITY PUBG BY ALYAZOURI — الـ Prompt الشامل الكامل
# انسخ هذا الـ Prompt بالكامل وألصقه لإنشاء الموقع من الصفر 100%

---

## معلومات المشروع

- **الاسم:** SENSITIVITY PUBG BY ALYAZOURI
- **الناقلة:** Professional AI-Powered PUBG Mobile Sensitivity Generator
- **المالك:** @Saeedjor11 (Instagram) / @saeedalyazouri0 (TikTok) / saeedjor11@gmail.com / UID: 5744469523
- **التقنية:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4
- **المكتبات:** lucide-react, jsPDF, JSZip, clsx, tailwind-merge
- **لا backend** — كل شيء في المتصفح

---

## هيكل الملفات

```
index.html
package.json
vite.config.ts
tsconfig.json
src/
  main.tsx
  App.tsx
  index.css
  utils/cn.ts
  lib/
    i18n.ts
    devices.ts
    weapons.ts
    sensitivityEngine.ts
    storage.ts
    videoAI.ts
    pdfReport.ts
  components/
    ui.tsx
    Generator.tsx
    Studio.tsx
```

---

## 1. index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23FFD700'/%3E%3Cstop offset='1' stop-color='%23B8860B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='22' fill='%230a0a0a'/%3E%3Ctext x='50' y='66' font-family='Georgia' font-size='54' font-weight='700' text-anchor='middle' fill='url(%23g)'%3EA%3C/text%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Tajawal:wght@300;400;500;700;900&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
  <meta name="theme-color" content="#0a0a0a" />
  <title>SENSITIVITY PUBG BY ALYAZOURI — AI Sensitivity Generator</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## 2. package.json (dependencies)

```json
{
  "name": "alyazouri-sensitivity",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "jspdf": "^2.5.2",
    "jszip": "^3.10.1",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "tailwind-merge": "3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "22.19.17",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1",
    "lucide-react": "^0.344.0",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "7.3.2",
    "vite-plugin-singlefile": "2.3.0"
  }
}
```

---

## 3. vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
```

---

## 4. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

---

## 5. src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 6. src/utils/cn.ts

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

---

## 7. src/lib/storage.ts

localStorage manager for theme, language, saved profiles, recent activity.
Keys: "alyazouri-store-v1"
Exports: getStore(), setTheme(), setLang(), saveProfile(), deleteProfile(), setUser(), addRecent(), uid()
Profile type: { id, name, dna, createdAt, payload }
User type: { id, name, email, provider, createdAt }

---

## 8. src/lib/i18n.ts

Full bilingual translation system (EN + AR). See the key structure:

```typescript
type Lang = "en" | "ar";
translations = {
  en: {
    brand, tagline,
    nav: { generator, studio },
    hero: { badge, title, subtitle, cta, cta2, stats1-3 },
    wizard: { step, of, back, next, continue, generate, generating,
      title: { device, detect, system, fingers, gyro, style, skill, combat, range, weapon, attachments, priority, speed },
      desc: { same keys } },
    labels: { brand, model, search, os, fps, refresh, touch, fingers, gyro, style, skill, range, weapon, grip, muzzle, mag, stock, priority, normalSpeed, gyroSpeed, detect, detecting, sensitivity, control, dna, save, share, copy, copied, reset },
    sections: { freeLook, camera, ads, gyro, adsGyro },
    scopes: { tpp, fpp, red, s2, s3, s4, s6, s8, parachuting },
    result: { title, sub, dnaLabel, confidence, tier },
    playStyles: { aggressive, rusher, balanced, support, sniper, tdm, competitive, entryfrag, lurker, igl, anchor },
    skills: { beginner, intermediate, advanced, professional, conqueror },
    ranges: { close, mid, long, mixed },
    priorities: { headshot, recoil, tracking, balanced, competitive },
    gyros: { off, scope, always },
    deviceInfo: { selectedDevice, brand, tier, refresh, touch, screen, os, confidence, method, userAgentData, uaParsing, hardwareHeuristic },
    controls: { movementSize, tppView, fppView, sprintSens },
    speedLabels: { ultraStable, balanced, maxSpeed },
    fingers: { f2, f3, f4, f5, f6 },
    studio: { title, subtitle, upload, uploadHint, preview, filters, effects, audio, export, download },
    theme: { dark, light },
    footer
  },
  ar: { /* same keys, all translated to Arabic */ }
}
```

---

## 9. src/lib/devices.ts

### Device Type
```typescript
type Device = {
  brand: string; model: string; year: number;
  refreshHz: number; touchHz: number; screenSize: number;
  tier: "low" | "mid" | "high" | "flagship" | "esports";
  os: "android" | "ios";
};
```

### 200+ Devices Database
All brands with latest models (2020-2025):
- Samsung: S25/S24/S23/S22 series, Z Fold6/Fold5/Flip6/Flip5, A55/A35/A25/A16, M55/M35, Note 20 Ultra
- Apple: iPhone 16/15/14/13/12/11 Pro/Plus/SE, iPad Pro M4/M2, iPad Air M2/M1, iPad 10/9, iPad mini 6
- Xiaomi: 15/14/13 series, Redmi Note 14/13/12, Redmi 14C/13C, POCO F7/F6/X7/X6/M7/M6/C75
- ASUS: ROG Phone 9/8/7/6
- Red Magic: 10 Pro+/Pro, 9S Pro+, 9 Pro, 8 Pro
- Black Shark: 6 Pro, 5 Pro, 5
- OnePlus: 13/13R/12/12R/11, Nord 4/3/CE4
- Realme: GT 7 Pro/GT 6/GT 5 Pro, 13 Pro+/13 Pro/12 Pro+, C75/C55
- Oppo: Find X8 Pro/X8/X7 Ultra/X7, Reno 13 Pro/12 Pro/11 Pro, A5 Pro/A3 Pro/A98
- Huawei: Mate 70 Pro+/70 Pro/70, Pura 70 Ultra/Pro/70, P60 Pro, Mate 60 Pro, Nova 13 Pro/12 Pro
- Honor: Magic 7 Pro/7/6 Pro/6/5 Pro, 200 Pro/200, X9b/X8b
- Google: Pixel 9 Pro XL/Pro/9/Pro Fold, 8 Pro/8/8a/7a
- Nothing: Phone (3)/(2a)+/(2a)/(2)/(1)
- Infinix: GT 30 Pro/GT 20 Pro, Note 50 Pro+/Pro/40 Pro+/Pro, Hot 50 Pro+/40i
- Tecno: Phantom X2 Pro/V Fold 2, Camon 40 Pro/30 Pro/30, Spark 30 Pro/20 Pro+
- Motorola: Edge 50 Ultra/Pro/Fusion, Edge 40 Pro/40, Moto G85/G84
- Lenovo: Legion Y700 (2024/2023)
- Sony: Xperia 1 VI/V, 5 VI/V
- Nokia: XR21, G60/G42, X30

### Detection System (detectDeviceAsync)
```typescript
type DetectionResult = {
  device: Device | null; confidence: number;
  method: "userAgentData" | "screenHeuristic" | "uaFallback" | "none";
  rawInfo: { brand?, model?, platform?, screenWidth, screenHeight, pixelRatio, cores, memoryGB, touchPoints };
};
```

3-layer detection:
1. navigator.userAgentData.getHighEntropyValues() → fuzzy match → 95% confidence
2. Classic UA string matching (iPhone/iPad/SM-codes/model names) → 85% confidence
3. Hardware heuristic (cores + RAM + screen) → 55% confidence

Also exports: BRANDS (sorted unique brand names), ALL_DEVICES (flat array)

---

## 10. src/lib/weapons.ts

### Weapon Type
```typescript
type Weapon = {
  id: string; name: string; category: "AR"|"SMG"|"DMR"|"Sniper"|"LMG"|"Shotgun"|"Pistol";
  verticalRecoil: number; horizontalRecoil: number;
  fireRate: number; stability: number;
};
```

### 30+ Weapons
AR: M416, AKM, M762, SCAR-L, AUG, Groza, QBZ, G36C, ACE32
SMG: UMP45, Vector, MP5K, PP-19 Bizon, Tommy Gun
DMR: Mini 14, MK14, SLR, SKS, DMR
Sniper: AWM, Kar98k, M24, Win94
LMG: M249, DP-28, MG3
Shotgun: S12K, S1897, S686, DBS

### Attachments
Grips: none, vertical (vert:-25%, horiz:-5%, stab:+15%), half, thumb, angled, light, laser
Muzzles: none, compensator (vert:-20%, horiz:-20%), flash hider, suppressor
Mags: none, extended (+2%), quickdraw (+5%), ext+quickdraw (+7%)
Stocks: none, tactical (vert:-12%, horiz:-10%, stab:+18%), heavy

---

## 11. src/lib/sensitivityEngine.ts

### Input Type
```typescript
type Input = {
  device: Device; os: "android"|"ios"; fps: number; refreshHz: number; touchHz: number;
  fingers: 2|3|4|5|6; gyro: "off"|"scope"|"always";
  style: "aggressive"|"rusher"|"balanced"|"support"|"sniper"|"tdm"|"competitive"|"entryfrag"|"lurker"|"igl"|"anchor";
  skill: "beginner"|"intermediate"|"advanced"|"professional"|"conqueror";
  range: "close"|"mid"|"long"|"mixed";
  weapon: Weapon; grip: string; muzzle: string; mag: string; stock: string;
  priority: "headshot"|"recoil"|"tracking"|"balanced"|"competitive";
  normalSpeed: number; gyroSpeed: number; // 1-15
};
```

### Output Type
```typescript
type SensitivityProfile = {
  freeLook: { tpp, fpp, parachuting };
  camera: { tpp, fpp, red, s2, s3, s4, s6, s8 };
  ads: { tpp, fpp, red, s2, s3, s4, s6, s8 };
  gyro: { tpp, fpp, red, s2, s3, s4, s6, s8 };
  adsGyro: { tpp, fpp, red, s2, s3, s4, s6, s8 };
  control: { movementSize, tppView, fppView, sprintSens };
  dna: string; confidence: number; recommendations?: string[];
};
```

### Base Values
BASE_CAMERA: tpp=120, fpp=115, red=55, s2=42, s3=28, s4=22, s6=15, s8=12
ADS_RATIO: tpp=0.92, fpp=0.92, red=0.88, s2=0.90, s3=0.92, s4=0.92, s6=0.95, s8=0.95
GYRO_BASE: tpp=280, fpp=260, red=220, s2=140, s3=90, s4=65, s6=45, s8=35
ADS_GYRO_RATIO: tpp=1.0, fpp=1.0, red=1.0, s2=1.35, s3=1.45, s4=1.55, s6=1.7, s8=1.85

### 9-Layer Calculation Pipeline
1. deviceScale(): screen size curve (12"+→0.78, 10"→0.82, 8"→0.86, 7"→0.91, 6.3"→0.97, 6"→1.0, 5.5"→1.03, <5.5"→1.06)
2. touchScale(): touchHz (720→1.05, 480→1.03, 360→1.02, 240→1.0, 180→0.98, <180→0.96)
3. touchCalibration(): same scale, used for gyro too
4. refreshScale(): refreshHz (165→1.05, 144→1.04, 120→1.03, 90→1.01, 60→0.98)
5. skillSmoothing(): beginner=1.08, intermediate=1.02, advanced=1.0, professional=0.98, conqueror=0.96
6. normalSpeedFactor(): non-linear, speed 1→0.65, 8→0.85, 15→1.35
7. calculateRecoilCompensation(): weapon recoil × (1 - attachment bonuses) × 0.18
8. calculateInputLatencyCompensation(): touchHz-based (720→1.04, 240→1.0, 120→0.97)
9. calculateVelocityScaling(): per style (entryfrag=1.12, rusher=1.10, aggressive=1.08, balanced=1.0, anchor=0.93)

### Per-Scope Calculation
For each scope:
- camera = base × baseMult × styleMultiplier × weaponAdjust × priorityAdjust × rangeAdjust × grip.camera × adsSmooth × combatMult × priorityBonus
- ads = camera × ADS_RATIO
- gyro = GYRO_BASE × dScale × tScale × rScale × skill × gFactor × grip.gyro × tcScale
- adsGyro = gyro × ADS_GYRO_RATIO

### HARD RULE: For s2/s3/s4/s6/s8 → if gyro >= adsGyro → gyro = adsGyro × 0.75

### Finger adjustment: 2=0.95, 3=1.0, 4=1.03, 5=1.06, 6=1.08

### Control optimization
- movementSize = clamp(100 - (screenSize - 5.5) × 4, 50, 100)
- tppView = clamp(90 - nsNorm × 10, 80, 90)  where nsNorm = (normalSpeed-1)/14
- fppView = clamp(103 - nsNorm × 23, 80, 103)
- sprintSens = clamp(80 + nsNorm × 20, 80, 100)

### DNA Generation
Deterministic 6-char hash from input keys → "ALY-DNA-" + chars

### Confidence (78-99)
Base 85 + tier bonus (esports=+10) + skill bonus (+4 conqueror) + gyro bonus (+3 always) + fingers (+4 for 6) + refresh (+4 for 165) + touchHz (+4 for 720) + style bonus (+2) + weapon stability (+2) + attachment quality (+3) + priority alignment (+2)

### AI Recommendations
Returns string[] based on weapon category, playstyle, device tier, gyro usage, priority.

---

## 12. src/lib/videoAI.ts

### Functions
- sampleFrames(video, count=20, onProgress?): { time, analysis: FrameAnalysis, diff }[]
- analyzeFrame(img: ImageData): { avgBrightness, avgSaturation, avgContrast, sharpness, dominantHue, motionScore }
- frameDiff(a, b): number (sum of abs pixel diffs, sampled every 16th pixel)
- rgbToHue(r, g, b): number
- analyzeAudio(video, onProgress?): { silentSegments: {start, end}[] }
- detectHighlights(frames, topN=5): { start, end, score }[]
- suggestAdjustments(frames): { brightness, contrast, saturation, sharpen }
- suggestFilter(avgHue, avgBrightness, avgSaturation): string
- generateColorGrade(dominantHue, avgBrightness): { shadows, mids, highlights } (hex colors)
- fullAIAnalysis(video, onProgress?): VideoAIReport

### VideoAIReport
```typescript
{
  duration, avgBrightness, avgSaturation, avgSharpness, dominantHue,
  highlights: { start, end, score }[],
  silentSegments: { start, end }[],
  suggestedFilter: string,
  suggestedAdjustments: { brightness, contrast, saturation, sharpen },
  colorGrade: { shadows, mids, highlights }
}
```

---

## 13. src/lib/pdfReport.ts

### generatePDF(profile, device, weapon, lang, extras)
Uses jsPDF to create a professional A4 report:
- Dark background (#0f0f0f)
- Gold header bar with title + DNA + confidence
- Sections with gold title bars
- Device & Setup (14 rows)
- Free Look (3 values)
- Camera/ADS/Gyroscope/ADS Gyroscope tables (8 scopes each)
- Control Optimization (4 values)
- AI Recommendations list
- Footer with socials

Exported only on button click (NOT auto).

---

## 14. src/components/ui.tsx

Reusable primitives:
- Card: glass-glass + card-glow rounded-2xl
- GoldButton: btn-gold inline-flex
- GhostButton: btn-ghost inline-flex
- Chip: chip rounded-xl, supports active prop (chip-active)
- Field: label + children + hint
- Input: styled input with gold focus
- Select: styled select
- Progress: gold gradient bar
- Stat: label + value + sub card
- Divider: gold gradient line
- GlowDot: colored glowing dot

---

## 15. src/components/Generator.tsx

### State
```typescript
draft: {
  device: Device|null, brand: string, modelSearch: string, os, fps, refreshHz, touchHz,
  fingers: 2|3|4|5|6, gyro, style, skill, range, weapon: Weapon|null,
  grip, muzzle, mag, stock, priority, normalSpeed (default 8), gyroSpeed (default 8),
  detecting: boolean, detectionInfo: {method, confidence, rawInfo} | null
}
```

### Hero Section
- Badge "AI Sensitivity Engine V2"
- Title "Pro Sensitivity, Engineered for You."
- 3 stat cards
- "Start Generator" button → auto-detects device immediately
- "Open Video Studio" button

### 11-Step Wizard
Steps: device → system → fingers → gyro → style → skill → range → weapon → attachments → priority → speed

Each step has: title, description, Back/Next buttons, progress bar

**Device Step:**
- Brand grid (clickable chips)
- Model list with search
- Detect My Device card with confidence display
- Selected Device card

**System Step:**
- OS (Android/iOS chips)
- FPS (20/30/40/45/60/90/120)
- Refresh Rate (60/90/120/144/165 Hz)
- Touch Sampling (120/240/360/480/720 Hz)

**Fingers Step:** 5 cards (2-6) with translated hints

**Gyro Step:** Off / Scope On / Always On cards

**Style Step:** 11 styles in grid (6 per row on xl), each with icon + translated label + description

**Skill Step:** 5 chips

**Range Step:** 4 chips

**Weapon Step:** Category tabs + weapon cards

**Attachments Step:** Grip + Muzzle + Magazine + Stock chips

**Priority Step:** 5 chips with labels + descriptions

**Speed Step:** Two sliders 1-15 with dynamic gold fill bar
- Normal Sensitivity Speed
- Gyroscope Sensitivity Speed
- Labels: 1 Ultra Stable / 8 Balanced / 15 Max Speed (translated)

### Generate Button
- Calls generateSensitivity() + getSensitivityRecommendation()
- Shows spinner during 900ms delay

### Result View
Header cards: DNA, Confidence, Performance Tier, Control Optimization
Tables: Free Look, Camera, ADS, Gyroscope, ADS Gyroscope (8 scopes each with bar visualization)
AI Recommendations section
Action buttons: Copy, JSON, PDF (button click only), Save, Reset

### Save Modal
Name input + save to localStorage

---

## 16. src/components/Studio.tsx

### Layout (CapCut-style 3-column)
- Top bar: project name + Close + Export
- Left sidebar (80px): 11 tool icons
- Center: Preview + Transport + Timeline
- Right (320px): Properties panel

### Home Screen (no file)
- Upload zone (drag/click)
- 6 templates: Kill Montage, Victory Royale, Sniper God, Squad Goals, Funny Moments, Sensitivity Flex

### Editor Screen
**Sidebar Tools:** Media, Filters, Adjust, Effects, Text, Music, Speed, Transitions, Cinematic, AI, Export

**Media Panel:** Aspect ratio (8), Quality (4), Format checkboxes, Transform (Mirror/Rotate/Zoom)

**Filters Panel:** 36 filters in 6 categories:
- Clarity: Original, Ultra HD, Crystal Clear, Sharp Vision, HDR Boost, Vivid Colors
- Cinematic: Cinema, Hollywood, Blockbuster, Indie Film, Film Noir, Vintage Film
- Color: Teal & Orange, Bleach Bypass, Cross Process, Classic Sepia, Warm/Cool Tones, Sunset Glow, Faded
- Atmosphere: Golden Hour, Blue Hour, Foggy, Neon Lights, Cyberpunk, Dreamy
- Professional: Studio, Broadcast, Documentary, Commercial, Portrait, Landscape
- SFX: Glitch, VHS Retro, Analog Film, 80s Retro, Bloom, Black & White, Inverted

**Filter Application:** Via pixel manipulation (NOT CSS filter) for cross-browser + export compatibility
Pipeline: Invert → Grayscale → Sepia → Hue Rotation → Brightness → Contrast → Saturation → Clamp

**Adjust Panel:** Brightness, Contrast, Saturation, Hue, Blur, Sharpness + Reset

**Effects Panel:** Vignette, Glitch, Grain, Scanlines, RGB Split, Film Burn

**Text Panel:** Caption input + Text Overlays (color/size) + Lower Third (title/subtitle/4 positions)

**Music Panel:** 6 tracks + Audio On/Mute

**Speed Panel:** 9 speeds (0.25x-4x)

**Transitions Panel:** 8 types (crossfade, zoom, slide, blur, glitch, wipe, burn, dipblack) + add at current time

**Cinematic Panel:** Cinematic Bars (toggle + ratio slider), Safe Zones (toggle), Fade In/Out sliders

**AI Panel:** Run Full AI Analysis → shows brightness/saturation/sharpness/hue/highlights/silence + suggested filter + Apply button + Cut Silence + Best Moment

**Export Panel:** 4 Pro Presets + Export Now button + completed exports list

### Transport
- Play/Pause button (gold circle)
- Mute button
- Scrubber slider (gold-range)
- Time display

### Timeline
- Trim In/Out buttons
- Visual track with trim region, transition markers, playhead
- Click to seek

### Auto-Save
All settings saved to localStorage on every change. Restored on mount.

### Export System
- Multi-format: select WebM + MP4 × 4 qualities
- Single → direct download with correct extension
- Multiple → ZIP with all files + project-settings.json
- 30fps stable export with frame rate limiting
- Safety timeout (duration + 3s)
- Audio only when not muted
- Error recovery per frame

---

## 17. src/index.css — Design System

### Animated Background
```css
.anim-bg { fixed inset-0 }
.orb { absolute, rounded-full, filter blur(100px), opacity 0.5 }
.orb-1 { 600px, gold radial gradient, 18s float }
.orb-2 { 500px, deep gold radial, 22s float }
.orb-3 { 350px, soft gold radial, 15s float }
.grid-bg { 60px gold grid lines, 30s drift animation }
```

### Glass Effects
```css
.header-glass { bg black/72%, blur 24px, border gold/10% }
.card-glass { bg white/3%, border gold/14%, blur 16px }
.card-glow { shadow gold/12% + black/30% }
.logo-glow { 36px gold gradient circle, pulse animation }
```

### Buttons
```css
.btn-gold { gold gradient, shadow, hover lift }
.btn-ghost { transparent, gold border, hover glow }
.nav-pill-active { gold gradient, shadow, lift }
.nav-pill-idle { transparent, hover highlight }
.ctrl-btn { small, border gold, hover glow }
```

### Chips
```css
.chip { border gold/22%, bg gold/4% }
.chip:hover { border gold/60% }
.chip-active { gold gradient bg, gold border, shadow }
```

### Range Slider
```css
.gold-range { height 6px, gold gradient bg }
.gold-range::-webkit-slider-thumb { 22px gold gradient circle, border, shadow, hover scale }
```

### Typography
```css
body { font-family: Tajawal, Cairo, Inter }
html[dir="rtl"] body { font-family: Cairo, Tajawal, Inter; line-height: 1.7; letter-spacing: 0 }
.text-gold-grad { gold gradient text }
```

### Animations
```css
@keyframes fadeUp { from opacity-0 translateY-12 to opacity-1 }
@keyframes shimmer { background-position sweep }
@keyframes orbFloat1/2/3 { translate + scale cycles }
@keyframes gridDrift { translate 60px }
@keyframes logoPulse { box-shadow pulse }
@keyframes auraborder { border-color gold cycle }
```

### Theme Light Overrides
```css
.theme-light body { bg #faf7ef, color #1a1612 }
.theme-light .orb-* { reduced opacity }
.theme-light .header-glass { bg white/78% }
.theme-light .card-glass { bg white/88% }
.theme-light input/select { bg white/85% }
```

---

## 18. Absolute Rules

1. Every sensitivity value CALCULATED, never random
2. Gyro Camera < ADS Gyro for 2x-8x scopes (hard enforced)
3. Filters via pixel manipulation (NOT CSS ctx.filter)
4. PDF only on button click (NOT auto-download)
5. Export preserves ALL effects (filters, effects, overlays, bars, transitions, fades, lower third)
6. All text translated EN + AR
7. RTL support for Arabic
8. Dark + Light themes (persisted)
9. Animated background (3 gold orbs + grid)
10. Premium glassmorphism design
11. No Dashboard, no Profile, no Admin
12. Two tabs only: Generator + Studio
13. FREE forever, no paid features
14. 200+ devices, 30+ weapons, 36 filters, 11 play styles
15. 11-step wizard for sensitivity generation
16. CapCut-style 3-column layout for video studio
17. Auto-save all settings to localStorage
18. Multi-format export (WebM + MP4) with ZIP support
19. AI video analysis (frame sampling + audio + highlights)
20. Responsive: mobile + tablet + desktop

---

## 19. Owner Info

- Instagram: @Saeedjor11
- TikTok: @saeedalyazouri0
- Email: saeedjor11@gmail.com
- PUBG UID: 5744469523

---

هذا الـ Prompt يحتوي **كل التفاصيل** لإنشاء الموقع مطابقاً 100% بدون أي نقص.
