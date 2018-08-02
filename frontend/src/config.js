export default {
  socketEndpoint: process.env.NODE_ENV === 'production' ? 'ws://67.205.170.55:8080' : 'ws://localhost:8080',
  // socketEndpoint: 'ws://67.205.170.55:8080',
  filesPath: process.env.NODE_ENV === 'production' ? 'http://67.205.170.55:8080' : 'http://localhost:3000',
  // filesPath: 'http://67.205.170.55:8080',
}