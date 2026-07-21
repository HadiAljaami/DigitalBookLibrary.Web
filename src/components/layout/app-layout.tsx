import { Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, useSidebar } from "@/providers/sidebar-provider";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * App shell: the sidebar and topbar stay fixed; only the <main> area scrolls.
 * The whole viewport is locked to screen height so the page never scrolls as a whole.
 */
function LayoutShell() {
  const { setMobileOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={200}>
        <LayoutShell />
      </TooltipProvider>
    </SidebarProvider>
  );
}
