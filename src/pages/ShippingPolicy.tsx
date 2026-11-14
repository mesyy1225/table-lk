import React from "react";
import { Link } from "react-router-dom";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { policyConfig as c } from "@/lib/policyConfig";

const sections: PolicySection[] = [
  {
    id: "coverage",
    title: "Where we deliver",
    body: <p>We deliver to all districts of Sri Lanka. We do not currently ship outside Sri Lanka.</p>,
  },
  {
    id: "timeframes",
    title: "Delivery times",
    body: (
      <>
        <ul>
          <li><strong>Colombo and Western Province:</strong> {c.colomboDeliveryDays} after order confirmation.</li>
          <li><strong>Other provinces:</strong> {c.outstationDeliveryDays} after order confirmation.</li>
          <li><strong>Custom-made orders:</strong> {c.customOrderDays} for production, plus delivery time. We will confirm the date with you.</li>
        </ul>
        <p>These are estimates. We will call or message you before delivery to agree a convenient time.</p>
      </>
    ),
  },
  {
    id: "charges",
    title: "Delivery charges",
    body: (
      <p>
        Delivery charges depend on the size of the order and the delivery location. The charge is shown or confirmed with you before you pay,
        and there are no hidden fees after payment. Bulk and office orders may qualify for free or discounted delivery.
      </p>
    ),
  },
  {
    id: "receiving",
    title: "Receiving your order",
    body: (
      <ul>
        <li>Please make sure someone is available at the address to receive and sign for the order.</li>
        <li>Check the items on delivery. Report any damage or missing items within {c.damageReportHours} hours, with photos, as described in our <Link to="/return-policy">Return &amp; Refund Policy</Link>.</li>
        <li>If a delivery fails because nobody is available or the address is incorrect, a redelivery charge may apply.</li>
      </ul>
    ),
  },
  {
    id: "collection",
    title: "Collect from our workshop",
    body: (
      <p>
        You can collect your order free of charge from our workshop at {c.address} during business hours ({c.businessHours}). Please
        contact us first so we can have it ready.
      </p>
    ),
  },
];

const ShippingPolicy: React.FC = () => (
  <PolicyPage
    title="Delivery Policy"
    path="/shipping-policy"
    seoTitle="Delivery Policy - TableLK"
    seoDescription="Island-wide delivery times, charges and collection options for TableLK furniture orders in Sri Lanka."
    intro={<p>How and when we deliver your {c.brandName} order anywhere in Sri Lanka.</p>}
    sections={sections}
  />
);

export default ShippingPolicy;
