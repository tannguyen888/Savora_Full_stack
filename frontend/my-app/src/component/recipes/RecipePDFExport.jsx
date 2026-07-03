import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function RecipePDFExport({ recipe, t }) {
  const [loading, setLoading] = useState(false);

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildRecipeHtml = () => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const meta = [];
    if (recipe.category) meta.push(`${escapeHtml(recipe.category.toUpperCase())}`);
    if (totalTime) meta.push(`${totalTime} min`);
    if (recipe.prep_time) meta.push(`${escapeHtml(t.prep)}: ${recipe.prep_time} min`);
    if (recipe.cook_time) meta.push(`${escapeHtml(t.cook)}: ${recipe.cook_time} min`);
    if (recipe.servings) meta.push(`${recipe.servings} ${escapeHtml(t.servings)}`);

    const ingredients = (recipe.ingredients || [])
      .map(
        (ing) => `
          <tr>
            <td>${escapeHtml(ing?.amount || "-")}</td>
            <td>${escapeHtml(ing?.name || "")}</td>
          </tr>`,
      )
      .join("");

    const steps = (recipe.steps || [])
      .map(
        (step, idx) => `
          <li>
            <span class="step-index">${idx + 1}</span>
            <span class="step-text">${escapeHtml(step)}</span>
          </li>`,
      )
      .join("");

    const tags = recipe.tags?.length
      ? `<div class="tags">${recipe.tags.map((tag) => escapeHtml(tag)).join(" • ")}</div>`
      : "";

    return `
      <div class="pdf-root">
        <div class="header">${escapeHtml(recipe.name || "Recipe")}</div>
        ${meta.length ? `<div class="meta">${meta.join(" | ")}</div>` : ""}
        ${recipe.description ? `<p class="description">${escapeHtml(recipe.description)}</p>` : ""}

        ${(recipe.ingredients || []).length
          ? `
            <h2>${escapeHtml(t.ingredients)}</h2>
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(t.amountLabel)}</th>
                  <th>${escapeHtml(t.ingredientLabel)}</th>
                </tr>
              </thead>
              <tbody>${ingredients}</tbody>
            </table>
          `
          : ""}

        ${(recipe.steps || []).length
          ? `
            <h2>${escapeHtml(t.instructions)}</h2>
            <ol class="steps">${steps}</ol>
          `
          : ""}

        ${tags}
      </div>
    `;
  };

  const handleExport = async () => {
    setLoading(true);
    let container;
    try {
      container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "0";
      container.style.top = "0";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      container.style.zIndex = "-1";
      container.style.transform = "translateX(-200vw)";
      container.style.width = "794px";
      container.style.background = "#ffffff";
      container.style.padding = "36px";
      container.style.boxSizing = "border-box";
      container.style.color = "#2c2218";
      container.style.fontFamily = "'JetBrains Mono Variable', 'Segoe UI', Arial, sans-serif";
      container.innerHTML = `
        <style>
          .pdf-root .header { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #3e2d1f; }
          .pdf-root .meta { font-size: 14px; color: #6a5748; margin-bottom: 12px; }
          .pdf-root .description { font-size: 16px; color: #5b4a3c; line-height: 1.55; margin: 0 0 18px; }
          .pdf-root h2 { font-size: 22px; margin: 24px 0 10px; color: #3e2d1f; }
          .pdf-root table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 8px; }
          .pdf-root th { text-align: left; background: #f1e6da; padding: 8px; color: #4f3e30; }
          .pdf-root td { border-bottom: 1px solid #e8ddd2; padding: 8px; color: #3f352d; vertical-align: top; }
          .pdf-root .steps { list-style: none; padding: 0; margin: 0; }
          .pdf-root .steps li { display: flex; gap: 10px; margin: 0 0 10px; font-size: 15px; line-height: 1.5; }
          .pdf-root .step-index {
            width: 24px; min-width: 24px; height: 24px;
            border-radius: 999px; background: #6b4a33; color: #fff;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 12px; margin-top: 2px;
          }
          .pdf-root .step-text { flex: 1; color: #2d251f; white-space: pre-wrap; }
          .pdf-root .tags { margin-top: 18px; padding-top: 12px; border-top: 1px solid #d8c9ba; color: #7c6a5b; font-size: 13px; }
        </style>
        ${buildRecipeHtml()}
      `;

      document.body.appendChild(container);
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }

      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 12;
      const printableW = pageW - margin * 2;
      const printableH = pageH - margin * 2;
      const imgH = (canvas.height * printableW) / canvas.width;
      const imgData = canvas.toDataURL("image/png", 1.0);

      let heightLeft = imgH;
      let position = margin;
      doc.addImage(imgData, "PNG", margin, position, printableW, imgH, undefined, "FAST");
      heightLeft -= printableH;

      while (heightLeft > 0) {
        doc.addPage();
        position = margin - (imgH - heightLeft);
        doc.addImage(imgData, "PNG", margin, position, printableW, imgH, undefined, "FAST");
        heightLeft -= printableH;
      }

      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Savora  —  ${p} / ${totalPages}`, pageW / 2, pageH - 6, { align: "center" });
      }

      doc.save(`${(recipe.name || "recipe").replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);

      // Fallback export so the button never feels dead.
      const fallbackDoc = new jsPDF({ unit: "mm", format: "a4" });
      const margin = 18;
      let y = margin;
      const safeName = recipe.name || "Recipe";

      fallbackDoc.setFontSize(16);
      fallbackDoc.text(safeName, margin, y);
      y += 10;

      fallbackDoc.setFontSize(11);
      const body = [
        recipe.description,
        "",
        `${t.ingredients}:`,
        ...(recipe.ingredients || []).map((ing) => `- ${ing?.amount || ""} ${ing?.name || ""}`),
        "",
        `${t.instructions}:`,
        ...(recipe.steps || []).map((step, idx) => `${idx + 1}. ${step}`),
      ]
        .filter((line) => line !== undefined && line !== null)
        .join("\n")
        .replace(/\r/g, "");

      const lines = fallbackDoc.splitTextToSize(body || "No content", 170);
      fallbackDoc.text(lines, margin, y);
      fallbackDoc.save(`${safeName.replace(/\s+/g, "_")}.pdf`);
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2 no-select"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {t.exportPDF}
    </Button>
  );
}