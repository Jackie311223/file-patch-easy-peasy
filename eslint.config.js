// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } }, // Add node globals for config files
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["frontend/src/**/*.{ts,tsx,js,jsx}"], // Target frontend files
    ...pluginReactConfig,
    settings: { react: { version: "detect" } }, // Detect React version
    languageOptions: {
      ...pluginReactConfig.languageOptions,
      parserOptions: { 
        ecmaFeatures: { jsx: true },
        project: ["./frontend/tsconfig.json"] // Point to frontend tsconfig for type-aware linting
      }
    }
  },
  {
    files: ["frontend/src/**/*.{ts,tsx,js,jsx}"], // Target frontend files
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules, // Use recommended rules for hooks
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/prop-types': 'off' // Often handled by TypeScript
    }
  },
  {
    // Configuration for backend (if needed in the future, currently minimal)
    files: ["backend/src/**/*.ts"],
    // Add NestJS specific ESLint config here if required
  },
  {
    // Configuration for tests
    files: ["tests/**/*.{ts,tsx}", "frontend/src/**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
    // Add test specific rules if needed
  },
  { 
    ignores: [
      "**/node_modules/", 
      "**/dist/", 
      "**/build/", 
      "**/coverage/", 
      "*.cjs", 
      "frontend/vite.config.js" // Ignore Vite config if needed
    ]
  } 
];
