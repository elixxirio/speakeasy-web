import type { WithChildren } from '@types';

import { FC, useEffect } from 'react';
import { loadUtils } from '@xxnetwork/xxdk-npm';
import { useUtils, XXDKUtils } from 'src/contexts/utils-context';

type Logger = {
  StopLogging: () => void,
  GetFile: () => Promise<string>,
  Threshold: () => number,
  MaxSize: () => number,
  Size: () => Promise<number>,
  Worker: () => Worker,
};

declare global {
  interface Window {
    onWasmInitialized: () => void;
    Crash: () => void;
    GetLogger: () => Logger;
    logger?: Logger;
    getCrashedLogFile: () => Promise<string>;
  }
}

const WebAssemblyRunner: FC<WithChildren> = ({ children }) => {
  const { setUtils, setUtilsLoaded, utilsLoaded } = useUtils();

  useEffect(() => {
    if (!utilsLoaded) {
      loadUtils().then((utils) => {
        setUtils(utils as unknown as XXDKUtils);

        if(typeof utils.GetLogger === 'function') {
          const logger = utils.GetLogger()

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
        }

        setUtilsLoaded(true);
      });
    }
  }, [setUtils, setUtilsLoaded, utilsLoaded]);
  return <>{children}</>;
};

export default WebAssemblyRunner;
