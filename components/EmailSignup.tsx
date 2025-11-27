"use client";

import styles from "./EmailSignup.module.css";
import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  return (
    <section className={styles.signup}>
      <div className={styles.container}>
        <h2>Subscribe to Our Newsletter</h2>
        <p>Get the latest updates delivered to your inbox</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Subscribe
          </button>
        </form>

        {submitted && (
          <p className={styles.success}>Thanks for subscribing!</p>
        )}
      </div>
    </section>
  );
}
