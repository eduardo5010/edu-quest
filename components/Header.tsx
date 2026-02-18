
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: User | null;
  customLogo: string | null;
  onNavigateHome: () => void;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  onNavigateToCommunity: () => void;
  onNavigateToWallet: () => void;
  onNavigateToStudyPlanner: () => void;
  onNavigateToEducatorDashboard: () => void;
  onNavigateToMockTests: () => void;
}

const LevelIndicator: React.FC<{ level: number, xp: number }> = ({ level, xp }) => {
  const currentLevelXp = (level) * 150;
  const nextLevelXp = (level + 1) * 150;
  const xpIntoLevel = xp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercentage = Math.max(0, Math.min(100, (xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm font-bold text-cyan-400">Lvl {level}</div>
      <div className="w-24 bg-slate-700 rounded-full h-2.5">
        <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ user, customLogo, onNavigateHome, onLogout, onNavigateToProfile, onNavigateToCommunity, onNavigateToWallet, onNavigateToStudyPlanner, onNavigateToEducatorDashboard, onNavigateToMockTests }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={onNavigateHome} className="flex items-center space-x-2" disabled={!user}>
              {customLogo ? (
                <img src={customLogo} alt="EduQuest Logo" className="h-10 w-10 rounded-xl shadow-sm object-cover" />
              ) : (
                <Logo className="h-10 w-10 text-indigo-500" />
              )}
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">EduQuest</h1>
            </button>
             <nav className="hidden md:flex space-x-6">
                 <button onClick={onNavigateHome} disabled={!user} className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Dashboard</button>
                 <button onClick={onNavigateToStudyPlanner} disabled={!user} className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Planner</button>
                 <button onClick={onNavigateToMockTests} disabled={!user} className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Simulados</button>
                 <button onClick={onNavigateToCommunity} disabled={!user} className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Community</button>
                 {user?.roles.includes('teacher') && (
                    <button onClick={onNavigateToEducatorDashboard} className="font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Educator Panel</button>
                 )}
             </nav>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <button onClick={onNavigateToWallet} className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <span className="text-yellow-400">💰</span>
                  <span className="font-bold text-sm">{user.wallet.globalCredits}</span>
              </button>
              <div className="hidden sm:flex items-center space-x-2"><span title={`${user.streak} day streak`} className="text-orange-400 font-bold text-lg">{user.streak} 🔥</span></div>
              <LevelIndicator level={user.level} xp={user.xp} />
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}><img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} /></button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg py-1 z-50">
                    <button onClick={() => { onNavigateToProfile(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">Profile</button>
                    <button onClick={() => { onNavigateToWallet(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">My Wallet</button>
                    <button onClick={() => { onNavigateToStudyPlanner(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">Study Planner</button>
                    <button onClick={() => { onNavigateToMockTests(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">Simulados</button>
                     {user?.roles.includes('teacher') && (
                        <button onClick={() => { onNavigateToEducatorDashboard(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">Educator Panel</button>
                     )}
                    <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 w-full text-left">Logout</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
