# Theme System Documentation

## Overview
The application now includes a comprehensive dark/light mode theme system that allows users to toggle between themes and persists their preference.

## Features
- ✅ Dark mode and light mode toggle
- ✅ Theme persistence using localStorage
- ✅ System preference detection (respects user's OS theme preference)
- ✅ Context-based theme management
- ✅ Easy integration with any component

## Usage

### 1. Theme Provider Setup
Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from '@/app/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Using Theme in Components
Use the `useTheme` hook in any component:

```tsx
import { useTheme } from '@/app/contexts/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className={isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}>
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}
```

### 3. CSS Classes
The theme system adds/removes the `dark` class on the `document.documentElement`. You can use Tailwind's dark mode classes:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  This will be white background in light mode, black in dark mode
</div>
```

## Theme Toggle Location
The theme toggle is available in the user dropdown menu:
- Click on the user avatar/profile icon
- Select "Dark Mode" or "Light Mode" from the dropdown
- The theme will change immediately and be saved for future visits

## Implementation Details

### ThemeContext
- Manages global theme state
- Handles localStorage persistence
- Detects system preference on first load
- Provides `isDarkMode` boolean and `toggleTheme` function

### User Dropdown Menu
- Added theme toggle option with sun/moon icons
- Shows current theme state
- Prevents dropdown from closing when toggling theme

### Persistence
- Theme preference is saved to localStorage
- Automatically restored on page reload
- Falls back to system preference if no saved preference exists

## Styling Guidelines

### Light Mode
- Use standard Tailwind classes: `bg-white`, `text-black`, etc.
- Default colors work well in light mode

### Dark Mode
- Use `dark:` prefix for dark mode styles: `dark:bg-black`, `dark:text-white`
- Ensure good contrast ratios
- Test both themes for accessibility

## Example Component Styling

```tsx
function ExampleCard() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-gray-900 dark:text-white font-bold">
        Card Title
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        Card content that adapts to the current theme.
      </p>
    </div>
  );
}
```

## Pages with Dark Mode Support

### About Us Page
The About Us page (`app/about-us/page.tsx`) has been fully updated to support dark mode with the following changes:

- **Main Background**: `bg-gray-50 dark:bg-black`
- **Text Colors**: `text-gray-700 dark:text-white`
- **Card Backgrounds**: `bg-white dark:bg-gray-800`
- **Brand Colors**: `text-indigo-600 dark:text-indigo-400`
- **Icon Backgrounds**: `bg-indigo-100 dark:bg-indigo-900`
- **CTA Section**: `bg-indigo-600 dark:bg-indigo-800`

All elements now properly switch between light and dark themes when the user toggles the theme.

### Contact Us Page
The Contact Us page (`app/contact-us/page.tsx`) has been updated with dark mode support:

- **Main Background**: `bg-gray-50 dark:bg-black`
- **Text Colors**: `text-gray-700 dark:text-white`
- **Card Background**: `bg-gray-100 dark:bg-gray-800`
- **Icon Colors**: `text-[#7239EA] dark:text-indigo-400`
- **Headings**: `text-gray-900 dark:text-white`

### How It Works Page
The How It Works page (`app/how-it-will-work/page.tsx`) has been comprehensively updated with dark mode support:

- **Main Background**: `bg-gray-50 dark:bg-black`
- **Text Colors**: `text-gray-700 dark:text-white`
- **Card Backgrounds**: `bg-white dark:bg-gray-800`
- **Card Borders**: `border-gray-100 dark:border-gray-700`
- **Headings**: `text-gray-800 dark:text-white`
- **Body Text**: `text-gray-600 dark:text-gray-300`
- **Step Numbers**: Color-coded backgrounds with dark variants (e.g., `bg-blue-100 dark:bg-blue-900`)
- **Feature Icons**: Maintained color coding with appropriate dark mode variants

All sections including the hero, step-by-step process, features, benefits, and FAQ now properly adapt to both light and dark themes.

## Future Enhancements
- [ ] Add more theme options (auto, light, dark)
- [ ] Add theme transition animations
- [ ] Create theme-specific color palettes
- [ ] Add theme preview in settings
