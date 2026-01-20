import { Metadata } from 'next'
import { Breadcrumbs } from '../components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Contacto iJac IT Solutions | IT Consulting & Support en Buenos Aires',
  description: 'Contactá a iJac IT Solutions para obtener servicios profesionales de consultoría y soporte IT en Buenos Aires, Argentina. Obtén asistencia experta hoy.',
  keywords: 'contacto iJac, soporte IT Buenos Aires, contacto consultoría técnica, servicios IT Argentina, soporte tecnológico empresarial',
  openGraph: {
    title: 'Contacto iJac IT Solutions | Soporte IT Experto',
    description: 'Ponete en contacto con iJac IT Solutions para obtener servicios profesionales de consultoría y soporte IT en Buenos Aires.',
    url: 'https://ijac.com.ar/contact',
    type: 'website',
  },
  twitter: {
    title: 'Contactá a iJac IT Solutions | Expertos en Soluciones IT',
    description: 'Ponete en contacto con iJac IT Solutions para obtener servicios profesionales de consultoría y soporte IT en Buenos Aires.',
  },
  alternates: {
    canonical: 'https://ijac.com.ar/contact'
  }
}

const breadcrumbItems = [
  { name: 'Home', href: '/' },
  { name: 'Contact', href: '/contact' }
]

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "iJac IT Solutions",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+54-11-1234-5678",
        "contactType": "customer service",
        "email": "info@ijac.com.ar",
        "availableLanguage": ["Spanish", "English"]
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <h1 className="text-4xl font-bold mb-8 font-heading">Contactanos</h1>
          <p className="text-lg mb-8">Ponete en contacto con nuestro equipo</p>

          <div className="max-w-md w-full space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Información de Contacto</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:jose.carrizo@ijac.com.ar" title="Enviar correo electrónico a iJAC" className="text-blue-600 hover:text-blue-800">jose.carrizo@ijac.com.ar</a></p>
                <p><strong>Teléfono:</strong> <a href="tel:+541130862409" title="Llamar a iJAC" className="text-blue-600 hover:text-blue-800">+54 11 30862409</a></p>
                <p><strong>Dirección:</strong> Buenos Aires, Argentina</p>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Horario de Atención</h2>
              <div className="space-y-1">
                <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
