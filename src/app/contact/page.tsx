import { Metadata } from 'next'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PrimaryButton } from '../components/ui/PrimaryButton'
import { business } from '../../data/business'

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
        "telephone": business.phoneDisplay,
        "contactType": "customer service",
        "email": business.email,
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
                 <p><strong>Email:</strong> <a href={`mailto:${business.email}`} title="Enviar correo electrónico a iJAC" className="text-blue-600 hover:text-blue-800">{business.email}</a></p>
                 <p><strong>Teléfono:</strong> <a href={`tel:${business.phoneHref}`} title="Llamar a iJAC" className="text-blue-600 hover:text-blue-800">{business.phoneDisplay}</a></p>
                <p><strong>Dirección:</strong> Buenos Aires, Argentina</p>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Horario de Atención</h2>
              <div className="space-y-1">
                 <p>{business.hours.display}</p>
              </div>
              <div className="mt-4">
                    <PrimaryButton
              text="WhatsApp"
              href={business.whatsappUrl}
              colorVariant="green"
              className="justify-start"
              target="_blank"
              rel="noopener noreferrer"
            />
              </div>
            
              
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
