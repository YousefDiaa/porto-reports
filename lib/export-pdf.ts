import { Report, Specialization } from "./supabase";

export async function exportReportToPDF(
  reports: Report[],
  specialization?: Specialization | null,
  periodLabel?: string
) {
  // Dynamic import to avoid SSR issues
  // @ts-ignore
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default || html2pdfModule;

  const htmlContent = generatePDFHTML(reports, specialization, periodLabel);

  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  element.style.direction = "rtl";
  element.style.fontFamily = "Cairo, sans-serif";
  document.body.appendChild(element);

  const filename =
    reports.length === 1
      ? `${reports[0].title}.pdf`
      : `تقارير-بورتو${periodLabel ? `-${periodLabel}` : ""}.pdf`;

  const options = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
    },
    jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    await html2pdf().from(element).set(options).save();
  } finally {
    document.body.removeChild(element);
  }
}

function generatePDFHTML(
  reports: Report[],
  specialization?: Specialization | null,
  periodLabel?: string
): string {
  const reportPages = reports
    .map(
      (report, idx) => `
    <div style="page-break-after: ${idx < reports.length - 1 ? "always" : "auto"}; padding: 20px;">
      <!-- Report Header Card -->
      <div style="background: linear-gradient(135deg, #E4007C, #C20063); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-bottom: 4px solid #00AEEF;">
        <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: white;">${report.title}</h1>
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
          ${
            specialization
              ? `<span style="background: #00AEEF; color: white; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700;">${specialization.name}</span>`
              : ""
          }
          <span style="color: #FFE500; font-size: 14px; font-weight: 700;">📅 ${new Date(report.report_date).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      <!-- Report Content -->
      <div style="font-size: 14px; line-height: 1.8; color: #1E293B;">
        ${report.content_html}
      </div>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          color: #1E293B;
          background: white;
        }
        
        /* Page Header */
        .page-header {
          background: #E4007C;
          color: white;
          text-align: center;
          padding: 18px;
          margin-bottom: 0;
          border-bottom: 4px solid #00AEEF;
        }
        
        .page-header h2 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          color: white;
        }
        
        .page-header .period {
          font-size: 14px;
          color: #FFE500;
          font-weight: 700;
          margin-top: 4px;
        }
        
        /* Content Styles */
        h1 { color: #E4007C; font-size: 22px; margin: 16px 0 8px; font-weight: 800; }
        h2 { color: #00AEEF; font-size: 18px; margin: 14px 0 6px; font-weight: 700; }
        h3 { color: #E4007C; font-size: 16px; margin: 12px 0 4px; font-weight: 600; }
        p { margin: 8px 0; line-height: 1.8; }
        strong { font-weight: 700; }
        em { font-style: italic; }
        u { text-decoration: underline; }
        
        ul, ol { padding-right: 20px; margin: 8px 0; }
        li { margin: 4px 0; line-height: 1.7; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 14px 0;
          font-size: 13px;
        }
        
        th {
          background: #E4007C;
          color: white;
          padding: 8px 12px;
          text-align: right;
          font-weight: 700;
        }
        
        td {
          padding: 8px 12px;
          border: 1px solid #E2E8F0;
          text-align: right;
        }
        
        tr:nth-child(even) td { background: #F8FAFC; }
        
        blockquote {
          border-right: 4px solid #FFE500;
          padding: 8px 16px;
          margin: 12px 0;
          background: #F8FAFC;
          color: #475569;
        }
        
        a { color: #00AEEF; text-decoration: underline; }
        
        img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 8px 0;
        }
        
        /* Footer */
        .page-footer {
          text-align: center;
          color: #64748B;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 16px;
          border-top: 2px solid #00AEEF;
        }
      </style>
    </head>
    <body>
      <!-- Page Header -->
      <div class="page-header">
        <h2>نادي بورتو الرياضي — PORTO SPORTING CLUB</h2>
        ${periodLabel ? `<div class="period">${periodLabel}</div>` : ""}
      </div>
      
      <!-- Reports -->
      ${reportPages}
      
      <!-- Footer -->
      <div class="page-footer">
        Porto Sporting Clubs — Amer Group | جميع الحقوق محفوظة
      </div>
    </body>
    </html>
  `;
}
