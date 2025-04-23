// layouts/Layout.tsx
'use client'
import React from 'react';
import { useStarContext } from '@/context/StarContext';
import StarCanvas from '@/component/meteors';
import styled from '@emotion/styled';
import {STAR_COLORS, LayoutProps} from '@/styles/theme';
import Controls from '@/component/Controls';

const Layout = React.memo<LayoutProps>(({ children }) => {
    const { starCount, starspeed, themeIndex } = useStarContext();
  
  // 테마 색상 설정 (예시)


  return (
    <LayoutWrapper>
      <StarCanvas 
        count={starCount}
        colors={STAR_COLORS[themeIndex].colors}  // .colors로 접근
        starspeed={starspeed}
      />
     
      <ContentWrapper>
      <Controls />
        {children}
      </ContentWrapper>
    </LayoutWrapper>
  );
});

export default Layout;

const LayoutWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3; // StarCanvas의 z-index보다 높게 설정
  width: 100%;
  height: 100%;
`;