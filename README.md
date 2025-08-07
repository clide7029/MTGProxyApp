# MTG Proxy App

Create themed proxy decks for Magic: The Gathering using AI.

## Features

- Create themed proxy decks from decklists
- AI-powered theme generation
- Custom art prompts for each card
- Reroll individual card themes
- Save and manage multiple decks
- Export proxy cards

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB >= 6.0
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd mtg-proxy-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy the example environment files and update them with your values:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: Secret key for JWT token generation

4. Build the shared package:
```bash
npm run build:shared
```

## Development

Start the development server:

```bash
npm run dev
```

This will start both the client and server in development mode:
- Client: http://localhost:5173
- Server: http://localhost:3000

### Available Scripts

- `npm run dev`: Start development servers
- `npm run build`: Build all packages
- `npm run start`: Start production servers
- `npm run lint`: Run linting
- `npm run format`: Format code
- `npm run test`: Run tests
- `npm run clean`: Clean build artifacts

### Project Structure

```
MTGProxyApp/
├── client/                 # React frontend
│   ├── src/               # Source code
│   ├── public/            # Static files
│   └── index.html         # HTML template
│
├── server/                # Express backend
│   ├── src/              # Source code
│   └── tests/            # Test files
│
├── shared/               # Shared types and utilities
│   └── src/             # Source code
│
└── docs/                # Documentation
```

## API Documentation

The API documentation is available at `/api/docs` when running the server.

Key endpoints:
- `/api/auth`: Authentication endpoints
- `/api/decks`: Deck management
- `/api/cards`: Card processing and theme generation

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[License Type] - See LICENSE file for details