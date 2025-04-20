//page.tsx
"use client"
import Homepage from "./component/homepage";
import Star from "./component/star";
import styled from '@emotion/styled';   
import StarCanvas from "@/app/component/meteors";
import { useState } from "react";
import { Color, STAR_COLORS } from "@/styles/theme";

export default function Home() {
  const [starCount, setStarCount] = useState(100);
  const [themeIndex, setThemeIndex] = useState(0);

  return (
    <>
    <Maincontainer>
      <div style={{
        position: 'fixed', // fixed로 변경
        zIndex:1
        }}>
      <StarCanvas count={100} colors={STAR_COLORS[themeIndex]} />
      </div>
      <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 3,
          display: 'flex',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '8px'
        }}>
      <button 
            onClick={() => setStarCount(prev => Math.min(prev + 10, 200))}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            + 별 추가
          </button>
          <button 
            onClick={() => setStarCount(prev => Math.max(prev - 10, 10))}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            - 별 감소
          </button>
          <span style={{ color: 'white', alignSelf: 'center' }}>
            현재 별 개수: {starCount}
          </span>
          </div>
      <div style={{
        position: 'relative',
        zIndex: 2
      }}>
        <Homepage />
      </div>
      </Maincontainer>
    </>
  );
}

const Maincontainer = styled.div`

    width: 100%;
    height: 100%;
    background-image: url('asset/night1.jpeg');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        aspect-ratio: 16 / 9;
    z-index: 0;

    
`