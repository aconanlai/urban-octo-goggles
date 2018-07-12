export default {
  socketEndpoint: process.env.NODE_ENV === 'production' ? 'ws://67.205.170.55:8080' : 'ws://localhost:8080',
}