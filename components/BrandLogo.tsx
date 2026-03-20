type BrandLogoProps = {
  className?: string;
};

export default function BrandLogo({ className = "h-8 w-32" }: BrandLogoProps) {
  return (
    <span
      className={`block bg-[var(--foreground)] ${className}`}
      style={{
        WebkitMaskImage: "url('/logo.png')",
        maskImage: "url('/logo.png')",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
      aria-hidden
    />
  );
}
