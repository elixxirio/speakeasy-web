import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

type LogFileWorker = {
  Threshold: () => number,
  GetFile: () => Promise<string>,
  MaxSize: () => number,
  Size: () => Promise<number>,
  Worker: () => Worker,
};
declare global {
  interface Window {
    LogToFileWorker: (wasmJsPath: string, name: string, level: number,
                      maxLogFileSizeBytes: number) => LogFileWorker;
    logFileWorker?: LogFileWorker;
    getCrashedLogFile: () => Promise<string>;
  }
}

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const go = new (window as any).Go();
      const binPath = '/integrations/assets/xxdk.wasm';
      WebAssembly?.instantiateStreaming(fetch(binPath), go.importObject).then(
        async (result) => {
          go?.run(result?.instance);
          const {
            Base64ToUint8Array,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GenerateChannelIdentity,
            GetChannelInfo,
            GetChannelJSON,
            GetClientVersion,
            GetDefaultCMixParams,
            GetOrInitPassword,
            GetPublicChannelIdentityFromPrivate,
            GetShareUrlType,
            GetVersion,
            ImportPrivateIdentity,
            IsNicknameValid,
            LoadChannelsManagerWithIndexedDb,
            LoadCmix,
            LogLevel,
            NewChannelsDatabaseCipher,
            NewChannelsManagerWithIndexedDb,
            NewCmix,
            NewDummyTrafficManager,
            Purge,
            ValidForever
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } = (window as any) || {};

          const { LogToFileWorker } = window;

          setUtils({
            NewCmix,
            LoadCmix,
            GetChannelInfo,
            GenerateChannelIdentity,
            GetDefaultCMixParams,
            NewChannelsManagerWithIndexedDb,
            Base64ToUint8Array,
            LoadChannelsManagerWithIndexedDb,
            GetPublicChannelIdentityFromPrivate,
            IsNicknameValid,
            GetShareUrlType,
            GetVersion,
            GetClientVersion,
            GetOrInitPassword,
            ImportPrivateIdentity,
            ConstructIdentity,
            DecodePrivateURL,
            DecodePublicURL,
            GetChannelJSON,
            NewDummyTrafficManager,
            NewChannelsDatabaseCipher,
            Purge,
            ValidForever
          });

          if (LogLevel) {
            LogLevel(2);
          }

          // LogToFileWorker is a WASM function that returns a new object that
          // manages the log file worker
          const logFileWorker = await LogToFileWorker(
            'integrations/assets/logFileWorker.js', 'xxdkLogFileWorker',
            1,5000000);
          window.logFileWorker = logFileWorker;


          // Get the actual Worker object from the log file object
          const w = logFileWorker.Worker()

          window.getCrashedLogFile = () => {
            return new Promise((resolve) => {
              w.addEventListener('message', ev => {
                resolve(atob(JSON.parse(ev.data).data))
              })
              w.postMessage(JSON.stringify({ tag: 'GetFileExt'}))
            });
          };

          setUtilsLoaded(true);
        }
      );
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
