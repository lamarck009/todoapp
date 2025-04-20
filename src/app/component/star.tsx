"use client";
import { useState, useEffect, JSX } from "react";
import styles from "@/css/star.module.css";
import { start } from "repl";

interface StarProps {
  startPosition?: number;
  top?: number;
  randomLeft?: number; // 새로운 prop 추가
  right?: number;
  delay?: number;
  duration?: number;
  count?: number;
  style?: React.CSSProperties;
  twinkleTime?: number;
  onAnimationEnd?: () => void; // 애니메이션 종료 시 호출될 콜백 함수
}

const Meteor = ({ duration, delay, style, randomLeft, onAnimationEnd = () => {} // 기본값 제공
}: StarProps) => {
  const randomTwinkleTime = Math.random() * 2;

  const randomTop = -(Math.random() * 50 + 10); // 화면 위쪽 바깥에서 시작 (음수 값)
  const meteorStyle = {
    ...style,
    top: `${randomTop}vh`, // 화면 위쪽 바깥에서 시작
    left: `${randomLeft}%`,
    animationName: styles.meteorMove,
    animationDuration: `${duration || 12}s`,
    animationTimingFunction: "linear",
    animationDelay: `${delay || 0}s`,
    animationFillMode: "forwards",
  };

  const starStyle = {
    animationName: styles.starTwinkle,
    animationDuration: `${randomTwinkleTime}s`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  };

  return (
    <div className={styles.meteorContainer} style={meteorStyle}
    onAnimationEnd={() => onAnimationEnd()}// 애니메이션 종료 시 콜백
    >
      <div className={styles.star} style={starStyle} />
      <div className={styles.tail} />
    </div>
  );
};

export default function PageDesign({ count = 5 }: StarProps) {
  const [meteorsnumber, setMeteors] = useState<Array<{id: string, element: JSX.Element}>>([]);

  const removeMeteor = (id: string) => {
    setMeteors(prev => prev.filter(meteor => meteor.id !== id));
};


  useEffect(() => {
    const createMeteors = () => {
        const newMeteors: Array<{id: string, element: JSX.Element}> = []; // 타입 명시
        for (let i = 0; i < count; i++) {
        const delay = Math.random() * 5;
        const startX = Math.random() * 100;
        const meteorId = `meteor-${Date.now()}-${i}`;
        newMeteors.push({
            id: meteorId,
            element: (

          <Meteor
          key={meteorId}
          onAnimationEnd={() => removeMeteor(meteorId)}
          style={{ ["--start-x" as string]: `${startX}vw` }}
            duration={Math.random() * 3 + 3}
            delay={delay}
            randomLeft={(100 / count) * i}
            />
        )
      });
    }
    setMeteors(prev => [...prev, ...newMeteors].slice(-count * 10));
    };

    createMeteors();
    const interval = setInterval(createMeteors, 7000);

    return () => {
      clearInterval(interval);
      setMeteors([]);
    };
  }, [count]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {meteorsnumber.map(meteor => meteor.element)} {/* 요소만 렌더링 */}
      </div>
  );
}
