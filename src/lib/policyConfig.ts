// Single source of truth for business facts used across the site
// (policies, footer, contact page, checkout, WhatsApp links, SEO).
// PayHere checks that these match your merchant registration, so keep them accurate.

export const policyConfig = {
  // Must match the name on your Business Registration (BR) certificate used for PayHere.
  legalName: "TableLK",
  // Business Registration number, e.g. "PV 123456" or "WCO/12345". Shown only when filled in.
  registrationNo: "",
  brandName: "TableLK",
  website: "https://www.tablelk.com", // canonical domain (tablelk.com redirects here)
  address: "No. 31/A/02, Gammanpila, Bandaragama, Sri Lanka",
  phone: "+94 72 461 3204",
  phoneHref: "tel:+94724613204",
  whatsapp: "+94 72 461 3204",
  whatsappNumber: "94724613204", // wa.me format, no "+"
  email: "bossfurniturelk@gmail.com",
  facebookUrl: "https://www.facebook.com/p/Table-Lk-61577878267758/",
  businessHours: "Every day, 8.00 am – 6.00 pm",

  // Returns & refunds
  returnWindowDays: 7, // days after delivery to request a return for standard items
  damageReportHours: 48, // hours after delivery to report damage / wrong item
  refundProcessingDays: "7–14 working days", // time for card refunds to reach the customer

  // Delivery
  colomboDeliveryDays: "2–5 working days",
  outstationDeliveryDays: "3–7 working days",
  customOrderDays: "7–21 working days",
  // Delivery charge in LKR per order. KEEP IN SYNC with
  // supabase/functions/payhere-checkout/index.ts (the server recomputes it for card payments).
  deliveryFee: {
    western: 0, // Colombo, Gampaha, Kalutara
    other: 0, // all other districts
  },

  lastUpdated: "14 November 2026",
} as const;

export const WESTERN_DISTRICTS = ["Colombo", "Gampaha", "Kalutara"] as const;

export const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
  "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
] as const;

export const deliveryFeeFor = (district?: string): number =>
  district && (WESTERN_DISTRICTS as readonly string[]).includes(district)
    ? policyConfig.deliveryFee.western
    : policyConfig.deliveryFee.other;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${policyConfig.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
