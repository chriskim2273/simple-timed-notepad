# Simple Timed Notepad

A React-based notepad application where each line is timestamped with its creation time. The application persists notes in localStorage so they survive browser refreshes.

## Features

- Single continuous text area experience (like Google Docs)
- Press Enter to create a new timestamped line
- Each line shows its creation timestamp on the left
- Automatic saving to localStorage
- Backspace on empty line merges with previous line
- Clear all functionality

## Tech Stack

- React (JavaScript)
- Tailwind CSS (for styling)
- Vite (build tool)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## How It Works

- Start typing in the first line
- Press Enter to create a new timestamped line below the current one
- Each line shows when it was created (time and date)
- Press Backspace on an empty line to merge with the previous line
- All content is automatically saved to localStorage
- Clear all content with the "Clear All" button (with confirmation)

## Project Structure

```
src/
├── App.jsx (Main application component)
└── main.jsx (Entry point)
```

## Implementation Details

The application uses React hooks for state management:
- `useState` to manage the lines array
- `useEffect` to load from and save to localStorage
- `useRef` to manage focus on textareas

Each line object contains:
- `id`: Unique identifier
- `timestamp`: Time when the line was created (HH:MM:SS)
- `date`: Date when the line was created (MM/DD/YYYY)
- `content`: The actual note content

The UI is built with Tailwind CSS classes for a clean, responsive design that works on both desktop and mobile devices.