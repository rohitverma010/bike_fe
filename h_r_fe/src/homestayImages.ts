import type { SyntheticEvent } from "react";

// Single source of truth for homestay listing images. Keyed by the exact
// homestay name as stored in the backend (core_homestay.name), so every
// place that renders a homestay image (Home, Homestays, HomestayDetail)
// stays in sync by importing this instead of using `homestay.image` directly.
export const HOMESTAY_IMAGES: Record<string, string> = {
  "Verma Homestay": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeD3Un3CcbbQLurRq2QcgpiWWcSlhdhc3LtbImTbT0ew&s=10",
  "Rohit Homestay": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdz6LbOfeaxICo05UoufBi1zZ9q3jo9WT9S-0x-Qq7Xw&s=10",
};

// A neutral fallback used only if a mapped/API image URL fails to load.
export const HOMESTAY_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800";

/** Resolves the image to show for a homestay, preferring the fixed mapping above. */
export function homestayImageFor(homestayName: string, apiImage?: string): string {
  return HOMESTAY_IMAGES[homestayName] || apiImage || HOMESTAY_IMAGE_FALLBACK;
}

/** Attach to <img onError> so a broken URL falls back instead of showing a broken-image icon. */
export function onHomestayImageError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.src !== HOMESTAY_IMAGE_FALLBACK) {
    img.src = HOMESTAY_IMAGE_FALLBACK;
  }
}
