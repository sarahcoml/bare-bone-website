"use client";

import Image from "next/image";
import styles from "./Hero.module.css";

interface HeroProps {
  bgSrc: string;
  sideSrc: string;
}

export default function Hero({ bgSrc, sideSrc }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.content}>
          <h1>Welcome to Our Site</h1>
          <p>Discover amazing content and experiences</p>
        </div>
        {bgSrc && (
          <div className={styles.bgImage}>
            <Image
              src={bgSrc}
              alt="Hero background"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}
        {sideSrc && (
          <div className={styles.sideImage}>
            <Image
              src={sideSrc}
              alt="Hero side image"
              width={300}
              height={300}
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
