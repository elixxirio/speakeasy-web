import type { DBMessage } from '@contexts/network-client-context';

import { useLiveQuery } from 'dexie-react-hooks';

import { useDb, DBChannel } from 'src/contexts/db-context';

const useDexie = () => {
  const db = useDb();
  const channels = useLiveQuery(() => {
    return db?.table<DBChannel>('channels').toArray() ?? []
  }, [db]);

  const messages = useLiveQuery(() => {
    return db?.table<DBMessage>('messages').toArray() ?? [];
  }, [db]);

  return {
    channels,
    messages
  }
}

export default useDexie;
