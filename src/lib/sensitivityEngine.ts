import type { Device } from "./devices";
import type { Weapon } from "./weapons";

export type Input = {
  device: Device;
  os: "android" | "ios";
  fps: number;
  refreshHz: number;
  touchHz: number;
  fingers: 2 | 3 | 4 | 5 | 6;
  gyro: "off" | "scope" | "always";
  style: "aggressive" | "rusher" | "balanced" | "support" | "sniper" | "tdm" | "competitive" | "entryfrag" | "lurker" | "igl" | "anchor";
  skill: "beginner" | "intermediate" | "advanced" | "professional" | "conqueror";
  range: "close" | "mid" | "long" | "mixed";
  weapon: Weapon;
  grip: string;
  muzzle: string;
  mag: string;
  stock: string;
  priority: "headshot" | "recoil" | "tracking" | "balanced" | "competitive";
  normalSpeed: number; // 1..100
  gyroSpeed: number; // 1..100
};

export type SensitivityProfile = {
  freeLook: { tpp: number; fpp: number; parachuting: number };
  camera: {
    tpp: number;
    fpp: number;
    red: number;
    s2: number;
    s3: number;
    s4: number;
    s6: number;
    s8: number;
  };
  ads: {
    tpp: number;
    fpp: number;
    red: number;
    s2: number;
    s3: number;
    s4: number;
    s6: number;
    s8: number;
  };
  gyro: {
    tpp: number;
    fpp: number;
    red: number;
    s2: number;
    s3: number;
    s4: number;
    s6: number;
    s8: number;
  };
  adsGyro: {
    tpp: number;
    fpp: number;
    red: number;
    s2: number;
    s3: number;
    s4: number;
    s6: number;
    s8: number;
  };
  control: {
    movementSize: number;
    tppView: number;
    fppView: number;
    sprintSens: number;
  };
  dna: string;
  confidence: number;
  recommendations?: string[];
};

const SCOPE_KEYS = ["tpp", "fpp", "red", "s2", "s3", "s4", "s6", "s8"] as const;
type ScopeKey = (typeof SCOPE_KEYS)[number];

// Base camera sensitivity per scope (PUBG-ish tuning reference)
const BASE_CAMERA: Record<ScopeKey, number> = {
  tpp: 120,
  fpp: 115,
  red: 55,
  s2: 42,
  s3: 28,
  s4: 22,
  s6: 15,
  s8: 12,
};

// ADS is typically 80-95% of camera (pro tuning)
const ADS_RATIO: Record<ScopeKey, number> = {
  tpp: 0.92,
  fpp: 0.92,
  red: 0.88,
  s2: 0.9,
  s3: 0.92,
  s4: 0.92,
  s6: 0.95,
  s8: 0.95,
};

// Gyro camera base (must be LOWER than ADS gyro per scope for 2x+ per spec)
const GYRO_BASE: Record<ScopeKey, number> = {
  tpp: 280,
  fpp: 260,
  red: 220,
  s2: 140,
  s3: 90,
  s4: 65,
  s6: 45,
  s8: 35,
};

