# ⌨️ Typester

<p align="center">
  <a href="https://github.com/Ahmdpolash/online-typing-test-platform">
    <img src="https://img.shields.io/badge/Next.js-16.1.7-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </a>
</p>

<p align="center">
  A sleek, minimalist online typing test platform inspired by <b>Monkeytype</b>, featuring realistic mechanical keyboard sounds, real-time WPM/accuracy tracking, smooth animations, and versatile practice modes.
</p>

---

## ✨ Features

- 🎧 **Realistic Mechanical Keyboard Audio**: Web Audio API sound sprite delivering satisfying mechanical key sound profiles and tactile haptic feedback.
- 🎨 **Monkeytype Carbon Dark Aesthetic**: Warm matte charcoal background (`#323437`), soft cream typed text (`#d1d0c5`), muted slate untyped words (`#646669`), and iconic golden accent (`#e2b714`).
- ⏱️ **Versatile Test Modes**:
  - **Time Mode**: 15s, 30s, 60s, 120s speed tests.
  - **Words Mode**: 10, 25, 50, 100 fixed word counts.
  - **Quote Mode**: Practice quotes categorized by Short, Medium, and Long.
  - **Zen Mode**: Distraction-free, endless typing flow.
- 🎛️ **Modifiers & Difficulty**:
  - Punctuation toggle (`@ punctuation`).
  - Numbers toggle (`# numbers`).
  - Difficulty toggle (`easy` / `hard`).
- 📊 **Detailed Real-time Analytics**:
  - Real-time Gross WPM, Net WPM, and Accuracy %.
  - Interactive consistency graph with keystroke burst tracking powered by Recharts.
  - Character accuracy breakdown (correct, incorrect, extra, missed).
- ⌨️ **Interactive Virtual Keyboard**: Highlighting pressed keys in real time with custom mechanical keycap themes (Classic, Mint, Royal, Dolch, Sand, Scarlet).
- 🌍 **Multi-Language Support**: Support for English, Spanish, French, German, and more.
- 🚀 **SEO & PWA Ready**: Dynamic `sitemap.xml`, `robots.txt`, and web app `manifest.json` for full search engine indexing and mobile installation.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Base UI (`@base-ui/react`) |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion v12) |
| **Data Visualization** | [Recharts 3.8](https://recharts.org/) |
| **Icons** | [Phosphor Icons](https://phosphoricons.com/) & [Tabler Icons](https://tabler.io/icons) |
| **Audio & Haptics** | HTML5 Audio Sprite Engine + Web Haptics |

---

## 📂 Project Structure

```text
typing test/
├── app/
│   ├── globals.css          # Tailwind CSS v4 design tokens & Monkeytype palette
│   ├── layout.tsx           # Root layout, metadata & blocking theme scripts
│   ├── page.tsx             # Main typing test arena
│   ├── manifest.ts          # PWA web manifest
│   ├── robots.ts            # Search engine robots.txt
│   └── sitemap.ts           # Dynamic XML sitemap
├── components/
│   ├── layout/              # Header, navigation, and Typester brand logo
│   ├── settings/            # Settings drawer, theme & font customizers
│   ├── shared/              # Reusable responsive layout wrappers
│   ├── theme/               # Theme provider (dark mode by default)
│   ├── typing/              # Typing test engine, word items, results screen
│   └── ui/                  # Interactive mechanical keyboard & base controls
├── hooks/
│   ├── use-typing-test.ts   # Core typing mechanics, WPM calculation, timers
│   └── use-media-query.ts   # Responsive viewport detection
├── lib/
│   ├── font-options.ts      # Google fonts integration
│   ├── keyboard-layouts.ts  # Virtual keyboard key configurations
│   ├── site.ts              # Global site configuration & metadata
│   ├── test-storage.ts      # LocalStorage persistence utilities
│   └── wpm-count.ts         # Net / Gross WPM and accuracy algorithms
└── public/
    ├── languages/           # Multi-language word dictionaries
    └── sounds/              # Mechanical keyboard audio sprite files
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18+ or later
- npm, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ahmdpolash/online-typing-test-platform.git
   cd online-typing-test-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗺️ Roadmap

- [x] Rebrand to **Typester**
- [x] Signature Monkeytype Matte Carbon Dark theme (`#323437`)
- [x] Safe volume curve for headphone users
- [x] Stable, non-blinking controls toolbar
- [x] SEO setup (`robots.txt`, `sitemap.xml`, OpenGraph)
- [ ] User Authentication (Google & GitHub OAuth)
- [ ] NeonDB (PostgreSQL) + Drizzle ORM integration for cross-device stats
- [ ] Global Daily & All-time Leaderboard
- [ ] Real-time 1v1 Multiplayer Race Mode

---

## 👨‍💻 Author

Crafted with ❤️ by **[Polash](https://www.linkedin.com/in/polashahmed)**.

Feel free to connect on [LinkedIn](https://www.linkedin.com/in/polashahmed) or submit an issue/PR on [GitHub](https://github.com/Ahmdpolash/online-typing-test-platform).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
