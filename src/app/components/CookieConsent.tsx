'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  CONSENT_STORAGE_KEY,
  CONSENT_WITHDRAW_EVENT,
  type ConsentChoice,
} from '../lib/consent';
import { getLocaleFromPath } from '@/i18n/routing';
import { cookieConsentContent } from '@/i18n/chrome/cookie-consent';

/**
 * Denies analytics and removes the `_ga`/`_ga_*` cookies a granted consent left
 * behind. The expiry loop lives in the head bootstrap, which exposes it as a
 * global because an inline script cannot import this module; the optional call
 * keeps a blocked head script from turning a click into a script error.
 */
function denyAnalytics() {
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  window.__ijacExpireAnalyticsCookies?.();
}

function forgetStoredChoice() {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem(`${CONSENT_STORAGE_KEY}-date`);
  } catch {
    // Blocked storage keeps whatever could not be removed, and analytics stays
    // denied either way.
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // A withdrawal is an explicit request, so it overrides the legal-page
  // suppression; a first visit there still shows nothing.
  const [requested, setRequested] = useState(false);
  const pathname = usePathname();
  const copy = cookieConsentContent[getLocaleFromPath(pathname)];

  // Derived during render rather than pushed into state by an effect,
  // so navigating to a legal page hides the banner without a state update.
  const isLegalPage = pathname === '/terminos-y-condiciones' ||
                      pathname === '/politica-de-privacidad';
  const isSuppressed = isLegalPage && !requested;

  useEffect(() => {
    if (isLegalPage) return;

    // Check if user has already given consent. Unreadable storage means no
    // remembered choice: show the banner and let analytics stay denied,
    // instead of letting the throw unmount the tree mid-render.
    try {
      if (localStorage.getItem(CONSENT_STORAGE_KEY)) return;
    } catch {
      // Fall through and ask again.
    }

    // Delay showing banner slightly for better UX
    const timer = setTimeout(() => {
      setShowBanner(true);
      setIsVisible(true);
    }, 1000);

    // Without this, a banner scheduled before navigation still fires on a legal page.
    return () => clearTimeout(timer);
  }, [isLegalPage]);

  /**
   * The footer control withdraws through this event rather than through a
   * shared parent: both components are client components under a server
   * component, and the banner is always mounted, so its listener is always
   * there. Withdrawing ends where a first visit starts — no stored choice,
   * analytics denied, banner asking again.
   */
  useEffect(() => {
    const withdraw = () => {
      // Deny before expiring: a hit processed while storage is still granted
      // would write the cookies straight back.
      denyAnalytics();
      forgetStoredChoice();
      setRequested(true);
      setShowBanner(true);
      setIsVisible(true);
    };

    window.addEventListener(CONSENT_WITHDRAW_EVENT, withdraw);
    return () => window.removeEventListener(CONSENT_WITHDRAW_EVENT, withdraw);
  }, []);

  /**
   * Persists the choice before applying it. If storage is blocked nothing is
   * remembered, so the next page load starts denied again; granting analytics
   * for a choice we could not store would be a consent the visitor cannot undo.
   */
  const applyChoice = (choice: ConsentChoice) => {
    let persisted = false;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
      localStorage.setItem(`${CONSENT_STORAGE_KEY}-date`, new Date().toISOString());
      persisted = true;
    } catch {
      // Analytics stays denied below.
    }

    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);

    const granted = persisted && choice === CONSENT_ACCEPTED;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': granted ? 'granted' : 'denied'
      });
    }

    // Rejecting must undo what an earlier acceptance wrote, not just stop new
    // writes; the expiry runs after the deny so nothing recreates the cookies.
    if (!granted) window.__ijacExpireAnalyticsCookies?.();
  };

  const acceptCookies = () => applyChoice(CONSENT_ACCEPTED);
  const rejectCookies = () => applyChoice(CONSENT_REJECTED);

  if (isSuppressed || !showBanner) return null;

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
                      {copy.heading}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                      {copy.bodyIntro}{' '}
                      <a 
                        href="/terminos-y-condiciones" 
                        title={copy.termsTitle}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {copy.termsLabel}
                      </a>{' '}
                      {copy.bodyJoin}{' '}
                      <a 
                        href="/politica-de-privacidad" 
                        title={copy.privacyTitle}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {copy.privacyLabel}
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
                    {copy.rejectLabel}
                  </button>
                  <button
                    onClick={acceptCookies}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    {copy.acceptLabel}
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