// ADS gyro must be HIGHER than gyro camera for 2x+ scopes
const ADS_GYRO_RATIO: Record<ScopeKey, number> = {
  tpp: 1.0,
  fpp: 1.0,
  red: 1.0,
  s2: 1.35,
  s3: 1.45,
  s4: 1.55,
  s6: 1.7,
  s8: 1.85,
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function round5(v: number) {
  return Math.round(v / 5) * 5 || 5;
}

function styleMultiplier(style: Input["style"], scope: ScopeKey): number {
  // Scope-specific style shaping — more aggressive scaling for stronger styles
  const map: Record<Input["style"], Record<ScopeKey, number>> = {
    aggressive: { tpp: 1.12, fpp: 1.12, red: 1.08, s2: 0.98, s3: 0.95, s4: 0.92, s6: 0.9, s8: 0.88 },
    rusher: { tpp: 1.18, fpp: 1.18, red: 1.12, s2: 1.02, s3: 0.97, s4: 0.92, s6: 0.88, s8: 0.85 },
    balanced: { tpp: 1.0, fpp: 1.0, red: 1.0, s2: 1.0, s3: 1.0, s4: 1.0, s6: 1.0, s8: 1.0 },
    support: { tpp: 0.95, fpp: 0.95, red: 1.0, s2: 1.05, s3: 1.08, s4: 1.1, s6: 1.12, s8: 1.1 },
    sniper: { tpp: 0.88, fpp: 0.88, red: 0.93, s2: 0.98, s3: 1.05, s4: 1.12, s6: 1.18, s8: 1.25 },
    tdm: { tpp: 1.1, fpp: 1.12, red: 1.08, s2: 1.02, s3: 0.95, s4: 0.9, s6: 0.85, s8: 0.8 },
    competitive: { tpp: 1.03, fpp: 1.03, red: 1.04, s2: 1.03, s3: 1.03, s4: 1.03, s6: 1.03, s8: 1.03 },
    // New strong styles
    entryfrag: { tpp: 1.25, fpp: 1.25, red: 1.18, s2: 1.05, s3: 0.98, s4: 0.92, s6: 0.85, s8: 0.8 },
    lurker: { tpp: 1.02, fpp: 1.0, red: 1.05, s2: 1.08, s3: 1.12, s4: 1.15, s6: 1.18, s8: 1.22 },
    igl: { tpp: 1.05, fpp: 1.05, red: 1.05, s2: 1.05, s3: 1.05, s4: 1.05, s6: 1.05, s8: 1.05 },
    anchor: { tpp: 0.92, fpp: 0.9, red: 0.95, s2: 0.98, s3: 1.02, s4: 1.08, s6: 1.15, s8: 1.22 },
  };
  return map[style][scope];
}

function skillSmoothing(skill: Input["skill"]): number {
  // Smoothing factor — beginners get slightly higher base for easier flicking
  const map = { beginner: 1.08, intermediate: 1.02, advanced: 1.0, professional: 0.98, conqueror: 0.96 };
  return map[skill];
}

function deviceScale(device: Device): number {
  // Bigger screen → slightly lower sens (covers more distance per swipe)
  // Fine-tuned curve: each 0.1 inch ~1.5% reduction
  const s = device.screenSize;
  // Phones: 5.0-7.0, Tablets: 7.0-13.5
  if (s >= 12) return 0.78; // large tablets
  if (s >= 10) return 0.82; // iPad/Android tablets
  if (s >= 8) return 0.86; // iPad mini / small tablets
  if (s >= 7.5) return 0.89; // foldables unfolded
  if (s >= 7) return 0.91;
  if (s >= 6.8) return 0.93;
  if (s >= 6.6) return 0.95;
  if (s >= 6.3) return 0.97;
  if (s >= 6.0) return 1.0;
  if (s >= 5.5) return 1.03;
  return 1.06; // smaller phones (SE, etc)
}

function touchCalibration(touchHz: number): number {
  // Higher touch sampling → more precise input → can use slightly higher sens
  // 720Hz+ is esports-grade, 240Hz is high-end, 120Hz is baseline
  if (touchHz >= 720) return 1.05;
  if (touchHz >= 480) return 1.03;
  if (touchHz >= 360) return 1.02;
  if (touchHz >= 240) return 1.0;
  if (touchHz >= 180) return 0.98;
  return 0.96;
}

function touchScale(touchHz: number): number {
  // Higher touch sampling → slightly lower sens for precision
  if (touchHz >= 720) return 0.9;
  if (touchHz >= 480) return 0.93;
  if (touchHz >= 360) return 0.96;
  if (touchHz >= 240) return 1.0;
  if (touchHz >= 180) return 1.04;
  return 1.08;
}

function refreshScale(refreshHz: number): number {
  if (refreshHz >= 144) return 0.96;
  if (refreshHz >= 120) return 0.98;
  if (refreshHz >= 90) return 1.02;
  return 1.05;
}

function weaponAdjust(w: Weapon, scope: ScopeKey): number {
  // Weapon-specific recoil scaling: close scopes heavily influenced, long scopes minimal
  const recoilWeight: Record<ScopeKey, number> = {
    tpp: 0.95,
    fpp: 0.95,
    red: 0.85,
    s2: 0.6,
    s3: 0.4,
    s4: 0.3,
    s6: 0.18,
    s8: 0.08,
  };
  // Weapon-specific fire rate influence (fast-firing weapons need more control)
  const fireRatePenalty = w.fireRate > 0.85 ? 0.08 : w.fireRate > 0.75 ? 0.04 : 0;
  // Base recoil: vertical 65% + horizontal 35%
  const recoilFactor = w.verticalRecoil * 0.65 + w.horizontalRecoil * 0.35 + fireRatePenalty;
  // Stability bonus: stable weapons get +5% sens
  const stabilityBonus = (w.stability - 0.5) * 0.1;
  // Category-specific tweaks
  const categoryBonus: Record<string, number> = {
    AR: 0, SMG: 0.05, DMR: -0.05, Sniper: -0.08, LMG: -0.06, Shotgun: 0.08, Pistol: 0.04,
  };
  const catBonus = categoryBonus[w.category] ?? 0;
  // High recoil → lower sensitivity for control (up to -28% now, up from -25%)
  const adj = 1 - recoilFactor * 0.28 + stabilityBonus + catBonus;
  const weight = recoilWeight[scope];
  return 1 + (adj - 1) * weight;
}

function gripAdjust(gripId: string): { camera: number; gyro: number } {
  // Better grip → slightly higher ADS gyro allowed (better control)
  const map: Record<string, number> = {
    none: 1.0,
    vertical: 1.05,
    half: 1.08,
    thumb: 1.1,
    angled: 1.06,
    light: 1.04,
    laser: 1.07,
  };
  const v = map[gripId] ?? 1;
  return { camera: 1 + (v - 1) * 0.3, gyro: v };
}

function priorityAdjust(priority: Input["priority"], scope: ScopeKey): number {
  // Priority-based multipliers
  const map: Record<Input["priority"], Record<ScopeKey, number>> = {
    headshot: { tpp: 1.05, fpp: 1.05, red: 1.02, s2: 0.98, s3: 0.96, s4: 0.94, s6: 0.92, s8: 0.88 },
    recoil: { tpp: 0.92, fpp: 0.92, red: 0.94, s2: 0.96, s3: 0.98, s4: 1.0, s6: 1.02, s8: 1.05 },
    tracking: { tpp: 1.1, fpp: 1.1, red: 1.08, s2: 1.05, s3: 1.02, s4: 1.0, s6: 0.98, s8: 0.96 },
    balanced: { tpp: 1, fpp: 1, red: 1, s2: 1, s3: 1, s4: 1, s6: 1, s8: 1 },
    competitive: { tpp: 1.03, fpp: 1.03, red: 1.03, s2: 1.03, s3: 1.03, s4: 1.03, s6: 1.03, s8: 1.03 },
  };
  return map[priority][scope];
}

function rangeAdjust(range: Input["range"], scope: ScopeKey): number {
  const map: Record<Input["range"], Record<ScopeKey, number>> = {
    close: { tpp: 1.08, fpp: 1.08, red: 1.05, s2: 0.98, s3: 0.95, s4: 0.92, s6: 0.9, s8: 0.88 },
    mid: { tpp: 1.0, fpp: 1.0, red: 1.02, s2: 1.04, s3: 1.05, s4: 1.02, s6: 0.98, s8: 0.96 },
    long: { tpp: 0.92, fpp: 0.92, red: 0.98, s2: 1.02, s3: 1.06, s4: 1.08, s6: 1.12, s8: 1.15 },
    mixed: { tpp: 1, fpp: 1, red: 1.02, s2: 1.02, s3: 1.02, s4: 1.0, s6: 0.98, s8: 0.96 },
  };
  return map[range][scope];
}

function normalSpeedFactor(speed: number): number {
  // Enhanced non-linear curve with stronger impact
  // speed 1 → 0.65 (ultra stable), 8 → 0.85 (balanced), 15 → 1.35 (max speed)
  const normalized = (speed - 1) / 14;
  return 0.65 + Math.pow(normalized, 0.85) * 0.7;
}

function gyroSpeedFactor(speed: number): number {
  // Enhanced non-linear curve for gyro with stronger impact
  // speed 1 → 0.60 (ultra stable), 8 → 0.85 (balanced), 15 → 1.50 (max speed)
  const normalized = (speed - 1) / 14;
  return 0.60 + Math.pow(normalized, 0.8) * 0.9;
}

function calculateADSSmoothing(input: Input, scope: ScopeKey): number {
  // ADS smoothing based on skill level + scope magnification
  const skillMultiplier = input.skill === "conqueror" ? 1.08 : 
                          input.skill === "professional" ? 1.05 :
                          input.skill === "advanced" ? 1.02 : 1.0;
  
  const scopeMagnification = scope === "tpp" || scope === "fpp" ? 1 :
                             scope === "red" ? 1.5 :
                             scope === "s2" ? 2 :
                             scope === "s3" ? 3 :
                             scope === "s4" ? 4 :
                             scope === "s6" ? 6 : 8;
  
  // Higher magnification = more smoothing needed = slightly lower sensitivity
  const scopePenalty = 1 - (scopeMagnification - 1) * 0.015;
  
  return skillMultiplier * scopePenalty;
}

function calculateRecoilCompensation(input: Input): number {
  // Advanced recoil compensation based on weapon + attachments
  const weapon = input.weapon;
  const recoilFactor = weapon.verticalRecoil * 0.6 + weapon.horizontalRecoil * 0.4;
  
  // Attachment bonuses
  let attachmentBonus = 0;
  if (input.grip === "vertical") attachmentBonus += 0.15;
  else if (input.grip === "half") attachmentBonus += 0.12;
  else if (input.grip === "angled") attachmentBonus += 0.1;
  
  if (input.muzzle === "comp") attachmentBonus += 0.2;
  else if (input.muzzle === "flash") attachmentBonus += 0.12;
  
  if (input.stock === "tac") attachmentBonus += 0.1;
  
  // Final recoil compensation (lower sensitivity = better control)
  const compensation = recoilFactor * (1 - attachmentBonus) * 0.18;
  return 1 - compensation;
}

function calculateCombatMultiplier(input: Input, scope: ScopeKey): number {
  // Combat distance multiplier
  const rangeMultipliers: Record<Input["range"], number> = {
    close: 1.15,   // Faster for close combat
    mid: 1.05,     // Slightly faster
    long: 0.92,    // Slower for precision
    mixed: 1.0     // Balanced
  };
  
  // Apply only to relevant scopes
  if (input.range === "close" && (scope === "tpp" || scope === "fpp" || scope === "red")) {
    return rangeMultipliers.close;
  } else if (input.range === "long" && scope !== "tpp" && scope !== "fpp" && scope !== "red") {
    return rangeMultipliers.long;
  } else if (input.range === "mid") {
    return rangeMultipliers.mid;
  }
  
  return 1.0;
}

function calculatePriorityBonus(input: Input, scope: ScopeKey): number {
  // Priority-based multipliers
  if (input.priority === "headshot") {
    // Crosshair precision bonus for headshots
    if (scope === "tpp" || scope === "fpp" || scope === "red") {
      return 1.08; // Faster for flick shots
    }
  } else if (input.priority === "tracking") {
    // Smooth tracking bonus
    if (scope === "tpp" || scope === "fpp" || scope === "red" || scope === "s2") {
      return 1.12; // Smoother for tracking
    }
  } else if (input.priority === "recoil") {
    // Recoil control bonus (lower sensitivity = better control)
    return 0.92;
  } else if (input.priority === "competitive") {
    // Balanced competitive tuning
    return 1.03;
  }
  
  return 1.0;
}

function calculateInputLatencyCompensation(touchHz: number): number {
  // Input latency compensation based on touch sampling rate
  const touchResponseTime = 1000 / touchHz; // ms
  
  if (touchResponseTime < 2) { // 500Hz+
    return 1.04; // Can handle faster sensitivity
  } else if (touchResponseTime < 4) { // 250Hz+
    return 1.02;
  } else if (touchResponseTime < 6) { // 166Hz+
    return 1.0;
  } else {
    return 0.97; // Slower response needs slightly lower sensitivity
  }
}

function calculateFrameTimeScaling(refreshHz: number): number {
  // Frame-time scaling for motion smoothness
  const frameTime = 1000 / refreshHz; // ms
  
  if (frameTime < 7) { // 144Hz+
    return 1.05; // Smoother motion = can use higher sensitivity
  } else if (frameTime < 9) { // 120Hz
    return 1.03;
  } else if (frameTime < 12) { // 90Hz
    return 1.01;
  } else {
    return 0.98; // 60Hz needs slightly lower sensitivity
  }
}

function calculateVelocityScaling(input: Input): number {
  // Velocity-based scaling based on play style
  const styleMultipliers: Record<Input["style"], number> = {
    entryfrag: 1.12,  // Fast movement, aggressive
    rusher: 1.10,     // Fast rotations
    aggressive: 1.08, // Aggressive playstyle
    tdm: 1.06,        // TDM fast-paced
    balanced: 1.0,    // Balanced
    competitive: 1.03,// Slightly faster
    igl: 1.02,        // Strategic but mobile
    support: 0.98,    // Support/utility, balanced
    lurker: 0.97,     // Slower, methodical
    sniper: 0.95,     // Static positions
    anchor: 0.93      // Very static, defensive
  };
  
  return styleMultipliers[input.style];
}

export function generateSensitivity(input: Input): SensitivityProfile {
  const dScale = deviceScale(input.device);
  const tScale = touchScale(input.device.touchHz || input.touchHz);
  const tcScale = touchCalibration(input.device.touchHz || input.touchHz);
  const rScale = refreshScale(input.device.refreshHz || input.refreshHz);
  const skill = skillSmoothing(input.skill);
  const nFactor = normalSpeedFactor(input.normalSpeed);
  const gFactor = gyroSpeedFactor(input.gyroSpeed);
  const grip = gripAdjust(input.grip);
  const weapon = input.weapon;
  
  // Advanced multipliers
  const recoilComp = calculateRecoilCompensation(input);
  const latencyComp = calculateInputLatencyCompensation(input.device.touchHz || input.touchHz);
  const frameScaling = calculateFrameTimeScaling(input.device.refreshHz || input.refreshHz);
  const velocityScale = calculateVelocityScaling(input);

  const baseMult = dScale * tScale * tcScale * rScale * skill * nFactor * latencyComp * frameScaling * velocityScale * recoilComp;

  function calc(scope: ScopeKey): { camera: number; ads: number; gyro: number; adsGyro: number } {
    const base = BASE_CAMERA[scope];
    
    // Recalculate per-scope multipliers
    const scopeADSSmooth = calculateADSSmoothing(input, scope);
    const scopeCombatMult = calculateCombatMultiplier(input, scope);
    const scopePriorityBonus = calculatePriorityBonus(input, scope);
    
    const mult =
      baseMult *
      styleMultiplier(input.style, scope) *
      weaponAdjust(weapon, scope) *
      priorityAdjust(input.priority, scope) *
      rangeAdjust(input.range, scope) *
      grip.camera *
      scopeADSSmooth *
      scopeCombatMult *
      scopePriorityBonus;

    let cam = base * mult;
    let ads = cam * ADS_RATIO[scope];
    let gyro = GYRO_BASE[scope] * dScale * tScale * rScale * skill * gFactor * grip.gyro * tcScale;
    let adsG = gyro * ADS_GYRO_RATIO[scope];

    // Priority gyro adjustments
    if (input.priority === "recoil") {
      if (scope !== "tpp" && scope !== "fpp" && scope !== "red") {
        adsG *= 1.15; // enforce higher ADS gyro for recoil control per spec
      }
    }
    if (input.priority === "tracking") {
      cam *= 1.04;
      ads *= 1.04;
    }
    if (input.priority === "headshot") {
      if (scope === "tpp" || scope === "fpp" || scope === "red") {
        cam *= 1.03;
        ads *= 1.03;
      }
    }

    // HARD RULE: for 2x,3x,4x,6x,8x — gyro camera MUST be LOWER than ADS gyro
    if (scope === "s2" || scope === "s3" || scope === "s4" || scope === "s6" || scope === "s8") {
      if (gyro >= adsG) {
        // reduce gyro camera to be 75% of adsGyro
        gyro = Math.round(adsG * 0.75);
      }
    }

    // Finger count adjustment — more fingers = can handle faster sens
    const fingerMult = { 2: 0.95, 3: 1.0, 4: 1.03, 5: 1.06, 6: 1.08 }[input.fingers];
    cam *= fingerMult;
    ads *= fingerMult;

    return {
      camera: clamp(round5(cam), 1, 400),
      ads: clamp(round5(ads), 1, 400),
      gyro: clamp(round5(gyro), 1, 400),
      adsGyro: clamp(round5(adsG), 1, 400),
    };
  }

  const cam = {} as SensitivityProfile["camera"];
  const ads = {} as SensitivityProfile["ads"];
  const gyro = {} as SensitivityProfile["gyro"];
  const adsGyro = {} as SensitivityProfile["adsGyro"];

  for (const k of SCOPE_KEYS) {
    const r = calc(k);
    cam[k] = r.camera;
    ads[k] = r.ads;
    gyro[k] = r.gyro;
    adsGyro[k] = r.adsGyro;
  }

  // Free Look
  const freeMult = baseMult * nFactor;
  const freeLook = {
    tpp: clamp(round5(130 * freeMult), 20, 300),
    fpp: clamp(round5(125 * freeMult), 20, 300),
    parachuting: clamp(round5(110 * freeMult), 20, 250),
  };

  // Control optimization
  const screenInch = input.device.screenSize;
  // Bigger screen → smaller movement button (more HUD space)
  const movementSize = clamp(Math.round(100 - (screenInch - 5.5) * 4), 50, 100);
  // Map normalSpeed 1-100 to control ranges (inverted for stability)
  const nsNorm = (input.normalSpeed - 1) / 99; // 0..1
  const tppView = clamp(Math.round(90 - nsNorm * 10), 80, 90);
  const fppView = clamp(Math.round(103 - nsNorm * 23), 80, 103);
  const sprintSens = clamp(Math.round(80 + nsNorm * 20), 80, 100);

  // DNA: deterministic hash based on input key
  const dnaKey = [
    input.device.model,
    input.style,
    input.skill,
    input.range,
    input.weapon.id,
    input.grip,
    input.priority,
    input.normalSpeed,
    input.gyroSpeed,
  ].join("|");
  const dna = "ALY-DNA-" + hashToAlnum(dnaKey);

  const confidence = computeConfidence(input);

  return { freeLook, camera: cam, ads, gyro, adsGyro, control: { movementSize, tppView, fppView, sprintSens }, dna, confidence };
}

function hashToAlnum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  let x = h;
  for (let i = 0; i < 6; i++) {
    out += chars[x % chars.length];
    x = (x * 1103515245 + 12345) >>> 0;
  }
  return out;
}

