# Global Loading Components

This directory contains beautifully themed, reusable loading components for the application.

## 🎨 Theme Colors

All loading components use the application's theme colors:
- **Primary Navy**: `#1B3A5C` (main brand color)
- **Secondary Gold**: `#C89650` (accent color)
- Variations include light and dark shades for depth

## Components

### 1. LoadingSpinner
A versatile loading spinner component with multiple variants and size options.

**Props:**
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size of the spinner (default: 'md')
- `fullScreen?: boolean` - Display as full-screen overlay (default: false)
- `message?: string` - Optional loading message
- `className?: string` - Additional CSS classes
- `variant?: 'default' | 'dots' | 'pulse' | 'ring'` - Animation style (default: 'default')

**Variants:**

1. **Default** - Dual-color spinning ring (navy + gold)
   ```tsx
   <LoadingSpinner variant="default" />
   ```

2. **Dots** - Three bouncing dots with alternating colors
   ```tsx
   <LoadingSpinner variant="dots" />
   ```

3. **Pulse** - Pulsing gradient circles
   ```tsx
   <LoadingSpinner variant="pulse" />
   ```

4. **Ring** - Triple concentric spinning rings (most premium)
   ```tsx
   <LoadingSpinner variant="ring" />
   ```

**Usage Examples:**
```tsx
import { LoadingSpinner } from '../../../components/common';

// Small inline spinner
<LoadingSpinner size="sm" variant="dots" />

// Medium spinner with message
<LoadingSpinner size="md" variant="ring" message="Loading data..." />

// Full-screen overlay
<LoadingSpinner size="lg" fullScreen variant="pulse" message="Saving changes..." />

// Custom styling
<LoadingSpinner 
  size="xl" 
  variant="ring" 
  message="Processing..." 
  className="py-12 bg-gray-50 rounded-lg"
/>
```

### 2. PageLoader
A full-page loading component with themed animations.

**Props:**
- `message?: string` - Loading message (default: 'Loading...')
- `variant?: 'default' | 'dots' | 'pulse' | 'ring'` - Animation style (default: 'ring')

**Usage:**
```tsx
import { PageLoader } from '../../../components/common';

if (loading) {
  return <PageLoader message="Loading your dashboard..." variant="ring" />;
}
```

## 🎯 When to Use

### Use `LoadingSpinner`:

**Small (`sm`)**
- Inline with text or buttons
- Form field validation
- Small UI elements

**Medium (`md`)**
- Cards and sections
- List items
- Modal content

**Large (`lg`)**
- Main content areas
- Large modals
- Feature sections

**Extra Large (`xl`)**
- Empty states
- Full-width sections
- Hero areas

### Use `PageLoader`:
- Initial page load
- Route transitions
- When entire page content depends on data
- Authentication flows

## 🎨 Variant Selection Guide

- **`ring`** - Best for premium feel, main pages (recommended for PageLoader)
- **`default`** - Clean and simple, general purpose
- **`dots`** - Playful, good for lists and cards
- **`pulse`** - Attention-grabbing, good for important operations

## 📋 Examples

See `LoadingExamples.tsx` for comprehensive usage examples including:
- Page loading with all variants
- Inline button states
- Card/section loading
- Full-screen overlays
- Themed button states

## ✅ Best Practices

1. **Always provide meaningful messages** for operations longer than 1 second
2. **Use appropriate sizes** based on the context
3. **Choose variants consistently** across similar UI patterns
4. **Avoid multiple loading states** on the same screen
5. **Show loading immediately** when action starts
6. **Hide loading promptly** when action completes
7. **Use fullScreen mode sparingly** - only for critical operations

## 🚀 Integration Status

These components are integrated in:
- ✅ Dashboard page (PageLoader with ring variant)
- ✅ Courses listing page (LoadingSpinner lg with message)
- 🔲 Course details page (recommended: PageLoader)
- 🔲 Profile page (recommended: LoadingSpinner md)
- 🔲 Forms and modals (recommended: LoadingSpinner with fullScreen)
- 🔲 File uploads (recommended: LoadingSpinner xl with pulse variant)

## 🎨 Color Customization

The components automatically use your Tailwind theme colors:
- `primary-navy` and variants
- `secondary-gold` and variants

To customize, update `tailwind.config.js`:
```js
colors: {
  primary: {
    'navy': '#1B3A5C',
    'navy-light': '#2D4E73',
    'navy-dark': '#0F2338',
  },
  secondary: {
    'gold': '#C89650',
    'gold-light': '#D4A873',
    'gold-dark': '#B17E3A',
  },
}
```
