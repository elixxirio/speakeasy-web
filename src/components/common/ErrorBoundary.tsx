import type { FC } from 'react';
import type { WithChildren } from 'src/types';

import React from 'react';
import { ErrorBoundary as LibBoundary } from 'react-error-boundary';
import { Download } from '@components/icons';

type ErrorProps = {
  resetErrorBoundary: () => void;
}

const Error: FC<ErrorProps> = ({ resetErrorBoundary }) => (
  <div>
    <h2>Oops, something went wrong!</h2>
    <div>
      <h3 className='headline--sm'>Download logs</h3>
      <Download
        onClick={async () => {
          if (!window.getCrashedLogFile) {
            console.error('Log file worker required')
            return
          }

          const filename = 'xxdk.log';
          const data = await window.getCrashedLogFile();
          const file = new Blob([data], { type: 'text/plain' });
          const a = document.createElement('a'),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        }}
      />
    </div>
    <button
      type='button'
      onClick={resetErrorBoundary}
    >
      Try again?
    </button>
  </div>
);

const ErrorBoundary: FC<WithChildren> = ({ children }) => {
  return (
    <LibBoundary FallbackComponent={Error}>
      {children}
    </LibBoundary>
  );
}

export default ErrorBoundary;
