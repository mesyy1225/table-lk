/** Price in Sri Lankan rupees, e.g. "Rs. 18,500". Use this everywhere a price is shown. */
export const formatPrice = (price: number) => `Rs. ${Math.round(price).toLocaleString("en-LK")}`;

/** Table size in inches as "60 × 24 × 30 in" (length × width × height). Empty string when no size is known. */
export const formatSize = (d?: { length?: number; width?: number; height?: number }) => {
  if (!d) return "";
  const parts = [d.length, d.width, d.height].filter((n): n is number => typeof n === "number" && n > 0);
  return parts.length >= 2 ? `${parts.join(" × ")} in` : "";
};
