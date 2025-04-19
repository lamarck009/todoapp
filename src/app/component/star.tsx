'use client'
import { useState, useEffect, JSX } from 'react';
import styles from '@/css/star.module.css';
import { start } from 'repl';

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
}

const Meteor = ({ duration, delay, style, randomLeft }: StarProps) => {
    const randomTwinkleTime = Math.random() * 2;
    
    const randomTop = -(Math.random() * 50 + 10); // 화면 위쪽 바깥에서 시작 (음수 값)
    const meteorStyle = {
        ...style,
        top: `${randomTop}vh`, // 화면 위쪽 바깥에서 시작
        left: `${randomLeft}%`,
        animationName: styles.meteorMove,
        animationDuration: `${duration || 12}s`,
        animationTimingFunction: 'linear',
        animationDelay: `${delay || 0}s`,
        animationFillMode: 'forwards'
    };

    const starStyle = {
        animationName: styles.starTwinkle,
        animationDuration: `${randomTwinkleTime}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite'
    };

    return (
        <div className={styles.meteorContainer} style={meteorStyle}>
            <div className={styles.star} style={starStyle} />
            <div className={styles.tail} />
        </div>
    );
};

export default function PageDesign({ count = 5 }: StarProps) {
    const [meteorsnumber, setMeteors] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const createMeteors = () => {
            const meteors: JSX.Element[] = [];
            for (let i = 0; i < count; i++) {
                const delay = Math.random() * 5 ;
                const startX = Math.random() * 100;
                meteors.push(
                    <Meteor
                        key={`meteor-${Date.now()}-${i}`}
                        style={{ ['--start-x' as string]: `${startX}vw` }}
                        duration={Math.random() * 3 + 3}
                        delay={delay}
                        randomLeft={(100 / count) * i}
                    />
                );
                
            }
            setMeteors(prev => [...prev, ...meteors].slice(-count * 10));
        };

        createMeteors();
        const interval = setInterval(createMeteors, 4000);

        return () => {
            clearInterval(interval);
            setMeteors([]);
        };
    }, [count]);

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 2, 
        }}>
            {meteorsnumber}    
        </div>
    );
}