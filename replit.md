# LIFO Page Replacement Simulator

## Overview

An interactive web-based simulator for the LIFO (Last In, First Out) page replacement algorithm used in operating systems memory management. The application provides an educational tool to visualize how LIFO page replacement works through step-by-step simulation and real-time statistics tracking.

This is a single-page application built with vanilla HTML, CSS, and JavaScript featuring a dual-tab interface: one for educational content explaining the algorithm, and another for interactive simulation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single-Page Application (SPA) Pattern**
- Pure vanilla JavaScript with no external frameworks
- DOM-based rendering for all UI components
- State management using centralized JavaScript object
- Event-driven architecture for user interactions

**Component Structure**
- Dual-tab interface separating explanation from simulation
- State-driven UI updates with manual DOM manipulation
- Modular CSS using CSS custom properties (variables) for theming

**Key Design Decisions**
- **Vanilla JavaScript**: Chosen for simplicity and zero dependencies, making the application lightweight and easy to understand for educational purposes
- **State Management**: Centralized state object pattern stores simulation state (frames, reference string, step history, playback controls)
- **No Build Process**: Direct browser execution without compilation or bundling for maximum accessibility

### Visual Design System

**Glass-morphism Dark Theme**
- CSS custom properties for consistent theming across components
- Gradient backgrounds (#0f172a → #071426) and blur effects for modern aesthetic
- Boxicons library for consistent iconography
- Responsive layout using flexbox and grid

**Animation & Interaction**
- CSS transitions for smooth state changes
- Step-by-step playback controls (play, pause, next, previous)
- Variable speed simulation playback (Slow: 700ms, Medium: 400ms, Fast: 150ms)
- Real-time statistics updates

### Data Flow Architecture

**Simulation Engine**
- Algorithm processes reference string sequentially
- Maintains frame state history for playback navigation
- Tracks page hits and faults for statistics calculation
- Stack-based data structure mirrors LIFO behavior

**State History Pattern**
- Captures complete simulation state at each step
- Enables bidirectional navigation through simulation
- Supports replay functionality without recalculation

### UI Components

**Educational Tab (Explanation)**
- Static content explaining LIFO algorithm
- Comparison tables with other algorithms (FIFO, LRU)
- Visual diagrams and examples
- Interactive stack push/pop demo
- Pros and cons cards

**Simulator Tab**
- Input controls (frame count 1-10, reference string)
- Visualization panels (table view, stack view)
- Playback controls with speed adjustment
- Real-time statistics dashboard
- Event logging system

## External Dependencies

### Third-Party Libraries

**Boxicons (CDN)**
- Purpose: Icon library for UI elements
- Integration: CDN link in HTML head
- Usage: Consistent iconography across navigation, buttons, and indicators

### Browser APIs

**DOM API**
- Direct manipulation for dynamic UI updates
- Event listeners for user interactions
- Keyboard shortcuts support (Arrow keys, Spacebar)

### No Backend Dependencies

- Fully client-side application
- No server communication required
- No database or persistent storage
- All computation happens in browser

### Development & Deployment

- Static file hosting compatible (any web server)
- No build process or compilation required
- CDN dependency for icons (Boxicons)
- Works offline after initial page load (except icons)

## Project Structure

```
/
├── index.html      # Main HTML with dual-tab interface
├── style.css       # Dark theme with glassmorphism styling
├── script.js       # LIFO algorithm and UI logic
├── replit.md       # Project documentation
└── attached_assets/  # Specification documents
```

## Features Implemented

1. **Dual-Tab Interface**: Explanation tab with educational content, Simulator tab with interactive visualization
2. **LIFO Algorithm**: Complete implementation with stack-based replacement logic
3. **Step Navigation**: Previous/Next buttons for manual control
4. **Auto-Play**: Automatic stepping with pause/resume and adjustable speed
5. **Frames Table**: Dynamic visualization with color-coded cells (green=hit, red=fault, orange=replaced)
6. **Stack View**: Real-time stack display with top element highlighted
7. **Statistics Dashboard**: Total hits, faults, current step, and hit ratio
8. **Action Log**: Detailed step-by-step explanations
9. **Input Validation**: Friendly error messages with animations
10. **Keyboard Shortcuts**: Arrow keys for stepping, spacebar for play/pause
11. **Responsive Design**: Mobile-friendly layout that adapts to screen size
