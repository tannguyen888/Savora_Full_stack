import { Link, useLocation } from "react-router-dom";
import { UtensilsCrossed, CalendarDays, Settings } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLang();

  const tabs = [
    { path: "/", label: t.recipes, icon: UtensilsCrossed },
    { path: "/meal-plan", label: t.mealPlan, icon: CalendarDays },
    { path: "/settings", label: t.settings, icon: Settings },
  ];

  const showOnPaths = ["/", "/meal-plan", "/settings"];
  if (!showOnPaths.includes(location.pathname)) return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-bottom-nav no-select">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}