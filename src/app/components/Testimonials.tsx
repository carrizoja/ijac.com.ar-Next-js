"use client";

// import Swiper core and required modules
import {
  Navigation,
  Pagination,
  A11y,
  EffectFlip,
  Autoplay
} from "swiper/modules";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/effect-flip";

// Import testimonials data
import { testimonials } from "../../data/testimonials.js";

interface Testimonial {
  id: number;
  name: string;
  comment: string;
  rating: number;
  reviewDate: string;
  avatarInitials: string;
  image_avatar?: string;
  source: string;
  sourceUrl: string;
}

const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        aria-hidden="true"
      >
        ★
      </span>
    ));
  };
  return (
    <div className="my-8 w-full max-w-4xl mx-auto px-4">
      <h2 className="text-lg sm:text-lg lg:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-8 text-center">
        Lo que dicen nuestros clientes
      </h2>
      <Swiper
        // install Swiper modules
        modules={[Navigation, Pagination, A11y, EffectFlip, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        effect="slide"
        flipEffect={{
          slideShadows: true,
          limitRotation: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        scrollbar={{ draggable: true }}
      >
        {testimonials.map((testimonial: Testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <a
              href={testimonial.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver la reseña de ${testimonial.name} en Google (se abre en una pestaña nueva)`}
              className="block bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-lg p-4 sm:p-6 min-h-[360px] w-full max-w-md mx-auto border border-gray-700/50 transition-colors hover:border-blue-400/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
            >
              <div className="flex flex-col items-center text-center h-full">
                {testimonial.image_avatar ? (
                  <Image
                    src={testimonial.image_avatar}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="mb-4 h-16 w-16 rounded-full border-2 border-blue-400 object-cover shadow-md"
                  />
                ) : (
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-400 bg-blue-950 text-lg font-bold text-blue-100 shadow-md"
                    aria-hidden="true"
                  >
                    {testimonial.avatarInitials}
                  </div>
                )}

                <div
                  className="flex justify-center mb-2 md:mb-3"
                  role="img"
                  aria-label={`${testimonial.rating} de 5 estrellas`}
                >
                  {renderStars(testimonial.rating)}
                </div>

                <blockquote className="text-gray-300 italic mb-2 md:mb-4 text-sm leading-relaxed whitespace-pre-line flex-1">
                  &ldquo;{testimonial.comment}&rdquo;
                </blockquote>

                <div className="flex flex-col items-center justify-center mt-4 md:mt-6">
                  <cite className="not-italic font-semibold text-white text-base">
                    {testimonial.name}
                  </cite>
                  <p className="text-gray-400 text-sm">
                    {testimonial.reviewDate}
                  </p>
                  <p className="mt-2 text-blue-400 text-sm font-semibold">
                    Reseña de {testimonial.source}
                    <span aria-hidden="true"> ↗</span>
                  </p>
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

TestimonialsSection.displayName = "TestimonialsSection";

export default TestimonialsSection;
