# EBK

This is the server for EBK.

## Components:

- server: `node.js` server with both REST and UDP (for OSC) endpoints, static server
- frontend: `react` app + routes for debugging

## Development:

Requirements:
- `node.js` version 8+
- `nodemon`

Install dependencies:
- `npm install`
- `cd frontend` & `npm install`

Run frontend app:
- `cd frontend` & `npm start`

Run server:
- `npm start`

Build frontend:
- `cd frontend` & `npm run build`

## Performance setup notes
- Ideally, set up fixed IP on server machine
- Configure DNS on network to point selected domain to server (for audience to access)
- Edit `frontend/src/config.js` to edit `socketEndpoint` and `filesPath` to server address
- Build the frontend

