import React from 'react';
import { FileText, Settings, Upload, RotateCcw, Sparkles } from 'lucide-react';

const Header = ({ currentView, onViewChange, onReset, hasData }) => {
  const navItems = [
    { id: 'import', label: 'Import', icon: Upload, disabled: false },
    { id: 'builder', label: 'Builder', icon: Settings, disabled: !hasData },
    // { id: 'preview', label: 'Preview', icon: Eye, disabled: !hasData }, // Hidden for now
  ];

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Premium Design */}
          <button
            onClick={() => onViewChange('import')}
            className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105"
            title="Go to home page"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gradient leading-none">Form Builder</h1>
              <span className="text-xs text-gray-500 font-medium">Professional Edition</span>
            </div>
          </button>

          {/* Navigation - Modern Tabs */}
          <nav className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-1.5 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isDisabled = item.disabled;

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && onViewChange(item.id)}
                  disabled={isDisabled}
                  className={`
                    relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300
                    ${isActive
                      ? 'text-white shadow-lg'
                      : isDisabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/80'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl animate-bounce-in"></div>
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <Sparkles className="w-3 h-3 relative z-10 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {hasData && (
              <button
                onClick={onReset}
                className="group flex items-center space-x-2 text-gray-600 hover:text-rose-600 px-4 py-2.5 rounded-xl hover:bg-white/80 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                title="Start over"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;