import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

export const asyncStoragePersistor = createAsyncStoragePersister({
  storage: localStorage,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
