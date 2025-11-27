"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import styles from "./NavBar.module.css";

export default function Navbar() {
  const router = useRouter();
  const [showTransition, setShowTransition] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstMenuItemRef = useRef<HTMLAnchorElement | null>(null);

  const handleAcademyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTransition(true);
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstMenuItemRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = prevOverflow || "";
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow || "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          <div className={styles.logo}>
            <img src="/images/WYMLogo.png" alt="WYM Logo" height={25} />
          </div>

          <ul className={styles.navLinks}>
            <li>
              <Link href="/" className={styles.navLink}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.navLink}>
                ABOUT
              </Link>
            </li>
            <li>
              <a
                href="/academy"
                className={`${styles.navLink} ${showTransition ? styles.navLinkActive : ""}`}
                onClick={handleAcademyClick}
                aria-pressed={showTransition}
              >
                ACADEMY
              </a>
            </li>
          </ul>

          <a
            href="https://www.instagram.com/wymofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bookBtn}
            aria-label="Follow us on Instagram"
          >
            Follow Us
          </a>
        </div>

        <button
          className={styles.mobileToggle}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((s) => !s)}
          type="button"
        >
          <span className={`${styles.hamburger} ${mobileOpen ? styles.open : ""}`}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </span>
        </button>
      </nav>

      {mobileOpen && (
        <div
          className={styles.mobileMenu}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          onClick={closeMobile}
        >
          <div
            className={styles.mobileMenuPanel}
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X button inside the panel */}
            <button
              className={styles.mobileClose}
              aria-label="Close menu"
              onClick={closeMobile}
              type="button"
            >
              ×
            </button>

            <ul className={styles.mobileMenuList}>
              <li onClick={closeMobile}>
                <Link href="/" className={styles.mobileMenuLink} ref={firstMenuItemRef}>
                  Home
                </Link>
              </li>
              <li onClick={closeMobile}>
                <Link href="/about" className={styles.mobileMenuLink}>
                  About
                </Link>
              </li>
              <li onClick={handleAcademyClick}>
                <a className={styles.mobileMenuLink} href="/academy">
                  Academy
                </a>
              </li>
              <li onClick={closeMobile}>
                <a
                  href="https://www.instagram.com/wymofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileMenuLink}
                >
                  Follow Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {showTransition && (
        <StickerTransitionOverlay targetHref="/academy" onFinish={() => setShowTransition(false)} />
      )}
    </>
  );
}

