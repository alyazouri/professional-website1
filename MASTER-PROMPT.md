# SENSITIVITY PUBG BY ALYAZOURI — Master Reproduction Prompt
# هذا الـ Prompt يحتوي كل التفاصيل لإعادة بناء الموقع 100%

## PROJECT OVERVIEW
Build a React + Vite + Tailwind CSS SPA called "SENSITIVITY PUBG BY ALYAZOURI".
It has TWO main sections: Sensitivity Generator + Video Studio.
NO admin panel. NO dashboard. NO user accounts. FREE forever.

## TECH STACK
- React 19 + TypeScript
- Vite 7 with single-file plugin
- Tailwind CSS 4
- lucide-react icons
- jsPDF (for PDF report)
- JSZip (for multi-export ZIP)
- All logic runs in the browser. No backend.

## FILE STRUCTURE
```
src/
  App.tsx                          # Root app with nav, animated bg, theme/lang
  main.tsx                         # React entry
  index.css                        # Global styles + animated bg + glass effects
  utils/cn.ts                      # clsx + tailwind-merge helper
  lib/
    i18n.ts                        # Full EN + AR translations
    devices.ts                     # 200+ devices database + detection
    weapons.ts                     # PUBG weapons + attachments
    sensitivityEngine.ts           # AI sensitivity calculation engine
    storage.ts                     # localStorage manager
    videoAI.ts                     # Browser-based video analysis
    pdfReport.ts                   # PDF report generator
  components/
    ui.tsx                         # Reusable UI primitives (Card, Chip, GoldButton, etc.)
    Generator.tsx                  # Sensitivity Generator (11-step wizard)
    Studio.tsx                     # Video Studio (CapCut-style editor)
```

## DESIGN SYSTEM