function computeConfidence(input: Input): number {
  // Advanced confidence calculation (78-99)
  let c = 85;
  const weapon = input.weapon;
  
  // Device tier impact
  const tierMap = { low: -5, mid: 0, high: 4, flagship: 7, esports: 10 };
  c += tierMap[input.device.tier];
  
  // Skill level impact
  if (input.skill === "conqueror") c += 4;
  else if (input.skill === "professional") c += 3;
  else if (input.skill === "advanced") c += 1;
  else if (input.skill === "beginner") c -= 2;
  
  // Gyroscope usage
  if (input.gyro === "always") c += 3;
  else if (input.gyro === "scope") c += 2;
  
  // Finger count (more fingers = more precise control)
  if (input.fingers >= 6) c += 4;
  else if (input.fingers >= 5) c += 3;
  else if (input.fingers >= 4) c += 2;
  else if (input.fingers === 3) c += 1;
  
  // Refresh rate
  if (input.refreshHz >= 165) c += 4;
  else if (input.refreshHz >= 144) c += 3;
  else if (input.refreshHz >= 120) c += 2;
  else if (input.refreshHz >= 90) c += 1;
  
  // Touch sampling rate
  const touchHz = input.device.touchHz || input.touchHz;
  if (touchHz >= 720) c += 4;
  else if (touchHz >= 480) c += 3;
  else if (touchHz >= 240) c += 2;
  else if (touchHz >= 120) c += 1;
  
  // Advanced playstyles (well-defined tuning)
  if (["entryfrag", "sniper", "anchor", "igl", "lurker", "competitive"].includes(input.style)) c += 2;
  
  // Weapon-specific confidence (some weapons are more predictable)
  if (weapon.stability >= 0.8) c += 2;
  else if (weapon.stability <= 0.5) c -= 1;
  
  // Attachment quality
  if (input.grip === "vertical" && input.muzzle === "comp" && input.stock === "tac") c += 3;
  else if (input.grip !== "none" && input.muzzle !== "none") c += 1;
  
  // Priority alignment
  if (input.priority === "competitive") c += 2;
  else if (input.priority === "balanced") c += 1;
  
  return clamp(c, 78, 99);
}

