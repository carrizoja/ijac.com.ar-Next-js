'use client'

import Link from 'next/link';

export function BackButton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link 
        href="/"
        title="Ir al inicio"
        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium text-center"
      >
        Ir al Inicio
      </Link>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
      >
        Volver Atrás
      </button>
    </div>
  );
}
