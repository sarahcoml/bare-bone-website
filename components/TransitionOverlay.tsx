"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TransitionContext = createContext<any>(null);

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (show) setVisible(true);
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) {
      setVisible(false);
      if (navigateTo) {
        router.push(navigateTo);
        setNavigateTo(null);
      }
    }
  };

  return (
    <TransitionContext.Provider value={{ show, setShow, setNavigateTo }}>
      {children}
      {visible && (
        <StickerTransition show={show} onAnimationEnd={handleAnimationEnd} />
      )}
    </TransitionContext.Provider>
  );
}

function StickerTransition({ show, onAnimationEnd }: { show: boolean; onAnimationEnd: () => void }) {
  const stickers = [];
  for (let i = 0; i < 60; i++) {
    stickers.push(
      <img
        key={i}
        src="/images/sticker1.png"
        alt=""
        style={{
          position: "absolute",
          left: `${(i % 10) * 10}%`,
          top: `${Math.floor(i / 10) * 20}%`,
          width: "80px",
          height: "80px",
          opacity: 0.85,
          animation: "popIn 0.5s cubic-bezier(.68,-0.55,.27,1.55) forwards",
          animationDelay: `${Math.random() * 0.4}s`,
        }}
      />
    );
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 99999,
        pointerEvents: "none",
        overflow: "hidden",
        display: "block",
        animation: !show ? "fadeOut 0.7s forwards" : undefined,
      }}
      onAnimationEnd={e => {
        if (e.target === e.currentTarget && e.animationName === "fadeOut") {
          onAnimationEnd();
        }
      }}
    >
      {stickers}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.2) rotate(-30deg); opacity: 0; }
          80% { transform: scale(1.1) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}