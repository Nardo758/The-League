# League Platform Design System

## Brand Identity

### Mission
League Platform is the operating system for recreational sports - professional, reliable, and energizing.

### Design Principles
1. **Energy & Motion** - Evoke the excitement of competition
2. **Clarity First** - Sports data must be instantly readable
3. **Trustworthy** - Handle money and schedules with confidence
4. **Inclusive** - Welcome all skill levels and sports
5. **Mobile-First** - Athletes are always on the go

---

## Color Palette

### Primary Colors
```css
--primary-blue: #0066FF        /* Vibrant, energetic */
--primary-dark: #0052CC        /* Hover states */
--primary-light: #4D94FF       /* Backgrounds */
--primary-pale: #E6F0FF        /* Subtle highlights */
```

### Secondary Colors
```css
--sports-green: #00C853        /* Success, wins, live events */
--sports-orange: #FF6B00       /* Urgent, breaking news */
--sports-purple: #7B2CBF       /* Tournaments, premium */
--sports-gold: #FFB800         /* Achievements, highlights */
```

### Neutral Colors
```css
--gray-900: #111827            /* Primary text */
--gray-800: #1F2937            /* Secondary text */
--gray-700: #374151            /* Tertiary text */
--gray-600: #4B5563            /* Disabled text */
--gray-500: #6B7280            /* Placeholder */
--gray-400: #9CA3AF            /* Borders */
--gray-300: #D1D5DB            /* Dividers */
--gray-200: #E5E7EB            /* Subtle borders */
--gray-100: #F3F4F6            /* Backgrounds */
--gray-50: #F9FAFB             /* Page backgrounds */
--white: #FFFFFF
```

### Sport-Specific Accent Colors
```css
--golf-green: #2D5016
--pickleball-yellow: #FFE500
--bowling-red: #DC2626
--softball-blue: #1E40AF
--tennis-lime: #84CC16
--soccer-emerald: #059669
```

### Semantic Colors
```css
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

---

## Typography

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
--font-display: 'Inter', sans-serif;  /* Headings with tighter tracking */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;  /* Scores, stats */
```

### Font Sizes
```css
/* Display */
--text-5xl: 3rem;      /* 48px - Hero headings */
--text-4xl: 2.25rem;   /* 36px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Section titles */
--text-2xl: 1.5rem;    /* 24px - Card titles */
--text-xl: 1.25rem;    /* 20px - Subheadings */

/* Body */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-base: 1rem;     /* 16px - Default body */
--text-sm: 0.875rem;   /* 14px - Small text */
--text-xs: 0.75rem;    /* 12px - Captions */
--text-2xs: 0.625rem;  /* 10px - Labels */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

---

## Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - Buttons, badges */
--radius-md: 0.5rem;     /* 8px - Cards */
--radius-lg: 0.75rem;    /* 12px - Modals */
--radius-xl: 1rem;       /* 16px - Feature cards */
--radius-2xl: 1.5rem;    /* 24px - Hero sections */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Sport-specific shadows for emphasis */
--shadow-live: 0 0 20px rgba(0, 200, 83, 0.3);      /* Green glow for live */
--shadow-urgent: 0 0 20px rgba(255, 107, 0, 0.3);   /* Orange glow for urgent */
```

---

## Component Styles

### Buttons

#### Primary Button
```css
background: var(--primary-blue);
color: white;
padding: 12px 24px;
border-radius: var(--radius-md);
font-weight: var(--font-semibold);
font-size: var(--text-base);
transition: all 0.2s ease;
box-shadow: var(--shadow-sm);

&:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
background: white;
color: var(--primary-blue);
border: 2px solid var(--primary-blue);
padding: 12px 24px;
border-radius: var(--radius-md);
font-weight: var(--font-semibold);
```

#### Ghost Button
```css
background: transparent;
color: var(--gray-700);
padding: 12px 24px;
border-radius: var(--radius-md);

&:hover {
  background: var(--gray-100);
}
```

### Cards

#### Standard Card
```css
background: white;
border: 1px solid var(--gray-200);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-sm);
transition: all 0.3s ease;

&:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### Live Event Card
```css
background: white;
border: 2px solid var(--sports-green);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-live);
position: relative;

