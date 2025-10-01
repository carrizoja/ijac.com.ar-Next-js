import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="space-y-8">
          {/* 404 Number */}
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            404
          </h1>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Página no encontrada
            </h2>
            <p className="text-gray-400 text-lg">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ir al Inicio
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-300 mb-4">
              ¿Necesitas ayuda? Contáctanos:
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>📱 WhatsApp: +54 9 11 3086-2409</p>
              <p>📧 Email: jose.carrizo@ijac.com.ar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}