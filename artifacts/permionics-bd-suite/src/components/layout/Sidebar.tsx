import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useLogout, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
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
  const [location, setLocation] = useLocation();
  const logout = useLogout();
  const { toast } = useToast();
  const { data: user } = useGetMe();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      },
      onError: () => {
        toast({ title: "Error logging out", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground print-hide">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-3">
          <img src={logoMark} alt="Permionics" className="h-8 w-8" />
          <span className="font-bold tracking-tight text-sidebar-foreground">BD Suite</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary pl-2" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
