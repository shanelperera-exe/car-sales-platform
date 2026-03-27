import { useEffect, useState } from "react";

interface ListingImageProps {
  src: string | null;
  alt: string;
  className: string;
  fallbackClassName?: string;
  fallbackLabel: string;
}

export function ListingImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackLabel
}: ListingImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={fallbackClassName ?? className}>
        {fallbackLabel}
      </div>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