// Sensitivity recommendation engine
export function getSensitivityRecommendation(input: Input): string[] {
  const recommendations: string[] = [];
  const weapon = input.weapon;
  
  // Weapon-specific recommendations
  if (weapon.category === "AR") {
    if (weapon.verticalRecoil > 0.7) {
      recommendations.push("High recoil weapon detected. Consider using Vertical Grip + Compensator.");
    }
    if (input.style === "sniper" || input.style === "anchor") {
      recommendations.push("AR with defensive playstyle. Lower close-range sensitivity recommended.");
    }
  } else if (weapon.category === "Sniper") {
    recommendations.push("Sniper weapon. Prioritize long-range sensitivity (6x/8x).");
    if (input.style === "rusher" || input.style === "entryfrag") {
      recommendations.push("Aggressive sniper style. Consider lowering TPP/FPP for better control.");
    }
  } else if (weapon.category === "SMG") {
    recommendations.push("SMG detected. High close-range sensitivity optimal for quick flicks.");
  }
  
  // Playstyle-specific recommendations
  if (input.style === "entryfrag") {
    recommendations.push("Entry Fragger: Maximize close-range sensitivity for fast entries.");
  } else if (input.style === "lurker") {
    recommendations.push("Lurker: Balance between close and long-range for flanking.");
  } else if (input.style === "igl") {
    recommendations.push("IGL: Balanced sensitivity for adaptive leadership.");
  } else if (input.style === "anchor") {
    recommendations.push("Anchor: Lower close-range, higher long-range for holding positions.");
  }
  
  // Device-specific recommendations
  if (input.device.tier === "low" || input.device.tier === "mid") {
    recommendations.push("Mid-range device detected. Consider lowering sensitivity for stability.");
  } else if (input.device.tier === "esports") {
    recommendations.push("Esports device. Can handle high sensitivity with precision.");
  }
  
  // Gyroscope recommendations
  if (input.gyro === "off" && (input.style === "sniper" || input.style === "anchor")) {
    recommendations.push("Consider enabling gyroscope for better long-range precision.");
  }
  
  // Priority recommendations
  if (input.priority === "headshot") {
    recommendations.push("Headshot priority: Practice crosshair placement at head level.");
  } else if (input.priority === "recoil") {
    recommendations.push("Recoil priority: Focus on spray control training.");
  } else if (input.priority === "tracking") {
    recommendations.push("Tracking priority: Smooth sensitivity for following moving targets.");
  }
  
  return recommendations;
}

export function tierLabel(t: Device["tier"]): string {
  return {
    low: "Low-End",
    mid: "Mid-Range",
    high: "High-End",
    flagship: "Flagship",
    esports: "Esports Grade",
  }[t];
}
