'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metricName = entry.name;
        const entryValue = 'value' in entry ? (entry as { value: number }).value : 0;
        const value = Math.round(entry.startTime || entryValue);
        
        // Send to Google Analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', metricName, {
            event_category: 'Web Vitals',
            value: value,
            non_interaction: true,
          });
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`${metricName}: ${value}`);
        }
      }
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      // Fallback for browsers that don't support all entry types
      console.warn('Performance Observer not fully supported', error);
    }

    // Measure First Input Delay (FID)
    const measureFID = () => {
      let fidEntry: PerformanceEventTiming | null = null;
      
      const firstInputObserver = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0] as PerformanceEventTiming;
        if (firstInput && !fidEntry) {
          fidEntry = firstInput;
          const fid = firstInput.processingStart - firstInput.startTime;
          
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'FID', {
              event_category: 'Web Vitals',
              value: Math.round(fid),
              non_interaction: true,
            });
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`FID: ${Math.round(fid)}`);
          }
        }
      });

      try {
        firstInputObserver.observe({ type: 'first-input', buffered: true });
      } catch (error) {
        console.warn('FID measurement not supported', error);
      }
    };

    measureFID();

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
