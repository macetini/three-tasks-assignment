# Technical Assessment - PixiJS v8

A high-performance interactive demo featuring three technical tasks, built with TypeScript and PixiJS v8.

## 🚀 Live Demo
[[LINK]](https://macetini.github.io/three-tasks-assignment/)

## 🛠 Tech Stack
- **Engine:** PixiJS v8 (Latest)
- **Language:** TypeScript
- **Bundler:** Vite
- **Architecture:** Custom MVCS (Model-View-Controller-Service)

## 📋 Task Highlights

### 1. Ace of Cards
- **Challenge:** Move 144 cards between stacks with organic offset.
- **Solution:** Implemented a non-linear stack offset and optimized rendering to ensure 60 FPS on mobile. 
- **Optimization:** Used procedural texture generation to create unique card visuals without external assets.

### 2. Magic Words (Rich Text)
- **Challenge:** Render mixed text and images.
- **Solution:** Built a flexible layout system that supports inline images and multi-line wrapping.
- **Feature:** Fully responsive layout that adapts to screen resizing in real-time.

### 3. Phoenix Flame
- **Challenge:** Create a "great" fire effect limited to **exactly 10 sprites**.
- **Solution:** Utilized additive blending (`blendMode: 'add'`) and procedural teardrop textures to create a high-density "plasma" look.
- **Logic:** Implemented a sine-wave "flicker" and life-cycle tinting (White -> Orange -> Red).

## 🏗 Architecture
The project follows a strict **MVCS** pattern to ensure decoupling:
- **Models:** Maintain state (Card positions, Flame textures).
- **Views:** Handle rendering and local input.
- **Mediators:** Bridge Views with the rest of the application.
- **Services:** Handle heavy lifting like procedural asset generation.
