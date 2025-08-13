interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "¿Qué servicios de IT ofrece iJac?",
    answer: "iJac IT Solutions ofrece servicios completos de consultoría IT, soporte técnico, desarrollo de software, gestión de infraestructura, y soluciones tecnológicas personalizadas para empresas en Argentina y a nivel global."
  },
  {
    question: "¿Atienden empresas de todos los tamaños?",
    answer: "Sí, trabajamos con empresas de todos los tamaños, desde startups hasta grandes corporaciones, adaptando nuestras soluciones tecnológicas a las necesidades específicas de cada cliente."
  },
  {
    question: "¿Cuál es el horario de atención?",
    answer: "Nuestro horario de atención es de lunes a viernes de 9 a 18h (GMT-3)."
  },
  {
    question: "¿Cuál es el tiempo de respuesta para consultas?",
    answer: "Nuestro tiempo de respuesta estándar es de 2-4 horas para consultas normales y menos de 1 hora para urgencias."
  }
];

export function FAQ() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-heading">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 font-heading">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
