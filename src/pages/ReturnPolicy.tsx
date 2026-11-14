import React from "react";
import { Link } from "react-router-dom";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { policyConfig as c } from "@/lib/policyConfig";

const sections: PolicySection[] = [
  {
    id: "eligibility",
    title: "Returns we accept",
    body: (
      <>
        <p>You may request a return within <strong>{c.returnWindowDays} days of delivery</strong> if:</p>
        <ul>
          <li>the product arrived <strong>damaged</strong> or <strong>defective</strong>;</li>
          <li>you received the <strong>wrong item</strong>, size or colour; or</li>
          <li>the product is a standard (non-customised) item that is <strong>unused, unassembled</strong> and in its original packaging, and you have changed your mind.</li>
        </ul>
        <p>
          Damage during delivery or a wrong item must be reported within <strong>{c.damageReportHours} hours</strong> of delivery,
          with photos of the product and packaging, so we can arrange a replacement quickly.
        </p>
      </>
    ),
  },
  {
    id: "non-returnable",
    title: "Items that cannot be returned",
    body: (
      <ul>
        <li>Custom-made or made-to-order furniture (custom sizes, finishes, colours or designs made to your specification), unless it is defective or does not match the agreed specification.</li>
        <li>Products that have been assembled, used, altered, or damaged after delivery.</li>
        <li>Damage caused by misuse, moisture, improper assembly, or normal wear and tear.</li>
        <li>Clearance or discounted items marked as final sale.</li>
      </ul>
    ),
  },
  {
    id: "how-to-return",
    title: "How to request a return",
    body: (
      <ol>
        <li>Contact us on <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a>, WhatsApp {c.whatsapp}, or <a href={`mailto:${c.email}`}>{c.email}</a> with your order number, name and the reason for the return.</li>
        <li>Send clear photos of the item and the packaging (required for damaged, defective or wrong items).</li>
        <li>We will review the request and reply within 2 working days with approval and the pickup or drop-off arrangements.</li>
        <li>Once the item is collected and inspected, we will process your replacement or refund.</li>
      </ol>
    ),
  },
  {
    id: "return-shipping",
    title: "Return delivery costs",
    body: (
      <>
        <p>If the item is damaged, defective or incorrect, <strong>we cover the full cost</strong> of collection and replacement.</p>
        <p>For change-of-mind returns of standard items, the customer pays the return transport cost, which will be deducted from the refund or paid before collection. The original delivery charge is not refundable for change-of-mind returns.</p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <>
        <p>After the returned item passes inspection, we will confirm the refund by phone, WhatsApp or email.</p>
        <ul>
          <li><strong>Card payments (via PayHere):</strong> refunded to the same credit or debit card used for the purchase. Refunds are initiated within 3 working days of approval and normally appear on your statement within {c.refundProcessingDays}, depending on your bank.</li>
          <li><strong>Cash on delivery or bank transfer:</strong> refunded by bank transfer to an account in the customer's name within 7 working days of approval.</li>
        </ul>
        <p>We do not charge any fee for processing refunds. We cannot refund to a different card or to a third party.</p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Order cancellations",
    body: (
      <>
        <p>You can cancel a standard order free of charge any time before it is dispatched. Paid orders cancelled before dispatch receive a full refund.</p>
        <p>
          Custom-made orders can be cancelled free of charge before production starts. After production starts, an advance covering materials
          and work already done may be retained; we will tell you the exact amount before you confirm a custom order.
        </p>
      </>
    ),
  },
  {
    id: "warranty",
    title: "Warranty and defects",
    body: (
      <p>
        If a manufacturing defect appears after the return window, contact us. We will inspect the product and, where the fault is due to
        materials or workmanship, repair or replace it. This policy does not affect your statutory rights under the Consumer Affairs Authority
        Act No. 9 of 2003 of Sri Lanka. See also our <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>.
      </p>
    ),
  },
];

const ReturnPolicy: React.FC = () => (
  <PolicyPage
    title="Return & Refund Policy"
    path="/return-policy"
    seoTitle="Return & Refund Policy - TableLK"
    seoDescription="TableLK return, refund and cancellation policy for furniture orders in Sri Lanka, including card refunds via PayHere."
    intro={
      <p>
        We want you to be happy with every {c.brandName} table. This policy explains when you can return a product, how to request a
        return, and how refunds are paid for orders placed on {c.website.replace("https://", "")}.
      </p>
    }
    sections={sections}
  />
);

export default ReturnPolicy;
