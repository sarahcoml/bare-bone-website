"use client";

import styles from "./about.module.css";
import Image from "next/image";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Array of sticker image paths
const STICKER_IMAGES = [
  "/images/sticker1.png",
  "/images/sticker1.png",
  "/images/sticker2.png",
  "/images/sticker3.png",
];

// Helper to get a random sticker image
function getRandomSticker() {
  const idx = Math.floor(Math.random() * STICKER_IMAGES.length);
  return STICKER_IMAGES[idx];
}

// Helper to generate random positions around the card perimeter, avoiding bottom left except corners
function getRandomStickerPositions(
  count: number,
  cardW = 370,
  cardH = 540,
  radius = 40
) {
  const positions: { top: number; left: number; rotate: number; behind: boolean }[] = [];
  let tries = 0;
  const minDist = 70; // Minimum distance between stickers (in px)
  const minTopClamp = 48; // don't place stickers above this vertical offset (push top stickers lower)
  const topJitter = 18; // extra jitter to make clamped top positions feel natural

  while (positions.length < count && tries < count * 50) {
    tries++;
    const angle =
      2 * Math.PI * Math.random() + (Math.PI / 12) * (Math.random() - 0.5);
    const cx = cardW / 2;
    const cy = cardH / 2;
    const jitterRadius = radius + Math.random() * 32 - 16;
    const x = cx + Math.cos(angle) * (cardW / 2 + jitterRadius);
    const y = cy + Math.sin(angle) * (cardH / 2 + jitterRadius);

    let stickerLeft = x - 32;
    let stickerTop = y - 32;

    // If a sticker would be near the very top, push it down a bit so it doesn't sit over the card top
    if (stickerTop < minTopClamp) {
      stickerTop = minTopClamp + Math.random() * topJitter;
    }

    const stickerBottom = stickerTop + 64;
    const stickerRight = stickerLeft + 64;

    // Corners
    const isCorner =
      (stickerLeft < 40 && stickerTop < 40) || // top left
      (stickerLeft > cardW - 80 && stickerTop < 40) || // top right
      (stickerLeft < 40 && stickerBottom > cardH - 40) || // bottom left
      (stickerRight > cardW - 40 && stickerBottom > cardH - 40); // bottom right

    // Avoid bottom left except corner
    const isInBottomLeft =
      stickerLeft < 120 && stickerBottom > cardH - 120 && !isCorner;

    // Check distance to all previous stickers
    const tooClose = positions.some((pos) => {
      const dx = pos.left + 32 - x;
      const dy = pos.top + 32 - y;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });

    if (!isInBottomLeft && !tooClose) {
      positions.push({
        top: Math.round(stickerTop),
        left: Math.round(stickerLeft),
        rotate: Math.floor(Math.random() * 36) - 18,
        behind: Math.random() < 0.33,
      });
    }
    // else: skip this position and try again
  }
  return positions;
}

// StaticSticker: animates in, then stays
function StaticSticker({
  pos,
  delay,
  idx,
  stickerImg,
}: {
  pos: any;
  delay: number;
  idx: number;
  stickerImg: string;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleClick = () => {
    router.push("/academy");
  };

  return (
    <div
      className={`${styles.staticSticker} ${pos.behind ? styles.stickerBehind : styles.stickerFront}`}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        transform: `rotate(${pos.rotate}deg) scale(${show ? 1 : 0.7})`,
        opacity: show ? 1 : 0,
        transition: "opacity 0.7s, transform 0.7s",
        pointerEvents: "auto", // Allow click events
        cursor: "pointer",
      }}
      key={idx}
      onClick={handleClick}
      tabIndex={0}
      aria-label="Go to Academy"
      role="button"
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <Image src={stickerImg} alt="Sticker" width={64} height={64} />
    </div>
  );
}

// Mouse-move stickers (popup, fade out)
function PopupSticker({
  x,
  y,
  id,
  stickerImg,
}: {
  x: number;
  y: number;
  id: string | number;
  stickerImg: string;
}) {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // don't show a popup sticker if it would land over any social button area
    const padding = 12; // extra safe area around buttons
    const socials = Array.from(document.querySelectorAll(".fullCardSocials"));
    const isOverButton = socials.some((el) => {
      const r = el.getBoundingClientRect();
      return x >= r.left - padding && x <= r.right + padding && y >= r.top - padding && y <= r.bottom + padding;
    });
    if (isOverButton) setBlocked(true);
  }, [x, y]);

  if (blocked) return null;

  return (
    <img
      key={id}
      src={stickerImg}
      alt=""
      className={styles.sticker}
      style={{ left: x, top: y, position: "fixed", pointerEvents: "none" }}
    />
  );
}

