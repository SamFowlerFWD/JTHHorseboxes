// JTH Design System - Premium Visual Identity 2025

export const colors = {
  // Primary - Deep Premium Blue
  primary: {
    50: 'hsl(220, 60%, 97%)',
    100: 'hsl(220, 60%, 94%)',
    200: 'hsl(220, 60%, 85%)',
    300: 'hsl(220, 60%, 70%)',
    400: 'hsl(220, 60%, 50%)',
    500: 'hsl(220, 60%, 40%)', // Medium Blue
    600: 'hsl(220, 60%, 25%)', // Primary brand color (#173164)
    700: 'hsl(220, 60%, 20%)',
    800: 'hsl(220, 60%, 15%)',
    900: 'hsl(220, 60%, 10%)',
    950: 'hsl(220, 60%, 6%)'
  },
  
  // Accent - Champagne Gold
  accent: {
    50: 'hsl(45, 60%, 97%)',
    100: 'hsl(45, 60%, 92%)',
    200: 'hsl(45, 60%, 82%)',
    300: 'hsl(45, 60%, 70%)',
    400: 'hsl(45, 60%, 58%)',
    500: 'hsl(45, 60%, 50%)', // Champagne Gold (#d4af37)
    600: 'hsl(45, 60%, 42%)',
    700: 'hsl(45, 60%, 35%)',
    800: 'hsl(45, 60%, 28%)',
    900: 'hsl(45, 60%, 20%)'
  },

  // Sophisticated grays
  neutral: {
    0: 'hsl(0, 0%, 100%)',
    50: 'hsl(210, 20%, 98%)',
    100: 'hsl(210, 20%, 96%)',
    200: 'hsl(210, 20%, 90%)',
    300: 'hsl(210, 20%, 80%)',
    400: 'hsl(210, 20%, 60%)',
    500: 'hsl(210, 20%, 45%)',
    600: 'hsl(210, 20%, 35%)',
    700: 'hsl(210, 20%, 25%)',
    800: 'hsl(210, 20%, 15%)',
    900: 'hsl(210, 20%, 10%)',
    950: 'hsl(210, 20%, 5%)'
  }
}

export const typography = {
  // Font families - premium stack
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    display: '"Playfair Display", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace'
  },

  // Fluid typography scales using clamp()
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
    '3xl': 'clamp(2rem, 1.7rem + 1.5vw, 2.5rem)',
    '4xl': 'clamp(2.5rem, 2rem + 2.5vw, 3.5rem)',
    '5xl': 'clamp(3rem, 2.5rem + 3vw, 4.5rem)',
    '6xl': 'clamp(3.5rem, 3rem + 3.5vw, 5.5rem)',
    '7xl': 'clamp(4rem, 3.5rem + 4vw, 6.5rem)'
  },

  // Line heights for optimal readability
  lineHeight: {
    tight: '1.1',
    snug: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75'
  },

  // Letter spacing for elegance
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    luxury: '0.15em' // For premium headings
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
}

export const spacing = {
  // 8-point grid system with mathematical progression
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem' // 384px
}

export const animations = {
  // Timing functions for smooth animations
  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
    luxury: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
  },

  // Animation durations
  duration: {
    instant: '75ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    dissolve: '800ms', // For gallery dissolve effect
    slowest: '1000ms'
  },

  // Predefined animations
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' }
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    slideDown: {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' }
    },
    scaleIn: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' }
    },
    dissolve: {
      '0%': { opacity: '0' },
      '50%': { opacity: '0.5' },
      '100%': { opacity: '1' }
    },
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' }
    },
    pulse: {
      '0%, 100%': { transform: 'scale(1)', opacity: '1' },
      '50%': { transform: 'scale(1.05)', opacity: '0.8' }
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' }
    }
  }
}

export const effects = {
  // Glass morphism styles
  glassmorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    },
    dark: {
      background: 'rgba(17, 25, 40, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.125)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    },
    colored: {
      background: 'linear-gradient(135deg, rgba(23, 49, 100, 0.7) 0%, rgba(212, 175, 55, 0.3) 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(23, 49, 100, 0.15)'
    }
  },

  // Neumorphism styles
  neumorphism: {
    flat: {
      background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
      boxShadow: '5px 5px 10px #bebebe, -5px -5px 10px #ffffff'
    },
    concave: {
      background: 'linear-gradient(145deg, #cacaca, #f0f0f0)',
      boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff'
    },
    convex: {
      background: 'linear-gradient(145deg, #f0f0f0, #cacaca)',
      boxShadow: '10px 10px 20px #bebebe, -10px -10px 20px #ffffff'
    }
  },

  // Modern gradients
  gradients: {
    premium: 'linear-gradient(135deg, #173164 0%, #d4af37 100%)',
    subtle: 'linear-gradient(135deg, rgba(23, 49, 100, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
    dark: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    light: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    hero: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)',
    cta: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
    mesh: `
      background-color: #173164;
      background-image: 
        radial-gradient(at 47% 33%, hsl(220, 80%, 45%) 0, transparent 59%), 
        radial-gradient(at 82% 65%, hsl(45, 60%, 50%) 0, transparent 55%)
    `
  },

  // Box shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    luxury: '0 20px 40px -10px rgba(23, 49, 100, 0.3)',
    gold: '0 20px 40px -10px rgba(212, 175, 55, 0.3)',
    glow: '0 0 20px rgba(212, 175, 55, 0.5)'
  }
}

// Responsive breakpoints
export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  '4xl': '2560px'
}

// Z-index scale for layering
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
  top: 9999
}

// Border radius scale
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
}

// Container settings
export const container = {
  center: true,
  padding: {
    DEFAULT: '1rem',
    sm: '2rem',
    lg: '4rem',
    xl: '5rem',
    '2xl': '6rem'
  },
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}