
import type * as React from 'react';

const TechFrontLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10H9V14.5C9 15.3284 8.32843 16 7.5 16C6.67157 16 6 15.3284 6 14.5" />
    <path d="M12 18C12 19.1046 12.8954 20 14 20C15.1046 20 16 19.1046 16 18V10.5C16 9.11929 14.8807 8 13.5 8C12.1193 8 11 9.11929 11 10.5V12" />
    <path d="M14 6C14.5523 6 15 5.55228 15 5C15 4.44772 14.5523 4 14 4C13.4477 4 13 4.44772 13 5C13 5.55228 13.4477 6 14 6Z" />
  </svg>
);

export default TechFrontLogo;
