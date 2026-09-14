import type { SyntheticEvent } from "react";

// Single source of truth for bike/scooter listing images. Keyed by the
// exact bike name as stored in the backend (core_bike.name), so every
// place that renders a bike image (Home, Bikes, BikeDetail) stays in sync
// by importing this instead of using `bike.image` from the API directly.
export const VEHICLE_IMAGES: Record<string, string> = {
  "TVS NTorq": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_ldOO_qifCHKheDneNGkTxh3UeJrBeH3utN9Scy6W1w&s=10",
  "Honda Activa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7SwVlgaFEu-EmG_ZLhtBlz7L5H_QxcLLzHyYx768Rfg&s=10",
  "TVS Jupiter": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKJ5RqI-76z8pupv407NAeTU20-KmkN1wVBwsiR4TtNA&s=10",
  "Royal Enfield Himalayan": "https://cdn.bikedekho.com/upload/userfiles/images/6a742b7e10791.png",
  "Royal Enfield Hunter": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcgpUl8K5aIAcr0R8SEvdyRM1aFIEFeTn1eWyzyWlAtw&s=10",
  "Hero Xpulse": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiQ2pwI7WQfUJQ0jkgI8WJ-VepWZ8Zh1YCNOsJxOT7vA&s=10",
  "Royal Enfield Classic 350 Bullet": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgkTCwA6MQWK8zGR2q-ThqBi_GdG81ihtQ0mS6dcnrLg&s=10",
};

// A neutral fallback used only if a mapped/API image URL fails to load.
export const VEHICLE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";

/** Resolves the image to show for a bike, preferring the fixed mapping above. */
export function vehicleImageFor(bikeName: string, apiImage?: string): string {
  return VEHICLE_IMAGES[bikeName] || apiImage || VEHICLE_IMAGE_FALLBACK;
}

/** Attach to <img onError> so a broken URL falls back instead of showing a broken-image icon. */
export function onVehicleImageError(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.src !== VEHICLE_IMAGE_FALLBACK) {
    img.src = VEHICLE_IMAGE_FALLBACK;
  }
}
