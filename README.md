# Pushbullet Desktop

A lightweight Electron wrapper for the Pushbullet web interface, built with Vite, React, and Electron. This app runs natively on your desktop (macOS/Windows/Linux) and provides quick access to Pushbullet notifications, messages, and file sharing — without using a browser tab.

![Build](https://github.com/SpiritStack/pushbullet-desktop/actions/workflows/release.yml/badge.svg)
![Release](https://img.shields.io/github/v/release/SpiritStack/pushbullet-desktop?style=flat-square)
![License](https://img.shields.io/github/license/SpiritStack/pushbullet-desktop?style=flat-square)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-macOS-blue?style=flat-square)
![Framework](https://img.shields.io/badge/framework-Electron-brightgreen?style=flat-square)
![Tech](https://img.shields.io/badge/built_with-Vite_+_React-purple?style=flat-square)

---

## 🚀 Features

- Built with ⚡ Vite + React
- Packaged as a native desktop app using Electron
- Works offline with local assets
- Mac `.dmg` build support included

---

## 📦 Installation (For Developers)

### 1. Clone the repository

```bash
git clone https://github.com/SpiritStack/pushbullet-desktop.git
cd pushbullet-desktop
````

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode (browser)

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 🖥️ Run as Electron App (Desktop)

Build and run locally in Electron:

```bash
npm run desktop
```

This will:

* Build the Vite app (`dist/`)
* Launch Electron using the local `index.html`

---

## 📦 Package as Native App (DMG for macOS)

Build the desktop app and create a `.dmg` installer:

```bash
npm run dist
```

After the build, your `.dmg` will be located in:

```
release/Pushbullet Desktop-1.0.0.dmg
```

> Note: Windows `.exe` and Linux `.AppImage` builds can also be configured via `electron-builder`.

---

## 🔧 Scripts

| Script            | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start Vite dev server                     |
| `npm run build`   | Build Vite frontend                       |
| `npm run desktop` | Build frontend and launch Electron        |
| `npm run dist`    | Package native app using Electron Builder |

---

## 📁 Project Structure

```
.
├── electron/           # Electron main process
│   └── main.cjs
├── public/             # Public static assets
├── src/                # React source files
├── dist/               # Production build output (auto-generated)
├── release/            # Packaged apps (.dmg/.exe/.AppImage)
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

* [React](https://reactjs.org/)
* [Vite](https://vitejs.dev/)
* [Electron](https://www.electronjs.org/)
* [Electron Builder](https://www.electron.build/)

---

## ✍️ Author

Made with ❤️ by [Vikash Sharma](https://github.com/SpiritStack)

---

## 📄 License

MIT License

```
