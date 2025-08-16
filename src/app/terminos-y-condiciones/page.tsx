import { Metadata } from 'next';
import { BackButton } from '../components/BackButton';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del sitio web de iJAC IT Solutions',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Términos y Condiciones
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Información General
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Estos términos y condiciones rigen el uso del sitio web de <strong>iJAC IT Solutions</strong> 
                (en adelante, &ldquo;la Empresa&rdquo;), ubicado en Almagro, Buenos Aires, Argentina.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Al acceder y utilizar este sitio web, usted acepta cumplir con estos términos y condiciones. 
                Si no está de acuerdo con alguno de estos términos, no debe utilizar este sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Servicios Ofrecidos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                iJAC IT Solutions ofrece servicios de consultoría informática, desarrollo web, 
                aplicaciones móviles y soluciones tecnológicas para empresas.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Desarrollo de aplicaciones web y móviles</li>
                <li>Consultoría en tecnologías de la información</li>
                <li>Soporte técnico especializado</li>
                <li>Soluciones de comercio electrónico</li>
                <li>Servicios de hosting y mantenimiento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Uso de Cookies
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Este sitio web utiliza cookies para mejorar la experiencia del usuario y analizar el tráfico web.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Tipos de cookies que utilizamos:</h4>
                <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio</li>
                  <li><strong>Cookies de análisis:</strong> Google Analytics para mejorar nuestros servicios</li>
                  <li><strong>Cookies de preferencias:</strong> Recordar sus configuraciones</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Privacidad y Protección de Datos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Respetamos su privacidad y cumplimos con las leyes argentinas de protección de datos personales 
                (Ley 25.326) y las mejores prácticas internacionales.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>No compartimos información personal con terceros sin consentimiento</li>
                <li>Utilizamos medidas de seguridad apropiadas para proteger sus datos</li>
                <li>Puede solicitar la eliminación de sus datos en cualquier momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Propiedad Intelectual
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Todo el contenido de este sitio web, incluyendo texto, gráficos, logos, imágenes y software, 
                es propiedad de iJAC IT Solutions y está protegido por las leyes de propiedad intelectual argentinas e internacionales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Limitación de Responsabilidad
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                iJAC IT Solutions no será responsable por daños directos, indirectos, incidentales o consecuentes 
                que puedan surgir del uso de este sitio web o de los servicios proporcionados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Modificaciones
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Contacto
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-700 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Si tiene preguntas sobre estos términos y condiciones, puede contactarnos:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Email:</strong> jose.carrizo@ijac.com.ar</p>
                  <p><strong>Ubicación:</strong> Almagro, Buenos Aires, Argentina</p>
                  <p><strong>WhatsApp:</strong> +54 9 11 3086-2409</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Ley Aplicable
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Estos términos y condiciones se rigen por las leyes de la República Argentina. 
                Cualquier disputa será resuelta en los tribunales competentes de Buenos Aires, Argentina.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 iJAC IT Solutions. Todos los derechos reservados.
              </p>
              <BackButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
