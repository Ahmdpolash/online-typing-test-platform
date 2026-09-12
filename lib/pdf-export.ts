import { GState, jsPDF } from "jspdf";
import type { ResultStats } from "@/lib/types";

export function exportScoreToPdf(stats: ResultStats) {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = 297;
  const height = 210;

  // 1. Dark elegant canvas background
  doc.setFillColor(35, 37, 40); // Matte dark slate #232528
  doc.rect(0, 0, width, height, "F");

  // 2. Gold & Subtle Double Border Frame
  doc.setDrawColor(226, 183, 20); // Golden yellow #E2B714
  doc.setLineWidth(0.8);
  doc.roundedRect(12, 12, width - 24, height - 24, 5, 5, "S");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.15);
  doc.roundedRect(15, 15, width - 30, height - 30, 4, 4, "S");

  // 3. WATERMARK (Centered, angled, low opacity)
  doc.saveGraphicsState();
  try {
    doc.setGState(new GState({ opacity: 0.05 }));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(42);
    doc.setTextColor(255, 255, 255);
    doc.text("DEVELOPED BY POLASH", width / 2, height / 2 - 5, {
      align: "center",
      angle: 25,
    });
    doc.text("TYPESTER OFFICIAL SCORECARD", width / 2, height / 2 + 25, {
      align: "center",
      angle: 25,
    });
  } catch {
    // fallback if GState is not available
  }
  doc.restoreGraphicsState();

  // 4. Header Bar
  doc.setTextColor(226, 183, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("typester", 24, 28);

  doc.setTextColor(160, 164, 170);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Online Typing Test Platform", 24, 34);

  // Header Right: Date & Verification ID
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const testId = `TYP-${Date.now().toString(36).toUpperCase()}`;

  doc.setFontSize(9);
  doc.setTextColor(180, 184, 190);
  doc.text(`DATE: ${dateStr}`, width - 24, 28, { align: "right" });
  doc.text(`VERIFICATION ID: ${testId}`, width - 24, 34, { align: "right" });

  // Divider Line
  doc.setDrawColor(60, 64, 70);
  doc.setLineWidth(0.3);
  doc.line(24, 40, width - 24, 40);

  // 5. Certificate Title
  doc.setTextColor(240, 240, 245);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("OFFICIAL TYPING SCORECARD", width / 2, 52, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 154, 160);
  doc.text(
    `Mode: ${stats.mode.toUpperCase()}  |  Condition: ${stats.modeDetail}  |  Duration: ${stats.elapsedSeconds}s`,
    width / 2,
    58,
    { align: "center" }
  );

  // 6. Main Stat Cards (4 Cards across)
  const cardY = 68;
  const cardWidth = 58;
  const cardHeight = 44;
  const cardGap = 8;
  const startX = (width - (4 * cardWidth + 3 * cardGap)) / 2;

  const statCards = [
    { label: "NET WPM", value: `${stats.wpm}`, sub: "Words Per Minute", color: [226, 183, 20] },
    { label: "ACCURACY", value: `${stats.accuracy}%`, sub: "Character Precision", color: [209, 208, 197] },
    { label: "RAW WPM", value: `${stats.raw}`, sub: "Gross Speed", color: [160, 164, 170] },
    { label: "CONSISTENCY", value: `${stats.consistency}%`, sub: "Pacing Uniformity", color: [160, 164, 170] },
  ];

  statCards.forEach((c, idx) => {
    const x = startX + idx * (cardWidth + cardGap);

    // Card background
    doc.setFillColor(45, 48, 53);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "F");

    // Card border
    doc.setDrawColor(65, 68, 75);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "S");

    // Card Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(140, 144, 150);
    doc.text(c.label, x + cardWidth / 2, cardY + 11, { align: "center" });

    // Card Big Value
    doc.setFontSize(22);
    doc.setTextColor(c.color[0], c.color[1], c.color[2]);
    doc.text(c.value, x + cardWidth / 2, cardY + 26, { align: "center" });

    // Card Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 124, 130);
    doc.text(c.sub, x + cardWidth / 2, cardY + 36, { align: "center" });
  });

  // 7. Breakdown Box
  const boxY = 122;
  const boxWidth = width - 48;
  const boxHeight = 46;

  doc.setFillColor(40, 43, 48);
  doc.roundedRect(24, boxY, boxWidth, boxHeight, 3, 3, "F");
  doc.setDrawColor(60, 64, 70);
  doc.setLineWidth(0.25);
  doc.roundedRect(24, boxY, boxWidth, boxHeight, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(226, 183, 20);
  doc.text("DETAILED CHARACTER ANALYSIS", 32, boxY + 11);

  // Table columns inside breakdown
  const charStats = [
    { label: "Correct Characters", val: stats.correctChars, color: [100, 200, 120] },
    { label: "Incorrect Characters", val: stats.incorrectChars, color: [220, 80, 80] },
    { label: "Extra Characters", val: stats.extraChars, color: [220, 140, 60] },
    { label: "Missed Characters", val: stats.missedChars, color: [160, 160, 160] },
  ];

  const colWidth = (boxWidth - 16) / 4;
  charStats.forEach((st, idx) => {
    const colX = 32 + idx * colWidth;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(150, 154, 160);
    doc.text(st.label, colX, boxY + 23);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(`${st.val}`, colX, boxY + 36);
  });

  // 8. Footer with User's Watermark / Attribution
  const footerY = 186;
  doc.setDrawColor(60, 64, 70);
  doc.setLineWidth(0.2);
  doc.line(24, footerY - 8, width - 24, footerY - 8);

  // Left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(140, 144, 150);
  doc.text("Engine: Typester Mechanical v1.0", 24, footerY);

  // Center: "Developed by Polash" (The user's requested watermark)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(226, 183, 20); // Golden yellow
  doc.text("✦ Developed by Polash ✦", width / 2, footerY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 144, 150);
  doc.text("linkedin.com/in/polashahmed  |  github.com/Ahmdpolash", width / 2, footerY + 5, {
    align: "center",
  });

  // Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 200, 120);
  doc.text("STATUS: VERIFIED RESULT", width - 24, footerY, { align: "right" });

  // Save the PDF
  doc.save(`typester-scorecard-${new Date().toISOString().slice(0, 10)}.pdf`);
}
