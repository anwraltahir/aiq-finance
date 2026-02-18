import React from 'react';
import { Wallet } from 'lucide-react';
import { AIQ_LOGO_WIDE } from '../constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center h-full">
          {/* Logo Section: Clicking navigates to root. Fills 90% of header height. */}
          <a href="/" className="flex items-center h-full">
            <img 
              src={AIQ_LOGO_WIDE} 
              alt="AIQ Logo" 
              className="h-[90%] w-auto object-contain"
            />
          </a>
        </div>
        
        <div className="flex items-center gap-2 text-aiq-purple">
          <Wallet className="w-6 h-6" />
          <span className="font-bold text-sm sm:text-base">الإدارة المالية</span>
        </div>
      </div>
    </header>
  );
};