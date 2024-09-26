import { SVGProps } from 'react';

const Plus = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g id='Icon'>
      <path id='vector' fillRule='evenodd' clipRule='evenodd' d='M11.5001 18.9C11.5001 19.1762 11.7239 19.4 12.0001 19.4C12.2762 19.4 12.5001 19.1762 12.5001 18.9V12.4H19C19.2761 12.4 19.5 12.1761 19.5 11.9C19.5 11.6238 19.2761 11.4 19 11.4H12.5001V4.90003C12.5001 4.62388 12.2762 4.40003 12.0001 4.40003C11.7239 4.40003 11.5001 4.62388 11.5001 4.90003L11.5001 11.4H5C4.72386 11.4 4.5 11.6238 4.5 11.9C4.5 12.1761 4.72386 12.4 5 12.4H11.5001L11.5001 18.9Z' fill='currentColor'/>
      </g>
    </svg>
  );
};

export default Plus;
