import React, { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, CheckCircle2, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";
import { EASE_OUT } from "@/components/motion";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = { name: "", email: "", phone: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (f: FormState): FormErrors => {
  const e: FormErrors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  else if (f.name.length > 100) e.name = "Name is too long.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (f.phone.trim() && !/^[+\d][\d\s-]{6,19}$/.test(f.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (f.subject.trim().length < 2) e.subject = "Please add a subject.";
  else if (f.subject.length > 150) e.subject = "Subject is too long.";
  if (f.message.trim().length < 10) e.message = "Please write a little more (at least 10 characters).";
  else if (f.message.length > 4000) e.message = "Message is too long (max 4000 characters).";
  return e;
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(policyConfig.address)}`;

// One contact detail: the whole row is the link, so the tap target is full width and well over 44px tall.
const rowLink =
  "group flex min-h-[4.5rem] items-center justify-between gap-4 py-4 transition-colors duration-300 hover:text-teak-deep";
const rowIcon = "h-5 w-5 shrink-0 text-steel transition-colors duration-300 group-hover:text-teak-deep";

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    const { error } = await (supabase as any).from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Sorry, your message couldn't be sent.", {
        description: "Please try again, or message us on WhatsApp instead.",
        action: {
          label: "WhatsApp",
          onClick: () => window.open(whatsappLink(`Hi TableLK, ${form.subject.trim() || "I have a question"}`), "_blank", "noopener"),
        },
      });
      return;
    }

    setForm(EMPTY);
    setSent(true);
  };

  const fieldClass = (key: keyof FormState) => (errors[key] ? "border-destructive focus-visible:ring-destructive" : "");

  const fieldError = (key: keyof FormState) =>
    errors[key] && (
      <p id={`${key}-error`} className="text-sm font-medium text-destructive">
        {errors[key]}
      </p>
    );

  return (
    <Layout>
      <SEOHead
        title="Contact TableLK - Office & Dining Tables, Sri Lanka"
        description={`Contact TableLK for orders, custom sizes and delivery questions. Call or WhatsApp ${policyConfig.phone}, or send us a message.`}
        canonical={`${policyConfig.website}/contact`}
      />

      <header className="shell pb-8 pt-10 md:pb-12 md:pt-16">
        <h1 className="display-lg">Contact us</h1>
        <p className="mt-4 max-w-[52ch] text-steel md:text-lg">
          Questions about sizes, colours, custom orders or delivery? Send us a message here, or call or WhatsApp the
          workshop.
        </p>
      </header>

      <div className="shell">
        <div className="grid grid-cols-1 gap-14 border-t border-ink/15 pt-8 md:pt-12 lg:grid-cols-12 lg:gap-12">
          {/* Contact form */}
          <section aria-labelledby="contact-form-title" className="min-w-0 lg:col-span-7">
            <h2 id="contact-form-title" className="display-md">
              Send us a message
            </h2>

            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="sent"
                  role="status"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  className="mt-6 rounded-2xl border border-ink/10 bg-board p-6 md:p-8"
                >
                  <CheckCircle2 className="mb-4 h-9 w-9 text-teak-deep" aria-hidden="true" />
                  <h3 className="text-xl md:text-2xl">Thank you, your message has been sent.</h3>
                  <p className="mb-6 mt-2 max-w-[52ch] text-steel">
                    We usually reply within one working day. For anything urgent, call or WhatsApp us on{" "}
                    <a
                      href={policyConfig.phoneHref}
                      className="num font-semibold text-ink underline decoration-teak-deep decoration-[1.5px] underline-offset-4"
                    >
                      {policyConfig.phone}
                    </a>
                    .
                  </p>
                  <Button variant="outline" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-6 space-y-5"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your name</Label>
                      <Input id="name" autoComplete="name" value={form.name} onChange={update("name")} className={fieldClass("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                      {fieldError("name")}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={update("email")} className={fieldClass("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                      {fieldError("email")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="font-normal text-steel">(optional)</span>
                    </Label>
                    <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="07X XXX XXXX" value={form.phone} onChange={update("phone")} className={fieldClass("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
                    {fieldError("phone")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" value={form.subject} onChange={update("subject")} className={fieldClass("subject")} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} />
                    {fieldError("subject")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={6} value={form.message} onChange={update("message")} className={fieldClass("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
                    {fieldError("message")}
                  </div>
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="sm:min-w-[11rem]">
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" /> Sending
                        </>
                      ) : (
                        "Send message"
                      )}
                    </Button>
                    <Button type="button" size="lg" variant="outline" asChild>
                      <a href={whatsappLink("Hi TableLK, I have a question")} target="_blank" rel="noopener noreferrer">
                        <MessageCircle /> Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </section>

          {/* Contact details */}
          <section aria-labelledby="contact-details-title" className="min-w-0 lg:col-span-5 xl:col-span-4 xl:col-start-9">
            <h2 id="contact-details-title" className="display-md">
              Reach the workshop
            </h2>
            <ul className="mt-6 border-t border-ink/15">
              <li className="border-b border-ink/15">
                <a href={policyConfig.phoneHref} className={rowLink}>
                  <span className="min-w-0">
                    <span className="label block text-steel">Phone</span>
                    <span className="num mt-1 block text-lg font-semibold">{policyConfig.phone}</span>
                  </span>
                  <Phone className={rowIcon} aria-hidden="true" />
                </a>
              </li>
              <li className="border-b border-ink/15">
                <a href={whatsappLink("Hi TableLK, I have a question")} target="_blank" rel="noopener noreferrer" className={rowLink}>
                  <span className="min-w-0">
                    <span className="label block text-steel">WhatsApp</span>
                    <span className="num mt-1 block text-lg font-semibold">{policyConfig.whatsapp}</span>
                  </span>
                  <MessageCircle className={rowIcon} aria-hidden="true" />
                </a>
              </li>
              <li className="border-b border-ink/15">
                <a href={`mailto:${policyConfig.email}`} className={rowLink}>
                  <span className="min-w-0">
                    <span className="label block text-steel">Email</span>
                    <span className="mt-1 block break-all text-lg font-semibold">{policyConfig.email}</span>
                  </span>
                  <Mail className={rowIcon} aria-hidden="true" />
                </a>
              </li>
              <li className="border-b border-ink/15">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={rowLink}>
                  <span className="min-w-0">
                    <span className="label block text-steel">Address</span>
                    <span className="mt-1 block text-lg font-semibold">{policyConfig.address}</span>
                    <span className="mt-1 block text-sm text-steel">Open in Google Maps</span>
                  </span>
                  <MapPin className={rowIcon} aria-hidden="true" />
                </a>
              </li>
              <li className="flex min-h-[4.5rem] items-center justify-between gap-4 border-b border-ink/15 py-4">
                <span className="min-w-0">
                  <span className="label block text-steel">Business hours</span>
                  <span className="num mt-1 block text-lg font-semibold">{policyConfig.businessHours}</span>
                </span>
                <Clock className="h-5 w-5 shrink-0 text-steel" aria-hidden="true" />
              </li>
              <li className="border-b border-ink/15">
                <a href={policyConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className={rowLink} aria-label="TableLK on Facebook">
                  <span className="min-w-0">
                    <span className="label block text-steel">Facebook</span>
                    <span className="mt-1 block text-lg font-semibold">Table LK on Facebook</span>
                  </span>
                  <Facebook className={rowIcon} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
