"use client";
import styles from "./SocialIcons.module.css";

export default function SocialIcons() {
  return (
    <ul className={styles.list} aria-label="Follow us">
      <li>
        <a
          className={styles.iconLink}
          href="mailto:team@letswym.com"
          aria-label="Email"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
            <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 7.5l8.5 6L20.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </li>

      <li>
        <a
          className={styles.iconLink}
          href="https://www.instagram.com/wymofficial/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
            <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="1.6"/>
            <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.6"/>
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
          </svg>
        </a>
      </li>

      <li>
        <a
          className={styles.iconLink}
          href="https://www.linkedin.com/company/wymofficial/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
            <rect x="2.5" y="2.5" width="19" height="19" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.25 17.0V10.5H4.75V17.0H7.25Z" fill="currentColor" />
            <path d="M6.0 9.0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" fill="currentColor" />
            <path d="M18.0 17.0h-2.5v-3.7c0-.92-.02-2.1-1.3-2.1-1.31 0-1.51 1.02-1.51 2.05V17h-2.5V10.5H11v.96h.03c.33-.62 1.16-1.28 2.38-1.28 2.52 0 2.95 1.65 2.95 3.8V17Z" fill="currentColor" />
          </svg>
        </a>
      </li>
    </ul>
  );
}