import type { CMix } from 'src/types'
import { useUtils } from '@contexts/utils-context';
import { decoder } from '@utils/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STATE_PATH } from 'src/constants';
import { ndf } from 'src/sdk-utils/ndf';

const MAXIMUM_PAYLOAD_BLOCK_SIZE = 725;

const cmixPreviouslyInitiated = () => {
  return localStorage && localStorage.getItem(STATE_PATH) !== null;
};

export type DummyTraffic = {
  GetStatus: () => boolean;
  SetStatus: (status: boolean) => void;
}

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
}

const useCmix = () => {
  const [status, setStatus] = useState<NetworkStatus>();
  const [dummyTraffic, setDummyTrafficManager] = useState<DummyTraffic>();
  const [cmix, setCmix] = useState<CMix | undefined>();
  const { utils } = useUtils();
  const cmixId = useMemo(() => cmix?.GetID(), [cmix]);
  const [databaseCipher, setDatabaseCipher] = useState<{ id: number, decrypt: (encrypted: string) => string }>();

  const createDatabaseCipher = useCallback(
    (id: number, decryptedInternalPassword: Uint8Array) => {
      const cipher = utils.NewChannelsDatabaseCipher(
        id,
        decryptedInternalPassword,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );

      setDatabaseCipher({
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(utils.Base64ToUint8Array(encrypted))
        ),
      })
    },
    [utils]
  )
  
  const load = useCallback((decryptedInternalPassword: Uint8Array) => {
    try {
      utils.LoadCmix(
        STATE_PATH,
        decryptedInternalPassword,
        utils.GetDefaultCMixParams()
      ).then((loadedCmix) => {
        createDatabaseCipher(loadedCmix.GetID(), decryptedInternalPassword);
        setCmix(loadedCmix);
      });
    } catch (e) {
      console.error('Failed to load Cmix: ' + e);
      setStatus(NetworkStatus.FAILED);
    }
  }, [createDatabaseCipher, utils]);

  const initiate = useCallback(async (decryptedInternalPassword: Uint8Array) => {
    try {
      if (!cmixPreviouslyInitiated()) {
        utils.NewCmix(ndf, STATE_PATH, decryptedInternalPassword, '');
      }

      load(decryptedInternalPassword);
    } catch (e) {
      console.error('Failed to initiate Cmix: ' + e);
      setStatus(NetworkStatus.FAILED);
    }
  }, [utils, load]);


  const connect = useCallback(async () => {
    if (!cmix) { 
      throw Error('Cmix required') 
    }

    setStatus(NetworkStatus.CONNECTING);
    try {
      cmix.StartNetworkFollower(50000);
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
    dummyTraffic?.SetStatus(false);
    setDummyTrafficManager(undefined);
    cmix?.StopNetworkFollower();
    setStatus(NetworkStatus.DISCONNECTED);
    setCmix(undefined);
  }, [cmix, dummyTraffic])


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
    if (cmix && status !== NetworkStatus.CONNECTED) {
      connect();
    }

    return () => disconnect();
  }, [connect, cmix, status, disconnect])
  

  useEffect(() => {
    if (status === 'connected' && dummyTraffic && !dummyTraffic.GetStatus()) {
      dummyTraffic.SetStatus(true);
    }

    return () => dummyTraffic?.SetStatus(false);
  }, [dummyTraffic, status])


  useEffect(() => {
    if (cmixId) {
      try {
        setDummyTrafficManager(utils.NewDummyTrafficManager(
          cmixId,
          3,
          15000,
          7000
        ));
      } catch (error) {
        console.error('error while creating the Dummy Traffic Object:', error);
      }
    }
  }, [cmixId, utils]);
  
  return { connect, databaseCipher, disconnect, id: cmixId,  initiate, status };
}

export default useCmix;
