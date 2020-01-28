export default {
  socketEndpoint: process.env.NODE_ENV === 'production' ? 'ws://eternitybekind.com' : 'ws://localhost:8080',
  // socketEndpoint: 'ws://localhost:8080',
  filesPath: process.env.NODE_ENV === 'production' ? 'http://eternitybekind.com' : 'http://localhost:8080',
}