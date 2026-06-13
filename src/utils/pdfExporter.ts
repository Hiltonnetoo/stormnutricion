import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import i18n from "../i18n";
import type { DietPlan, Meal, MealOption } from "../types";

function formatFileName(plan: DietPlan): string {
  const patientName = plan.patientName.replace(/\s+/g, "-").toLowerCase();
  const date = new Date(plan.createdAt)
    .toLocaleDateString("pt-BR")
    .replace(/\//g, "-");
  return `diet-${patientName}-${date}.pdf`;
}

// --- MODE 1: EDITORIAL LAYOUT (Storm Nutrition visual identity) ---
// Brand palette converted to RGB (mirrors src/index.css).
type RGB = [number, number, number];
const SAGE800: RGB = [17, 94, 89];
const SAGE700: RGB = [15, 118, 110];
const SAGE600: RGB = [13, 148, 136];
const SAGE100: RGB = [204, 251, 241];
const SAGE50: RGB = [240, 253, 250];
const SKY: RGB = [2, 132, 199]; // carbohydrates
const AMBER: RGB = [217, 119, 6]; // fats
const INK: RGB = [15, 23, 42]; // slate-900
const SUBTLE: RGB = [100, 116, 139]; // slate-500
const FAINT: RGB = [148, 163, 184]; // slate-400
const HAIR: RGB = [226, 232, 240]; // slate-200
const PAPER: RGB = [248, 250, 252]; // slate-50

export const generateCustomLayoutPdf = async (plan: DietPlan) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 0;

  // Clinic data configured in Settings → Clinic & Brand.
  const ls = typeof localStorage !== "undefined" ? localStorage : null;
  const clinicName = ls?.getItem("clinicName") || "";
  const clinicSpecialty = ls?.getItem("clinicSpecialty") || "";
  const clinicPhone = ls?.getItem("clinicPhone") || "";

  const checkPageBreak = (need: number) => {
    if (yPos + need > pageHeight - 16) {
      doc.addPage();
      yPos = 18;
    }
  };

  /* ---------------------------------------------- Header (brand banner) */
  doc.setFillColor(...SAGE700);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFillColor(...SAGE800);
  doc.rect(0, 40, pageWidth, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setCharSpace(1.5);
  doc.text("STORM NUTRITION", margin, 15);
  doc.setCharSpace(0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(clinicName || i18n.t("pdf.personalized_plan"), margin, 23);
  if (clinicSpecialty) {
    doc.setFontSize(8);
    doc.setTextColor(...SAGE100);
    doc.text(clinicSpecialty, margin, 28.5);
    doc.setTextColor(255, 255, 255);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(i18n.t("pdf.nutritional_plan"), pageWidth - margin, 15, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SAGE100);
  doc.text(
    i18n.t("pdf.issued_on", {
      date: new Date(plan.createdAt).toLocaleDateString(
        i18n.language === "en" ? "en-US" : "pt-BR",
      ),
    }),
    pageWidth - margin,
    22,
    { align: "right" },
  );
  doc.setTextColor(255, 255, 255);

  yPos = 54;

  /* ------------------------------------------------------- Patient Block */
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(plan.patientName, margin, yPos);
  yPos += 7;
  const startD = new Date(plan.startDate + "T00:00:00").toLocaleDateString(
    i18n.language === "en" ? "en-US" : "pt-BR",
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...SUBTLE);
  doc.text(
    i18n.t("pdf.plan_duration_start", {
      duration: plan.durationDays,
      startDate: startD,
    }),
    margin,
    yPos,
  );
  yPos += 10;

  /* -------------------------------------------------- Nutritional Summary */
  const cardH = 34;
  doc.setFillColor(...SAGE50);
  doc.setDrawColor(...SAGE100);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, cardH, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...SAGE700);
  doc.setCharSpace(0.8);
  doc.text(i18n.t("pdf.daily_summary"), margin + 6, yPos + 7);
  doc.setCharSpace(0);

  const m = plan.macronutrients;
  const cols: Array<{ v: string; sub: string; c: RGB }> = [
    {
      v: `${plan.dailyCalories.toFixed(0)}`,
      sub: i18n.t("pdf.calories_kcal"),
      c: INK,
    },
    {
      v: `${m.proteinGrams.toFixed(0)}g`,
      sub: i18n.t("pdf.proteins_pct", { pct: m.proteinPercentage }),
      c: SAGE600,
    },
    {
      v: `${m.carbsGrams.toFixed(0)}g`,
      sub: i18n.t("pdf.carbs_pct", { pct: m.carbsPercentage }),
      c: SKY,
    },
    {
      v: `${m.fatGrams.toFixed(0)}g`,
      sub: i18n.t("pdf.fats_pct", { pct: m.fatPercentage }),
      c: AMBER,
    },
  ];
  const colW = contentWidth / 4;
  cols.forEach((col, i) => {
    const cx = margin + colW * i + colW / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...col.c);
    doc.text(col.v, cx, yPos + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SUBTLE);
    doc.text(col.sub, cx, yPos + 23, { align: "center" });
  });

  // Macro distribution bar (protein / carbs / fat by kcal)
  const pK = m.proteinGrams * 4;
  const cK = m.carbsGrams * 4;
  const fK = m.fatGrams * 9;
  const totK = Math.max(1, pK + cK + fK);
  const barX = margin + 6;
  const barY = yPos + 27.5;
  const barW = contentWidth - 12;
  const segs: Array<{ k: number; c: RGB }> = [
    { k: pK, c: SAGE600 },
    { k: cK, c: SKY },
    { k: fK, c: AMBER },
  ];
  let bx = barX;
  segs.forEach((s) => {
    const w = (s.k / totK) * barW;
    doc.setFillColor(...s.c);
    doc.rect(bx, barY, w, 2.4, "F");
    bx += w;
  });
  yPos += cardH + 12;

  /* ------------------------------------------------------ Meal Plan */
  const sectionTitle = (title: string) => {
    checkPageBreak(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(title, margin, yPos);
    yPos += 2;
    doc.setDrawColor(...HAIR);
    doc.setLineWidth(0.4);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 7;
  };

  sectionTitle(i18n.t("pdf.meal_plan"));

  const padX = 8;
  const innerW = contentWidth - padX * 2;

  plan.meals.forEach((meal: Meal) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const mainLines = doc.splitTextToSize(
      `${meal.mainOption.name} — ${meal.mainOption.portion}`,
      innerW,
    );
    doc.setFontSize(9.5);
    const altWrapped = meal.alternatives.map((alt: MealOption) =>
      doc.splitTextToSize(`${alt.name} — ${alt.portion}`, innerW - 4),
    );
    const altLineCount = altWrapped.reduce((s, l) => s + l.length, 0);
    const hasAlts = meal.alternatives.length > 0;
    const blockH =
      19.5 +
      mainLines.length * 4.5 +
      (hasAlts ? 6 + altLineCount * 4.5 : 0) +
      5;

    checkPageBreak(blockH + 4);

    // Meal card + accent on the left
    doc.setFillColor(...PAPER);
    doc.roundedRect(margin, yPos, contentWidth, blockH, 3, 3, "F");
    doc.setFillColor(...SAGE600);
    doc.roundedRect(margin, yPos, 2.2, blockH, 1, 1, "F");

    let cy = yPos + 8;
    // Name + time
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(meal.mealName, margin + padX, cy);
    const nameW = doc.getTextWidth(meal.mealName);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...FAINT);
    doc.text(`  ${meal.time}`, margin + padX + nameW, cy);

    // Kcal pill on the right
    const kcalStr = `${meal.calories.toFixed(0)} kcal`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const pillW = doc.getTextWidth(kcalStr) + 8;
    const pillX = pageWidth - margin - padX - pillW;
    doc.setFillColor(...SAGE100);
    doc.roundedRect(pillX, cy - 4.2, pillW, 6, 3, 3, "F");
    doc.setTextColor(...SAGE700);
    doc.text(kcalStr, pillX + pillW / 2, cy, { align: "center" });

    cy += 7;
    // Main option
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...SAGE700);
    doc.setCharSpace(0.5);
    doc.text(i18n.t("pdf.main_option"), margin + padX, cy);
    doc.setCharSpace(0);
    cy += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(mainLines, margin + padX, cy);
    cy += mainLines.length * 4.5;

    if (hasAlts) {
      cy += 1.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...SUBTLE);
      doc.setCharSpace(0.5);
      doc.text(i18n.t("pdf.alternatives"), margin + padX, cy);
      doc.setCharSpace(0);
      cy += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...SUBTLE);
      altWrapped.forEach((lines) => {
        doc.setFillColor(...FAINT);
        doc.circle(margin + padX + 1, cy - 1.3, 0.5, "F");
        doc.text(lines, margin + padX + 4, cy);
        cy += lines.length * 4.5;
      });
    }

    yPos += blockH + 5;
  });

  /* -------------------------------------------------- General Recommendations */
  const obs = [
    ...(plan.generalObservations || []),
    i18n.t("pdf.water_recommendation", {
      liters: (plan.waterRecommendationLiters || 2).toFixed(1),
    }),
  ];
  if (obs.length > 0) {
    yPos += 4;
    sectionTitle(i18n.t("pdf.general_recommendations"));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    obs.forEach((o) => {
      const lines = doc.splitTextToSize(o, contentWidth - 6);
      checkPageBreak(lines.length * 5 + 2);
      doc.setFillColor(...SAGE600);
      doc.circle(margin + 1, yPos - 1.3, 0.7, "F");
      doc.setTextColor(...SUBTLE);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 2;
    });
  }

  /* ---------------------------------------------------- Footer (every page) */
  const pageCount = doc.getNumberOfPages();
  const footerLeft = clinicName
    ? `${clinicName}${clinicPhone ? "  ·  " + clinicPhone : ""}`
    : "Storm Nutrition · Gestão Nutricional";
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...HAIR);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...FAINT);
    doc.text(footerLeft, margin, pageHeight - 7);
    doc.text(i18n.t("pdf.generated_by"), pageWidth / 2, pageHeight - 7, {
      align: "center",
    });
    doc.text(
      i18n.t("pdf.page_of", { page: i, total: pageCount }),
      pageWidth - margin,
      pageHeight - 7,
      { align: "right" },
    );
  }

  doc.save(formatFileName(plan));
};

// --- MODE 2: SCREENSHOT CAPTURE ---
export const generateScreenshotPdf = async (
  element: HTMLElement,
  plan: DietPlan,
) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor, // Match dark/light mode
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const ratio = canvasWidth / pdfWidth;
    const imgHeight = canvasHeight / ratio;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(formatFileName(plan));
  } catch (error) {
    console.error("Error generating screenshot PDF:", error);
    throw error;
  }
};
