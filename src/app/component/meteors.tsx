import { useEffect, useRef } from "react";
import { Color } from "@/styles/theme";

// 컴포넌트 props 타입 정의
interface StarCanvasProps {
  count: number; // 생성할 유성의 수
  colors: Color[]; // 유성에 사용될 색상 배열
}

export default function StarCanvas({ count = 100, colors }: StarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // 유성 객체의 속성 타입 정의
    interface Meteor {
      x: number; // x 좌표
      y: number; // y 좌표
      speed: number; // 이동 속도
      size: number; // 유성 크기
      tail: Array<{ x: number; y: number }>; // 꼬리의 각 점 위치 배열
      twinkle: number; // 반짝임 위상
      twinkleSpeed: number; // 반짝임 속도
      tailColor: Color; // 꼬리 색상
      glowColor: Color; // 발광 효과 색상
      starColor: Color; // 중심 별 색상
      angle: number; // 이동 각도
      maxTailLength: number; // 최대 꼬리 길이
    }

    const meteors: Meteor[] = [];

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 1;
      meteors.push({
        x: Math.random() * canvas.width * 2,
        y: -Math.random() * canvas.height,
        speed: Math.random() * 0.5 + 2, // 별똥별 속도
        size: size, // 별똥별 크기
        tail: [],
        twinkle: Math.random() * Math.PI * 2, // 초기 반짝임 위상
        twinkleSpeed: 0.08 + Math.random() * 0.1, // 반짝임 속도
        tailColor: colors[2],
        glowColor: colors[2],
        starColor: colors[2],
        angle: ((42 + Math.random() * 4) * Math.PI) / 180,
        maxTailLength: size * 15, // 최대 꼬리 길이 (별 크기에 비례)
      });
    }

    const animate = () => {
      if (!canvas || !ctx) return; // Defensive check
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      meteors.forEach((meteor) => {
        // 화면 상의 상대적 위치에 따른 꼬리 길이 계산
        const screenProgress = Math.pow(meteor.x / (canvas.width * 2), 2);
        const currentMaxLength = Math.floor(
          meteor.maxTailLength * (1 - screenProgress)
        );
        // 반짝임 업데이트
        meteor.twinkle += meteor.twinkleSpeed;
        const twinkleIntensity = (Math.sin(meteor.twinkle) + 1) / 2; // 0과 1 사이의 값으로 변환

        // 꼬리 업데이트
        meteor.tail.unshift({ x: meteor.x, y: meteor.y });
        if (meteor.tail.length > currentMaxLength) {
          meteor.tail.length = currentMaxLength; // 꼬리 길이 조절
        }

        if (meteor.tail.length > 1) {
          const startPoint = meteor.tail[0];
          const endPoint = meteor.tail[meteor.tail.length - 1];

          // 꼬리의 방향 각도 계산
          const angle = Math.atan2(
            endPoint.y - startPoint.y,
            endPoint.x - startPoint.x
          );

          // 시작점에서의 꼬리 너비
          const startWidth = meteor.size * 1;

          // 각 점의 위치에 따른 너비 계산
          const points = meteor.tail.map((point, index) => {
            // index가 증가할수록(꼬리 끝으로 갈수록) 너비가 감소
            const widthRatio = 1 - index / meteor.tail.length;
            const currentWidth = startWidth * widthRatio;

            return {
              left: {
                x: point.x + Math.cos(angle + Math.PI / 2) * currentWidth,
                y: point.y + Math.sin(angle + Math.PI / 2) * currentWidth,
              },
              right: {
                x: point.x + Math.cos(angle - Math.PI / 2) * currentWidth,
                y: point.y + Math.sin(angle - Math.PI / 2) * currentWidth,
              },
            };
          });

          // 그라데이션 생성
          const gradient = ctx.createLinearGradient(
            startPoint.x,
            startPoint.y,
            endPoint.x,
            endPoint.y
          );
          
          gradient.addColorStop(
            0,
            `rgba(${meteor.tailColor.r}, ${meteor.tailColor.g}, ${meteor.tailColor.b}, 0.8)`
          );
          gradient.addColorStop(
            1,
            `rgba(255, 255, 255, 0)`
          );

          // 꼬리 그리기 과정
          ctx.beginPath(); // 새로운 경로 시작

          // 왼쪽 면 그리기
          ctx.moveTo(points[0].left.x, points[0].left.y); // 시작점 이동
          points.forEach((point) => {
            ctx.lineTo(point.left.x, point.left.y); // 왼쪽 점들을 연결
          });

          // 오른쪽 면 그리기 (역순)
          for (let i = points.length - 1; i >= 0; i--) {
            ctx.lineTo(points[i].right.x, points[i].right.y); // 오른쪽 점들을 연결
          }

          ctx.closePath(); // 현재 경로의 끝점과 시작점을 자동으로 연결
          ctx.fillStyle = gradient;
          ctx.fill(); // 닫힌 경로 내부를 채움
        }

        // 반짝이는 별 head 그리기
        const glowSize = meteor.size * (1 + twinkleIntensity); // 크기 변화
        const glowAlpha = 0.5 + twinkleIntensity * 0.5; // 투명도 변화

        // 외부 glow 효과
        const gradient = ctx.createRadialGradient(
          meteor.x,
          meteor.y,
          0,
          meteor.x,
          meteor.y,
          glowSize * 2
        );
        gradient.addColorStop(
          0,
          `rgba(${meteor.glowColor.r}, ${meteor.glowColor.g}, ${meteor.glowColor.b}, ${glowAlpha})`
        );
        gradient.addColorStop(
          1,
          `rgba(${meteor.glowColor.r}, ${meteor.glowColor.g}, ${meteor.glowColor.b}, 0)`
        );

        // 중심 별 그리기
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${meteor.starColor.r}, ${meteor.starColor.g}, ${
          meteor.starColor.b
        }, ${glowAlpha + 0.3})`;
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

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [count, colors]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: 'url("/asset/night1.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}
