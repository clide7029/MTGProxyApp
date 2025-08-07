# Project Setup Guide

## Project Structure

```
MTGProxyApp/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── server/                 # Express backend
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── shared/                 # Shared types and utilities
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── docs/                  # Documentation
```

## Configuration Files

### Root Level Configuration

**.gitignore**
```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Misc
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### Client Configuration

**.env.example**
```env
VITE_API_URL=http://localhost:3000
VITE_ASSETS_URL=http://localhost:3000/assets
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

### Server Configuration

**.env.example**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mtg_proxy_app

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-key

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Shared Types Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Package Dependencies

### Client Dependencies

**package.json key dependencies**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^4.x",
    "axios": "^1.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^4.x"
  }
}
```

### Server Dependencies

**package.json key dependencies**
```json
{
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^7.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "openai": "^4.x"
  },
  "devDependencies": {
    "@types/express": "^4.x",
    "@types/node": "^18.x",
    "typescript": "^5.x",
    "ts-node": "^10.x",
    "nodemon": "^2.x"
  }
}
```

## Initial Setup Steps

1. Create project structure:
```bash
mkdir -p client/src client/public server/src server/tests shared/src docs
```

2. Initialize Git repository:
```bash
git init
```

3. Copy configuration files to their respective locations

4. Initialize package managers:
```bash
# Root directory
npm init -y

# Client directory
cd client
npm init -y
npm install [client-dependencies]

# Server directory
cd ../server
npm init -y
npm install [server-dependencies]

# Shared directory
cd ../shared
npm init -y
npm install typescript @types/node -D
```

5. Set up initial TypeScript configurations

6. Create environment files from examples

## Development Scripts

Add these scripts to the respective package.json files:

### Client package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

### Server package.json
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

## Next Steps

1. Switch to code mode to implement this structure
2. Set up the development environment
3. Install dependencies
4. Create initial source files