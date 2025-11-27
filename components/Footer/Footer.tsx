"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Footer.module.css";
import SocialIcons from "../SocialIcons/SocialIcons";
import CookiePreferences from "@/components/CookiePreferences/CookiePreferences";

export default function Footer() {
  const router = useRouter();
  const [showTransition, setShowTransition] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAcademyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTransition(true);
    setTimeout(() => {
      router.push("/academy");
    }, 1200);
  };

  useEffect(() => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    return () => {
      // safe removal: only remove if node.parentNode exists
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }, []);

  return (
    <footer className={styles.footer}>
      {showTransition && (
        <div className={styles.stickerTransition}>
          {Array.from({ length: 36 }).map((_, i) => (
            <img
              key={i}
              src="/images/sticker1.png"
              className={styles.transitionSticker}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `scale(${0.8 + Math.random() * 1.2}) rotate(${Math.random() * 360}deg)`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
              alt=""
            />
          ))}
        </div>
      )}

      <div className={styles.footerTop}>
        <div className={`${styles.footerCol} ${styles.hideOnMobile}`}>
          <ul>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <a href="/academy" onClick={handleAcademyClick}>
                Academy
              </a>
            </li>
            <li>
              <a
                className={styles.followLink}
                href="https://www.instagram.com/wymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                Follow Us
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerCol}>
          <div className={styles.newsletterTitle}>
            Subscribe to our newsletter
            <br />
            for product updates, discounts & more
          </div>

          <form
            className={styles.newsletterForm}
            aria-label="Subscribe to newsletter"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              const email = String(formData.get("email") || "").trim();
              if (!email) {
                setStatusMsg("Enter your email");
                return;
              }
              setLoading(true);
              setStatusMsg(null);
              try {
                const res = await fetch("/api/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, name: "" }),
                });
                const json = await res.json();
                if (!res.ok) {
                  setStatusMsg(json.error || "Subscription failed");
                } else {
                  setStatusMsg("Thanks — check your email!");
                  form.reset();
                }
              } catch (err) {
                setStatusMsg("Network error");
              } finally {
                setLoading(false);
              }
            }}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              name="email"
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className={styles.newsletterInput}
              aria-label="Email address"
            />
            <button
              type="submit"
              className={styles.newsletterArrow}
              aria-label="Subscribe"
              disabled={loading}
            >
              {loading ? "…" : "→"}
            </button>
          </form>
          {statusMsg && <div className={styles.newsletterStatus}>{statusMsg}</div>}
        </div>

        <div className={styles.footerCol}>
          <div className={styles.followTitle}>Follow us</div>
          <div className={styles.socialLinks}>
            <SocialIcons />
          </div>

          <div className={styles.contactInfo}>
            <a href="mailto:contactwymofficial@gmail.com" className={`${styles.contactEmail} ${styles.hideOnMobile}`}>
              contactwymofficial@gmail.com
            </a>

            <div className={styles.cookieWrapper}>
              <CookiePreferences open={false} inFooter />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div>© {new Date().getFullYear()} wymple</div>
      </div>

      <div className={styles.footerBgWord}>wymple</div>
    </footer>
  );
}