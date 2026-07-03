import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, LogOut, User, ChevronRight, ShieldAlert, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLang, LANGUAGES } from "@/lib/LanguageContext";

export default function Settings() {
  const [deleting, setDeleting] = useState(false);
  const { t, lang, switchLang } = useLang();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    if (user?.id) await base44.entities.User.delete(user.id);
    base44.auth.logout("/login");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{t.settings}</h1>
        <p className="text-muted-foreground mt-1.5">{t.manageAccount}</p>
      </div>

      {/* Language */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            {t.language}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(LANGUAGES).map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => switchLang(code)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all no-select ${
                  lang === code
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted text-foreground"
                }`}
              >
                <span className="text-lg">{flag}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            {t.account}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {user && (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{user.full_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {(user.full_name || user.email || "?")[0].toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <Separator />
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-select"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-4 h-4" />
            {t.dangerZone}
          </CardTitle>
          <CardDescription>{t.deleteAccountWarning}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive no-select">
                <Trash2 className="w-4 h-4" />
                {t.deleteAccount}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t.deleteAccount}</AlertDialogTitle>
                <AlertDialogDescription>{t.deleteAccountWarning}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                  {deleting ? t.deleting : t.deleteAccount}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}