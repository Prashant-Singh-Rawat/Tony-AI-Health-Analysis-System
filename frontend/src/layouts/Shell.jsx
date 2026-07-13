import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import CommandPalette from './CommandPalette';

export default function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Ctrl+K trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main body content area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${collapsed ? 'pl-20' : 'pl-64'}`}
      >
        <TopNav onCommandOpen={() => setPaletteOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Ctrl+K Search Overlay */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