/* Live indicator pulse */
&::before {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: var(--sports-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

### Badges & Tags

#### Status Badge
```css
display: inline-flex;
align-items: center;
padding: 4px 12px;
border-radius: var(--radius-full);
font-size: var(--text-xs);
font-weight: var(--font-semibold);
text-transform: uppercase;
letter-spacing: 0.05em;
```

Status variants:
- **Live**: background: #DCFCE7, color: #166534
- **Upcoming**: background: #DBEAFE, color: #1E40AF
- **Completed**: background: #F3F4F6, color: #4B5563
- **Urgent**: background: #FED7AA, color: #9A3412

### Forms

#### Input Fields
```css
width: 100%;
padding: 12px 16px;
border: 2px solid var(--gray-300);
border-radius: var(--radius-md);
font-size: var(--text-base);
transition: all 0.2s ease;

&:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px var(--primary-pale);
}

&::placeholder {
  color: var(--gray-500);
}
```

#### Select Dropdown
```css
width: 100%;
padding: 12px 16px;
padding-right: 40px;
border: 2px solid var(--gray-300);
border-radius: var(--radius-md);
background: white;
background-image: url("data:image/svg+xml...");  /* Custom chevron */
appearance: none;
```

---

## Navigation

### Top Navigation
```css
height: 64px;
background: white;
border-bottom: 1px solid var(--gray-200);
backdrop-filter: blur(10px);
position: sticky;
top: 0;
z-index: 50;
```

### Sidebar Navigation
```css
width: 256px;
background: white;
border-right: 1px solid var(--gray-200);

.nav-item {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  
  &.active {
    background: var(--primary-pale);
    color: var(--primary-blue);
    font-weight: var(--font-semibold);
  }
  
  &:hover {
    background: var(--gray-100);
  }
}
```

---

## Data Display

### Score Display
```css
font-family: var(--font-mono);
font-size: var(--text-3xl);
font-weight: var(--font-bold);
color: var(--primary-blue);
letter-spacing: -0.02em;
```

### Stats Grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
gap: var(--space-4);

.stat-item {
  text-align: center;
  
  .stat-label {
    font-size: var(--text-xs);
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .stat-value {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--gray-900);
  }
}
```

### Standings Table
```css
width: 100%;
border-collapse: collapse;

thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
  
  th {
    padding: 12px 16px;
    text-align: left;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--gray-600);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

tbody {
  tr {
    border-bottom: 1px solid var(--gray-200);
    transition: background 0.2s ease;
    
    &:hover {
      background: var(--gray-50);
    }
  }
  
  td {
    padding: 16px;
    font-size: var(--text-sm);
  }
}
```

---

## Animations

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### Keyframes

#### Pulse (for live indicators)
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

#### Slide In
```css
@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## Iconography

### Icon System
- Use Lucide React icons for consistency
- Default size: 20px (w-5 h-5)
- Sport emojis for quick recognition: 🏌️ ⚾ 🏓 🎳 🎾 ⚽

### Icon Colors by Context
- **Primary actions**: var(--primary-blue)
- **Success/Live**: var(--sports-green)
- **Warning**: var(--sports-orange)
- **Info**: var(--gray-600)
- **Error**: var(--error)

---

## Sport Branding

### Golf
- Primary: Deep green (#2D5016)
- Accent: Gold (#FFB800)
- Icons: 🏌️ 🏌️‍♀️ ⛳

### Pickleball
- Primary: Bright yellow (#FFE500)
- Accent: Teal (#14B8A6)
- Icons: 🏓 🎾

### Bowling
- Primary: Bold red (#DC2626)
- Accent: Navy (#1E3A8A)
- Icons: 🎳

### Softball
- Primary: Royal blue (#1E40AF)
- Accent: Red (#DC2626)
- Icons: ⚾ 🥎

### Tennis
- Primary: Lime green (#84CC16)
- Accent: Yellow (#FBBF24)
- Icons: 🎾 🎾

### Soccer
- Primary: Emerald (#059669)
- Accent: Orange (#F97316)
- Icons: ⚽

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet */
--breakpoint-lg: 1024px;   /* Desktop */
--breakpoint-xl: 1280px;   /* Large desktop */
--breakpoint-2xl: 1536px;  /* Extra large */
```

### Mobile-First Approach
All designs start mobile and scale up:
```css
/* Mobile first (default) */
.container { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container { padding: 32px; }
}
```

---

## Layout Patterns

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Grid System
```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}
```

---

## Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}
```

### Color Contrast
- All text meets WCAG AA standards
- Primary blue (#0066FF) on white: 4.5:1 ratio
- Gray-700 (#374151) on white: 10.7:1 ratio

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

### Hero Section
```jsx
<div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
  <div className="max-w-7xl mx-auto px-6 py-20">
    <h1 className="text-5xl font-bold mb-4">
      Find Your Next League
    </h1>
    <p className="text-xl text-blue-100 mb-8">
      Discover and join recreational sports leagues near you
    </p>
    <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl">
      Browse Leagues
    </button>
  </div>
</div>
```

### Stat Card
```jsx
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div className="text-sm text-gray-600 uppercase tracking-wide">
      Win Rate
    </div>
    <TrendingUp className="w-5 h-5 text-green-600" />
  </div>
  <div className="text-4xl font-bold text-gray-900 mb-2">
    68%
  </div>
  <div className="text-sm text-green-600">
    ↑ 5% from last season
  </div>
</div>
```

### Live Event Badge
```jsx
<div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
  <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
  <span className="text-xs font-semibold uppercase">Live</span>
</div>
```

---

## Design Tokens Export

For developers using Tailwind CSS, here's the config:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          dark: '#0052CC',
          light: '#4D94FF',
          pale: '#E6F0FF',
        },
        sports: {
          green: '#00C853',
          orange: '#FF6B00',
          purple: '#7B2CBF',
          gold: '#FFB800',
        },
        golf: '#2D5016',
        pickleball: '#FFE500',
        bowling: '#DC2626',
        softball: '#1E40AF',
        tennis: '#84CC16',
        soccer: '#059669',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
}
```

---

## Summary

This design system creates a cohesive, professional, and energetic brand that:
- **Feels athletic** - Bold colors, clear hierarchy, dynamic animations
- **Builds trust** - Professional typography, consistent spacing, accessible
- **Scales well** - From mobile to desktop, from golf to soccer
- **Reduces friction** - Clear CTAs, intuitive navigation, instant feedback

The blue primary color conveys trust and professionalism, while sport-specific accent colors add personality. The system is flexible enough to accommodate any recreational sport while maintaining brand consistency.
