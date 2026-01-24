# WabMeta

A modern web application built with React, TypeScript, and Vite.

## Project Structure

- `src/assets/images/` — Static image assets
- `src/components/common/` — Reusable UI components (Button, Input, Modal, etc.)
- `src/components/landing/` — Landing page components (Navbar, Hero, Features, etc.)
- `src/components/auth/`, `dashboard/`, `contacts/`, `templates/`, `campaigns/`, `inbox/`, `chatbot/`, `team/`, `analytics/`, `settings/` — Feature-specific components
- `src/pages/` — Main page components (Landing, Login, Signup, ForgotPassword, Dashboard)
- `src/hooks/` — Custom React hooks
- `src/store/` — State management
- `src/services/` — API and service logic
- `src/utils/` — Utility functions
- `src/types/` — TypeScript types
- `src/App.tsx` — Main app component
- `src/main.tsx` — Entry point

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173)

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

## Customization
- Replace placeholder components and assets as needed.
- Add your own logic and styles in the respective folders.

---

For more details, see the `.github/copilot-instructions.md` file.
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
