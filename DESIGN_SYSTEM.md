# HomeMAXX Design System

## 1. Design Principles
1. **User-Centric**: Every design decision prioritizes the needs of homeowners and real estate investors
2. **Clarity**: Clear visual hierarchy and intuitive navigation
3. **Trust**: Professional aesthetic that builds credibility
4. **Efficiency**: Streamlined processes for property evaluation and offers
5. **Accessibility**: WCAG 2.1 AA compliance minimum

## 2. Color Palette

### Primary Colors
- Primary: #007CF0 (Vibrant Blue)
- Secondary: #00DFD8 (Cyan)
- Accent: #FF4D4D (Coral)

### Neutral Colors
- Dark: #0D1117 (Dark Blue)
- Darker: #090C10 (Darker Blue)
- Light: #E6EDF3 (Off-White)
- Gray: #7D8590 (Medium Gray)
- Light Gray: #F6F8FA (Light Gray)

### Semantic Colors
- Success: #2ECC71
- Warning: #F39C12
- Error: #E74C3C
- Info: #3498DB

## 3. Typography

### Font Family
- Primary: 'Inter', -apple-system, system-ui, sans-serif
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif

### Type Scale
- H1: 3.5rem (56px)
- H2: 2.5rem (40px)
- H3: 2rem (32px)
- H4: 1.5rem (24px)
- H5: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Caption: 0.75rem (12px)

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700
- ExtraBold: 800

## 4. Spacing System
- Base Unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768

## 5. Breakpoints
- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: 1024px+

## 6. Shadows
- Small: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
- Medium: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)
- Large: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)
- X-Large: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)

## 7. Border Radius
- Small: 4px
- Medium: 8px
- Large: 16px
- Full: 9999px

## 8. Animation & Transitions
- Fast: 150ms ease-in-out
- Normal: 300ms ease-in-out
- Slow: 500ms ease-in-out
- Bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6)

## 9. Z-Index Scale
- Base: 1
- Dropdown: 100
- Sticky: 200
- Fixed: 300
- Modal: 400
- Toast: 500
- Tooltip: 600

## 10. Component Library
### Buttons
- Primary
- Secondary
- Outline
- Text
- Icon
- Floating Action Button (FAB)

### Forms
- Text Input
- Select
- Checkbox
- Radio
- Toggle
- Slider
- Date Picker

### Navigation
- Top Navigation
- Sidebar
- Breadcrumbs
- Pagination
- Tabs
- Stepper

### Feedback
- Alert
- Toast
- Tooltip
- Modal
- Drawer
- Progress
- Skeleton

### Data Display
- Card
- Table
- List
- Grid
- Carousel
- Accordion
- Timeline

### Overlays
- Modal
- Drawer
- Popover
- Tooltip
- Toast

## 11. Accessibility
- Color Contrast: Minimum 4.5:1 for normal text, 3:1 for large text
- Focus States: Clearly visible focus indicators
- Keyboard Navigation: Full keyboard accessibility
- ARIA: Proper ARIA labels and roles
- Reduced Motion: Respect user preferences
- Screen Reader: Tested with screen readers

## 12. Icons
- System: Material Icons
- Size: 16px, 20px, 24px, 32px, 48px
- Weight: Filled, Outlined, Rounded

## 13. Grid System
- 12-column responsive grid
- Gutter: 24px
- Max-width: 1200px
- Container padding: 16px (mobile), 24px (tablet+)

## 14. Responsive Breakpoints
```css
/* Mobile-first approach */
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}
```

## 15. Design Tokens
```css
:root {
  /* Colors */
  --color-primary: #007CF0;
  --color-secondary: #00DFD8;
  --color-accent: #FF4D4D;
  --color-dark: #0D1117;
  --color-darker: #090C10;
  --color-light: #E6EDF3;
  --color-gray: #7D8590;
  --color-light-gray: #F6F8FA;
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  /* Spacing */
  --spacing-xxs: 0.25rem;  /* 4px */
  --spacing-xs: 0.5rem;   /* 8px */
  --spacing-sm: 0.75rem;  /* 12px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-xxl: 3rem;    /* 48px */
  
  /* Border Radius */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 1rem;     /* 16px */
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Z-Index */
  --z-index-dropdown: 100;
  --z-index-sticky: 200;
  --z-index-fixed: 300;
  --z-index-modal: 400;
  --z-index-toast: 500;
  --z-index-tooltip: 600;
}
```

## 16. Component Examples
### Button Component
```html
<button class="btn btn-primary">
  <span class="btn__content">Get Offer</span>
  <span class="btn__icon">→</span>
</button>
```

### Card Component
```html
<article class="card">
  <div class="card__image">
    <img src="property-image.jpg" alt="Property">
    <span class="card__badge">Featured</span>
  </div>
  <div class="card__content">
    <h3 class="card__title">123 Main St, Anytown</h3>
    <p class="card__price">$450,000</p>
    <div class="card__meta">
      <span>3 Beds</span>
      <span>2 Baths</span>
      <span>1,850 sqft</span>
    </div>
    <button class="btn btn-outline btn-block">View Details</button>
  </div>
</article>
```

## 17. Animation Guidelines
1. **Purposeful**: Every animation should serve a clear purpose
2. **Subtle**: Avoid excessive or distracting animations
3. **Fast**: Most UI animations should be between 200-400ms
4. **Consistent**: Use the same easing functions and timing across similar interactions
5. **Responsive**: Consider performance on lower-end devices

## 18. Performance Budget
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Total Page Weight: < 1MB
- Max JavaScript: 300KB
- Max CSS: 50KB
- Max Images: 500KB total

## 19. Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (latest 2 versions)
- Chrome for Android (latest 2 versions)

## 20. Documentation
- Storybook for component documentation
- JSDoc for JavaScript
- SassDoc for styles
- Living style guide for designers and developers
