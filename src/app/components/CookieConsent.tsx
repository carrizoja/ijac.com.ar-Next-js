'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show banner on legal pages
    const isLegalPage = pathname === '/terminos-y-condiciones' || 
                       pathname === '/politica-de-privacidad';
    
    if (isLegalPage) {
      // Ensure banner is hidden on legal pages
      setShowBanner(false);
      setIsVisible(false);
      return;
    }

    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => {
        setShowBanner(true);
        setIsVisible(true);
      }, 1000);
    }
  }, [pathname]);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);

    // Enable Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);

    // Disable Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />

          {/* Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
          >
            <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 md:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      🍪 Uso de Cookies
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                      Este sitio web utiliza cookies propias y de terceros para mejorar su experiencia de navegación, 
                      analizar el tráfico del sitio y personalizar el contenido. Al continuar navegando, acepta nuestros{' '}
                      <a 
                        href="/terminos-y-condiciones" 
                        title="Ver Términos y Condiciones"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Términos y Condiciones
                      </a>{' '}
                      y nuestra{' '}
                      <a 
                        href="/politica-de-privacidad" 
                        title="Ver Política de Privacidad"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Política de Privacidad
                      </a>.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={rejectCookies}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={acceptCookies}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Aceptar Cookies
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
