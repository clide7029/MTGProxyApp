# MTG Proxy App: Development and Deployment Guide

This guide provides instructions on how to set up and run the MTG Proxy App in a local development environment, as well as how to deploy it to a production environment.

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: Version 18.x or later. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Should be included with your Node.js installation.
*   **MongoDB**: Version 5.0 or later. You can install it locally or use a free cloud-hosted instance from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Project Structure

This project is a monorepo with the following structure:

*   `client/`: Contains the React frontend application.
*   `server/`: Contains the Node.js/Express backend API.
*   `shared/`: Contains shared types and interfaces used by both the client and server.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd MTGProxyApp
    ```

2.  **Install dependencies**:
    This command will install all the necessary dependencies for the client, server, and shared packages.
    ```bash
    npm install
    ```

### Environment Variables

You will need to set up environment variables for both the client and the server.

1.  **Server Environment**:
    Create a `.env` file in the `server/` directory by copying the example file:
    ```bash
    cp server/.env.example server/.env
    ```    Now, edit `server/.env` and provide the following values:
    ```
    PORT=3001
    MONGODB_URI=<your-mongodb-connection-string>
    JWT_SECRET=<a-long-random-secret-string>
    OPENAI_API_KEY=<your-openai-api-key>
    ```

2.  **Client Environment**:
    Create a `.env` file in the `client/` directory by copying the example file:
    ```bash
    cp client/.env.example client/.env
    ```
    Now, edit `client/.env` and provide the URL of your backend server:
    ```
    VITE_API_URL=http://localhost:3001/api
    ```

### Running the Application

You can run both the client and server concurrently with a single command from the root directory:

```bash
npm run dev```

This will:
*   Start the backend server on `http://localhost:3001`.
*   Start the frontend development server on `http://localhost:5173`.

You can now access the application in your browser at `http://localhost:5173`.

## Deployment

This section provides a general guide for deploying the application. We recommend using a platform like Vercel for the frontend and Render for the backend.

### Database

Set up a production MongoDB database using a service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Once you have your production database, get the connection string and add it to your backend's environment variables.

### Backend Deployment (Render)

1.  **Create a new Web Service on Render**.
2.  **Connect your Git repository**.
3.  **Configure the service**:
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Root Directory**: `server`
4.  **Add Environment Variables**:
    *   `MONGODB_URI`: Your production MongoDB connection string.
    *   `JWT_SECRET`: A long, random, and secret string.
    *   `OPENAI_API_KEY`: Your OpenAI API key.
    *   `NODE_ENV`: `production`

### Frontend Deployment (Vercel)

1.  **Create a new Project on Vercel**.
2.  **Connect your Git repository**.
3.  **Configure the project**:
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   **Root Directory**: `client`
4.  **Add Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed backend service (e.g., `https://your-backend-app.onrender.com/api`).

### CI/CD

Both Vercel and Render offer automatic deployments from your Git repository. Once you have configured your services, any push to your main branch will trigger a new deployment.

## Troubleshooting Common Issues

### Development Issues

#### MongoDB Memory Server Download Errors
If you encounter MongoDB download errors during testing:
```bash
# The error typically looks like:
# DownloadError: Download failed for url "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel93-7.0.14.tgz"
```

**Solution**: The test setup uses MongoDB Memory Server version 5.0.19 which is compatible with most systems. If you still encounter issues, you can:
1. Check available MongoDB versions at: https://www.mongodb.com/download-center/community/releases/archive
2. Update the version in `server/src/test/setup.ts` if needed

#### TypeScript Compilation Errors
Common TypeScript issues and their fixes:

1. **Missing imports**: Ensure all required types are imported
2. **Jest configuration warnings**: The project uses updated Jest configuration without deprecated globals
3. **Scryfall type errors**: All Scryfall types are properly defined in `server/src/services/scryfall/types.ts`

#### Client Build Errors
If the client fails to build:
1. Ensure all dependencies are installed: `npm install`
2. Check that the shared package is built: `npm run build:shared`
3. Verify environment variables are set correctly

### Testing Issues

#### Running Tests
To run tests for different parts of the application:

```bash
# Run all tests
npm test

# Run server tests only
cd server && npm test

# Run client tests only
cd client && npm test

# Run shared package tests
cd shared && npm test

# Run server tests without MongoDB Memory Server issues
cd server && npm run test:unit
```

#### Test Coverage
The server tests have coverage thresholds set. If tests fail due to coverage:
- Use `jest.config.test.ts` for development (lower thresholds)
- Use `jest.config.ts` for production (80% coverage required)

### Production Deployment Issues

#### Environment Variables
Ensure all required environment variables are set:

**Server (Backend)**:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string (at least 32 characters)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Set to `production`

**Client (Frontend)**:
- `VITE_API_URL`: Your backend API URL

#### Database Connection Issues
If you encounter MongoDB connection issues:
1. Verify your connection string is correct
2. Ensure your IP address is whitelisted (for MongoDB Atlas)
3. Check that your database user has the correct permissions

#### API Rate Limits
The application includes rate limiting for external APIs:
- Scryfall API: Built-in rate limiting and caching
- OpenAI API: Monitor your usage and implement additional rate limiting if needed

### Performance Optimization

#### Caching
The application includes several caching layers:
- Scryfall API responses are cached for 1-24 hours
- Card generation results are cached
- Frontend components use React.memo where appropriate

#### Database Optimization
- Indexes are automatically created for frequently queried fields
- Use database connection pooling in production
- Monitor query performance and add indexes as needed

### Monitoring and Logging

#### Performance Monitoring
The client includes a performance monitoring service that tracks:
- Web Vitals (LCP, FID, CLS)
- API response times
- Component render times
- User interactions

#### Error Tracking
Consider integrating error tracking services like:
- Sentry for error monitoring
- LogRocket for session replay
- DataDog for application performance monitoring

### Getting Help

If you encounter issues not covered here:
1. Check the application logs for detailed error messages
2. Verify all dependencies are up to date
3. Ensure your Node.js version is 18.x or later
4. Review the GitHub issues for similar problems
5. Create a new issue with detailed error information and steps to reproduce