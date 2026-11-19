# React + TypeScript + Vite

## iOS app and TestFlight

The app uses Capacitor to reuse the existing React/Vite UI as a native iOS app.

Requirements:
- macOS with Xcode and Xcode Command Line Tools
- Apple Developer account
- Bundle ID: `com.nhanphan1159.personalos`

```bash
source ~/.nvm/nvm.sh
nvm use 22.23.4
pnpm ios:build
pnpm ios:open
```

In Xcode:
1. Select the `App` target and the `Signing & Capabilities` tab.
2. Choose the Apple Development Team and confirm the Bundle Identifier: `com.nhanphan1159.personalos`.
3. Set a Marketing Version and Build number.
4. Run on an iPhone simulator/device or use `Product > Archive`.
5. Upload the archive with the Organizer to App Store Connect, then add it to a TestFlight internal/external test group.

After changing web code, run `pnpm ios:build` before rebuilding the iOS app.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
