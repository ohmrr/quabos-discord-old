import createEvent from '../interfaces/event.js';
import logger from '../utils/logger.js';

export default createEvent('error', false, async error => {
  logger.error(error);
});
