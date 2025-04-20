import { useEffect, useRef } from 'react';
import { Color } from "@/styles/theme";

interface StarCanvasProps {
  count: number;
  colors: Color[];  // Color 인터페이스 사용
}

export default function StarCanvas({ count = 100, colors }: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    interface Meteor {
      x: number;
      y: number;
      speed: number;
      size: number;
      tail: Array<{ x: number; y: number }>;
      twinkle: number;
      twinkleSpeed: number;
      tailColor: Color;
      glowColor: Color;
      starColor: Color;
      angle: number;
    }
    
    const meteors: Meteor[] = [];

    for (let i = 0; i < count; i++) {
      meteors.push({
        x: Math.random() * canvas.width*2,
        y: -Math.random() * canvas.height,
        speed: Math.random() * 0.5 + 2, // 별똥별 속도
        size: Math.random() * 2 + 1, // 별의 크기
        tail: [],
        twinkle: Math.random() * Math.PI * 2, // 초기 반짝임 위상
        twinkleSpeed: 0.08 + Math.random() * 0.1, // 반짝임 속도
        tailColor: colors[0],
        glowColor: colors[1],
        starColor: colors[2],
        angle: (35 + Math.random() * 7) * Math.PI / 180,
      });
    }


    const animate = () => {
      if (!canvas || !ctx) return; // Defensive check
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((meteor) => {
        // 반짝임 업데이트
        meteor.twinkle += meteor.twinkleSpeed;
        const twinkleIntensity = (Math.sin(meteor.twinkle) + 1) / 2; // 0과 1 사이의 값으로 변환

        // 꼬리 업데이트
        meteor.tail.unshift({ x: meteor.x, y: meteor.y });
        if (meteor.tail.length > 35) {
          meteor.tail.pop();
        }

        // 꼬리 그리기
        for (let i = 0; i < meteor.tail.length - 1; i++) {
          const alpha = 0.8 * (1 - i / meteor.tail.length);
          const lineWidth = meteor.size * (1 - i / meteor.tail.length) * 2;

          ctx.beginPath();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = `rgba(${meteor.tailColor.r}, ${meteor.tailColor.g}, ${meteor.tailColor.b}, ${alpha})`;
          ctx.moveTo(meteor.tail[i].x, meteor.tail[i].y);
          ctx.lineTo(meteor.tail[i + 1].x, meteor.tail[i + 1].y);
          ctx.stroke();
        }

        // 반짝이는 별 head 그리기
        const glowSize = meteor.size * (1 + twinkleIntensity); // 크기 변화
        const glowAlpha = 0.5 + (twinkleIntensity * 0.5); // 투명도 변화

        // 외부 glow 효과
        const gradient = ctx.createRadialGradient(
          meteor.x, meteor.y, 0,
          meteor.x, meteor.y, glowSize * 2
        );
        gradient.addColorStop(0, `rgba(${meteor.glowColor.r}, ${meteor.glowColor.g}, ${meteor.glowColor.b}, ${glowAlpha})`);
        gradient.addColorStop(1, `rgba(${meteor.glowColor.r}, ${meteor.glowColor.g}, ${meteor.glowColor.b}, 0)`);
        
        // 중심 별 그리기
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${meteor.starColor.r}, ${meteor.starColor.g}, ${meteor.starColor.b}, ${glowAlpha + 0.3})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // 별똥별 이동
        meteor.y += meteor.speed * Math.sin(meteor.angle);
        meteor.x -= meteor.speed * Math.cos(meteor.angle);

        // 화면 밖으로 나가면 재설정
        if (meteor.y > canvas.height || meteor.x < -10) {
          meteor.y = -10;
          meteor.x = Math.random() * canvas.width * 2;
          meteor.tail = [];
        }
      });
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => {      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [count, colors]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'url("/asset/night1.jpeg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 2
        }} 
      />
    </div>
  );
}