# 🍳 PantryPal: Smart Food Storage & Zero-Waste Culinary Planner

PantryPal is a modern, full-stack, AI-powered web application designed to help households track grocery inventories, minimize food waste, optimize leftovers, find clever ingredient substitutions, and save money. 

By integrating the **Google Gemini API**, PantryPal turns photos of grocery receipts or pantry ingredients into active digital inventories and provides instant custom recipe suggestions and culinary coaching.

---

## ✨ Features

### 1. 📸 Smart Receipt & Ingredient Scanner
* **Real-time Camera & File Upload**: Snap a photo of a physical receipt or upload grocery images directly from your phone or desktop.
* **Intelligent Parsing**: Automatically extracts item names, estimated quantities, purchase dates, and calculated expiration dates.
* **MIME Detection & Sanitization**: Robust base64 image encoding handles different file formats securely.

### 2. 🗄️ Active Family Pantry Inventory
* **Live Synchronization**: Features an in-memory synchronized engine so multiple family members see inventory updates in real time.
* **Freshness & Waste Trackers**: Visual indicators flag items nearing expiry.
* **Flexible Management**: Add, edit, or delete items manually with a clean, high-contrast, touch-friendly UI.

### 3. 🍲 AI-Powered Zero-Waste Recipe Generator
* **Context-Aware Recipes**: Generates culinary recommendations based directly on what is currently in your fridge or pantry.
* **Saves Money & Earth**: Highlights estimated savings per recipe by avoiding store bought alternatives and utilizing expiring produce.
* **Complete Instructions**: Provides step-by-step prep directions, difficulty ratings, preparation times, and custom tags.

### 4. 💬 Chef Instructor Chatbot
* **Actionable Advice**: Your personal culinary tutor is an expert on food preservation, leftover preservation, and ingredient substitutions.
* **Hyper-Concise Answers**: Designed to give you short, snappy advice (maximum 75 words) with clear bold headers, so you don't get lost in heavy blocks of text while cooking.
* **Smart Fallbacks**: Features high-fidelity local fallback guides for popular ingredients (Sourdough, Avocados, Spinach) even if the API is offline or unconfigured.

---

## 🛠️ Tech Stack

* **Frontend**: React 18+, Vite, Tailwind CSS, Lucide Icons, and Motion transitions.
* **Backend**: Express (Node.js server with TypeScript/tsx execution).
* **AI Model Integration**: Google Gen AI SDK (`@google/genai`) using `gemini-2.5-flash` for high-speed, accurate multi-modal processing.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Clone & Install Dependencies
```bash
# Navigate into the project directory and install required packages
npm install
```

### 2. Configure Your Environment (Gemini API Key)
Create a `.env` file in the root directory (you can copy `.env.example` as a starting point) and populate your Google Gemini API key:

```env
# .env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> **Note**: You can obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 3. Run the App in Development Mode
Start the joint Express & Vite development server:
```bash
npm run dev
```
Once started, open your browser to `http://localhost:3000`.

### 4. Build and Start for Production
Compiles client assets and bundles the TypeScript backend into a single robust output:
```bash
# Build the production assets
npm run build

# Start the compiled production server
npm run start
```

---

## 📂 Project Structure

* `/server.ts` - The entry point for the Express backend, handling API routes for receipt scanning, recipe generation, chef chat, and serving the React app.
* `/src/App.tsx` - The primary React single-page application orchestrating the dashboard views, camera modules, state synchronization, and UI layouts.
* `/src/index.css` - Global Tailwind CSS setup and theme definitions.
* `metadata.json` - Defines application configurations, permissions, and major capabilities.

---

## 💡 Smart Use Cases to Try
1. **Snap a Receipt**: Tap the scan icon, choose a receipt photo, and watch your pantry load up with bread, avocados, Greek yogurt, or milk.
2. **Consult the Chef**: Type *"How do I keep my avocados from browning?"* or *"My sourdough is dry, how do I save it?"* to receive high-fidelity, immediate preservation hacks.
3. **Generate Recipes**: Click *"Generate AI Recipes"* on the dashboard to build step-by-step recipes specifically utilizing the items you have in stock.
