// Business facts used by the legal / policy pages (Terms, Privacy, Returns, Shipping).
// PayHere checks that these pages match your merchant registration, so keep the
// values below accurate. Edit here once and every policy page updates.

export const policyConfig = {
  // Must match the name on your Business Registration (BR) certificate used for PayHere.
  legalName: "TableLK",
  // Business Registration number, e.g. "PV 123456" or "WCO/12345". Shown only when filled in.
  registrationNo: "",
  brandName: "TableLK",
  website: "https://www.tablelk.com",
  address: "No. 31/A/02, Gammanpila, Bandaragama, Sri Lanka",
  phone: "+94 72 461 3204",
  whatsapp: "+94 70 461 3204",
  email: "bossfurniturelk@gmail.com",
  businessHours: "Every day, 8.00 am – 6.00 pm",

  // Returns & refunds
  returnWindowDays: 7, // days after delivery to request a return for standard items
  damageReportHours: 48, // hours after delivery to report damage / wrong item
  refundProcessingDays: "7–14 working days", // time for card refunds to reach the customer

  // Delivery
  colomboDeliveryDays: "2–5 working days",
  outstationDeliveryDays: "3–7 working days",
  customOrderDays: "7–21 working days",

  lastUpdated: "14 November 2026",
} as const;
