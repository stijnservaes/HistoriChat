# HistoriChat# HistoriChat-Next-JS
Backend application for HistoriChat App. Backend on https://github.com/stijnservaes/HistoriChat-Next-JS.

## Status
### Finished



## Getting Started
### Install Instruction
1. Clone the repo
2. Install NPM packages and build
  ```sh
  npm install --legacy-peer-deps && npm run ts-build
  ```
3. Set Environment Variables
```js
CLERK_PUBLIC_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
MONGO_URI=
NODE_ENV="production"
OPENAI_API_KEY
SIGNING_SECRET_CREATE=(ClerkJS Webhook for user creation)
SIGNING_SECRET_MODIFY=(ClerkJS Webhook for user modification)
```
4. Start server
  ```
  npm run dev
  ```


