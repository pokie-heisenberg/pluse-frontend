import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { SidebarProvider } from '../contexts/SidebarContext';

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-[#030303] text-white flex overflow-hidden">

        {/* Ambient Animated Background Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        {/* Mobile top header (hamburger + logo) */}
        <MobileHeader />

        {/* Sidebar (desktop fixed | mobile drawer) */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 md:ml-64 relative z-10 pt-14 md:pt-0">
          <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-6 md:py-8">
            <Outlet />
          </div>
        </main>

      </div>
    </SidebarProvider>
  );
};
