# Agent Studio MCP Engine — Build Guide

## Platform Overview

| Platform | Tool | Output |
|---|---|---|
| Windows x64 | Tauri v2 | `.msi` / `.exe` installer |
| Windows ARM64 | Tauri v2 (cross-target) | `.msi` / `.exe` installer |
| macOS Intel (x86_64) | Tauri v2 | `.dmg` / `.app` |
| macOS Apple Silicon (arm64) | Tauri v2 | `.dmg` / `.app` |
| macOS Universal | Tauri v2 | `.dmg` (fat binary) |
| Android | Capacitor v7 + Android Studio | `.apk` / `.aab` |
| iOS | Capacitor v7 + Xcode | `.ipa` (requires Mac) |

---

## Prerequisites

### All Platforms
- **Node.js** >= 18 (currently v24.18.0 OK)
- **npm** >= 9

### Desktop (Tauri)
- **Rust** — installed via `winget install Rustlang.Rustup` (installing)
  - After install, open a **new terminal** for PATH to update
  - Verify: `rustc --version`
- **Windows**: Visual Studio C++ Build Tools (Tauri installs prompt for this)
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)

### Android (Capacitor)
- **Android Studio** — https://developer.android.com/studio
- **JDK 17+** — bundled with Android Studio
- Set `ANDROID_HOME` env var (Android Studio does this automatically)
- Create an Android Virtual Device (AVD) for testing

### iOS (Capacitor — macOS only)
- **Xcode 15+** from the Mac App Store
- **CocoaPods**: `sudo gem install cocoapods`
- Apple Developer account (for device testing / distribution)

---

## Quick Start

```bash
# Install all dependencies (already done)
npm install

# Build the web app
npm run build
```

---

## Desktop (Windows & macOS)

### Development (live reload)
```bash
npm run tauri:dev
```
Opens a native window with your Vite dev server inside it. Hot module reload works.

### Production Build
```bash
npm run tauri:build
```
Output locations:
- Windows: `src-tauri/target/release/bundle/msi/` and `.../nsis/`
- macOS: `src-tauri/target/release/bundle/dmg/` and `.../macos/`

### macOS Universal Binary (Intel + Apple Silicon)
Run on a Mac:
```bash
npm run tauri:build -- --target universal-apple-darwin
```

### Windows ARM64
Run on a Windows ARM machine (or GitHub Actions with `windows-arm64`):
```bash
npm run tauri:build -- --target aarch64-pc-windows-msvc
```

### Generate Icon Set (all sizes)
```bash
npm run tauri:icon
```
Reads `public/icon.png` (1024x1024) and generates all required icon sizes in `src-tauri/icons/`

---

## Android

### First-time Setup
```bash
# Sync web assets to Android project and open Android Studio
npm run cap:android
```

### Generate Icons & Splash Screens
Place your source icon at `resources/icon.png` (1024x1024) first.
```bash
npm run cap:icons
```
Generates all Android icon densities (mdpi through xxxhdpi) and splash screens.

### Building an APK
In Android Studio:
1. Run > Run 'app' (debug APK on emulator/device)
2. Build > Generate Signed Bundle/APK (release)

### Updating after web changes
```bash
npm run cap:sync
```

---

## iOS (macOS only)

### First-time Setup
```bash
# Sync web assets to iOS project and open Xcode
npm run cap:ios
```

### Updating after web changes
```bash
npm run cap:sync
```

### Building & Running
In Xcode:
1. Select your target device or simulator
2. Click Run or Product > Build
3. For distribution: Product > Archive > upload to App Store Connect

---

## Environment Variables

The app requires a `GEMINI_API_KEY`. In packaged builds:
- **Desktop (Tauri)**: Set via OS environment variables, or ship with a config dialog
- **Mobile (Capacitor)**: Embed via `capacitor.config.ts` or use a secure storage plugin

---

## CI/CD Recommendations

For automated cross-platform builds, use GitHub Actions:

- **Windows**: `windows-latest` runner
- **macOS Universal**: `macos-latest` runner with `--target universal-apple-darwin`
- **Android**: `ubuntu-latest` with Android SDK action
- **iOS**: `macos-latest` with Xcode action + Apple certs in secrets

See https://tauri.app/distribute/github-actions/ and https://capacitorjs.com/docs/guides/ci-cd for workflow templates.
