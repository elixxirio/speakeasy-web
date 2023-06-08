import { createContext, useEffect, useState, FC, useContext } from 'react';

import { KV_VERSION, OperationType, RemoteKV } from 'src/types/collective';
import { encoder } from 'src/utils/index';
import {  kvEntryDecoder } from 'src/utils/decoders';
import { WithChildren } from 'src/types';
import { AppEvents, bus } from 'src/events';

type OnChangeCallback = (data?: string) => void;

export class RemoteKVWrapper {
  kv: RemoteKV;

  constructor(kv: RemoteKV) {
    this.kv = kv;
  }

  async get(key: string) {
    let value = undefined;
    try {
      const fetchedEntry = await this.kv.Get(key, KV_VERSION);
      const entry = kvEntryDecoder(fetchedEntry);
      value = Buffer.from(entry.data, 'base64').toString();
    } catch (e) {
      console.warn(`Could not find ${key} in remote kv, returning undefined. Remote kv returned ${(e as Error).message}`);
    }
    return value;
  }

  set(key: string, data: string) {
    const entry = { Version: KV_VERSION, Data: Buffer.from(data).toString('base64'), Timestamp: new Date().toISOString() }
    return this.kv.Set(key, encoder.encode(JSON.stringify(entry)));
  }

  delete(key: string) {
    this.kv.Delete(key, KV_VERSION);
  }

  listenOn(key: string, onChange: OnChangeCallback) {
    return this.kv.ListenOnRemoteKey(
      key,
      KV_VERSION,
      {
        Callback: (_k, _old, v, operationType) => {
          const entry = kvEntryDecoder(v);
          const converted = Buffer.from(entry.data, 'base64').toString();
          onChange(
            operationType === OperationType.Deleted
              ? undefined
              : converted
          );
        }
      }
    );
  }
}

type ContextType = {
  kv?: RemoteKVWrapper,
}

const RemoteKVContext = createContext<ContextType>({} as ContextType);

export const RemoteKVProvider: FC<WithChildren> = ({ children }) => {
  const [kv, setKv] = useState<RemoteKVWrapper>();

  useEffect(() => {
    bus.addListener(AppEvents.REMOTE_KV_INITIALIZED, setKv);

    return () => { bus.removeListener(AppEvents.REMOTE_KV_INITIALIZED, setKv); }
  }, []);

  return (
    <RemoteKVContext.Provider value={{ kv }}>
      {children}
    </RemoteKVContext.Provider>
  )
}


export const useRemoteKV = () => useContext(RemoteKVContext).kv;
