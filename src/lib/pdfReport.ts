import jsPDF from "jspdf";
import type { SensitivityProfile } from "./sensitivityEngine";
import type { Device } from "./devices";
import type { Weapon } from "./weapons";
import type { Lang } from "./i18n";

export function generatePDF(
  profile: SensitivityProfile,
  device: Device,
  weapon: Weapon,
  lang: Lang,
  extras: {
    style: string;
    skill: string;
    range: string;
    priority: string;
    fingers: number;
    gyro: string;
    normalSpeed: number;
    gyroSpeed: number;
    grip: string;
    muzzle: string;
    stock: string;
  },
) {
  const isAr = lang === "ar";
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const gold = [212, 175, 55] as const;
  const dark = [15, 15, 15] as const;
  const white = [245, 240, 225] as const;
  let y = 0;

  // ---- Background ----
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 297, "F");

  // ---- Gold header bar ----
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 38, "F");
  doc.setTextColor(15, 15, 15);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  const title = isAr ? "SENSITIVITY PUBG BY ALYAZOURI" : "SENSITIVITY PUBG BY ALYAZOURI";
  doc.text(title, W / 2, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const sub = isAr ? "AI Sensitivity Engine V2" : "Professional AI-Powered Sensitivity Generator";
  doc.text(sub, W / 2, 26, { align: "center" });
  doc.setFontSize(8);
  doc.text(`DNA: ${profile.dna} | Confidence: ${profile.confidence}%`, W / 2, 34, { align: "center" });

  y = 45;

  // ---- Helpers ----
  const goldLine = () => {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(15, y, W - 15, y);
    y += 4;
  };

  const sectionTitle = (en: string, ar: string) => {
    if (y > 260) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, 297, "F"); y = 15; }
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.roundedRect(15, y, W - 30, 8, 2, 2, "F");
    doc.setTextColor(15, 15, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(isAr ? ar : en, W / 2, y + 5.5, { align: "center" });
    y += 13;
  };

  const row = (label: string, value: string, indent = 15) => {
    if (y > 280) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, 297, "F"); y = 15; }
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(label, indent, y);
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), W - indent, y, { align: "right" });
    y += 6;
  };

  const scopeKeys = ["tpp", "fpp", "red", "s2", "s3", "s4", "s6", "s8"] as const;
  const scopeLabels: Record<string, { en: string; ar: string }> = {
    tpp: { en: "TPP No Scope", ar: "TPP" },
    fpp: { en: "FPP No Scope", ar: "FPP" },
    red: { en: "Red Dot / Holo", ar: "Red Dot" },
    s2: { en: "2x Scope", ar: "2x" },
    s3: { en: "3x Scope", ar: "3x" },
    s4: { en: "4x Scope", ar: "4x" },
    s6: { en: "6x Scope", ar: "6x" },
    s8: { en: "8x Scope", ar: "8x" },
  };

  const tableHeader = () => {
    if (y > 270) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, 297, "F"); y = 15; }
    doc.setFillColor(30, 30, 30);
    doc.rect(15, y, W - 30, 6, "F");
    doc.setTextColor(...gold);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(isAr ? "المنظار" : "Scope", 18, y + 4);
    doc.text(isAr ? "القيمة" : "Value", W - 18, y + 4, { align: "right" });
    y += 8;
  };

  const tableRow = (scope: string, value: number, even: boolean) => {
    if (y > 282) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, 297, "F"); y = 15; }
    if (even) { doc.setFillColor(22, 22, 22); doc.rect(15, y - 3, W - 30, 6, "F"); }
    const sl = scopeLabels[scope];
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(isAr ? sl.ar : sl.en, 18, y);
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), W - 18, y, { align: "right" });
    y += 6;
  };

  // ---- Device & Setup ----
  sectionTitle("Device & Setup", "الجهاز والإعداد");
  row(isAr ? "الجهاز" : "Device", `${device.brand} ${device.model}`);
  row(isAr ? "النظام" : "OS", device.os.toUpperCase());
  row(isAr ? "الشاشة" : "Screen", `${device.screenSize}" • ${device.refreshHz}Hz • ${device.touchHz}Hz Touch`);
  row(isAr ? "الفئة" : "Tier", device.tier.toUpperCase());
  row(isAr ? "السلاح" : "Weapon", weapon.name + ` (${weapon.category})`);
  row(isAr ? "أسلوب اللعب" : "Play Style", extras.style);
  row(isAr ? "المهارة" : "Skill", extras.skill);
  row(isAr ? "النطاق" : "Range", extras.range);
  row(isAr ? "الأولوية" : "Priority", extras.priority);
  row(isAr ? "الأصابع" : "Fingers", String(extras.fingers));
  row(isAr ? "الجيروسكوب" : "Gyroscope", extras.gyro);
  row(isAr ? "سرعة عادية" : "Normal Speed", String(extras.normalSpeed));
  row(isAr ? "سرعة الجيروسكوب" : "Gyro Speed", String(extras.gyroSpeed));
  row(isAr ? "المقبض" : "Grip", extras.grip);
  row(isAr ? "الكاتم" : "Muzzle", extras.muzzle);
  row(isAr ? "المخزن" : "Stock", extras.stock);
  y += 2;
  goldLine();

  // ---- Free Look ----
  sectionTitle("Free Look", "النظر الحر");
  row("TPP", String(profile.freeLook.tpp));
  row("FPP", String(profile.freeLook.fpp));
  row(isAr ? "المظلة" : "Parachuting", String(profile.freeLook.parachuting));
  y += 2;

  // ---- Camera ----
  sectionTitle("Camera Sensitivity", "حساسية الكاميرا");
  tableHeader();
  scopeKeys.forEach((k, i) => tableRow(k, profile.camera[k], i % 2 === 0));
  y += 2;

  // ---- ADS ----
  sectionTitle("ADS Sensitivity", "حساسية ADS");
  tableHeader();
  scopeKeys.forEach((k, i) => tableRow(k, profile.ads[k], i % 2 === 0));
  y += 2;

  // ---- Gyroscope ----
  sectionTitle("Gyroscope Sensitivity", "حساسية الجيروسكوب");
  tableHeader();
  scopeKeys.forEach((k, i) => tableRow(k, profile.gyro[k], i % 2 === 0));
  y += 2;

  // ---- ADS Gyroscope ----
  sectionTitle("ADS Gyroscope Sensitivity", "حساسية جيروسكوب ADS");
  tableHeader();
  scopeKeys.forEach((k, i) => tableRow(k, profile.adsGyro[k], i % 2 === 0));
  y += 2;

  // ---- Control Optimization ----
  sectionTitle("Control Optimization", "تحسين الإعدادات");
  row(isAr ? "حجم الحركة" : "Movement Size", `${profile.control.movementSize}%`);
  row(isAr ? "رؤية TPP" : "TPP View", `${profile.control.tppView}%`);
  row(isAr ? "رؤية FPP" : "FPP View", `${profile.control.fppView}%`);
  row(isAr ? "حساسية الركض" : "Sprint Sensitivity", `${profile.control.sprintSens}%`);
  y += 2;

  // ---- Recommendations ----
  if (profile.recommendations && profile.recommendations.length > 0) {
    sectionTitle("AI Recommendations", "توصيات الذكاء الاصطناعي");
    profile.recommendations.forEach((rec, i) => {
      if (y > 278) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, 297, "F"); y = 15; }
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, W - 36);
      doc.text(lines, 18, y);
      y += lines.length * 4.5;
    });
    y += 2;
  }

  // ---- Footer ----
  goldLine();
  y += 2;
  doc.setTextColor(gold[0], gold[1], gold[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SENSITIVITY PUBG BY ALYAZOURI", W / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(white[0], white[1], white[2]);
  doc.text("Instagram: @Saeedjor11 | TikTok: @saeedalyazouri0 | UID: 5744469523", W / 2, y, { align: "center" });
  y += 4;
  doc.text(`Generated: ${new Date().toISOString().split("T")[0]} | DNA: ${profile.dna}`, W / 2, y, { align: "center" });

  // Save
  doc.save(`ALYAZOURI-Sensitivity-${profile.dna}.pdf`);
}
