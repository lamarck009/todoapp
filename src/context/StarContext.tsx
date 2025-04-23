// contexts/StarContext.tsx
'use client'
import { createContext, useContext, useState } from 'react';
import { StarContextType } from '@/styles/theme';
const StarContext = createContext<StarContextType | undefined>(undefined);

export function StarProvider({ children }: { children: React.ReactNode }) {
  const [starCount, setStarCount] = useState(50);
  const [themeIndex, setThemeIndex] = useState(0);
  const [starspeed, setStarSpeed] = useState(1);

  return (
    <StarContext.Provider 
      value={{ 
        starCount, 
        setStarCount, 
        themeIndex, 
        setThemeIndex, 
        starspeed, 
        setStarSpeed 
      }}
    >
      {children}
    </StarContext.Provider>
  );
}

export function useStarContext() {
  const context = useContext(StarContext);
  if (!context) {
    throw new Error('useStarContext must be used within a StarProvider');
  }
  return context;
}