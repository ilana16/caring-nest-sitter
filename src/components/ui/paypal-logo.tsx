
import React from "react";

function PaypalLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 11l-2 8h5l1.5-5.5c4 0 6.5-3 6.5-5.5s-2.5-4-5-4H7v7z" />
      <path d="M14.5 11c1.5-2 2-3.5 2-5.5-1.5 0-3 0-4 .5" />
      <path d="M10 15.5c6.5 0 6 0 7.5-5.5" />
    </svg>
  );
}

export { PaypalLogo };
