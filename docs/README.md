# @multiversx/template-dapp-reactjs

The **MultiversX dApp Template**, built using [React.js](https://reactjs.org/)

It's a basic implementation of [@multiversx/sdk-dapp](https://www.npmjs.com/package/@multiversx/sdk-dapp), providing the basics for MultiversX authentication and TX signing.

## Requirements

- Node.js version 16.20.0+
- Npm version 8.19.4+

## Getting Started

### Step 1. Install modules

From a terminal, navigate to the project folder and run:

```bash
yarn install
```

### Step 2. Running in development mode

In the project folder run:

```bash
yarn start-devnet
```

This will start the React app in development mode, using the configs found in the `vite.config.ts` file.
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Step 3. Build for testing and production use

A build of the app is necessary to deploy for testing purposes or for production use.
To build the project run:

```bash
yarn build-devnet
```