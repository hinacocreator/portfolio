import { Header } from "@/components/Header";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { HowIWork } from "@/components/sections/HowIWork";
import { Interests } from "@/components/sections/Interests";
import { Outside } from "@/components/sections/Outside";
import { Project } from "@/components/sections/Project";
import { WhatIDo } from "@/components/sections/WhatIDo";

/** 8セクションを原稿の順番どおりに並べるだけ（中身は src/components/sections/ 以下） */
export default function Home() {
  return (
    <>
      <Header variant="home" />
      <main id="main">
        <Hero />
        <About />
        <WhatIDo />
        <Project />
        <HowIWork />
        <Interests />
        <Outside />
        <Contact />
      </main>
    </>
  );
}
