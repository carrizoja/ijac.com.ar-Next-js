"use client";

// import Swiper core and required modules
import {
  Navigation,
  Pagination,
  A11y,
  EffectFlip,
  Autoplay
} from "swiper/modules";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

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
  company: string;
  comment: string;
  rating: number;
  avatar: string;
}

const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };
  return (
    <div className="my-8 w-[95%] md:w-2/3 mx-auto">
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
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log("slide change")}
      >
                {testimonials.map((testimonial: Testimonial) => (
          <SwiperSlide key={testimonial.id}>
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-lg p-6 mx-2 min-h-[360px] w-[80%] md:w-[80%] mx-auto border border-gray-700/50">
              <div className="flex flex-col items-center text-center h-full">
                {/* Avatar */}
                <div className="relative mb-4">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-3 border-blue-400 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex justify-center mb-2 md:mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Comment */}
                <blockquote className="text-gray-300 italic mb-2 md:mb-4 text-sm leading-relaxed flex-1">
                  &ldquo;{testimonial.comment}&rdquo;

                {/* Name and Company */}
                  <div className="flex flex-col items-center justify-center mt-4 md:mt-6">
                    <h4 className="font-semibold text-white text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-blue-400 text-sm font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </blockquote>

                <div className="mt-auto mb-4"></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

TestimonialsSection.displayName = "TestimonialsSection";

export default TestimonialsSection;
