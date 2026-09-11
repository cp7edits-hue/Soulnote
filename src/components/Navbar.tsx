import React from 'react';
import { NavigationTab } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Home,
  Clock3,
  BarChart2,
  BookOpen,
  Settings as SettingsIcon,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { Haptics } from '../services/haptics';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCheckIn: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCheckIn,
  isDark = false,
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'timeline' as NavigationTab, label: 'Timeline', icon: Clock3 },
    { id: 'trends' as NavigationTab, label: 'Trends', icon: BarChart2 },
    { id: 'reflection' as NavigationTab, label: 'Reflect', icon: BookOpen },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (tab: NavigationTab) => {
    Haptics.selection();
    onSelectTab(tab);
  };

  const handleCheckInClick = () => {
    Haptics.success();
    onOpenCheckIn();
  };

  return (
    <>
      {/* Desktop / Tablet Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#FBFBFA]/90 dark:bg-[#121211]/90 backdrop-blur-md border-b border-[#EAE8E1] dark:border-[#22221F]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3 cursor-pointer group text-left min-h-[44px]"
          >
            <BrandLogo size={28} className="text-[#1E1E1C] dark:text-[#EDEDEB]" />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
                SoulNote
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-[#F0EEE8] dark:bg-[#1A1A18] p-1 rounded-full border border-[#E4E2D8] dark:border-[#282824]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`desktop-nav-${tab.id}`}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px] ${
                    isActive
                      ? 'bg-white dark:bg-[#2A2A26] text-[#1E1E1C] dark:text-[#EDEDEB] shadow-xs font-semibold'
                      : 'text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <PWAInstallButton className="hidden sm:inline-flex" />

            {/* Dark Mode Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                id="navbar-theme-toggle-desktop"
                onClick={() => {
                  Haptics.selection();
                  onToggleTheme();
                }}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#55534D] hover:text-[#1E1E1C] dark:text-[#A8A69E] dark:hover:text-[#EDEDEB] hover:bg-[#EFECE5] dark:hover:bg-[#22221F] transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-700 stroke-[2]" />
                )}
              </button>
            )}

            <button
              type="button"
              id="desktop-checkin-btn"
              onClick={handleCheckInClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1E1C] hover:bg-[#32322E] dark:bg-[#EDEDEB] dark:hover:bg-[#FFFFFF] text-[#FBFBFA] dark:text-[#121211] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98 min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Check In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Subtle App Bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FBFBFA]/90 dark:bg-[#121211]/90 backdrop-blur-md border-b border-[#EAE8E1] dark:border-[#20201D] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={24} className="text-[#1E1E1C] dark:text-[#EDEDEB]" />
          <span className="font-serif text-base font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
            SoulNote
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              id="navbar-theme-toggle-mobile"
              onClick={() => {
                Haptics.selection();
                onToggleTheme();
              }}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#55534D] dark:text-[#A8A69E] hover:bg-[#EFECE5] dark:hover:bg-[#22221F] transition-colors cursor-pointer min-w-[44px] min-h-[44px]"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 stroke-[2]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCheckInClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] text-xs font-medium cursor-pointer shadow-xs active:scale-95 transition-all min-h-[44px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Check In</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBFBFA]/95 dark:bg-[#141412]/95 backdrop-blur-lg border-t border-[#EAE8E1] dark:border-[#22221F] px-2 py-1.5 pb-safe"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}`}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] ${
                  isActive
                    ? 'text-[#1E1E1C] dark:text-[#EDEDEB]'
                    : 'text-[#6F6D67] hover:text-[#1E1E1C] dark:text-[#9A9890] dark:hover:text-[#EDEDEB]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#EFECE5] dark:bg-[#252522]'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
