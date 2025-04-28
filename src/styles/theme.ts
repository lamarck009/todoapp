//theme.ts
export const colors = {
    a: 'var(--primary-color)',
    primary: ' #4cc35b',
    back: `
        radial-gradient(ellipse at 50% 50%, rgb(0, 31, 13) 30%, transparent 80%),
        radial-gradient(ellipse at 100% 100%, rgb(32, 0, 32) 0%, transparent 30%),
        radial-gradient(ellipse at 0% 0%, rgb(0, 0, 32) 0%, transparent 70%),
        rgb(0, 3, 44)
    `,
    border: ' #bebebe',
    head:'var(--head-color)',
    head2:'var(--head-color2)',
    list:'var(--list-color)',
    write:'#d7ecf8',
    hr: 'linear-gradient(to right, #00c6ff, #0072ff)',
    hover: '#e0e0e0',
    checked: '#1976D2',
    red: '#ff0000',
    btok: '#4caf50',
    btno: '#f44336',
    icon: '#0070f3',
    
} as const;

// 테마 정보를 포함하는 인터페이스 추가
export interface ThemeColor {
  name: string;
  colors: Color[];
}

// STAR_COLORS 배열 수정
export const STAR_COLORS: readonly ThemeColor[] = [
    {
        name: "CLASSIC",
        colors: [
            { r: 55, g: 255, b: 255 },
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 255, b: 255 }
        ]
    },
    {
        name: "WARM",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 223, b: 186 },
            { r: 255, g: 182, b: 193 }
        ]
    },
    {
        name: "COOL",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 173, g: 216, b: 230 },
            { r: 230, g: 230, b: 250 }
        ]
    },
    {
        name: "PURPLE",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 216, g: 180, b: 254 },
            { r: 192, g: 132, b: 252 }
        ]
    },
    {
        name: "GOLD (나트륨)",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 214, b: 186 },
            { r: 255, g: 183, b: 77 }
        ]
    },
    {
        name: "BLUE-WHITE (철)",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 226, g: 242, b: 255 },
            { r: 147, g: 197, b: 253 }
        ]
    },
    {
        name: "GREEN (구리)",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 209, g: 250, b: 229 },
            { r: 110, g: 231, b: 183 }
        ]
    },
    {
        name: "RED (칼슘)",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 254, g: 226, b: 226 },
            { r: 248, g: 113, b: 113 }
        ]
    },
    {
        name: "SILVER (마그네슘)",
        colors: [
            { r: 255, g: 255, b: 255 },
            { r: 43, g: 44, b: 46 },
            { r: 209, g: 213, b: 219 }
        ]
    }
];

// 색상 관련 인터페이스
export interface Color {
  r: number;
  g: number;
  b: number;
}

// 컴포넌트 Props 인터페이스
export interface StarCanvasProps {
  count: number;
  colors: Color[];  
  starspeed: number;
  backgroundImage?: string;
}

export interface ControlsProps {
  themeIndex: number;
  setThemeIndex: (index: number) => void;
  starCount: number;
  setStarCount: (count: number) => void;
  starspeed: number;
  setStarSpeed: (speed: number) => void;
}

// 별 관련 인터페이스
export interface StarDrawParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  size: number;
  spikes?: number;
}

export interface StarGlowParams extends StarDrawParams {
  color: Color;
  alpha: number;
}

// 유성 관련 인터페이스
export interface Meteor {
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
  maxTailLength: number;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface StarContextState {
  starCount: number;
  themeIndex: number;
  starspeed: number;
}

export interface StarContextActions {
  setStarCount: (count: number) => void;
  setThemeIndex: (index: number) => void;
  setStarSpeed: (speed: number) => void;
}

export interface StarContextType extends StarContextState, StarContextActions {}
