import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
}

const NAV_ITEMS = [
  { view: 'home', label: 'Home', icon: 'home' },
  { view: 'games', label: 'Games', icon: 'joystick' },
  { view: 'aistudio', label: 'AI Studio', icon: 'auto_awesome' },
  { view: 'family', label: 'Family', icon: 'groups' },
  { view: 'profile', label: 'Profile', icon: 'person' },
] as const;


// FIX: Define props with an interface and use React.FC to correctly type the component and handle React-specific props like `key`.
interface NavItemProps {
    icon: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-1/5 transition-colors duration-200 ${isActive ? 'text-coral-500' : 'text-gray-500'}`}>
        <div className={`flex items-center justify-center size-10 rounded-full ${isActive ? 'bg-coral-100' : ''}`}>
            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{icon}</span>
        </div>
        <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
);


const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-light-cream">
        <main className="flex-grow">
            {['family', 'aistudio'].includes(activeView) ? children : <div className="p-4 sm:p-6">{children}</div>}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-transparent pb-4 px-4">
            <div className="flex justify-around items-center h-20 bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl shadow-gray-300/20">
                {NAV_ITEMS.map(item => (
                    <NavItem 
                        key={item.view}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.view}
                        onClick={() => onNavigate(item.view)}
                    />
                ))}
            </div>
        </nav>
    </div>
  );
};

export default Layout;