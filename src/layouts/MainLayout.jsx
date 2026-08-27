import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { SidebarProvider } from '../contexts/SidebarContext';

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="noise-overlay relative min-h-screen bg-bg-primary text-text-primary flex overflow-hidden">

        {/* Subtle ambient radial gradient (replaces heavy blob orbs) */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-500/[0.04] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-accent-600/[0.03] rounded-full blur-[120px]" />
        </div>

        {/* Mobile top header (hamburger + logo) */}
        <MobileHeader />

        {/* Sidebar (desktop fixed | mobile drawer) */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 md:ml-[280px] relative z-10 pt-14 md:pt-0">
          <div className="max-w-[640px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <Outlet />
          </div>
        </main>

      </div>
    </SidebarProvider>
  );
};
