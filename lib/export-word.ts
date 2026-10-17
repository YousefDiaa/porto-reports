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

interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  size?: number;
}

function getImageType(src: string): "jpg" | "png" | "gif" | "bmp" {
  const clean = src.toLowerCase().split("?")[0];
  if (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.includes("image/jpeg") ||
    clean.includes("image/jpg")
  ) {
    return "jpg";
  }
  if (clean.endsWith(".gif") || clean.includes("image/gif")) {
    return "gif";
  }
  if (clean.endsWith(".bmp") || clean.includes("image/bmp")) {
    return "bmp";
  }
  return "png";
}

async function fetchImageForDocx(
  src: string
): Promise<{ data: Uint8Array; width: number; height: number; type: "jpg" | "png" | "gif" | "bmp" } | null> {
  try {
    let resolvedSrc = src.trim();
    if (resolvedSrc.startsWith("/") && typeof window !== "undefined") {
      resolvedSrc = window.location.origin + resolvedSrc;
    }

    let arrayBuffer: ArrayBuffer;
    let width = 500;
    let height = 300;

    if (resolvedSrc.startsWith("data:")) {
      const parts = resolvedSrc.split(",");
      const base64Data = parts[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const res = await fetch(resolvedSrc);
      if (!res.ok) return null;
      arrayBuffer = await res.arrayBuffer();
    }

    // Try to calculate aspect ratio in browser
    if (typeof window !== "undefined") {
      await new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const maxWidth = 550;
          const naturalW = img.naturalWidth || 500;
          const naturalH = img.naturalHeight || 300;
          if (naturalW > maxWidth) {
            width = maxWidth;
            height = Math.round((naturalH * maxWidth) / naturalW);
          } else {
            width = naturalW;
            height = naturalH;
          }
          resolve();
        };
        img.onerror = () => {
          width = 500;
          height = 300;
          resolve();
        };
        img.src = resolvedSrc;
      });
    }

    return {
      data: new Uint8Array(arrayBuffer),
      width,
      height,
      type: getImageType(src),
    };
  } catch (err) {
    console.warn("Could not fetch image for Word docx:", src, err);
    return null;
  }
}

// ----------------------------------------------------------------------
// 1. Tiptap JSON to Docx AST
// ----------------------------------------------------------------------

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

