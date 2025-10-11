import React from 'react';
import { FileText, Settings, Upload, RotateCcw } from 'lucide-react';

const Header = ({ currentView, onViewChange, onReset, hasData }) => {
  const navItems = [
    { id: 'import', label: 'Import', icon: Upload, disabled: false },
    { id: 'builder', label: 'Builder', icon: Settings, disabled: !hasData },
    // { id: 'preview', label: 'Preview', icon: Eye, disabled: !hasData }, // Hidden for now
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
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
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : isDisabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {hasData && (
              <button
                onClick={onReset}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Start over"
              >
                <RotateCcw className="w-4 h-4" />
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