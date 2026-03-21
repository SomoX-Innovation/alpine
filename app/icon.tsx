import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0b",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 82 L35 45 L49 59 L61 47 L95 82 L78 78 L61 56 L47 68 L34 56 L18 75 Z"
            fill="#f5f5f5"
          />
          <path
            d="M18 82 L45 40 L60 54 L70 48 L92 82 L80 79 L67 60 L58 66 L46 50 L27 75 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
