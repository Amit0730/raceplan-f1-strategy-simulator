# 🏎️ RacePlan — Interactive F1 Race Strategy Simulator

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAmit0730%2Fraceplan-f1-strategy-simulator)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://temporary-agile-azure-pjrg2b4.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> A motorsport-grade interactive Formula 1 Race Strategy & Telemetry Simulator built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

Simulate and analyze how tyre compound choices, pit-stop laps, fuel mass penalties, and variable track weather dictate overall Grand Prix race times and track position.

---

## 🌟 Core Features

- 🚦 **Interactive Stint & Strategy Builder**:
  - Preloaded circuits with authentic lap counts & degradation ratings (Silverstone, Spa, Monza, Monaco, Bahrain, Suzuka, Spielberg).
  - Dynamic stint manager with real-time pit-stop lap slider adjustments.
  - Multi-stop support (0, 1, 2, or 3 pit stops / up to 4 stints).
  - Full Pirelli 2026 compound palette: **Soft (Red)**, **Medium (Yellow)**, **Hard (White)**, **Intermediate (Green)**, and **Full Wet (Blue)**.
  - Adjustable weather scenarios: **Dry**, **Mixed (Damp / Crossover)**, and **Wet (Monsoon)**.
  - Configurable track degradation factors (Low, Standard, High, Extreme).
  - Custom pit-stop time loss tuning (e.g. 18.0s - 32.0s).

- ⏱️ **Visual Race Timeline**:
  - Proportional graphical stint bars colored in authentic Pirelli tire colors.
  - Formatted text/ASCII strategy blueprint:
    ```text
    Lap 1 ───────── Lap 18 ───────── Lap 42 ─────── Lap 57
           MEDIUM            HARD             SOFT
                             PIT              PIT
    ```
  - Pit stop markers with in-lap lap numbers and live stint hover tooltips.

- 📊 **Telemetry & Telemetric Charts**:
  - **Lap Time Pace Progression**: Visualizes lap-by-lap pace, pit stop spikes, out-lap tyre warmup, and fuel burn-off.
  - **Tyre Wear (%) & Cliff Curve**: Tracks tyre life percentage with a 75% cliff alert threshold.
  - **Fuel vs Tyre Wear Delta**: Visualizes fuel mass savings vs tyre degradation loss.

- ⚖️ **Multi-Strategy Head-to-Head Comparison**:
  - Compare Strategy A (e.g., 1-Stop Medium ➔ Hard) vs Strategy B (e.g., 2-Stop Soft ➔ Medium ➔ Soft) vs Strategy C.
  - Head-to-head cumulative race gap graph (seconds) showing lead changes and undercut/overcut crossovers.
  - Impartial strategic trade-off analysis (no strategy is falsely claimed to be universally "best").

- 📋 **Full Lap-by-Lap Data Breakdown**:
  - Filterable telemetry table tracking every single lap, compound, tyre age, delta, fuel weight, and pit flags.

- 💾 **Local Persistence**:
  - Automatic `localStorage` saving of active and compared strategies.

---

## 🔬 Mathematical Simulation Model

RacePlan uses a deterministic mathematical model based on established race engineering principles.

### 1. Fundamental Lap Time Equation

For lap $i$ on stint $k$:

$$T(i) = T_{\text{base}} + \Delta_{\text{compound}} + \Delta_{\text{deg}}(age, track) + \Delta_{\text{fuel}}(mass) + \Delta_{\text{weather}} + \Delta_{\text{pit}}$$

Where:
- **$T_{\text{base}}$**: Circuit base lap time (e.g., 88.5s for Silverstone, 81.2s for Monza).
- **$\Delta_{\text{compound}}$**: Initial mechanical grip delta relative to Medium:
  - **Soft**: $-0.65\text{s}$ (Fastest initial grip)
  - **Medium**: $0.00\text{s}$ (Baseline reference)
  - **Hard**: $+0.75\text{s}$ (Durable compound)
  - **Intermediate**: $+3.80\text{s}$ on dry, optimal in damp crossover
  - **Wet**: $+8.50\text{s}$ on dry, optimal in standing water

### 2. Tyre Degradation & The "Cliff"

Tyre performance follows a two-stage curve:
1. **Linear Wear Phase**: Rubber degrades linearly at $\approx 0.042\text{s} \times \text{DegMultiplier}$ per lap of tyre age.
2. **Exponential Cliff Phase**: When tyre age exceeds optimal life ($L_{\text{optimal}}$), thermal carcass degradation accelerates:
   $$\Delta_{\text{cliff}} = 0.12 \times (L - L_{\text{optimal}})^{1.65} \times \text{DegMultiplier}$$

### 3. Fuel Load Burn-Off

- Modern F1 cars start with $\approx 105\text{ kg}$ of fuel.
- Fuel consumption is distributed linearly: $\text{Burn} = \frac{105}{\text{Total Laps}}\text{ kg/lap}$.
- Mass sensitivity factor: $\approx 0.033\text{s}$ per kg of fuel.
- Cars get $\approx 2.5\text{s} - 3.5\text{s}$ faster from Lap 1 to the finish line as fuel burns off.

### 4. Weather Mismatch Penalty

- **Dry Track**: Slicks optimal. Intermediate tyres overheat ($+4.0\text{s}$). Wets overheat severely ($+8.5\text{s}$).
- **Mixed / Damp**: Intermediates optimal. Slicks lose traction ($+7.5\text{s}$).
- **Wet Track**: Full Wets optimal. Slicks suffer catastrophic aquaplaning ($+22.0\text{s}$).

---

## ⚠️ Educational Disclaimer

> **Note**: This simulator is an educational model created for motorsport enthusiasts, students, and engineers. It is a simplified representation and does **NOT** claim to reproduce proprietary Formula 1 telemetry, aerodynamic dirty air deltas, real-time asphalt track evolution, or safety car probability distributions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Confetti**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Amit0730/raceplan-f1-strategy-simulator.git

# Navigate to project directory
cd raceplan-f1-strategy-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License © 2026 RacePlan Contributors.
Formula 1, F1, and related marks are trademarks of Formula One Licensing B.V.
