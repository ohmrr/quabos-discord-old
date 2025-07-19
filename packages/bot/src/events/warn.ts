import createEvent from '../interfaces/event.js';
import logger from '../utils/logger.js';

export default createEvent('warn', false, async message => {
	logger.warn(message);
});
