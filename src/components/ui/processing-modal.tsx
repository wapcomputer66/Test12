'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Sparkles, Zap } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  message: string;
  subMessage?: string;
}

export default function ProcessingModal({ isOpen, message, subMessage }: ProcessingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 ml-0 mr-6 pl-0 pr-6 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-8 sm:py-10 space-y-6 sm:space-y-8 relative overflow-hidden">
          {/* Background animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Main animated loader container */}
          <div className="relative z-10">
            {/* Outer glowing ring */}
            <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            
            {/* Rotating outer ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin shadow-lg">
              <div className="absolute inset-0 border-4 border-transparent border-b-pink-500 border-l-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            
            {/* Middle rotating ring */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-16 h-16 sm:w-18 sm:h-18 border-3 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}>
              <div className="absolute inset-0 border-3 border-transparent border-b-indigo-500 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
            </div>
            
            {/* Inner pulsing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-30"></div>
              </div>
            </div>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -left-2 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2s' }}>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '500ms', animationDuration: '2s' }}>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce" style={{ animationDelay: '1000ms', animationDuration: '2s' }}>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 animate-bounce" style={{ animationDelay: '1500ms', animationDuration: '2s' }}>
              <Zap className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          
          {/* Messages with gradient text */}
          <div className="text-center space-y-3 sm:space-y-4 px-6 z-10">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              {message}
            </h3>
            {subMessage && (
              <p className="text-sm sm:text-base text-gray-600 max-w-xs animate-pulse" style={{ animationDelay: '200ms' }}>
                {subMessage}
              </p>
            )}
          </div>
          
          {/* Enhanced progress dots */}
          <div className="flex items-center space-x-3 z-10">
            <div className="flex space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '300ms' }}></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '600ms' }}></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '900ms' }}></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}