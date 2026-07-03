import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Check, Download, } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import jsPDF from "jspdf";
import { useLang } from "@/lib/LanguageContext";

export default function GroceryList({ recipe }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState({});
  const { t } = useLang();

  if (!recipe?.ingredients?.length) return null;

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = recipe.ingredients.length;

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 18;
    let y = margin;

    // Header
    doc.setFillColor(100, 70, 50);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${t.groceryList} — ${recipe.name}`, margin, 14);
    y = 34;

    doc.setTextColor(60, 40, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (recipe.servings) {
      doc.text(`${t.servingsLabel}: ${recipe.servings}`, margin, y);
      y += 8;
    }

    // Divider
    doc.setDrawColor(200, 180, 160);
    doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
    y += 8;

    // Ingredients table
    const contentW = doc.internal.pageSize.getWidth() - margin * 2;
    const col1W = 55;

    doc.setFillColor(240, 230, 218);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 60, 40);
    doc.text(t.qtyAmount, margin + 2, y);
    doc.text(t.ingredientLabel, margin + col1W + 2, y);
    y += 6;

    recipe.ingredients.forEach((ing, i) => {
      if (y + 8 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      if (i % 2 === 0) {
        doc.setFillColor(252, 248, 244);
        doc.rect(margin, y - 4, contentW, 8, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 50, 40);
      doc.setFontSize(9.5);

      // checkbox square
      doc.setDrawColor(150, 130, 110);
      doc.rect(margin + 2, y - 3, 4, 4);

      doc.text(ing.amount || "—", margin + 10, y);
      doc.text(ing.name || "", margin + col1W + 2, y);
      doc.setDrawColor(230, 220, 210);
      doc.line(margin, y + 3, margin + contentW, y + 3);
      y += 8;
    });

    // Footer note
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(130, 110, 90);
    doc.setFont("helvetica", "italic");
    doc.text(`${t.generatedFromSavora} — ${recipe.name}`, margin, y);

    doc.save(`${t.groceryListFilePrefix}_${recipe.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 no-select"
      >
        <ShoppingCart className="w-4 h-4" />
        {t.groceryList}
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="flex items-center justify-between pr-4">
            <DrawerTitle className="font-heading flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              {t.groceryList}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="no-select"><X className="w-4 h-4" /></Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{recipe.name}</p>
                <p className="text-xs text-muted-foreground">{checkedCount}/{total} {t.itemsChecked}</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2 no-select">
                <Download className="w-4 h-4" /> {t.pdf}
              </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-accent rounded-full h-1.5 transition-all duration-300"
                style={{ width: `${total ? (checkedCount / total) * 100 : 0}%` }}
              />
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {recipe.ingredients.map((ing, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left no-select ${
                    checked[i]
                      ? "bg-accent/10 border-accent/30 opacity-60"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked[i] ? "bg-accent border-accent" : "border-border"
                  }`}>
                    {checked[i] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`font-medium text-sm w-20 shrink-0 ${checked[i] ? "line-through text-muted-foreground" : ""}`}>
                    {ing.amount || "—"}
                  </span>
                  <span className={`text-sm flex-1 ${checked[i] ? "line-through text-muted-foreground" : ""}`}>
                    {ing.name}
                  </span>
                </button>
              ))}
            </div>

            {checkedCount === total && total > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 bg-accent/10 rounded-xl text-accent text-sm font-medium">
                <Check className="w-4 h-4" /> {t.allItemsCollected}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setChecked({})}
              className="w-full no-select text-muted-foreground"
            >
              {t.resetAll}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}