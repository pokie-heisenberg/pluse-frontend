import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white flex overflow-hidden">
      {/* Ambient Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <Sidebar />
      
      <main className="flex-1 md:ml-64 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
