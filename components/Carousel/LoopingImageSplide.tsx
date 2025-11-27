"use client";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import styles from "./LoopingImageSplide.module.css";

const images = [
  { src: "/images/WYMCamp1.jpg", alt: "WYM Camp 1" },
  { src: "/images/WYMCamp2.png", alt: "WYM Camp 2" },
  { src: "/images/WYMCamp4.png", alt: "WYM Camp 4" },
  { src: "/images/WYMCamp5.png", alt: "WYM Camp 5" },
];

export default function LoopingImageSplide() {
  return (
    <div className={styles.carouselWrapper}>
      <Splide
        options={{
          type: "loop",
          perPage: 3,
          gap: "24px",
          arrows: false,
          pagination: false,
          drag: "free",
          autoScroll: {
            pauseOnHover: true,
            pauseOnFocus: false,
            rewind: true,
            speed: 1.5,
          },
        }}
        extensions={{ AutoScroll }}
        aria-label="WYM Camp Carousel"
      >
        {images.map((img) => (
          <SplideSlide key={img.src}>
            <img
              src={img.src}
              alt={img.alt}
              className={styles.splideSlideImg}
            />
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}