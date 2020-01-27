export default {
  // socketEndpoint: process.env.NODE_ENV === 'production' ? 'ws://192.168.1.123' : 'ws://localhost:8080',
  socketEndpoint: 'ws://localhost:8080',
  filesPath: process.env.NODE_ENV === 'production' ? 'http://192.168.1.123' : 'http://localhost:8080',
}