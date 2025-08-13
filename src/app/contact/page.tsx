import { Metadata } from 'next'
import { Breadcrumbs } from '../components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Contact iJac IT Solutions | IT Consulting & Support in Buenos Aires',
  description: 'Contact iJac IT Solutions for professional IT consulting, technical support, and business solutions in Buenos Aires, Argentina. Get expert assistance today.',
  keywords: 'contact iJac, IT support Buenos Aires, technical consulting contact, IT services Argentina, business technology support',
  openGraph: {
    title: 'Contact iJac IT Solutions | Expert IT Support',
    description: 'Get in touch with iJac IT Solutions for professional IT consulting and support services in Buenos Aires.',
    url: 'https://ijac.com.ar/contact',
    type: 'website',
  },
  twitter: {
    title: 'Contact iJac IT Solutions | Expert IT Support',
    description: 'Get in touch with iJac IT Solutions for professional IT consulting and support services in Buenos Aires.',
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
          <h1 className="text-4xl font-bold mb-8 font-heading">Contact Us</h1>
          <p className="text-lg mb-8">Get in touch with our team</p>
          
          <div className="max-w-md w-full space-y-4">
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Contact Information</h2>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:info@ijac.com.ar" className="text-blue-600 hover:text-blue-800">info@ijac.com.ar</a></p>
                <p><strong>Phone:</strong> <a href="tel:+541112345678" className="text-blue-600 hover:text-blue-800">+54 11 1234-5678</a></p>
                <p><strong>Address:</strong> Buenos Aires, Argentina</p>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4 font-heading">Business Hours</h2>
              <div className="space-y-1">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
