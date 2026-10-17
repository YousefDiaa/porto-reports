import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { Report, Specialization } from "./supabase";

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, string> }[];
  attrs?: Record<string, unknown>;
}

function parseInlineContent(node: TiptapNode): TextRun[] {
  if (node.type === "text") {
    const marks = node.marks || [];
    const bold = marks.some((m) => m.type === "bold");
    const italic = marks.some((m) => m.type === "italic");
    const underline = marks.some((m) => m.type === "underline");

    return [
      new TextRun({
        text: node.text || "",
        bold,
        italics: italic,
        underline: underline ? {} : undefined,
        font: "Cairo",
        size: 24, // 12pt
      }),
    ];
  }
  if (node.content) {
    return node.content.flatMap(parseInlineContent);
  }
  return [];
}

function parseNode(node: TiptapNode): (Paragraph | Table)[] {
  switch (node.type) {
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      };
      return [
        new Paragraph({
          heading: headingMap[level] || HeadingLevel.HEADING_1,
          children: (node.content || []).flatMap(parseInlineContent),
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 100 },
        }),
      ];
    }

    case "paragraph": {
      const children = (node.content || []).flatMap(parseInlineContent);
      if (children.length === 0) {
        return [new Paragraph({ children: [new TextRun("")], spacing: { after: 100 } })];
      }
      return [
        new Paragraph({
          children,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
        }),
      ];
    }

    case "bulletList":
    case "orderedList": {
      return (node.content || []).flatMap((listItem, idx) => {
        const content = (listItem.content || []).flatMap(parseInlineContent);
        return [
          new Paragraph({
            children: [
              new TextRun({ text: node.type === "orderedList" ? `${idx + 1}. ` : "• ", font: "Cairo" }),
              ...content,
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 80 },
            indent: { right: 360 },
          }),
        ];
      });
    }

    case "table": {
      const rows = (node.content || []).map((row) => {
        const cells = (row.content || []).map((cell) => {
          return new TableCell({
            children: (cell.content || []).flatMap(parseNode).filter((n): n is Paragraph => n instanceof Paragraph),
            width: { size: 2000, type: WidthType.DXA },
          });
        });
        return new TableRow({ children: cells });
      });

      return [
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ];
    }

    case "blockquote": {
      return (node.content || []).flatMap(parseNode);
    }

    default:
      if (node.content) {
        return node.content.flatMap(parseNode);
      }
      return [];
  }
}

export async function exportReportToWord(reports: Report[], specialization?: Specialization | null, periodLabel?: string) {
  const children: (Paragraph | Table)[] = [];

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];

    // Report title
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: report.title,
            bold: true,
            color: "E4007C",
            font: "Cairo",
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      })
    );

    // Report metadata
    if (specialization) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `التخصص: ${specialization.name}`, font: "Cairo", size: 22, color: "718096" }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 80 },
        })
      );
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `التاريخ: ${new Date(report.report_date).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}`,
            font: "Cairo",
            size: 22,
            color: "718096",
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 300 },
      })
    );

    // Divider
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "─".repeat(60), color: "00AEEF", font: "Arial" })],
        spacing: { after: 200 },
      })
    );

    // Report content
    try {
      const contentJson = report.content as { content?: TiptapNode[] };
      const contentNodes = contentJson.content || [];
      for (const node of contentNodes) {
        const parsed = parseNode(node);
        children.push(...parsed);
      }
    } catch {
      // Fallback to plain text
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "تعذر تحليل محتوى التقرير", font: "Cairo" })],
        })
      );
    }

    // Page break between reports
    if (i < reports.length - 1) {
      children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // A4
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: {
            options: {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "نادي بورتو الرياضي — PORTO SPORTING CLUB",
                      font: "Cairo",
                      size: 20,
                      color: "E4007C",
                      bold: true,
                    }),
                    periodLabel
                      ? new TextRun({ text: ` | ${periodLabel}`, font: "Cairo", size: 20, color: "00AEEF" })
                      : new TextRun(""),
                  ],
                  alignment: AlignmentType.CENTER,
                  border: {
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "00AEEF" },
                  },
                }),
              ],
            },
          },
        },
        footers: {
          default: {
            options: {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Porto Sporting Clubs — Amer Group",
                      font: "Cairo",
                      size: 18,
                      color: "718096",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = reports.length === 1
    ? `${reports[0].title}.docx`
    : `تقارير-بورتو${periodLabel ? `-${periodLabel}` : ""}.docx`;
  saveAs(blob, filename);
}