// Reusable StickerCard component
function StickerCard({
  imageSrc,
  name,
  desc,
  email,
  linkedin,
  cardClass,
}: {
  imageSrc: string;
  name: string;
  desc: string;
  email: string;
  linkedin: string;
  cardClass?: string;
}) {
  const NUM_STATIC_STICKERS = 7;
  const [staticStickerImgs] = useState(() =>
    Array.from({ length: NUM_STATIC_STICKERS }, () => getRandomSticker())
  );
  const [staticStickerPositions] = useState(() =>
    getRandomStickerPositions(NUM_STATIC_STICKERS)
  );
  const [visibleStickers, setVisibleStickers] = useState(
    Array(NUM_STATIC_STICKERS).fill(false)
  );

  useEffect(() => {
    staticStickerPositions.forEach((_, idx) => {
      const delay = 400 + idx * 350 + Math.floor(Math.random() * 1200);
      setTimeout(() => {
        setVisibleStickers((prev) => {
          const updated = [...prev];
          updated[idx] = true;
          return updated;
        });
      }, delay);
    });
    // eslint-disable-next-line
  }, []);

  const isVivian = cardClass === styles.vivianCard;
  const imageStyle: React.CSSProperties = {
    objectFit: "cover",
    objectPosition: isVivian ? "center 18%" : "center 30%",
    transform: isVivian ? "scale(1.08)" : undefined,
  };

  return (
    <div className={`${styles.relativeCardWrap} ${cardClass || ""}`} style={{ position: "relative" }}>
      {/* Static stickers */}
      {staticStickerPositions.map((pos, idx) =>
        visibleStickers[idx] ? (
          <StaticSticker
            key={idx}
            pos={pos}
            delay={0}
            idx={idx}
            stickerImg={staticStickerImgs[idx]}
          />
        ) : null
      )}

      {/* Main card - use an inner imgWrapper so next/image fill has a sized parent */}
      <div className={`${styles.fullImageCard} ${cardClass || ""}`}>
        <div className={styles.imgWrapper}>
          <Image
            src={imageSrc}
            alt={name}
            fill
            className={styles.fullCardImg}
            priority
            style={imageStyle}
          />
        </div>

        <div className={styles.bottomBlur}></div>

        <div className={styles.fullCardContent}>
          <h2 className={styles.fullCardName}>{name}</h2>
          <p className={styles.fullCardDesc}>{desc}</p>
          <div className={styles.fullCardSocials}>
            <a href={`mailto:${email}`} className={styles.fullCardSocialBtn} aria-label="Email">
              <FaEnvelope />
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.fullCardSocialBtn} aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [stickers, setStickers] = useState<
    { x: number; y: number; id: number; stickerImg: string }[]
  >([]);
  const moveCount = useRef(0);
  const stickerId = useRef(0);
  const [overCard, setOverCard] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (overCard) return; // Don't add sticker if over card
      moveCount.current += 1;
      if (moveCount.current % 20 === 0) {
        const x = e.clientX - 30;
        const y = e.clientY - 0;
        const id = stickerId.current++;
        const stickerImg = getRandomSticker();
        setStickers((prev) => [
          ...prev,
          { x, y, id, stickerImg },
        ]);
        // Removed setTimeout for sticky stickers
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [overCard]);

  // Handlers for card hover
  const handleCardEnter = () => setOverCard(true);
  const handleCardLeave = () => setOverCard(false);

  return (
    <main className={styles.splitMain}>
      {/* Mission section at the top */}
      <section className={styles.missionSection}>
        <h1 className={styles.missionTitle}>Why We Built WYM</h1>
        <p className={styles.missionText}>
I grew up in the South Bronx, where swimming was meant to feel like freedom but often came at the cost of my hair. Hours of detangling and damage made it hard to stay in the pool, and I watched many kids give up altogether. WYM was born from those memories and a desire to change that experience. I’m building swim caps that protect and celebrate natural hair, making it possible to enjoy the water without compromise. With innovation and community at the heart of WYM, I’m working to make swimming more inclusive, safe, and welcoming for everyone.        </p>
      </section>

      {/* Both cards with stickers */}
      <section className={styles.cardsSection}>
        <StickerCard
          imageSrc="/images/sarahpicture.png"
          name="Sarah Comlan"
          desc="Sarah is the founder of WYM and a Brown University graduate in Computer Science and Entrepreneurship. She focuses on designing inclusive technologies that build community, expand access, and empower people to feel seen and supported."
          email="sarah_comlan@gmail.com"
          linkedin="https://www.linkedin.com/in/sarahcomlan/"
        />
        {stickers.map((s) => (
          <PopupSticker key={s.id} x={s.x} y={s.y} id={s.id} stickerImg={s.stickerImg} />
        ))}
      </section>
      <div style={{ height: "2rem" }} />
    </main>
  );
}
