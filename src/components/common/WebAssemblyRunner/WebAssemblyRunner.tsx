import type { WithChildren } from '@types';

import { FC, useCallback, useEffect } from 'react';

import { useUtils } from 'src/contexts/utils-context';

type Logger = {
  LogToFile: (level: number, maxLogFileSizeBytes: number) => void,
  LogToFileWorker: (
    level: number,
    maxLogFileSizeBytes: number,
    wasmJsPath: string,
    workerName: string
  ) => Promise<void>,
  StopLogging: () => void,
  GetFile: () => Promise<string>,
  Threshold: () => number,
  MaxSize: () => number,
  Size: () => Promise<number>,
  Worker: () => Worker,
};

declare global {
  interface Window {
    Crash: () => void;
    GetLogger: () => Logger;
    logger?: Logger;
    getCrashedLogFile: () => Promise<string>;
  }
}

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  const loadWasm = useCallback(async () => {
    const { loadUtils } = await import('@xxnetwork/xxdk-npm');
    const utils = await loadUtils();
    setUtils(utils);
    if (utils.LogLevel) {
      utils.LogLevel(1);
    }

    const logger = utils.GetLogger()

    const wasmJsPath = 'integrations/assets/logFileWorker.js';
    await logger.LogToFileWorker(
      0, 5000000, wasmJsPath, 'xxdkLogFileWorker'
    )

    // Get the actual Worker object from the log file object
    const w = logger.Worker()

    window.getCrashedLogFile = () => {
      return new Promise((resolve) => {
        w.addEventListener('message', ev => {
          resolve(atob(JSON.parse(ev.data).data))
        })
        w.postMessage(JSON.stringify({ tag: 'GetFileExt' }))
      });
    };

    window.logger = logger

    setUtilsLoaded(true);
  }, [setUtils, setUtilsLoaded])

  useEffect(() => {
    if (!utilsLoaded) {
      loadWasm();
    }
  }, [loadWasm, utilsLoaded]);

  return <>{children}</>;
};

export default WebAssemblyRunner;
