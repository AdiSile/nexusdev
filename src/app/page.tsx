import BackgroundCanvas from "@/components/BackgroundCanvas";
import Hero from "@/components/Hero";
import Services from "@/components/Services";

export default function Home() {
  return (
    <>
      <BackgroundCanvas />
      <Hero video poster="/images/hero-poster.jpg" />
      <Services />
    </>
  );
}