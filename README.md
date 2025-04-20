# ProofNest - Getting Started Guide

This README provides instructions for setting up and running the ProofNest project, a blockchain-based copyright registration and verification system.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [DFINITY Canister SDK (dfx)](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove)
- [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (if on Windows)

## Project Structure

The project consists of three main components:
- client - React frontend application
- node-backend - Express.js API server
- proofnest - Internet Computer canister (blockchain backend)

## Setup Instructions

### Step 1: Start the Internet Computer Local Network

Open a WSL terminal and start the Internet Computer local network:

```bash
cd ~/OneDrive/Desktop/hackowasp7.0
dfx start --clean
```

This command starts a local Internet Computer replica. Keep this terminal open.

### Step 2: Deploy the Canisters

Open a new terminal and deploy the canisters:

```bash
cd ~/OneDrive/Desktop/hackowasp7.0
dfx deploy
```

This will build and deploy the canisters to your local Internet Computer network.

### Step 3: Set Up the Node.js Backend

Open a new terminal and set up the Express.js backend:

```bash
cd node-backend
npm install
npm run start
```

The backend server will start on port 8000.

### Step 4: Set Up the React Frontend

Open a new terminal and set up the React frontend:

```bash
cd client
npm install
npm run dev
```

This will start the development server and open the application in your default browser (typically at http://localhost:5173).

## Accessing the Application

Once all components are running, you can access the ProofNest application in your web browser.

## Troubleshooting

- If you encounter TypeScript errors during dfx deploy, make sure TypeScript is installed:
  ```bash
  npm install -g typescript
  ```

- If you see "Cannot check for vulnerabilities" warnings, you can install cargo-audit:
  ```bash
  cargo install cargo-audit
  ```

- For WSL-related issues, ensure your WSL installation is properly configured and can access your Windows files.

## Additional Commands

- To stop the local Internet Computer network:
  ```bash
  dfx stop
  ```

- To reset the local state:
  ```bash
  dfx start --clean
  ```

## Project Links

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Internet Computer Canister: http://localhost:4943