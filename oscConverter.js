const logger = require('./logger');

module.exports = () => {
  return function converter(osc) {
    const { address, args } = osc;
    let payload;
    switch (address) {
      case '/send_chase':
        if (args.length !== 2) {
          logger.error('incorrect number of arguments for send_chase');
          break;
        }
        payload = {
          msgType: 'sendVideo',
          mode: 'chase',
          percentage: args[0].value,
          videoIds: args[1].value,
        };
        break;
      case '/send_random':
        if (args.length !== 2) {
          logger.error('incorrect number of arguments for send_random');
          break;
        }
        payload = {
          msgType: 'sendVideo',
          mode: 'random',
          percentage: args[0].value,
          videoIds: args[1].value,
        };
        break;
      case '/send_chase_image':
        if (args.length !== 4) {
          logger.error('incorrect number of arguments for send_chase_image');
          break;
        }
        payload = {
          msgType: 'sendImage',
          mode: 'chase',
          percentage: args[0].value,
          imageIds: args[1].value,
          interval: args[2].value,
          imageDuration: args[3].value,
        };
        break;
      case '/send_random_image':
        if (args.length !== 3) {
          logger.error('incorrect number of arguments for send_random_image');
          break;
        }
        payload = {
          msgType: 'sendImage',
          mode: 'random',
          percentage: args[0].value,
          imageIds: args[1].value,
          imageDuration: args[2].value,
        };
        break;
      case '/send_kill':
        if (args.length !== 1) {
          logger.error('incorrect number of arguments for send_kill');
          break;
        }
        payload = {
          msgType: 'sendKill',
          percentage: args[0].value,
        };
        break;
      default:
        logger.error(`unknown address in osc: ${address}`);
    }
    return payload;
  };
};
