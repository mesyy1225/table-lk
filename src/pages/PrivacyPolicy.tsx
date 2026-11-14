import React from "react";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { policyConfig as c } from "@/lib/policyConfig";

const sections: PolicySection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p><strong>Information you give us</strong> when you create an account, place an order, or contact us:</p>
        <ul>
          <li>Name, phone number, email address and delivery address.</li>
          <li>Order details, such as products, quantities, colours and any remarks you add.</li>
          <li>Messages you send us through the website, WhatsApp, chat, phone or email.</li>
        </ul>
        <p><strong>Information collected automatically</strong> when you use the website, such as device and browser type, pages visited and approximate location, through cookies and similar technologies.</p>
      </>
    ),
  },
  {
    id: "payment-information",
    title: "Payment information",
    body: (
      <p>
        Card payments are processed securely by <strong>PayHere</strong> (PayHere (Pvt) Ltd), a PCI DSS compliant payment gateway licensed
        in Sri Lanka. Your card number, expiry date and CVV are entered on PayHere's secure page and are <strong>never sent to or stored
        on our servers</strong>. We only receive confirmation of the payment, the amount, and a transaction reference.
      </p>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To process, deliver and support your orders, including returns and refunds.</li>
        <li>To contact you about your order by phone, SMS, WhatsApp or email.</li>
        <li>To manage your account and order history.</li>
        <li>To prevent fraud and keep the website secure.</li>
        <li>To improve our products, website and service.</li>
        <li>To send offers or news, only if you have agreed. You can opt out at any time.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We <strong>do not sell or rent</strong> your personal information. We share it only where needed to run our business:</p>
        <ul>
          <li><strong>PayHere</strong>, to process card payments.</li>
          <li><strong>Delivery partners</strong>, who receive your name, phone number and address to deliver your order.</li>
          <li><strong>Service providers</strong> that host our website, database and communication tools (for example Supabase, Vercel, WhatsApp and our website chat provider), under their own security and privacy terms.</li>
          <li><strong>Authorities</strong>, when required by Sri Lankan law or to protect our legal rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        We use cookies and local storage to keep you signed in, remember your cart, and understand how the website is used. You can block
        or delete cookies in your browser settings, but parts of the website such as sign-in and the cart may then stop working.
      </p>
    ),
  },
  {
    id: "security-retention",
    title: "Security and retention",
    body: (
      <p>
        We protect your information with encrypted (HTTPS) connections, access controls and secure hosting. We keep order records for as
        long as needed for delivery, warranty, accounting and legal requirements, and delete or anonymise personal information when it is
        no longer required.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          In line with the Personal Data Protection Act No. 9 of 2022 of Sri Lanka, you can ask us to access, correct or delete your
          personal information, or withdraw consent for marketing messages. Email <a href={`mailto:${c.email}`}>{c.email}</a> and we will
          respond within 21 days.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>Our website is intended for customers aged 18 and over. We do not knowingly collect personal information from children.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: <p>We may update this policy from time to time. The latest version will always be on this page with the date it was last updated.</p>,
  },
];

const PrivacyPolicy: React.FC = () => (
  <PolicyPage
    title="Privacy Policy"
    path="/privacy-policy"
    seoTitle="Privacy Policy - TableLK"
    seoDescription="How TableLK collects, uses and protects your personal information and card payments made through PayHere."
    intro={
      <p>
        {c.legalName} ("we", "us") respects your privacy. This policy explains what personal information we collect when you visit{" "}
        {c.website.replace("https://", "")} or buy from us, how we use it, and the choices you have.
      </p>
    }
    sections={sections}
  />
);

export default PrivacyPolicy;
