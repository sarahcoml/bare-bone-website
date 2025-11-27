"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./Hero.module.css";
import LoopingImageSplide from "../Carousel/LoopingImageSplide";

interface HeroProps {
  bgSrc: string;
  sideSrc: string;
}

const PoolMap = dynamic(() => import("../PoolMap/PoolMap"), { ssr: false });

export default function Hero({ bgSrc, sideSrc }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <section className={styles.heroSection} aria-label="WYM hero">
        <div className={styles.heroBg}>
          <Image
            src={bgSrc}
            alt="Soft ripples of a swimming pool"
            fill
            priority
            className={styles.bgImg}
          />
          <div className={styles.overlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.left}>
            <h4 className={styles.subtitle}>Where You Move, You Matter</h4>

            <h1 className={styles.title}>
              We make <span className={styles.highlight}>swimming</span> for{" "}
              <span className={styles.highlight}>everyone</span> by protecting{" "}
              <span className={styles.highlight}>your hair</span>.
            </h1>

            <div className={styles.buttonRow}>
              <a
                href="https://mailchi.mp/41b673bed130/wait-list"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.heroBtn}
                aria-label="Join the WYM waitlist"
              >
                Join the Waitlist
              </a>
              <Link
                href="#mission"
                className={styles.heroBtnAlt}
                aria-label="Learn more about WYM"
              >
                Our Mission
              </Link>
            </div>
            
          </div>

          <div className={styles.right}>
            <Image
              src="/images/kidsswimming.jpg"
              alt="WYM inclusive swim cap"
              className={styles.heroImg}
              width={1200}
              height={1600}
              priority
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className={styles.missionSection} aria-label="WYM Mission">
        <div className={styles.missionContent}>
          <h2 className={styles.missionTitle}>Our Mission</h2>
          <p className={styles.missionText}>
            At WYM, our mission is to break barriers in aquatic spaces by
            designing swim gear that celebrates and protects natural hair. We
            believe everyone deserves access to swim, train, and thrive in the
            water-regardless of hair type or background. Through innovation and
            community partnership, we're making pools more inclusive, safe, and
            welcoming for all.
          </p>
        </div>
      </section>

      {/* Inspiring Stories Carousel */}
      <section>
        <LoopingImageSplide />
      </section>

      {/* Pool Map Section */}
      <section>
        <h2 style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
          Pools Near You
        </h2>
        {/* render PoolMap only after client mount */}
        {mounted && <PoolMap />}
      </section>
    </>
  );
}
