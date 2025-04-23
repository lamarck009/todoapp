// components/Controls.tsx
'use client'
import styled from "@emotion/styled";
import { Color, STAR_COLORS } from "@/styles/theme";
import { useStarContext } from "@/context/StarContext"; // StarContext에서 useStarContext 훅 가져오기
  
const Controls = () => {
    const { 
      themeIndex, 
      setThemeIndex, 
      starCount, 
      setStarCount, 
      starspeed, 
      setStarSpeed 
    } = useStarContext();


    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 3,
          display: "flex",
          gap: "10px",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "20px",
          borderRadius: "8px",
          alignItems: "center",
          
        }}
      >
        <Button
          onClick={() => {
            setThemeIndex((themeIndex + 1) % STAR_COLORS.length);
          }}
        >
          테마 변경
        </Button>
        <div style={{ color: "white", display: "flex", alignItems: "center", flexDirection: "column", gap: "10px"}}>
          <Slider
            type="range"
            min={10}
            max={100}
            value={starCount}
            onChange={(e) => setStarCount(Number(e.target.value))}
          />
          <InfoText>현재 별 개수: {starCount}</InfoText>
          
        </div>
        
        <div style={{ color: "white", display: "flex", alignItems: "center", flexDirection: "column", gap: "10px"}}>
          <Slider
            type="range"
            min={0}  // 최소값을 0.1로 설정
            max={5}
            step={0.1}  // 0.1 단위로 조절 가능
            value={starspeed}
            onChange={(e) => setStarSpeed(Number(e.target.value))}
          />
          <InfoText>별 속도: {starspeed}</InfoText>
        </div>
      </div>
    );
  };

  const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px; // 오타 수정
  border: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease; // 부드러운 효과 추가

  &:hover {
    background: #f0f0f0;
  }
`;

const SliderContainer = styled.div`
  position: relative;
  width: 100px;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -5px;
    height: 10px;
    background: repeating-linear-gradient(
      to right,
      #fff 0%,
      #fff 2px,
      transparent 2px,
      transparent 20%
    );
  }
`;


const Slider = styled.input`
  width: 100px;
  margin-left: 10px;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #ddd;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
  }
`;

const InfoText = styled.span`
  color: white;
  user-select: none;  // 텍스트 선택 방지
  -webkit-user-select: none;  // Safari 지원
  -moz-user-select: none;     // Firefox 지원
  -ms-user-select: none;      // IE/Edge 지원
`;

  export default Controls;