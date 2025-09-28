# E9 Schedule SPA

Single Page Application untuk mengelola jadwal shift tim E9 dengan enhanced dock navigation menggunakan DaisyUI.

## ✨ Fitur Utama

- ✅ **Single Page Application (SPA)** dengan routing tanpa reload
- ✅ **Enhanced Dock Navigation** dengan desain modern dan interaktif:
  - Glass morphism effect dengan backdrop blur
  - Smooth animations dan transitions
  - Active indicators dengan pulse animation
  - Haptic feedback untuk mobile devices
  - Responsive design untuk semua ukuran layar
  - Hover effects dan visual feedback
- ✅ **Dua Pattern Schedule**:
  - Current Schedule (3 shift per hari)
  - Q4 Pattern (2 shift per hari)
- ✅ **Responsive Design** dengan mobile dan desktop view
- ✅ **Theme Toggle** (Light/Dark mode)
- ✅ **Auto-scroll ke hari ini**
- ✅ **URL routing** dengan browser history support

## 🎨 Desain Dock Navigation

### Visual Features
- **Glass Morphism**: Background blur dengan transparansi
- **Gradient Active States**: Linear gradient untuk button aktif
- **Active Indicators**: Dot indicator dengan pulse animation
- **Smooth Transitions**: Cubic-bezier animations untuk semua interaksi
- **Shadow Effects**: Multi-layer box-shadow untuk depth
- **Scale Animations**: Micro-interactions pada hover dan click

### Interactive Features
- **Haptic Feedback**: Vibration pada supported devices
- **Touch Gestures**: Optimized untuk mobile touch
- **Focus States**: Accessibility-friendly focus indicators
- **Responsive Scaling**: Adapts icon dan text size berdasarkan screen size

### Responsive Breakpoints
- **Mobile** (< 480px): Compact design dengan smaller icons
- **Tablet** (480px - 1024px): Medium size dengan balanced spacing
- **Desktop** (> 1024px): Large size dengan enhanced spacing

## 🛠 Teknologi

- **Frontend**: HTML5, JavaScript ES6+ (Classes, Async/Await)
- **Styling**: TailwindCSS + DaisyUI + Custom CSS
- **Effects**: CSS3 animations, backdrop-filter, transform3d
- **PWA**: Service Worker enabled
- **Responsive**: Mobile-first approach

## 📁 Struktur File

```
├── index.html              # Main SPA page dengan enhanced dock
├── spa-app.js              # Main application logic dengan haptic feedback
├── styles.css              # Enhanced dock styles & animations
├── schedule-pattern.json   # Current schedule pattern (3 shifts)
├── pattern-q4.json         # Q4 schedule pattern (2 shifts)
├── service-worker.js       # PWA service worker
└── manifest.json          # PWA manifest
```

## 🚀 Penggunaan

1. **Buka** `index.html` di browser
2. **Navigasi** menggunakan enhanced dock di bottom screen:
   - Klik **"Current"** untuk schedule normal (3 shift)
   - Klik **"Q4 Pattern"** untuk pattern Q4 (2 shift)
   - Nikmati smooth animations dan haptic feedback
3. **URL routing** - URL akan update sesuai view yang aktif
4. **Browser navigation** - Back/forward button akan bekerja normal
5. **Theme toggle** - Klik icon di kanan atas untuk light/dark mode

## 🎯 Enhanced Dock Features

### 🎨 Visual Enhancements
- **Glass morphism background** dengan blur effect
- **Active state indicators** dengan pulsing animation
- **Smooth hover animations** dengan scale transform
- **Multi-layer shadows** untuk realistic depth
- **Gradient overlays** pada active buttons

### 📱 Mobile Optimizations
- **Touch-optimized** button sizes (44px minimum)
- **Haptic feedback** untuk supported devices
- **Touch gestures** dengan scale feedback
- **Safe area** untuk iPhone notch compatibility
- **Viewport-fit=cover** untuk full-screen experience

### 🎭 Animation Details
- **Entrance animations** dengan stagger effect
- **Micro-interactions** pada semua user actions
- **Cubic-bezier easing** untuk natural feel
- **Transform3d acceleration** untuk smooth performance
- **Pulse effect** pada active indicators

## 🌍 Browser Support

- **Modern browsers** dengan ES6+ support
- **PWA enabled** browsers
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **Backdrop-filter** support untuk glass morphism
- **CSS Grid & Flexbox** support

## 📝 Pattern Files

### Current Schedule (schedule-pattern.json)
- 3 shift per hari dengan 7 member tim
- Base date: May 15, 2024
- Rotation cycle yang kompleks

### Q4 Pattern (pattern-q4.json)  
- 2 shift per hari untuk Q4 2024
- Base date: October 1, 2024
- Simplified rotation untuk efisiensi

---

*Dibuat dengan ❤️ menggunakan modern web technologies*