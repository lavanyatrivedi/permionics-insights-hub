import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { OsmosChat } from "../OsmosChat";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto print-full">
        {children}
      </main>
      {/* OSMOS floating chat — visible only on dashboard */}
      {location === "/" && <OsmosChat />}
    </div>
  );
}