async function parseNode(node: TiptapNode): Promise<(Paragraph | Table)[]> {
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
          spacing: { before: 240, after: 120 },
        }),
      ];
    }

    case "paragraph": {
      const children = (node.content || []).flatMap(parseInlineContent);
      if (children.length === 0) {
        return [];
      }
      return [
        new Paragraph({
          children,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
        }),
      ];
    }

    case "image": {
      const src = (node.attrs?.src as string) || "";
      if (src) {
        const img = await fetchImageForDocx(src);
        if (img) {
          return [
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: {
                    width: img.width,
                    height: img.height,
                  },
                  type: img.type,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),
          ];
        }
      }
      return [];
    }

    case "bulletList":
    case "orderedList": {
      return (node.content || []).flatMap((listItem, idx) => {
        const content = (listItem.content || []).flatMap(parseInlineContent);
        return [
          new Paragraph({
            children: [
              new TextRun({
                text: node.type === "orderedList" ? `${idx + 1}. ` : "• ",
                font: "Cairo",
                bold: true,
                color: "E4007C",
              }),
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
      const rows: TableRow[] = [];
      for (const row of node.content || []) {
        const cells: TableCell[] = [];
        for (const cell of row.content || []) {
          const cellParagraphs: Paragraph[] = [];
          for (const item of cell.content || []) {
            const parsed = await parseNode(item);
            cellParagraphs.push(
              ...parsed.filter((n): n is Paragraph => n instanceof Paragraph)
            );
          }
          cells.push(
            new TableCell({
              children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph("")],
              width: { size: 2000, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
              },
            })
          );
        }
        rows.push(new TableRow({ children: cells }));
      }

      return [
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ];
    }

    case "blockquote": {
      const result: (Paragraph | Table)[] = [];
      for (const child of node.content || []) {
        result.push(...(await parseNode(child)));
      }
      return result;
    }

    default:
      if (node.content) {
        const result: (Paragraph | Table)[] = [];
        for (const child of node.content) {
          result.push(...(await parseNode(child)));
        }
        return result;
      }
      return [];
  }
}

// ----------------------------------------------------------------------
// 2. HTML to Docx AST (Reliable fallback with Image Support)
// ----------------------------------------------------------------------

function parseInlineNodes(node: Node, currentStyle: InlineStyle = {}): TextRun[] {
  const runs: TextRun[] = [];

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];

    if (child.nodeType === 3) {
      // TEXT_NODE
      const text = child.textContent || "";
      if (text.length > 0) {
        runs.push(
          new TextRun({
            text,
            bold: currentStyle.bold,
            italics: currentStyle.italic,
            underline: currentStyle.underline ? {} : undefined,
            color: currentStyle.color,
            font: "Cairo",
            size: currentStyle.size || 24,
          })
        );
      }
    } else if (child.nodeType === 1) {
      // ELEMENT_NODE
      const el = child as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (tag === "IMG") {
        // Skip inline img here, handled in block parser
        continue;
      }

      const newStyle: InlineStyle = {
        ...currentStyle,
        bold: currentStyle.bold || tag === "STRONG" || tag === "B",
        italic: currentStyle.italic || tag === "EM" || tag === "I",
        underline: currentStyle.underline || tag === "U",
        color: tag === "A" ? "00AEEF" : currentStyle.color,
      };

      runs.push(...parseInlineNodes(el, newStyle));
    }
  }

  return runs;
}

async function parseHtmlBody(body: HTMLElement): Promise<(Paragraph | Table)[]> {
  const elements: (Paragraph | Table)[] = [];

  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];
    if (node.nodeType === 1) {
      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (tag === "IMG") {
        const src = el.getAttribute("src") || (el as HTMLImageElement).src || "";
        if (src) {
          const img = await fetchImageForDocx(src);
          if (img) {
            elements.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: img.data,
                    transformation: {
                      width: img.width,
                      height: img.height,
                    },
                    type: img.type,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
              })
            );
          }
        }
      } else if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4") {
        const headingMap: Record<string, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
          H1: HeadingLevel.HEADING_1,
          H2: HeadingLevel.HEADING_2,
          H3: HeadingLevel.HEADING_3,
          H4: HeadingLevel.HEADING_4,
        };
        const sizeMap: Record<string, number> = {
          H1: 32,
          H2: 28,
          H3: 26,
          H4: 24,
        };
        const runs = parseInlineNodes(el, { bold: true, size: sizeMap[tag] || 28 });
        if (runs.length > 0) {
          elements.push(
            new Paragraph({
              heading: headingMap[tag] || HeadingLevel.HEADING_2,
              children: runs,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 240, after: 120 },
            })
          );
        }
      } else if (tag === "P") {
        // If paragraph contains <img>, extract both text and image
        const imgEl = el.querySelector("img");
        if (imgEl) {
          for (let c = 0; c < el.childNodes.length; c++) {
            const childNode = el.childNodes[c];
            if (
              childNode.nodeType === 1 &&
              (childNode as HTMLElement).tagName.toUpperCase() === "IMG"
            ) {
              const src =
                (childNode as HTMLElement).getAttribute("src") ||
                (childNode as HTMLImageElement).src ||
                "";
              if (src) {
                const img = await fetchImageForDocx(src);
                if (img) {
                  elements.push(
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: img.data,
                          transformation: {
                            width: img.width,
                            height: img.height,
                          },
                          type: img.type,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 200 },
                    })
                  );
                }
              }
            } else {
              const runs = parseInlineNodes(childNode);
              if (runs.length > 0) {
                elements.push(
                  new Paragraph({
                    children: runs,
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 120 },
                  })
                );
              }
            }
          }
        } else {
          const runs = parseInlineNodes(el);
          if (runs.length > 0) {
            elements.push(
              new Paragraph({
                children: runs,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
              })
            );
          }
        }
      } else if (tag === "UL" || tag === "OL") {
        const isOl = tag === "OL";
        let itemIndex = 1;
        for (let j = 0; j < el.children.length; j++) {
          const li = el.children[j];
          if (li.tagName.toUpperCase() === "LI") {
            const runs = parseInlineNodes(li);
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: isOl ? `${itemIndex}. ` : "• ",
                    font: "Cairo",
                    bold: true,
                    color: "E4007C",
                    size: 24,
                  }),
                  ...runs,
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 80 },
                indent: { right: 360 },
              })
            );
            itemIndex++;
          }
        }
      } else if (tag === "TABLE") {
        const trs = el.querySelectorAll("tr");
        if (trs.length > 0) {
          const rows: TableRow[] = [];
          for (let r = 0; r < trs.length; r++) {
            const tr = trs[r];
            const cells: TableCell[] = [];
            const thsOrTds = tr.querySelectorAll("th, td");
            const colCount = thsOrTds.length || 1;

            for (let c = 0; c < thsOrTds.length; c++) {
              const cell = thsOrTds[c];
              const isTh = cell.tagName.toUpperCase() === "TH";
              const cellRuns = parseInlineNodes(cell, isTh ? { bold: true } : {});
              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: cellRuns.length > 0 ? cellRuns : [new TextRun("")],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 80, after: 80 },
                    }),
                  ],
                  width: { size: Math.floor(100 / colCount), type: WidthType.PERCENTAGE },
                  shading: isTh ? { fill: "F1F5F9" } : undefined,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
                  },
                })
              );
            }

            rows.push(new TableRow({ children: cells }));
          }

          elements.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
      } else if (tag === "BLOCKQUOTE") {
        const runs = parseInlineNodes(el, { italic: true, color: "4A5568" });
        if (runs.length > 0) {
          elements.push(
            new Paragraph({
              children: runs,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 120, after: 120 },
              indent: { right: 720 },
            })
          );
        }
      } else {
        const runs = parseInlineNodes(el);
        if (runs.length > 0) {
          elements.push(
            new Paragraph({
              children: runs,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 },
            })
          );
        }
      }
    }
  }

  return elements;
}

