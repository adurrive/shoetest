import shoetest from './shoetest';
export { escape } from './regexp';

// Default export for both CommonJS and ES modules
export default shoetest;

// CommonJS compatibility
module.exports = shoetest;
module.exports.default = shoetest;
module.exports.escape = require('./regexp').escape;
