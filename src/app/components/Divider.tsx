"use client"
import React from 'react'

function Divider() {
  return (
    <section>
          {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-shift"></div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
          }
          8.33% {
            background: linear-gradient(to right, #4f46e5, #a855f7, #f472b6);
          }
          16.66% {
            background: linear-gradient(to right, #8b5cf6, #ec4899, #f59e0b);
          }
          25% {
            background: linear-gradient(to right, #a855f7, #f472b6, #fb923c);
          }
          33.33% {
            background: linear-gradient(to right, #ec4899, #f59e0b, #10b981);
          }
          41.66% {
            background: linear-gradient(to right, #f472b6, #fbbf24, #34d399);
          }
          50% {
            background: linear-gradient(to right, #f59e0b, #10b981, #06b6d4);
          }
          58.33% {
            background: linear-gradient(to right, #fbbf24, #34d399, #22d3ee);
          }
          66.66% {
            background: linear-gradient(to right, #10b981, #06b6d4, #6366f1);
          }
          75% {
            background: linear-gradient(to right, #34d399, #22d3ee, #818cf8);
          }
          83.33% {
            background: linear-gradient(to right, #06b6d4, #6366f1, #3b82f6);
          }
          91.66% {
            background: linear-gradient(to right, #22d3ee, #818cf8, #4f46e5);
          }
          100% {
            background: linear-gradient(to right, #6366f1, #3b82f6, #8b5cf6);
          }
        }
        .animate-gradient-shift {
          animation: gradient-shift 30s ease-in-out infinite;
          background-size: 200% 100%;
        }
      `}</style>
    </section>
  )
}

export default Divider