async function parseHtmlFallback(htmlString: string): Promise<(Paragraph | Table)[]> {
  if (!htmlString || typeof htmlString !== "string") return [];

  // Browser environment
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const result = await parseHtmlBody(doc.body);
      if (result.length > 0) return result;
    } catch (e) {
      console.warn("DOMParser failed:", e);
    }
  }

  // Regex fallback
  const clean = htmlString
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (text) =>
        new Paragraph({
          children: [new TextRun({ text, font: "Cairo", size: 24 })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
        })
    );
}

// ----------------------------------------------------------------------
// 3. Main Export Function
// ----------------------------------------------------------------------

export async function exportReportToWord(
  reports: Report[],
  specialization?: Specialization | null,
  periodLabel?: string
) {
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
            new TextRun({
              text: `التخصص: ${specialization.name}`,
              font: "Cairo",
              size: 22,
              color: "718096",
            }),
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
            text: `التاريخ: ${new Date(report.report_date).toLocaleDateString("ar-EG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`,
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

    // Report content resolution
    let contentParagraphs: (Paragraph | Table)[] = [];

    try {
      let contentJson: any = report.content;
      if (typeof contentJson === "string" && contentJson.trim().startsWith("{")) {
        try {
          contentJson = JSON.parse(contentJson);
        } catch {
          contentJson = null;
        }
      }

      if (contentJson && typeof contentJson === "object" && contentJson.type === "doc") {
        const contentNodes = contentJson.content || [];
        for (const node of contentNodes) {
          const parsed = await parseNode(node);
          contentParagraphs.push(...parsed);
        }
      }
    } catch (e) {
      console.warn("Could not parse Tiptap JSON:", e);
    }

    // Fallback to HTML if JSON didn't produce content
    if (contentParagraphs.length === 0 && report.content_html && report.content_html.trim()) {
      contentParagraphs = await parseHtmlFallback(report.content_html);
    }

    // Fallback if still empty
    if (contentParagraphs.length === 0) {
      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "لا يوجد محتوى في هذا التقرير.",
              font: "Cairo",
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
        })
      );
    }

    children.push(...contentParagraphs);

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
                      ? new TextRun({
                          text: ` | ${periodLabel}`,
                          font: "Cairo",
                          size: 20,
                          color: "00AEEF",
                        })
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
  const filename =
    reports.length === 1
      ? `${reports[0].title}.docx`
      : `تقارير-بورتو${periodLabel ? `-${periodLabel}` : ""}.docx`;
  saveAs(blob, filename);
}
