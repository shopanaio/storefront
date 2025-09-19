interface WaveDividerProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export function WaveDivider({
  width = 85,
  height = 10,
  color = "#1890FF",
  strokeWidth = 2,
}: WaveDividerProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5C4.06061 -0.333333 7.12121 -0.333333 10.1818 5C13.2424 10.3333 16.303 10.3333 19.3636 5C22.4242 -0.333333 25.4848 -0.333333 28.5455 5C31.6061 10.3333 34.6667 10.3333 37.7273 5C40.7879 -0.333333 43.8485 -0.333333 46.9091 5C49.9697 10.3333 53.0303 10.3333 56.0909 5C59.1515 -0.333333 62.2121 -0.333333 65.2727 5C68.3333 10.3333 71.3939 10.3333 74.4545 5C77.5152 -0.333333 80.5758 -0.333333 83.6364 5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
