"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./academy.module.css";
import { useRouter } from "next/navigation";

/* Testimonials component */
function Testimonials() {
  const items = [
    {
      id: 1,
      name: "Lena Ivanova",
      text: "I would like to express my gratitude to Alexandra and the entire team for their consultation and help with my application.",
    },
    {
      id: 2,
      name: "Katie Bell",
      text: "They helped me prepare all the necessary documents and support through the process.",
    },
    {
      id: 3,
      name: "Sam Riley",
      text: "Great instructors and community events — highly recommend.",
    },
  ];

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.testimonialsTitle}>Testimonials</h2>
      <div className={styles.testimonialsGrid}>
        {items.map((t) => (
          <article key={t.id} className={styles.testimonialCard}>
            {/* avatar/image removed */}
            <p className={styles.testimonialText}>{t.text}</p>
            <div className={styles.testimonialName}>{t.name}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function AcademyPage() {
  const router = useRouter();
  const appFormRef = useRef<HTMLFormElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // mount flag used to trigger entrance animations (respects reduced motion by not delaying too long)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleAppSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // simple client-side ack — replace with real submit logic as needed
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name") || "";
    alert(`Thanks, ${String(name)} — your application was submitted.`);
    form.reset();
  };

  useEffect(() => {
    window.dispatchEvent(new Event("academy-page-ready"));
  }, []);

  return (
    <main className={styles.academyMain}>
      {/* BubbleField (if present) */}
      <div className={`${styles.contentLayer} ${mounted ? styles.entered : ""}`}>
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className={styles.backButton}
        >
          <span aria-hidden style={{ fontSize: 20, fontWeight: 800 }}>
            &larr;
          </span>
        </button>

        <section className={styles.topSection}>
          {/* decorative image wrappers removed */}
          <h1 className={styles.mainTitle}>
            WYMPLE <br /> ACADEMY
          </h1>

        <p className={styles.topDesc}>
          Wymple Academy expands access to swimming for kids often left out of aquatic spaces. Through lessons, water safety, and confidence-building, we help young people feel at home in the water while protecting and celebrating their natural hair. We’re currently partnering with schools, community centers, and local pools to teach the importance of swimming and water safety. As we grow, our initiative will expand to increase access and develop more inclusive swimming facilities.{" "}
          <span className={styles.highlight}>schools, community centers, and local pools</span> to make swimming more inclusive and fun.
        </p>
        </section>

        {/* Numbers Section */}
        <section className={styles.numbersSection}>
          <h2 className={styles.numbersTitle}>
            A Few Numbers{" "}
            <span className={styles.highlight}>About Us</span> & Our Impact
          </h2>
          <div className={styles.numbersGrid}>
            <div className={styles.numbersCard}>
              5<span>community swim events</span>
            </div>
            <div className={styles.numbersCard}>
              2<span>partner organizations</span>
            </div>
          </div>
        </section>

        {/* Focus Section */}


        {/* Testimonials (images removed) */}
        {/* CTA section (image removed) */}
    

        {/* Application / Partner form (centered column as in screenshot) */}
        <section className={styles.applicationSection} aria-labelledby="application-title">
          <div className={styles.appInner}>

            <form
              ref={appFormRef}
              className={styles.appForm}
              onSubmit={handleAppSubmit}
              aria-label="Partner application form"
            >
              <input name="name" className={styles.appInput} placeholder="Name*" required />
              <input name="email" type="email" className={styles.appInput} placeholder="Email*" required />
              <input name="phone" className={styles.appInput} placeholder="Phone*" />
              <textarea name="message" className={styles.appTextarea} placeholder="Message*" required />
              <button type="submit" className={styles.appSubmit}>
                Submit application
              </button>
            </form>
          </div>
        </section>

        {/* ...existing focusSection and remaining content... */}

      </div>

      {/* full-width footer (moved outside contentLayer so it can span edge-to-edge) */}
      <footer className={`${styles.footerContacts} ${mounted ? styles.entered : ""}`} aria-labelledby="footer-title">
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Our Socials</h4>
            <div className={styles.socialsList} role="list">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/wymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity="0.06"/>
                  <path d="M7 7h10v10H7z" fill="none"/>
                  <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                  <circle cx="17.6" cy="6.4" r="0.7" fill="currentColor" />
                </svg>
              </a>

              {/* Email (Gmail) */}
              <a
                href="mailto:contactwymofficial@gmail.com"
                className={styles.socialLink}
                aria-label="Email"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden>
                  <rect x="0.5" y="0.5" width="23" height="17" rx="2" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.06"/>
                  <path d="M2 3.5l10 7 10-7" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/wymofficial"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.06"/>
                  <path d="M7 17V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="7" cy="7.8" r="0.9" fill="currentColor"/>
                  <path d="M11.5 17V13.5c0-1.2.9-2.2 2.1-2.2 1.2 0 2.1 1 2.1 2.2V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.footerDivider} aria-hidden />

          <div className={styles.footerCol}>
            <h4 className={styles.footerTitle}>Our Contacts</h4>
            <div className={styles.contactList}>
              <div className={styles.contactHandle}>
                <a
                  href="mailto:contactwymofficial@gmail.com"
                  className={styles.contactLink}
                >
                  contactwymofficial@gmail.com
                </a>
              </div>
  

              {/* Waitlist CTA placed under the contacts column */}
              <div className={styles.contactCTA}>
                <a
                  href="https://mailchi.mp/41b673bed130/wait-list"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waitlistBtn}
                  aria-label="Join our waitlist"
                >
                  Join Our Waitlist
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}