
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus, CalendarDays, UtensilsCrossed, Settings2Icon } from "lucide-react";
import { savouraClient } from "@/api/savouraClient";
import { useLang } from "@/lib/LanguageContext";


export default function AppHeader() {
  const location = useLocation();
  const { t } = useLang();
  const token = typeof window !== "undefined" ? localStorage.getItem("savora_token") : null;
  const { data: currentUser } = useQuery({
    queryKey: ["me", token],
    queryFn: () => savouraClient.auth.me(),
    enabled: Boolean(token),
    retry: false,
  });

  const displayName = currentUser?.fullName || currentUser?.full_name || currentUser?.name || currentUser?.email;

  const navItems = [
    { path: "/", label: t.recipes, icon: UtensilsCrossed },
    { path: "/meal-plan", label: t.mealPlan, icon: CalendarDays },
    { path: "/community", label: t.community, icon: ChefHat },
    { path: "/settings", label: t.settings, icon: Settings2Icon }
  ];


  return (
    <header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2.5 no-select">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Savora</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-2 no-select ${isActive ? "font-medium" : "text-muted-foreground"}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
      
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/recipe/new">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-sm no-select">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t.addRecipe}</span>
              </Button>
            </Link>
            <Link to={displayName ? "/settings" : "/login"}>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-sm no-select">
                <span className="hidden sm:inline">{displayName || "Login"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
      

