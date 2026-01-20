import { Metadata } from 'next';
import { BackButton } from '../components/BackButton';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales de iJAC IT Solutions',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PoliticaDePrivacidad() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Información que Recopilamos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                En iJAC IT Solutions recopilamos información que usted nos proporciona directamente y 
                datos que se generan automáticamente cuando utiliza nuestros servicios.
              </p>
              
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Información Proporcionada Directamente:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Datos de contacto (nombre, email, teléfono)</li>
                <li>Información empresarial</li>
                <li>Mensajes y consultas enviadas</li>
                <li>Preferencias de servicios</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Información Recopilada Automáticamente:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Datos de navegación (Google Analytics)</li>
                <li>Dirección IP y ubicación aproximada</li>
                <li>Tipo de dispositivo y navegador</li>
                <li>Páginas visitadas y tiempo de permanencia</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Cómo Utilizamos su Información
              </h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Responder a sus consultas y brindar soporte</li>
                <li>Proporcionar cotizaciones y servicios personalizados</li>
                <li>Mejorar nuestros servicios y sitio web</li>
                <li>Enviar comunicaciones relevantes (con su consentimiento)</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Prevenir fraudes y garantizar la seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Uso de Google Analytics
              </h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 dark:text-yellow-300">
                  <strong>Importante:</strong> Utilizamos Google Analytics para analizar el tráfico de nuestro sitio web.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Google Analytics recopila información anónima sobre cómo los visitantes utilizan nuestro sitio web, incluyendo:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Páginas visitadas y tiempo de sesión</li>
                <li>Ubicación geográfica aproximada</li>
                <li>Dispositivo y navegador utilizado</li>
                <li>Fuente de tráfico (cómo llegó al sitio)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                Puede optar por no participar en Google Analytics visitando: 
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" 
                   title="Descargar extensión para deshabilitar Google Analytics"
                   className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline ml-1">
                  Google Analytics Opt-out
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Sus Derechos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Conforme a la Ley 25.326 de Protección de Datos Personales de Argentina, usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
                <li><strong>Portabilidad:</strong> Obtener una copia de sus datos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Seguridad de los Datos
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos personales:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Encriptación SSL/TLS para transmisión de datos</li>
                <li>Acceso restringido a información personal</li>
                <li>Backup y recuperación de datos</li>
                <li>Auditorías de seguridad regulares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Retención de Datos
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Conservamos sus datos personales solo durante el tiempo necesario para cumplir con los fines 
                para los que fueron recopilados, incluidas las obligaciones legales, contables o de informes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Contacto para Asuntos de Privacidad
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-700 p-6 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Para ejercer sus derechos o consultas sobre privacidad, contáctenos:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Email:</strong> jose.carrizo@ijac.com.ar</p>
                  <p><strong>Ubicación:</strong> Almagro, Buenos Aires, Argentina</p>
                  <p><strong>WhatsApp:</strong> +54 9 11 3086-2409</p>
                </div>
              </div>
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
