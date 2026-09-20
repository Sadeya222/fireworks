/** Direct image endpoint resolved from the supplied Postimages share page. */
export const BRAND_LOGO_URL = "https://i.postimg.cc/XXh28XJt/Classic-Logo.png";

interface BrandLogoProps {
  className?: string;
  eager?: boolean;
}

/** Responsive brand artwork shared by the navbar and footer. */
export default function BrandLogo({ className = "", eager = false }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_URL}
      alt="Classic Fireworks"
      width={190}
      height={84}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      className={`block h-auto max-w-full object-contain ${className}`}
    />
  );
}