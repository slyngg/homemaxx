# HomeMaxx Design System

## Table of Contents
1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Buttons](#buttons)
5. [Forms](#forms)
6. [Navigation](#navigation)
7. [Cards](#cards)
8. [Grid System](#grid-system)
9. [Breakpoints](#breakpoints)
10. [Animations](#animations)
11. [Accessibility](#accessibility)
12. [Icons](#icons)

## Colors

### Primary Palette
- `--primary`: #4F46E5 (Indigo 600)
- `--primary-dark`: #4338CA (Indigo 700)
- `--primary-light`: #C7D2FE (Indigo 100)
- `--primary-bg`: #EEF2FF (Indigo 50)

### Neutral Palette
- `--text`: #1F2937 (Gray 800)
- `--text-light`: #6B7280 (Gray 500)
- `--text-lighter`: #9CA3AF (Gray 400)
- `--border`: #E5E7EB (Gray 200)
- `--bg`: #FFFFFF (White)
- `--bg-light`: #F9FAFB (Gray 50)
- `--bg-dark`: #111827 (Gray 900)

### Semantic Colors
- `--success`: #10B981 (Green 500)
- `--warning`: #F59E0B (Amber 500)
- `--error`: #EF4444 (Red 500)
- `--info`: #3B82F6 (Blue 500)

## Typography

### Font Family
- Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Fallback: system-ui, -apple-system, sans-serif

### Font Sizes
- `--text-xs`: 0.75rem (12px)
- `--text-sm`: 0.875rem (14px)
- `--text-base`: 1rem (16px)
- `--text-lg`: 1.125rem (18px)
- `--text-xl`: 1.25rem (20px)
- `--text-2xl`: 1.5rem (24px)
- `--text-3xl`: 1.875rem (30px)
- `--text-4xl`: 2.25rem (36px)
- `--text-5xl`: 3rem (48px)
- `--text-6xl`: 3.75rem (60px)

### Font Weights
- `--font-light`: 300
- `--font-normal`: 400
- `--font-medium`: 500
- `--font-semibold`: 600
- `--font-bold`: 700
- `--font-extrabold`: 800

### Line Heights
- `--leading-none`: 1
- `--leading-tight`: 1.25
- `--leading-snug`: 1.375
- `--leading-normal`: 1.5
- `--leading-relaxed`: 1.625
- `--leading-loose`: 2

## Spacing

### Scale
- `--space-0`: 0
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-5`: 1.25rem (20px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-10`: 2.5rem (40px)
- `--space-12`: 3rem (48px)
- `--space-16`: 4rem (64px)
- `--space-20`: 5rem (80px)
- `--space-24`: 6rem (96px)
- `--space-32`: 8rem (128px)

## Buttons

### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px -2px rgba(79, 70, 229, 0.4);
}
```

### Outline Button
```css
.btn-outline {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}
```

## Forms

### Text Input
```html
<div class="form-group">
  <label for="name" class="form-label">Full Name</label>
  <input type="text" id="name" class="form-input" placeholder="John Doe" required>
</div>
```

### Select Dropdown
```html
<div class="form-group">
  <label for="property-type" class="form-label">Property Type</label>
  <select id="property-type" class="form-select" required>
    <option value="" disabled selected>Select property type</option>
    <option value="single-family">Single Family Home</option>
    <option value="condo">Condo</option>
    <option value="townhouse">Townhouse</option>
  </select>
</div>
```

## Navigation

### Main Navigation
```html
<nav class="main-nav" id="main-navigation" aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/" class="active" role="menuitem" aria-current="page">Home</a>
    </li>
    <!-- More nav items -->
  </ul>
</nav>
```

### Mobile Menu Toggle
```html
<button class="mobile-menu-toggle" 
        aria-label="Toggle mobile menu" 
        aria-expanded="false" 
        aria-controls="main-navigation"
        tabindex="0">
  <span class="sr-only">Menu</span>
  <span class="menu-icon" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </span>
</button>
```

## Cards

### Property Card
```html
<article class="property-card">
  <div class="property-image">
    <img src="path/to/image.jpg" alt="123 Main St, Anytown" loading="lazy">
  </div>
  <div class="property-details">
    <h3 class="property-title">123 Main St, Anytown</h3>
    <p class="property-price">$450,000</p>
    <ul class="property-features">
      <li>3 Beds</li>
      <li>2 Baths</li>
      <li>1,850 sqft</li>
    </ul>
    <a href="/properties/123" class="btn btn-outline">View Details</a>
  </div>
</article>
```

## Grid System

### Basic Grid
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  margin: var(--space-6) 0;
}
```

### Featured Grid
```css
.featured-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
}

.featured-item:first-child {
  grid-column: span 8;
  grid-row: span 2;
}

.featured-item:not(:first-child) {
  grid-column: span 4;
}
```

## Breakpoints

### Mobile First
```css
/* Base styles (mobile) */
.container {
  width: 100%;
  padding: 0 var(--space-4);
  margin: 0 auto;
}

/* Small tablets and large phones */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

/* Laptops */
@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

/* Desktops */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

## Animations

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
```

### Hover Scale
```css
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.03);
}
```

## Accessibility

### Focus Styles
```css
*:focus {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--primary-light);
}

/* Hide focus styles for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

/* Show focus styles for keyboard users */
.user-is-tabbing *:focus {
  outline: 3px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

### Skip Link
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  z-index: 100;
  transition: transform 0.3s ease;
}

.skip-link:focus {
  transform: translateY(40px);
  outline: none;
}
```

## Icons

### Using Font Awesome
```html
<button class="btn btn-icon">
  <i class="fas fa-search" aria-hidden="true"></i>
  <span class="sr-only">Search</span>
</button>
```

### Icon Sizes
```css
.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-md {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-lg {
  width: 2rem;
  height: 2rem;
}
```

## Best Practices

### Image Optimization
- Use WebP format with fallbacks
- Add `loading="lazy"` for below-the-fold images
- Always include `alt` text
- Specify `width` and `height` to prevent layout shifts

### Performance
- Inline critical CSS
- Defer non-critical JavaScript
- Minify and compress assets
- Use responsive images with `srcset` and `sizes`

### Accessibility
- Use semantic HTML5 elements
- Ensure proper heading hierarchy
- Provide text alternatives for non-text content
- Ensure sufficient color contrast
- Support keyboard navigation