### Colors
- Deep Black: #050505 / #0a0a0a / #141414
- Metallic Gold: #d4af37 (primary)
- Soft Gold: #f5d77a (highlights)
- Deep Gold: #a8862b (shadows)
- Gold Gradient: linear-gradient(135deg, #f7e6a1, #d4af37, #a8862b)
- Text Light: #e9e3d0
- Text Dark: #1a1612

### Theme System
- Dark mode: black bg + gold accents
- Light mode: #faf7ef bg + gold accents
- Persisted in localStorage
- Smooth transition on switch

### Animated Background (3 layers)
```css
.orb-1: 600px gold radial, top-left, 18s float animation
.orb-2: 500px deep-gold radial, bottom-right, 22s float
.orb-3: 350px soft-gold radial, center, 15s float
.grid-bg: 60px grid lines, gold, infinite drift
All behind content (z-index: 0), pointer-events: none
```

### Glass Effects
```css
.card-glass: bg gradient white/3%, border gold/14%, backdrop-blur 16px
.card-glow: shadow gold/12% + black/30%
.header-glass: bg black/72%, blur 24px, border-bottom gold/10%
```

### Typography
- Arabic: Cairo + Tajawal fonts (Google Fonts)
- English: Inter font
- RTL support: dir="rtl", no letter-spacing for Arabic

## LANGUAGE SYSTEM (i18n.ts)

Two complete translation objects: `en` and `ar`.

### Key Structure
```typescript
{
  brand: string,
  tagline: string,
  nav: { generator, studio },
  hero: { badge, title, subtitle, cta, cta2, stats1-3 },
  wizard: {
    step, of, back, next, continue, generate, generating,
    title: { device, detect, system, fingers, gyro, style, skill, combat, range, weapon, attachments, priority, speed },
    desc: { same keys }
  },
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
  footer: string
}
```

## DEVICE DATABASE (devices.ts)

### Brands (200+ devices total)
Samsung (S25/S24/S23/S22, Z Fold6/Fold5/Flip6/Flip5, A55/A35/A25/A16, M55/M35),
Apple (iPhone 16/15/14/13/12/11/SE, iPad Pro M4/M2, iPad Air M2/M1, iPad 10/9, iPad mini 6),
Xiaomi (15/14/13 series, Redmi Note 14/13, POCO F7/F6/X7/X6/M7/M6),
ASUS (ROG Phone 9/8/7/6),
Red Magic (10/9S/9/8),
Black Shark (6/5),
OnePlus (13/12/11, Nord 4/3/CE4),
Realme (GT 7/6/5, 13/12 series),
Oppo (Find X8/X7, Reno 13/12),
Huawei (Mate 70/60, Pura 70, Nova 13/12),
Honor (Magic 7/6/5, 200, X9b/X8b),
Google (Pixel 9 Pro XL/Pro/9/Pro Fold, 8 Pro/8/8a/7a),
Nothing (3, 2a+, 2a, 2, 1),
Infinix (GT 30/20, Note 50/40, Hot 50/40),
Tecno (Phantom X2/V Fold2, Camon 40/30, Spark 30/20),
Motorola (Edge 50/40, Moto G85/G84),
Lenovo (Legion Y700),
Sony (Xperia 1 VI/V, 5 VI/V),
Nokia (XR21, G60/G42, X30)

### Device Type
```typescript
type Device = {
  brand: string; model: string; year: number;
  refreshHz: number; touchHz: number; screenSize: number;
  tier: "low" | "mid" | "high" | "flagship" | "esports";
  os: "android" | "ios";
};
```

### Detection System (detectDeviceAsync)
3-layer detection:
1. `navigator.userAgentData.getHighEntropyValues()` → 95% confidence
2. Classic UA string matching → 85% confidence
3. Hardware heuristic (cores + RAM + screen) → 55% confidence
Returns { device, confidence, method, rawInfo }

## WEAPON DATABASE (weapons.ts)

### 30+ weapons across categories
AR: M416, AKM, M762, SCAR-L, AUG, Groza, QBZ, G36C, ACE32
SMG: UMP45, Vector, MP5K, PP-19 Bizon, Tommy Gun
DMR: Mini 14, MK14, SLR, SKS, DMR
Sniper: AWM, Kar98k, M24, Win94
LMG: M249, DP-28, MG3
Shotgun: S12K, S1897, S686, DBS

### Weapon Properties
```typescript
type Weapon = {
  id: string; name: string; category: string;
  verticalRecoil: number; horizontalRecoil: number;
  fireRate: number; stability: number;
};
```

### Attachments
- Grips: Vertical (+15%), Half (+12%), Thumb (+10%), Angled (+10%), Light (+8%), Laser (+7%), None
- Muzzles: Compensator (+20%), Flash Hider (+12%), Suppressor (+8%), None
- Magazines: Extended (+2%), Quickdraw (+5%), Ext+Quickdraw (+7%), Default
- Stocks: Tactical (+10%), Heavy (+8%), None

## SENSITIVITY ENGINE (sensitivityEngine.ts)

### Input Type
```typescript
type Input = {
  device: Device; os: "android" | "ios"; fps: number;
  refreshHz: number; touchHz: number;
  fingers: 2|3|4|5|6; gyro: "off" | "scope" | "always";
  style: "aggressive"|"rusher"|"balanced"|"support"|"sniper"|"tdm"|"competitive"|"entryfrag"|"lurker"|"igl"|"anchor";
  skill: "beginner"|"intermediate"|"advanced"|"professional"|"conqueror";
  range: "close"|"mid"|"long"|"mixed";
  weapon: Weapon;
  grip: string; muzzle: string; mag: string; stock: string;
  priority: "headshot"|"recoil"|"tracking"|"balanced"|"competitive";
  normalSpeed: number;  // 1-15
  gyroSpeed: number;    // 1-15
};
```

### Calculation Pipeline (9 layers)
1. **Device Scale**: screen size curve (0.78 for 12"+ tablets → 1.06 for small phones)
2. **Touch Scale**: touch sampling rate (720Hz=1.05, 240Hz=1.0, 120Hz=0.96)
3. **Touch Calibration**: additional touch precision bonus
4. **Refresh Scale**: refresh rate (165Hz=1.05, 120Hz=1.03, 60Hz=0.98)
5. **Skill Smoothing**: beginner=1.08, conqueror=0.96
6. **Normal Speed Factor**: non-linear curve, speed 1→0.65, 8→0.85, 15→1.35
7. **Recoil Compensation**: weapon recoil × attachment bonuses
8. **Latency Compensation**: touchHz-based
9. **Velocity Scaling**: play style velocity (entryfrag=+12%, anchor=-7%)

### Per-Scope Calculation
For each of 8 scopes (TPP, FPP, Red Dot, 2x, 3x, 4x, 6x, 8x):
- Camera = base × all_multipliers
- ADS = Camera × ADS_RATIO (0.88-0.95)
- Gyro Camera = gyro_base × gyro_factors
- ADS Gyro = Gyro × ADS_GYRO_RATIO (1.0-1.85)

### HARD RULE: For 2x/3x/4x/6x/8x → Gyro Camera MUST be < ADS Gyro

### Sensitivity DNA
Deterministic 6-char hash from input → `ALY-DNA-X72K91`

### Speed Ranges (1-15)
- Normal: 1→×0.65, 8→×0.85, 15→×1.35
- Gyro: 1→×0.60, 8→×0.85, 15→×1.50
- Default: both at 8 (balanced)

### AI Recommendations
Returns array of strings based on weapon, playstyle, device, gyro, priority.

### PDF Report (pdfReport.ts)
Using jsPDF:
- Gold header bar with title + DNA + confidence
- Sections: Device & Setup, Free Look, Camera, ADS, Gyro, ADS Gyro, Control, AI Recommendations
- Footer with socials
- Dark background (#0f0f0f) + gold text + white data
- Generated ONLY when user clicks "PDF" button (NOT auto)

## GENERATOR COMPONENT (Generator.tsx)

### 11-Step Wizard
Step order: device → system → fingers → gyro → style → skill → range → weapon → attachments → priority → speed

### Step Details

**Step 1 - Device**: Brand grid + model list with search + Detect My Device button
- Detect runs automatically when clicking "Start Generator" from hero
- Uses detectDeviceAsync() with 3-layer detection
- Shows confidence % and detection method

**Step 2 - System**: OS (Android/iOS) + FPS (20-120) + Refresh Rate (60-165Hz) + Touch Sampling (120-720Hz)

**Step 3 - Fingers**: 2/3/4/5/6 with visual cards and translated hints

**Step 4 - Gyro**: Off / Scope On / Always On

**Step 5 - Style**: 11 play styles with icons and descriptions (all translated)

**Step 6 - Skill**: 5 levels (all translated)

**Step 7 - Range**: Close/Mid/Long/Mixed (all translated)

**Step 8 - Weapon**: Category tabs + weapon cards

**Step 9 - Attachments**: Grip + Muzzle + Magazine + Stock

**Step 10 - Priority**: Headshot/Recoil/Tracking/Balanced/Competitive (all translated)

**Step 11 - Speed**: Two sliders (1-15) with dynamic gold bar fill
- Normal Sensitivity Speed
- Gyroscope Sensitivity Speed

### Result View
- DNA ID + Confidence + Performance Tier + Control Optimization
- Free Look table
- Camera/ADS/Gyroscope/ADS Gyroscope tables (8 scopes each)
- AI Recommendations section
- Action buttons: Copy, JSON Download, PDF Download, Save, Reset
- PDF button uses jsPDF to generate professional report

### Hero Section
- Animated badge "AI Sensitivity Engine V2"
- Title with gold gradient
- Stats cards
- Start Generator button (auto-detects device)
- Open Video Studio button

## VIDEO STUDIO (Studio.tsx)

### Layout (CapCut-style 3-column)
- Top bar: Project name + Close + Export button
- Left sidebar (80px): 11 tool icons
- Center: Preview canvas + Transport + Timeline
- Right (320px): Properties panel (changes based on selected tool)

### 11 Sidebar Tools
1. **Media**: Aspect ratio, Quality, Formats, Transform
2. **Filters**: 36 filters in 6 categories (see below)
3. **Adjust**: Brightness, Contrast, Saturation, Hue, Blur, Sharpness + Reset
4. **Effects**: Vignette, Glitch, Grain, Scanlines, RGB Split, Film Burn
5. **Text**: Caption + Text Overlays + Lower Third
6. **Music**: 6 tracks library + Audio On/Mute
7. **Speed**: 0.25x to 4x playback
8. **Transitions**: 8 types + add at current time
9. **Cinematic**: Cinematic Bars + Safe Zones + Fade In/Out
10. **AI Studio**: Run Full Analysis + Apply Suggestions
11. **Export**: Pro Presets + Export Now + Format selection

### 36 Filters (6 categories)
- **Clarity**: Original, Ultra HD, Crystal Clear, Sharp Vision, HDR Boost, Vivid Colors
- **Cinematic**: Cinema, Hollywood, Blockbuster, Indie Film, Film Noir, Vintage Film
- **Color Grading**: Teal & Orange, Bleach Bypass, Cross Process, Classic Sepia, Warm Tones, Cool Tones, Sunset Glow, Faded
- **Atmosphere**: Golden Hour, Blue Hour, Foggy, Neon Lights, Cyberpunk, Dreamy
- **Professional**: Studio, Broadcast, Documentary, Commercial, Portrait, Landscape
- **SFX**: Glitch, VHS Retro, Analog Film, 80s Retro, Bloom, Black & White, Inverted

### Filter Application Method
**IMPORTANT**: Filters are applied via pixel manipulation (getImageData + putImageData), NOT via CSS ctx.filter.
This ensures filters work in both preview AND export across all browsers.
Pipeline: Invert → Grayscale → Sepia → Hue Rotation → Brightness → Contrast → Saturation → Clamp

### 8 Aspect Ratios
Original, TikTok 9:16, Reels 9:16, Insta 1:1, Insta 4:5, YouTube 16:9

### 4 Qualities
720p, 1080p, 1440p, 4K

### Export System
- Multi-format export: select any combination of WebM + MP4 × 4 qualities
- Single format → direct download
- Multiple formats → ZIP with all files + project-settings.json
- Frame-locked 30fps export with stable timing
- Safety timeout prevents hung exports
- Audio included only when not muted and tracks exist
- Actual extension determined from MIME type (not requested format)

### Auto-Save
Every setting saved to localStorage automatically. Restored on page load.

### 6 Templates
Kill Montage, Victory Royale, Sniper God, Squad Goals, Funny Moments, Sensitivity Flex

### AI Video Analysis (videoAI.ts)
- Samples 20 frames at regular intervals
- Computes: brightness, saturation, contrast, sharpness, dominant hue, motion score
- Audio analysis: RMS-based silence detection
- Highlight detection: top 5 motion peaks
- Suggests: filter, adjustments (B/C/S/Sharp), color grade (3-color palette)

## NAVIGATION
Only 2 tabs: Generator + Studio
No dashboard, no profile, no admin.

## FOOTER
Simple text: "© 2026 SENSITIVITY PUBG BY ALYAZOURI — Crafted by Alyazouri"

## KEY RULES
1. Every sensitivity value is CALCULATED, never random
2. Gyro Camera < ADS Gyro for 2x-8x scopes (hard rule)
3. Filters applied via pixel manipulation (not CSS filter)
4. PDF only on button click (not auto)
5. Export preserves ALL applied effects
6. All text translated in EN + AR
7. RTL support for Arabic
8. Dark + Light themes
9. Animated background with 3 floating gold orbs
10. Premium glassmorphism design throughout
