import { useId } from 'react';

/**
 * LiqPay logo mark, the same artwork as the LiqPay app icon in admin
 * (`internal/admin/public/app-icons/liqpay.svg`).
 * Gradient ids are scoped per instance so several logos can share a page.
 */
export function LiqPayLogo({ size = 24 }: { size?: number }) {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      width={(size * 506) / 501}
      height={size}
      viewBox="0 0 506 501"
      fill="none"
      role="img"
      aria-label="LiqPay"
    >
      <g>
        <g>
          <g>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.6949 490.392L14.6638 484.365C-2.41177 469.801 -5.42511 443.183 10.1438 426.108L192.953 217.183C207.517 200.107 234.135 197.094 251.211 212.663L258.242 218.69C275.317 233.254 278.331 259.872 262.762 276.947L79.9528 485.872C65.3883 502.948 39.775 504.957 21.6949 490.392Z"
              fill={`url(#${id}-paint0)`}
            />
            <path
              opacity="0.4"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M168.343 253.342L164.828 249.324L136.703 281.466L139.716 284.982C187.93 333.195 167.339 381.911 156.29 398.986L160.308 394.466C166.836 386.933 176.881 375.382 187.428 362.826C198.477 343.742 214.045 298.542 168.343 253.342Z"
              fill={`url(#${id}-paint1)`}
            />
            <path
              opacity="0.4"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M228.61 316.12L236.144 307.582C236.646 306.578 237.65 305.573 238.153 304.569C230.117 313.609 221.579 323.151 213.544 332.693C219.57 326.164 224.592 320.64 228.61 316.12Z"
              fill={`url(#${id}-paint2)`}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M263.766 223.709L80.9572 14.7847C66.3927 -2.29092 39.7749 -5.30426 22.6993 10.2647L15.6682 16.2913C-1.40738 30.8558 -4.42071 57.4736 11.1482 74.5492L165.331 249.323L168.846 253.341C214.548 299.043 198.98 344.243 187.428 363.327C196.468 352.781 205.508 342.234 214.046 332.692C222.082 323.15 230.62 313.607 238.655 304.567C246.691 295.527 254.224 286.989 259.246 281.465C276.824 264.389 279.335 240.785 263.766 223.709Z"
              fill={`url(#${id}-paint3)`}
            />
          </g>
          <g>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M253.72 490.392L246.689 484.365C229.614 469.801 226.6 443.183 242.169 426.108L424.978 217.183C439.543 200.107 466.161 197.094 483.236 212.663L490.267 218.69C507.343 233.254 510.356 259.872 494.787 276.947L311.978 485.872C297.414 502.948 271.8 504.957 253.72 490.392Z"
              fill={`url(#${id}-paint4)`}
            />
            <path
              opacity="0.4"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M402.378 251.331L398.863 247.313L370.738 279.455L373.752 282.971C421.965 331.184 401.374 379.9 390.325 396.976L394.343 392.456C400.872 384.922 410.916 373.371 421.463 360.816C432.512 341.731 448.081 296.531 402.378 251.331Z"
              fill={`url(#${id}-paint5)`}
            />
            <path
              opacity="0.4"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M460.135 316.12L467.668 307.582C468.171 306.578 469.175 305.573 469.677 304.569C461.642 313.609 453.104 323.151 445.068 332.693C451.095 326.164 456.619 320.64 460.135 316.12Z"
              fill={`url(#${id}-paint6)`}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M495.289 223.709L312.48 14.7847C297.916 -2.29092 271.298 -5.30426 254.222 10.2647L247.191 16.2913C230.115 30.8558 227.102 57.4736 242.671 74.5492L396.853 249.323L400.369 253.341C446.071 299.043 430.502 344.243 418.951 363.327C427.991 352.781 437.031 342.234 445.569 332.692C453.605 323.15 462.142 313.607 470.178 304.567C478.214 295.527 485.747 286.989 490.769 281.465C508.347 264.389 510.858 240.785 495.289 223.709Z"
              fill={`url(#${id}-paint7)`}
            />
          </g>
        </g>
      </g>
      <defs>
        <linearGradient
          id={`${id}-paint0`}
          x1="78.7938"
          y1="555.602"
          x2="332.499"
          y2="432.593"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1FADC3" />
          <stop offset="0.7072" stopColor="#36B98F" />
        </linearGradient>
        <linearGradient
          id={`${id}-paint1`}
          x1="167.878"
          y1="358.031"
          x2="215.305"
          y2="351.125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#123F06" stopOpacity="0.01" />
          <stop offset="1" stopColor="#123F06" />
        </linearGradient>
        <radialGradient
          id={`${id}-paint2`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(127.873 342.23) scale(122.451 139.945)"
        >
          <stop offset="0.4185" stopColor="#123F06" stopOpacity="0.01" />
          <stop offset="1" stopColor="#123F06" />
        </radialGradient>
        <linearGradient
          id={`${id}-paint3`}
          x1="-94.7208"
          y1="276.967"
          x2="212.964"
          y2="383.294"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9FDB57" />
          <stop offset="1" stopColor="#71CA5E" />
        </linearGradient>
        <linearGradient
          id={`${id}-paint4`}
          x1="310.598"
          y1="555.729"
          x2="564.303"
          y2="432.72"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1FADC3" />
          <stop offset="0.7072" stopColor="#36B98F" />
        </linearGradient>
        <linearGradient
          id={`${id}-paint5`}
          x1="401.913"
          y1="356.02"
          x2="449.34"
          y2="349.115"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#123F06" stopOpacity="0.01" />
          <stop offset="1" stopColor="#123F06" />
        </linearGradient>
        <radialGradient
          id={`${id}-paint6`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(359.605 342.23) scale(122.451 139.945)"
        >
          <stop offset="0.4185" stopColor="#123F06" stopOpacity="0.01" />
          <stop offset="1" stopColor="#123F06" />
        </radialGradient>
        <linearGradient
          id={`${id}-paint7`}
          x1="136.953"
          y1="277.059"
          x2="444.638"
          y2="383.386"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9FDB57" />
          <stop offset="1" stopColor="#71CA5E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
