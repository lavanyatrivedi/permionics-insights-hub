import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useLogout, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoMark from "@assets/permionics_P_exact_1783575144366.png";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/generator", label: "Generator", icon: FileText },
  { href: "/questionnaire", label: "Questionnaire", icon: ClipboardList },
  { href: "/assistant", label: "BD Assistant", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  const { data: user } = useGetMe();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => { setLocation("/login"); },
      onError: () => { toast({ title: "Error logging out", variant: "destructive" }); }
    });
  };

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);

  return (
    <div
      className={`sidebar-transition flex h-screen flex-col print-hide flex-shrink-0 ${
        expanded ? "w-56" : "w-[72px]"
      }`}
      style={{ background: "hsl(var(--sidebar))" }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <Link href="~/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.2), hsl(217 91% 60% / 0.05))", border: "1px solid hsl(217 91% 60% / 0.3)" }}>
              <img src={logoMark} alt="OSMOS" className="h-6 w-6 object-contain" />
            </div>
            <span
              className={`font-extrabold tracking-tight text-xl text-white transition-all duration-200 overflow-hidden whitespace-nowrap ${
                expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              OSMOS
            </span>
          </div>
        </Link>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: "hsl(var(--sidebar-foreground))" }}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-250 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return expanded ? (
            <Link
              key={item.href}
              href={`~${item.href}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
              style={active ? {
                background: "linear-gradient(90deg, hsl(217 91% 60% / 0.25), hsl(217 91% 60% / 0.08))",
                boxShadow: "inset 3px 0 0 hsl(217 91% 60%)",
                paddingLeft: "10px",
              } : {}}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ) : (
            <Tooltip key={item.href} delayDuration={200}>
              <TooltipTrigger asChild>
                <Link
                  href={`~${item.href}`}
                  className={`flex items-center justify-center w-full h-10 rounded-xl transition-all ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white hover:bg-white/8"
                  }`}
                  style={active ? {
                    background: "hsl(217 91% 60% / 0.2)",
                    boxShadow: "0 0 0 1px hsl(217 91% 60% / 0.4)",
                  } : {}}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-2 space-y-1" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        {expanded ? (
          <>
            {user && (
              <div className="px-3 py-2 rounded-xl mb-1" style={{ background: "hsl(var(--sidebar-accent))" }}>
                <p className="text-xs font-semibold text-white/80 truncate">
                  {(user as any)?.email ?? "Admin"}
                </p>
                <p className="text-[10px] text-white/40">Permionics BD Suite</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full h-10 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
