// Importing the required modules
import { NodeLogger } from '@unconventional-code/observability-sdk';
import morgan from 'morgan';

const log = new NodeLogger({ correlation: 'system', name: 'httpLogger' });
export const httpLogger = morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: {
    write: (message: string): void => {
      log.info(message.substring(0, message.lastIndexOf('\n')));
    },
  },
});
