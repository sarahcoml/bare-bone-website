"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CookiePreferences.module.css";

const COOKIE_NAME = "wym_cookies_prefs";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax;Secure`;
}
function getCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

type Prefs = {
  analytics: boolean;
  marketing: boolean;
};

type CookiePreferencesProps = {
  open?: boolean;
  inFooter?: boolean;
};

export default function CookiePreferences({
  inFooter,
}: CookiePreferencesProps) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, marketing: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cookie = getCookie(COOKIE_NAME);
    if (cookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie));
        setPrefs((p) => ({ ...p, ...parsed }));
        setSaved(true);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // disable pointer events on the map while the panel is open and restore on close
  useEffect(() => {
    const el = document.getElementById("pool-map-wrap");
    if (!el) return;
    el.style.pointerEvents = panelOpen ? "none" : "";
    return () => {
      if (el) el.style.pointerEvents = "";
    };
  }, [panelOpen]);

  const openPanel = () => {
    // blur whatever currently has focus (Leaflet map often steals focus)
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") active.blur();

    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);

  const acceptAll = () => {
    const all: Prefs = { analytics: true, marketing: true };
    setPrefs(all);
    setCookie(COOKIE_NAME, JSON.stringify(all));
    setSaved(true);
    closePanel();
  };

  const declineAll = () => {
    const none: Prefs = { analytics: false, marketing: false };
    setPrefs(none);
    setCookie(COOKIE_NAME, JSON.stringify(none));
    setSaved(true);
    closePanel();
  };

  const savePrefs = () => {
    setCookie(COOKIE_NAME, JSON.stringify(prefs));
    setSaved(true);
    closePanel();
  };

  const toggle = (key: keyof Prefs) =>
    setPrefs((s) => ({ ...s, [key]: !s[key] }));

  // render the trigger locally but portal the backdrop + sheet to document.body
  const panel = (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${panelOpen ? styles.show : ""}`}
        onClick={closePanel}
        aria-hidden={!panelOpen}
        // inline zIndex to ensure it sits above Leaflet map panes / stacking contexts
        style={{ zIndex: 120000, pointerEvents: panelOpen ? "auto" : "none" }}
      />

      {/* Bottom sheet */}
      <aside
        id="cookie-panel"
        ref={sheetRef}
        tabIndex={-1}
        className={`${styles.sheet} ${panelOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-panel-title"
        style={{ zIndex: 120001 }}
      >
        <header className={styles.header}>
          <h3 id="cookie-panel-title">Cookie Preferences</h3>
          <button className={styles.close} onClick={closePanel} aria-label="Close preferences">
            ✕
          </button>
        </header>

        <div className={styles.body}>
          <p className={styles.lead}>
            We use cookies and analytics to improve your experience. Choose which cookies you allow.
          </p>

          <div className={styles.row}>
            <div>
              <div className={styles.rowTitle}>Essential</div>
              <div className={styles.rowDesc}>Required for site functionality. Always enabled.</div>
            </div>
            <div className={styles.switchStatic}>On</div>
          </div>

          <div className={styles.row}>
            <div>
              <div className={styles.rowTitle}>Analytics</div>
              <div className={styles.rowDesc}>Help us understand site usage (anonymous).</div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={prefs.analytics}
                onChange={() => toggle("analytics")}
                aria-label="Enable analytics cookies"
              />
              <span />
            </label>
          </div>

          <div className={styles.row}>
            <div>
              <div className={styles.rowTitle}>Marketing</div>
              <div className={styles.rowDesc}>Used for marketing and personalization.</div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={prefs.marketing}
                onChange={() => toggle("marketing")}
                aria-label="Enable marketing cookies"
              />
              <span />
            </label>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.actionsLeft}>
            <button className={styles.ghost} onClick={declineAll}>Decline</button>
            <button className={styles.ghost} onClick={acceptAll}>Accept All</button>
          </div>

          <div className={styles.actionsRight}>
            <button className={styles.save} onClick={savePrefs}>Save preferences</button>
          </div>
        </footer>
      </aside>
    </>
  );

  return (
    <>
      <button
        className={inFooter ? styles.triggerFooter : styles.trigger}
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-controls="cookie-panel"
      >
        Cookie Preferences
      </button>
      {typeof document !== "undefined" ? createPortal(panel, document.body) : panel}
    </>
  );
}