function StickerTransitionOverlay({
  targetHref,
  onFinish,
}: {
  targetHref: string;
  onFinish: () => void;
}) {
  const router = useRouter();

  const stickerSize = 150;
  const appearDuration = 180;
  const dropDuration = 800;
  const wavePattern = [10, 20, 30, 50];
  const waveInterval = 160;
  const perStickerJitter = 60;
  const densityFactor = 0.25;

  type Pos = { left: number; top: number; rotate: number; delay: number };

  const [positions, setPositions] = useState<Pos[]>([]);
  const [visible, setVisible] = useState<boolean[]>([]);
  const [dropping, setDropping] = useState(false);
  const [droppedCount, setDroppedCount] = useState(0);
  const finishedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const area = w * h;

    const targetCount = Math.min(
      2000,
      Math.max(120, Math.round(area / (stickerSize * stickerSize * densityFactor)))
    );

    const waves: number[] = [];
    let assigned = 0;
    let idx = 0;
    while (assigned < targetCount) {
      const add = wavePattern[idx % wavePattern.length];
      waves.push(add);
      assigned += add;
      idx++;
      if (waves.length > 2000) break;
    }

    const waveIndexForSticker: number[] = [];
    waves.forEach((count, wi) => {
      for (let i = 0; i < count; i++) waveIndexForSticker.push(wi);
    });

    const out: Pos[] = [];
    const minDistance = Math.max(14, Math.round(stickerSize * 0.28));
    const maxAttempts = targetCount * 30;
    let attempts = 0;

    while (out.length < waveIndexForSticker.length && attempts < maxAttempts) {
      const left = Math.random() * (w + stickerSize) - stickerSize / 2;
      const top = Math.random() * (h + stickerSize) - stickerSize / 2;

      let tooClose = false;
      for (const p of out) {
        const dx = p.left - left;
        const dy = p.top - top;
        if (dx * dx + dy * dy < minDistance * minDistance) {
          tooClose = true;
          break;
        }
      }
      if (tooClose && Math.random() > 0.5) {
        attempts++;
        continue;
      }

      const rotate = Math.random() * 60 - 30;
      const assignedWave = waveIndexForSticker[out.length] ?? Math.floor(out.length / 10);
      const baseWaveDelay = assignedWave * waveInterval;
      const delay = baseWaveDelay + Math.random() * perStickerJitter;
      out.push({ left, top, rotate, delay });
      attempts++;
    }

    while (out.length < waveIndexForSticker.length) {
      const left = Math.random() * (w + stickerSize) - stickerSize / 2;
      const top = Math.random() * (h + stickerSize) - stickerSize / 2;
      const rotate = Math.random() * 60 - 30;
      const assignedWave = waveIndexForSticker[out.length] ?? Math.floor(out.length / 10);
      const baseWaveDelay = assignedWave * waveInterval;
      const delay = baseWaveDelay + Math.random() * perStickerJitter;
      out.push({ left, top, rotate, delay });
    }

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    setPositions(out);
    setVisible(Array(out.length).fill(false));

    out.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setVisible((v) => {
          const copy = [...v];
          copy[i] = true;
          return copy;
        });
      }, Math.max(0, Math.floor(out[i].delay)));
      timersRef.current.push(t);
    });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (positions.length === 0) return;

    const maxDelay = positions.reduce((m, p) => Math.max(m, p.delay), 0);
    const startDropAfter = Math.ceil(maxDelay) + appearDuration + 120;

    const startTimer = window.setTimeout(() => {
      setDropping(true);
    }, startDropAfter);
    timersRef.current.push(startTimer);

    const fallback = window.setTimeout(() => {
      if (!finishedRef.current) setDropping(true);
    }, 12000);
    timersRef.current.push(fallback);

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [positions]);

  useEffect(() => {
    if (dropping && droppedCount >= positions.length && positions.length > 0 && !finishedRef.current) {
      finishedRef.current = true;

      (async () => {
        try {
          await router.push(targetHref);
        } catch {
          /* ignore navigation errors */
        } finally {
          onFinish();
        }
      })();
    }
  }, [droppedCount, dropping, positions.length]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        pointerEvents: "auto",
        overflow: "hidden",
        background: "transparent",
      }}
      aria-hidden="true"
    >
      {positions.map((pos, i) => {
        const isVisible = visible[i];
        const wrapperStyle: React.CSSProperties = {
          position: "absolute",
          left: `${pos.left}px`,
          top: `${pos.top}px`,
          width: `${stickerSize}px`,
          height: `${stickerSize}px`,
          transform: `translate(-50%, -50%) scale(${isVisible ? 1 : 0.75})`,
          opacity: isVisible ? 1 : 0,
          pointerEvents: "none",
          willChange: "transform, opacity",
          transition: dropping ? undefined : `transform ${appearDuration}ms cubic-bezier(.22,.9,.34,1), opacity ${appearDuration}ms ease`,
          transitionDelay: dropping ? "0ms" : `${pos.delay}ms`,
          animation: dropping ? `wrapDrop ${dropDuration}ms cubic-bezier(.22,.9,.34,1) forwards` : undefined,
        };

        return (
          <div
            key={i}
            style={wrapperStyle}
            onAnimationEnd={() => {
              if (dropping) {
                setDroppedCount((c) => c + 1);
              }
            }}
          >
            <img
              src="/images/sticker1.png"
              alt=""
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                transform: `rotate(${pos.rotate}deg)`,
                borderRadius: 6,
                pointerEvents: "none",
              }}
            />
          </div>
        );
      })}

      <style>{`
        @keyframes wrapDrop {
          0% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) translateY(120vh); }
        }
      `}</style>
    </div>
  );
}

