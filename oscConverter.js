const logger = require('./logger');

module.exports = () => {
  return function converter(osc) {
    const { address, args } = osc;
    let payload;
    switch (address) {
      case '/send_chase':
        if (args.length < 2) {
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
        if (args.length < 2) {
          logger.error('incorrect number of arguments for send_random');
          break;
        }
        payload = {
          msgType: 'sendVideo',
          mode: 'random',
          percentage: args[0].value,
          videoIds: args.slice(1, args.length).map((arg) => { return arg.value; }).join(','),
        };
        break;
      case '/send_chase_image':
        if (args.length < 4) {
          logger.error('incorrect number of arguments for send_chase_image');
          break;
        }
        payload = {
          msgType: 'sendImage',
          mode: 'chase',
          percentage: args[0].value,
          imageDuration: args[1].value,
          interval: args[2].value,
          imageIds: args[3].value,
        };
        break;
      case '/send_random_image':
        if (args.length < 3) {
          logger.error('incorrect number of arguments for send_random_image');
          break;
        }
        payload = {
          msgType: 'sendImage',
          mode: 'random',
          percentage: args[0].value,
          imageDuration: args[1].value,
          imageIds: args.slice(2, args.length).map((arg) => { return arg.value; }).join(','),
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
      case '/send_segmented_random_image':
        payload = handleSegmentedImageRandom(args);
        break;
      case '/send_segmented_chase_image':
        payload = handleSegmentedImageChase(args);
        break;
      case '/send_segmented_random_video':
        payload = handleSegmentedVideoRandom(args);
        break;
      case '/send_segmented_chase_video':
        payload = handleSegmentedVideoChase(args);
        break;
      default:
        logger.error(`unknown address in osc: ${address}`);
    }
    return payload;
  };
};

function handleSegmentedImageRandom(args) {
  if (args.length <= 7) {
    logger.error('incorrect number of arguments for send_segmented_random_image');
    return null;
  }
  // expect form:
  // /send_segmented_random_image 3 100 30 30 30 2 2 apples pears bananas pineapples apples pineapples
  // /send_segmented_random_image 2 100 50 50 1 apples pears
  // /send_segmented_random_image 4 100 25 25 25 25 1 1 1
  if (!args[0].type === 'i') {
    logger.error('incorrect arguments for send_segmented_random_image');
    return null;
  }
  const numberOfSegments = args[0].value;
  const expectedNumericalArgs = (numberOfSegments * 2) + 1;
  for (let i = 0; i < expectedNumericalArgs; i++) {
    const existingArg = args[i];
    if (!existingArg || !args[i].type === 'i') {
      logger.error('incorrect arguments for send_segmented_random_image');
      return null;
    }
  }

  const segmentSizes = args.slice(2, args[0].value + 2).map((arg) => { return arg.value; });
  const segmentNumberOfMedias = args.slice(2 + args[0].value, expectedNumericalArgs).map((arg) => { return arg.value; });
  const segmentContents = [];
  const mediaIds = args.slice(expectedNumericalArgs, args.length).map((media) => { return media.value; });
  let lastCounter = 0;
  for (let i = 0; i < segmentNumberOfMedias.length + 1; i += 1) {
    const lastIndex = segmentNumberOfMedias[i] ? lastCounter + segmentNumberOfMedias[i] : mediaIds.length;
    segmentContents.push(mediaIds.slice(lastCounter, lastIndex));
    lastCounter += segmentNumberOfMedias[i];
  }
  return {
    msgType: 'sendImage',
    mode: 'randomSegmented',
    segmentSizes,
    segmentContents,
    imageDuration: args[1].value,
  };
}

function handleSegmentedImageChase(args) {
  if (args.length <= 6) {
    logger.error('incorrect number of arguments for send_segmented_chase_image');
    return null;
  }
  // expect form:
  // /send_segmented_chase_image 3 100 100 30 30 30 apples pears bananas
  // /send_segmented_chase_image 2 100 100 50 50 apples pears
  // /send_segmented_chase_image 4 100 100 25 25 25 25 pears bananas pineapples apples
  if (!args[0].type === 'i') {
    logger.error('incorrect arguments for send_segmented_chase_image');
    return null;
  }
  const numberOfSegments = args[0].value;
  const expectedNumericalArgs = numberOfSegments + 3;
  for (let i = 0; i < expectedNumericalArgs; i++) {
    const existingArg = args[i];
    if (!existingArg || !args[i].type === 'i') {
      logger.error('incorrect arguments for send_segmented_chase_image');
      return null;
    }
  }

  const segmentSizes = args.slice(3, args[0].value + 3).map((arg) => { return arg.value; });
  const segmentContents = args.slice(expectedNumericalArgs, args.length).map((arg) => { return arg.value; });
  return {
    msgType: 'sendImage',
    mode: 'chaseSegmented',
    segmentSizes,
    segmentContents,
    imageDuration: args[1].value,
    interval: args[2].value,
  };
}

function handleSegmentedVideoRandom(args) {
  if (args.length <= 6) {
    logger.error('incorrect number of arguments for send_segmented_random_video');
    return null;
  }
  // expect form:
  // /send_segmented_random_video 3 30 30 30 2 2 ducks waterfall forest waves ducks forest
  // /send_segmented_random_video 2 50 50 1 ducks waterfall
  if (!args[0].type === 'i') {
    logger.error('incorrect arguments for send_segmented_random_video');
    return null;
  }
  const numberOfSegments = args[0].value;
  const expectedNumericalArgs = (numberOfSegments * 2);
  for (let i = 0; i < expectedNumericalArgs; i++) {
    const existingArg = args[i];
    if (!existingArg || !args[i].type === 'i') {
      logger.error('incorrect arguments for send_segmented_random_video');
      return null;
    }
  }

  const segmentSizes = args.slice(1, args[0].value + 1).map((arg) => { return arg.value; });
  const segmentNumberOfMedias = args.slice(1 + args[0].value, expectedNumericalArgs).map((arg) => { return arg.value; });
  const segmentContents = [];
  const mediaIds = args.slice(expectedNumericalArgs, args.length).map((media) => { return media.value; });
  let lastCounter = 0;
  for (let i = 0; i < segmentNumberOfMedias.length + 1; i += 1) {
    const lastIndex = segmentNumberOfMedias[i] ? lastCounter + segmentNumberOfMedias[i] : mediaIds.length;
    segmentContents.push(mediaIds.slice(lastCounter, lastIndex));
    lastCounter += segmentNumberOfMedias[i];
  }
  return {
    msgType: 'sendVideo',
    mode: 'randomSegmented',
    segmentSizes,
    segmentContents,
  };
}

function handleSegmentedVideoChase(args) {
  console.log(args)
  if (args.length <= 5) {
    logger.error('incorrect number of arguments for send_segmented_chase_video');
    return null;
  }
  // expect form:
  // /send_segmented_chase_video 3 100 30 30 30 apples pears bananas
  // /send_segmented_chase_video 2 100 50 50 apples pears
  // /send_segmented_chase_video 4 100 25 25 25 25 pears bananas pineapples apples
  if (!args[0].type === 'i') {
    logger.error('incorrect arguments for send_segmented_chase_video');
    return null;
  }
  const numberOfSegments = args[0].value;
  const expectedNumericalArgs = numberOfSegments + 2;
  for (let i = 0; i < expectedNumericalArgs; i++) {
    const existingArg = args[i];
    if (!existingArg || !args[i].type === 'i') {
      logger.error('incorrect arguments for send_segmented_chase_video');
      return null;
    }
  }

  const segmentSizes = args.slice(2, args[0].value + 2).map((arg) => { return arg.value; });
  const segmentContents = args.slice(expectedNumericalArgs, args.length).map((arg) => { return arg.value; });
  return {
    msgType: 'sendVideo',
    mode: 'chaseSegmented',
    segmentSizes,
    segmentContents,
    interval: args[1].value,
  };
}

