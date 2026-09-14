import { faqContent, resolveFaqAnswer } from "@/i18n/faq";
import type { Locale } from "@/i18n/routing";

export function FAQ({ locale = "es" }: { locale?: Locale }) {
  const content = faqContent[locale];
  const items = content.items.map((item) => ({
    question: item.question,
    answer: resolveFaqAnswer(item.answer),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(faq => ({
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
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-4xl font-bold font-heading text-center mb-12">
            {content.heading}
          </h2>
          <div className="space-y-6">
            {items.map((faq, index) => (
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
