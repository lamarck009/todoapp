"use client";
import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { StarCanvasProps } from "@/styles/theme"; // StarCanvasProps 타입 가져오기
import { StarDrawParams } from "@/styles/theme";
import { Meteor } from "@/styles/theme";
import { StarGlowParams } from "@/styles/theme";

export default function StarCanvas({ count = 100, colors, starspeed = 2}: StarCanvasProps) {
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

    const drawStar = ({ ctx, x, y, size, spikes = 5 }: StarDrawParams) => {
      let rotation = (Math.PI / 2) * 3;
      let step = Math.PI / spikes;

      ctx.beginPath();
      for (let i = 0; i < spikes; i++) {
        let outerX = x + Math.cos(rotation) * size;
        let outerY = y + Math.sin(rotation) * size;

        if (i === 0) {
          ctx.moveTo(outerX, outerY);
        } else {
          ctx.lineTo(outerX, outerY);
        }

        let innerX = x + Math.cos(rotation + step) * (size / 2);
        let innerY = y + Math.sin(rotation + step) * (size / 2);
        ctx.lineTo(innerX, innerY);

        rotation += step * 2;
      }

      ctx.closePath();
    };

    // 별 모양 글로우 효과를 그리는 함수
    const drawStarGlow = ({ ctx, x, y, size, color, alpha, spikes = 5 }: StarGlowParams) => {
      const layers = 15; // 글로우 효과의 레이어 수
      const sizeStep = size / layers;

      for (let i = layers; i > 0; i--) {
        const currentSize = sizeStep * i;
        const currentAlpha = alpha * Math.pow((layers - i + 1) / layers, 2);

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${currentAlpha})`;
        ctx.beginPath();
    drawStar({ ctx, x, y, size: currentSize, spikes });
        ctx.fill();
      }
    };



    const meteors: Meteor[] = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 1;
      meteors.push({
        x: Math.random() * canvas.width * 2,
        y: -Math.random() * canvas.height,
        speed: Math.random() * 0.5 + starspeed, // 별똥별 속도
        size: size, // 별똥별 크기
        tail: [],
        twinkle: Math.random() * Math.PI * 2, // 초기 반짝임 위상
        twinkleSpeed: 0.08 + Math.random() * 0.1, // 반짝임 속도
        tailColor: colors[0],
        glowColor: colors[1],
        starColor: colors[2],
        angle: ((42 + Math.random() * 4) * Math.PI) / 180,
        maxTailLength: 50+ size * 15, // 최대 꼬리 길이 (별 크기에 비례)
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
          const startWidth = meteor.size*0.7;

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
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

          // 꼬리 그리기 과정
          ctx.beginPath(); // 새로운 경로 시작



// 완전한 원 그리기 (시작 부분)
const firstPoint = points[0];
const radius = startWidth; // 반지름
const centerX = firstPoint.left.x + (firstPoint.right.x - firstPoint.left.x) / 2;
const centerY = firstPoint.left.y + (firstPoint.right.y - firstPoint.left.y) / 2;

// 원 그리기
ctx.moveTo(centerX + radius, centerY); // 원의 오른쪽 지점부터 시작
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

// 꼬리와 연결
ctx.moveTo(points[0].right.x, points[0].right.y);

// 오른쪽 면 그리기
points.forEach((point) => {
  ctx.lineTo(point.right.x, point.right.y);
});

// 왼쪽 면 그리기 (역순)
for (let i = points.length - 1; i >= 0; i--) {
  ctx.lineTo(points[i].left.x, points[i].left.y);
}

          ctx.closePath(); // 현재 경로의 끝점과 시작점을 자동으로 연결
          ctx.fillStyle = gradient;
          ctx.fill(); // 닫힌 경로 내부를 채움
        }

        // 반짝이는 별 head 그리기
        const glowSize = meteor.size * (1 + twinkleIntensity); // 크기 변화
        const glowAlpha = 0.5 + twinkleIntensity * 0.5; // 투명도 변화

        // 중심 별 그리기
        // 외부 글로우 효과
        drawStarGlow({
          ctx,
          x: meteor.x,
          y: meteor.y,
          size: glowSize * 3,
          color: meteor.glowColor,
          alpha: glowAlpha * 0.3,
          spikes: 5
        });

        // 중간 글로우 효과
        drawStarGlow({
          ctx,
          x: meteor.x,
          y: meteor.y,
          size: glowSize * 2,
          color: meteor.glowColor,
          alpha: glowAlpha * 0.5,
          spikes: 5
        });

        // 중심 별
        ctx.fillStyle = `rgba(${meteor.starColor.r}, ${meteor.starColor.g}, ${
          meteor.starColor.b
        }, ${glowAlpha + 0.3})`;
        drawStar({
          ctx,
          x: meteor.x,
          y: meteor.y,
          size: glowSize,
          spikes: 5
        });
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
  }, [count, colors, starspeed]);

  return (
    <Background>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </Background>
  );
}

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/asset/night1.jpeg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3); // 배경에 어두운 오버레이 추가 (선택사항)
    z-index: 1;
  }
`;