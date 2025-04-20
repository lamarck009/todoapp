import { useEffect, useRef } from 'react';

export default function StarCanvas({ count = 100 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const meteors: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
      tail: Array<{ x: number; y: number }>;
      twinkle: number; // 반짝임을 위한 값 추가
      twinkleSpeed: number; // 반짝임 속도를 위한 값 추가
    }> = [];

    for (let i = 0; i < count; i++) {
      meteors.push({
        x: Math.random() * canvas.width*2,
        y: -Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 2 + 1,
        tail: [],
        twinkle: Math.random() * Math.PI * 2, // 초기 반짝임 위상
        twinkleSpeed: 0.1 + Math.random() * 0.2 // 반짝임 속도
      });
    }


    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((meteor) => {
        // 반짝임 업데이트
        meteor.twinkle += meteor.twinkleSpeed;
        const twinkleIntensity = (Math.sin(meteor.twinkle) + 1) / 2; // 0과 1 사이의 값

        // 꼬리 업데이트
        meteor.tail.unshift({ x: meteor.x, y: meteor.y });
        if (meteor.tail.length > 35) {
          meteor.tail.pop();
        }

        // 꼬리 그리기
        for (let i = 0; i < meteor.tail.length - 1; i++) {
          const alpha = 0.8 * (1 - i / meteor.tail.length);
          const lineWidth = meteor.size * (1 - i / meteor.tail.length) * 1.5;

          ctx.beginPath();
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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
        gradient.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // 중심 별
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha + 0.3})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // 별똥별 이동
        meteor.y += meteor.speed;
        meteor.x -= meteor.speed;

        // 화면 밖으로 나가면 재설정
        if (meteor.y > canvas.height) {
          meteor.y = -10;
          meteor.x = Math.random() * canvas.width * 2;
          meteor.tail = [];
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count]);

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