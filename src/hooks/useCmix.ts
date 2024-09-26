import type { CMix, CMixParams, DatabaseCipher, DummyTraffic, RemoteStore } from 'src/types';

import { useCallback, useEffect, useMemo, useState } from 'react';
import assert from 'assert';

import { useUtils } from '@contexts/utils-context';
import { encoder, decoder } from '@utils/index';
import { DUMMY_TRAFFIC_ARGS, FOLLOWER_TIMEOUT_PERIOD, MAXIMUM_PAYLOAD_BLOCK_SIZE, STATE_PATH } from 'src/constants';
import useTrackNetworkPeriod from './useNetworkTrackPeriod';
import { useAuthentication } from '@contexts/authentication-context';
import { AppEvents, appBus as bus, useAppEventListener } from 'src/events';
import { RemoteKVWrapper } from '@contexts/remote-kv-context';
import useAccountSync, { AccountSyncStatus } from './useAccountSync';

import { GetDefaultNDF } from 'xxdk-wasm';

export enum NetworkStatus {
  UNINITIALIZED = 'uninitialized',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
}

const ndf = GetDefaultNDF();

const useCmix = () => {
  const { cmixPreviouslyInitialized, rawPassword } = useAuthentication();
  const [status, setStatus] = useState<NetworkStatus>(NetworkStatus.UNINITIALIZED);
  const [dummyTraffic, setDummyTrafficManager] = useState<DummyTraffic>();
  const [cmix, setCmix] = useState<CMix | undefined>();
  const { utils } = useUtils();
  const cmixId = useMemo(() => cmix?.GetID(), [cmix]);
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { trackingMs } = useTrackNetworkPeriod();
  const [decryptedPass, setDecryptedPass] = useState<Uint8Array>();
  const accountSync = useAccountSync();

  const encodedCmixParams = useMemo(() => {
    const params = JSON.parse(decoder.decode(utils.GetDefaultCMixParams())) as CMixParams;
    params.Network.EnableImmediateSending = true;
    return encoder.encode(JSON.stringify(params));
  }, [utils]);

  const createDatabaseCipher = useCallback(
    (id: number, password: Uint8Array) => {
      const cipher = utils.NewDatabaseCipher(
        id,
        password,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );

      setDatabaseCipher({
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(encrypted)
        ),
      })
    },
    [utils]
  );

  useEffect(() => {
    if (cmix) {
      bus.emit(AppEvents.CMIX_LOADED, cmix);
    }
  }, [cmix])

  const loadSynchronizedCmix = useCallback(async (password: Uint8Array, store: RemoteStore) => {
    const loadedCmix = await utils.LoadSynchronizedCmix(
      STATE_PATH,
      password,
      store,
      encodedCmixParams
    );

    setCmix(loadedCmix);
  }, [encodedCmixParams, utils]);

  const initializeSynchronizedCmix = useCallback(async (password: Uint8Array, store: RemoteStore) => {
    if (!cmixPreviouslyInitialized) {
      await utils.NewSynchronizedCmix(
        ndf,
        STATE_PATH,
        '',
        password,
        store,
      ).catch((e) => {
        bus.emit(AppEvents.NEW_SYNC_CMIX_FAILED);
        utils.Purge(rawPassword ?? '')
        throw e;
      });
    }
  }, [cmixPreviouslyInitialized, rawPassword, utils])

  const initializeCmix = useCallback(async (password: Uint8Array) => {
    if (!cmixPreviouslyInitialized) {
      await utils.NewCmix(ndf, STATE_PATH, password, '');
    }
  }, [cmixPreviouslyInitialized, utils]);

  const loadCmix = useCallback(async (password: Uint8Array) => {
    const loadedCmix = await utils.LoadCmix(
      STATE_PATH,
      password,
      encodedCmixParams
    );
    setCmix(loadedCmix)
  }, [encodedCmixParams, utils]);

  const connect = useCallback(async () => {
    if (!cmix) { 
      throw Error('Cmix required') 
    }

    setStatus(NetworkStatus.CONNECTING);
    try {
      cmix.StartNetworkFollower(FOLLOWER_TIMEOUT_PERIOD);
    } catch (error) {
      console.error('Error while StartNetworkFollower:', error);
      setStatus(NetworkStatus.FAILED);
    }

    try {
      await cmix.WaitForNetwork(10 * 60 * 1000);
      setStatus(NetworkStatus.CONNECTED)
    } catch (e) {
      console.error('Timed out. Network is not healthy.');
      setStatus(NetworkStatus.FAILED);
    }
  }, [cmix]);

  const disconnect = useCallback(() => {
    dummyTraffic?.Pause();
    setDummyTrafficManager(undefined);
    cmix?.StopNetworkFollower();
    setStatus(NetworkStatus.DISCONNECTED);
    setCmix(undefined);
  }, [cmix, dummyTraffic]);

  useEffect(() => {
    if (cmix) {
      cmix.AddHealthCallback({
        Callback: (isHealthy: boolean) => {
          if (isHealthy) {
            setStatus(NetworkStatus.CONNECTED);
          } else {
            setStatus(NetworkStatus.DISCONNECTED);
          }
        }
      });
    }
  }, [cmix]);

  useEffect(() => {
    const listener = () => {
      try {
        cmix?.StopNetworkFollower();
      } catch (e) {
        console.error('Stop follower failed:', e);
      }
    };

    bus.addListener(AppEvents.REMOTE_STORE_INITIALIZED, listener);

    return () => {
      bus.removeListener(AppEvents.REMOTE_STORE_INITIALIZED, listener);
    }
  }, [cmix])

  useEffect(() => {
    if (cmix) {
      connect();
    }
  }, [connect, cmix]);
  

  useEffect(() => {
    if (status === NetworkStatus.CONNECTED && dummyTraffic && !dummyTraffic.GetStatus()) {
      dummyTraffic.Start();
    }
  }, [dummyTraffic, status])


  useEffect(() => {
    if (cmixId !== undefined) {
      try {
        setDummyTrafficManager(utils.NewDummyTrafficManager(
          cmixId,
          ...DUMMY_TRAFFIC_ARGS
        ));
      } catch (error) {
        console.error('error while creating the Dummy Traffic Object:', error);
      }
    }
  }, [cmixId, utils]);

  useEffect(() => {
    if (cmix && status === NetworkStatus.CONNECTED) {
      cmix.SetTrackNetworkPeriod(trackingMs);
    }
  }, [cmix, status, trackingMs]);

  useEffect(() => {
    if (decryptedPass && cmix) {
      createDatabaseCipher(cmix.GetID(), decryptedPass);
    }
  }, [cmix, createDatabaseCipher, decryptedPass]);

  const initializeSync = useCallback((encryptedPass: Uint8Array, remote: RemoteStore) => {
    return initializeSynchronizedCmix(encryptedPass, remote)
      .then(() => loadSynchronizedCmix(encryptedPass, remote))
      .then(() => {
        bus.emit(AppEvents.CMIX_SYNCED, remote.service)
      })
      .catch(() => {
        utils.Purge(rawPassword ?? '');
        setStatus(NetworkStatus.FAILED);
      })
  }, [initializeSynchronizedCmix, loadSynchronizedCmix, rawPassword, utils]);
  
  const initialize = useCallback((encryptedPass: Uint8Array) => {
    return initializeCmix(encryptedPass)
      .then(() => loadCmix(encryptedPass))
      .catch((e) => {
        setStatus(NetworkStatus.FAILED);
        throw e;
      })
  }, [initializeCmix, loadCmix]);

  const onPasswordDecryption = useCallback(async (password: Uint8Array) => {
    setDecryptedPass(password);
    if (accountSync.status !== AccountSyncStatus.Synced) {
      await initialize(password);
    }
  }, [accountSync.status, initialize]);

  useAppEventListener(AppEvents.PASSWORD_DECRYPTED, onPasswordDecryption);

  const onRemoteStoreInitialized = useCallback(async (remoteStore: RemoteStore) => {
    assert(decryptedPass, 'Password required for sync login');
    initializeSync(decryptedPass, remoteStore);
  }, [decryptedPass, initializeSync]);

  useAppEventListener(AppEvents.REMOTE_STORE_INITIALIZED, onRemoteStoreInitialized);

  useEffect(() => {
    if (cmix) {
      cmix.GetRemoteKV().then((rawKv) => {
        const wrappedKv = new RemoteKVWrapper(rawKv);
        bus.emit(AppEvents.REMOTE_KV_INITIALIZED, wrappedKv);
      })
    }
  }, [cmix]);
  
  return {
    connect,
    cmix,
    cipher: databaseCipher,
    disconnect,
    id: cmixId,
    status,
    initialize,
    initializeSync
  };
}

export default useCmix;
