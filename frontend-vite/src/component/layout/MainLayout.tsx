import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../common/Button';
import { Sun, Moon, LogOut, Menu, X, Home, Mic, Briefcase } from 'lucide-react';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation(); 

  const menuItems = [
    { icon: <Home size={18} />, label: 'Home', path: '/' },
    { icon: <Mic size={18} />, label: 'MOC Sessions', path: '/moc-sessions' },
    { icon: <Briefcase size={18} />, label: 'Job Match', path: '/job-match' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      
      {/* --- Sidebar --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 h-screen sticky top-0 overflow-y-auto`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex-shrink-0"></div>
          {isSidebarOpen && <span className="ml-3 font-bold text-gray-900 dark:text-white tracking-tight">AI Interview</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link 
                key={item.label} 
                to={item.path} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="text-[13.5px] font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" icon={<LogOut size={18} />}>
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* --- Top Navbar --- */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <Button variant="ghost" size="sm" iconOnly icon={isSidebarOpen ? <X size={20} /> : <Menu size={20} />} onClick={() => setSidebarOpen(!isSidebarOpen)} />
          
          <div className="flex items-center gap-4">
            <Button 
              variant="secondary" 
              size="sm" 
              iconOnly 
              icon={theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} 
              onClick={toggleTheme} 
              className="rounded-full"
            />
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-blue-400 border-2 border-white dark:border-gray-800"></div>
          </div>
        </header>

        {/* --- Page Content --- */}
        <section className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </section>
      </main>
    </div>
  );
};