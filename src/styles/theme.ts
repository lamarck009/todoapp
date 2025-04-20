//theme.ts
export const colors = {
    primary: ' #4cc35b',
    back: `
        radial-gradient(ellipse at 50% 50%, rgb(0, 31, 13) 30%, transparent 80%),
        radial-gradient(ellipse at 100% 100%, rgb(32, 0, 32) 0%, transparent 30%),
        radial-gradient(ellipse at 0% 0%, rgb(0, 0, 32) 0%, transparent 70%),
        rgb(0, 3, 44)
    `,
    border: '#bebebe',
    head:' #4399C8',
    head2:'rgb(255, 255, 255)',
    list:'rgb(215, 236, 248)',
    hr: 'linear-gradient(to right, #00c6ff, #0072ff)',
    hover: '#e0e0e0',
    checked: '#1976D2',
    red: '#ff0000',
    btok: '#4caf50',
    btno: '#f44336',
} as const;

export const STAR_COLORS: Color[][] = [
    // CLASSIC
    [{ r: 255, g: 255, b: 255 },
     { r: 255, g: 255, b: 255 },
     { r: 255, g: 255, b: 255 }
    ],
    
    // WARM
    [
      { r: 255, g: 255, b: 255 },
      { r: 255, g: 223, b: 186 },
      { r: 255, g: 182, b: 193 }
    ],
    
    // COOL
    [
      { r: 255, g: 255, b: 255 },
      { r: 173, g: 216, b: 230 },
      { r: 230, g: 230, b: 250 }
    ]
  ];

  export interface Color {
    r: number;
    g: number;
    b: number;
  }  