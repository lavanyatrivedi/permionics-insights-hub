import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { OsmosChat } from "../OsmosChat";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto print-full">
        {children}
      </main>
      {/* OSMOS floating chat — top right, available on every page */}
      <OsmosChat />
    </div>
  );
}
