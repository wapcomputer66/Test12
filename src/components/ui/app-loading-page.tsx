'use client';

import { useEffect, useState } from 'react';
import { Loader2, Sparkles, Zap, CheckCircle2, Database, Shield, Cloud } from 'lucide-react';

interface AppLoadingPageProps {
  onComplete?: () => void;
  isLoading?: boolean;
}

export default function AppLoadingPage({ onComplete, isLoading = true }: AppLoadingPageProps) {
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const loadingStages = [
    { icon: Database, text: 'डेटाबेस कनेक्ट हो रहा है', subText: 'सुरक्षित कनेक्शन स्थापित कर रहे हैं' },
    { icon: Shield, text: 'उपयोगकर्ता प्रमाणीकरण', subText: 'आपकी सुरक्षा जांच चल रही है' },
    { icon: Cloud, text: 'डेटा लोड हो रहा है', subText: 'नवीनतम जानकारी ला रहे हैं' },
    { icon: Database, text: 'प्रोजेक्ट लोड हो रहे हैं', subText: 'आपके सभी प्रोजेक्ट तैयार हो रहे हैं' },
    { icon: CheckCircle2, text: 'लगभग तैयार', subText: 'अंतिम सेटअप पूरा हो रहा है' }
  ];

  useEffect(() => {
    if (!isLoading) {
      setShowComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 1500);
      return;
    }

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => {
        if (prev >= loadingStages.length - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, onComplete]);

  const CurrentIcon = loadingStages[loadingStage]?.icon || Database;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto p-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/20 p-8 md:p-12">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  {showComplete ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <CurrentIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                {!showComplete && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {showComplete ? 'एप्लिकेशन तैयार है' : 'भूमि रिकॉर्ड सिस्टम'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {showComplete ? 'आप सुरु कर सकते हैं' : 'लोड हो रहा है...'}
                </p>
              </div>
            </div>
          </div>

          {/* Main loading animation */}
          <div className="flex flex-col items-center justify-center py-8 space-y-8">
            {!showComplete ? (
              <>
                {/* Central loading animation */}
                <div className="relative">
                  {/* Outer glowing ring */}
                  <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  
                  {/* Rotating rings */}
                  <div className="relative w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin">
                    <div className="absolute inset-0 border-4 border-transparent border-b-pink-500 border-l-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  
                  <div className="absolute top-3 left-3 w-18 h-18 border-3 border-transparent border-t-purple-500 border-r-pink-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}>
                    <div className="absolute inset-0 border-3 border-transparent border-b-indigo-500 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                  </div>
                  
                  {/* Center core */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                  </div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-3 -left-3 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '2s' }}>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="absolute -top-3 -right-3 animate-bounce" style={{ animationDelay: '500ms', animationDuration: '2s' }}>
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 animate-bounce" style={{ animationDelay: '1000ms', animationDuration: '2s' }}>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 animate-bounce" style={{ animationDelay: '1500ms', animationDuration: '2s' }}>
                    <Zap className="w-5 h-5 text-pink-400" />
                  </div>
                </div>

                {/* Loading stages */}
                <div className="w-full max-w-md space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                      {loadingStages[loadingStage]?.text}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse" style={{ animationDelay: '200ms' }}>
                      {loadingStages[loadingStage]?.subText}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    >
                      <div className="h-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Progress dots */}
                  <div className="flex justify-center space-x-2">
                    {loadingStages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index <= loadingStage 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                            : 'bg-gray-300 dark:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Complete state */
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                    सब कुछ तैयार है!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    एप्लिकेशन सफलतापूर्वक लोड हो गया है
                  </p>
                </div>

                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span>संस्करण 1.0.0</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>सुरक्षित कनेक्शन</span>
                <span>•</span>
                <span>एन्क्रिप्टेड डेटा</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}