import { useLocation } from "wouter";
import { Home, Dog, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NavigationProps {
  onNavigate?: (path: string) => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("nav.home"), href: "/" },
    { icon: Dog, label: t("nav.pets"), href: "/pets" },
    { icon: Calendar, label: t("nav.calendar"), href: "/calendar" },
    { icon: Settings, label: t("nav.settings"), href: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate ? onNavigate(item.href) : undefined}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl gap-1 transition-all duration-300",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              data-testid={`nav-${item.href.replace("/", "") || "home"}`}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
