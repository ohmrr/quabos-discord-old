import createEvent from '../interfaces/event.js';
import logger from '../utils/logger.js';

export default createEvent('debug', false, async message => {
	logger.debug(message);
});
