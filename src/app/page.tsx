import { Hero } from "./components/Hero";
import Testimonials from "./components/Testimonials";
import { Services } from "./components/Services";
import { Contact } from "./components/Contact";
import { About } from "./components/About";
import { StructuredData } from "./components/StructuredData";
import { FAQ } from "./components/FAQ";

export default function Home() {
  return (
    <>
      <StructuredData />
      <section id="home">
        <Hero />
      </section>
      <section id="servicios">
        <Services />
      </section>
      <section id="nosotros">
        <About />
      </section>
      <section id="testimonios">
        <Testimonials />
      </section>
      <section id="faq">
        <FAQ />
      </section>
      <section id="contacto">
        <Contact />
      </section>
    </>
  );
}
