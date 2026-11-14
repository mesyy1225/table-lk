import React from "react";
import { Link } from "react-router-dom";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { policyConfig as c } from "@/lib/policyConfig";

const sections: PolicySection[] = [
  {
    id: "about-us",
    title: "About us",
    body: (
      <p>
        This website is operated by <strong>{c.legalName}</strong>
        {c.registrationNo && <> (Business Registration No. {c.registrationNo})</>}, a furniture manufacturer located at {c.address}.
        By using this website or placing an order, you agree to these Terms &amp; Conditions, our{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>, <Link to="/return-policy">Return &amp; Refund Policy</Link> and{" "}
        <Link to="/shipping-policy">Delivery Policy</Link>.
      </p>
    ),
  },
  {
    id: "products",
    title: "Products and pricing",
    body: (
      <ul>
        <li>All prices are in <strong>Sri Lankan Rupees (LKR)</strong> and include applicable taxes unless stated otherwise. Delivery charges, if any, are shown or confirmed before you pay.</li>
        <li>We make every effort to show products, colours and dimensions accurately. Because our tables are handcrafted from wood-based and natural materials, small variations in colour, grain and finish are normal and are not defects.</li>
        <li>Prices and availability may change without notice. If a pricing error occurs, we will contact you before processing the order and you may cancel for a full refund.</li>
      </ul>
    ),
  },
  {
    id: "orders",
    title: "Placing an order",
    body: (
      <>
        <p>
          An order is an offer to buy. Your order is accepted when we confirm it by phone, WhatsApp, SMS or email. We may decline or cancel
          an order, for example if a product is unavailable, the delivery address is outside our service area, or we suspect fraud. If a
          paid order is cancelled by us, you will receive a full refund.
        </p>
        <p>
          <strong>Custom orders:</strong> sizes, finishes and designs for custom-made furniture are confirmed in writing (including WhatsApp)
          before production. Please check these details carefully, as custom items are made to your specification.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment",
    body: (
      <>
        <p>We accept the following payment methods:</p>
        <ul>
          <li><strong>Credit and debit cards</strong> (Visa, Mastercard, American Express) and other methods offered by <strong>PayHere</strong>, our secure payment gateway.</li>
          <li><strong>Cash on delivery</strong>, where available.</li>
          <li><strong>Bank transfer</strong>, for bulk or custom orders on request.</li>
        </ul>
        <p>
          Card payments are processed by PayHere. We do not see or store your full card details. Your bank may apply its own charges for
          foreign-currency or online transactions. Custom orders may require an advance payment, which we will confirm before production.
        </p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    body: (
      <p>
        We deliver island-wide in Sri Lanka. Delivery times and charges are described in our <Link to="/shipping-policy">Delivery Policy</Link>.
        Please make sure someone is available to receive the order and check it on delivery. Risk in the goods passes to you on delivery.
      </p>
    ),
  },
  {
    id: "returns",
    title: "Returns, refunds and cancellations",
    body: (
      <p>
        Returns, refunds and cancellations are handled under our <Link to="/return-policy">Return &amp; Refund Policy</Link>. Card refunds are
        made to the original card used for payment.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <p>
        You are responsible for keeping your login details confidential and for activity under your account. Please give accurate name,
        phone and address details so we can deliver your order. We may suspend accounts that are used fraudulently or abusively.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <p>
        All content on this website, including the {c.brandName} name and logo, product photos, designs and text, belongs to {c.legalName}{" "}
        or its licensors and may not be copied or used commercially without our written permission.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the extent permitted by law, our liability for any order is limited to the amount you paid for that order. We are not liable for
        indirect or consequential losses, or for delays caused by events outside our reasonable control such as severe weather, strikes,
        or transport disruptions. Nothing in these terms limits your statutory rights under the Consumer Affairs Authority Act No. 9 of 2003.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka, including the Electronic Transactions Act
        No. 19 of 2006. Any dispute will be subject to the jurisdiction of the courts of Sri Lanka. We encourage you to contact us first so
        we can resolve any concern quickly.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. The version on this page at the time you place an order applies to that order.
      </p>
    ),
  },
];

const TermsAndConditions: React.FC = () => (
  <PolicyPage
    title="Terms & Conditions"
    path="/terms-and-conditions"
    seoTitle="Terms & Conditions - TableLK"
    seoDescription="Terms and conditions for buying office tables and furniture from TableLK, including pricing, payments via PayHere, delivery and returns."
    intro={
      <p>
        Please read these terms before buying from {c.website.replace("https://", "")}. They explain how orders, payments, delivery and
        returns work between you and {c.legalName}.
      </p>
    }
    sections={sections}
  />
);

export default TermsAndConditions;
