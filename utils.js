const logger = require('./logger');

module.exports = {
  getRandomPercentage: (arr, percentage) => {
  
    // if (percentage >= 100) {
    //   return arr;
    // }
    let n = Math.ceil(arr.length * (percentage / 100));
    if (n < 1) {
      return [];
    }
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
      
    if (n > len) {
      logger.error('range error in getRandomPercentage');
      return [];
    }
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  },
};
