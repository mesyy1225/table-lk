import React, { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { policyConfig, whatsappLink } from "@/lib/policyConfig";

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

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

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

  const contactItems = [
    {
      icon: MapPin,
      title: "Address",
      body: (
        <>
          <p>{policyConfig.address}</p>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 text-sm">
            Open in Google Maps
          </a>
        </>
      ),
    },
    {
      icon: Phone,
      title: "Phone",
      body: <a href={policyConfig.phoneHref} className="hover:text-foreground">{policyConfig.phone}</a>,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      body: (
        <a href={whatsappLink("Hi TableLK, I have a question")} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          {policyConfig.whatsapp}
        </a>
      ),
    },
    {
      icon: Mail,
      title: "Email",
      body: <a href={`mailto:${policyConfig.email}`} className="hover:text-foreground break-all">{policyConfig.email}</a>,
    },
    {
      icon: Clock,
      title: "Business Hours",
      body: <p>{policyConfig.businessHours}</p>,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Contact TableLK - Office & Dining Tables, Sri Lanka"
        description={`Contact TableLK for orders, custom sizes and delivery questions. Call or WhatsApp ${policyConfig.phone}, or send us a message.`}
        canonical={`${policyConfig.website}/contact`}
      />
      <div className="pb-16">
        {/* Header */}
        <div className="bg-primary/10 py-10 md:py-12">
          <div className="container mx-auto px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-serif font-bold mb-4"
            >
              Contact Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Questions about sizes, colours, custom orders or delivery? We'd love to hear from you.
            </motion.p>
          </div>
        </div>

        {/* Contact Form & Info Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="min-w-0"
              >
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

                {sent ? (
                  <div className="rounded-lg border border-border bg-secondary/40 p-6 md:p-8" role="status">
                    <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Thank you, your message has been sent.</h3>
                    <p className="text-muted-foreground mb-6">
                      We usually reply within one working day. For anything urgent, call or WhatsApp us on{" "}
                      <a href={policyConfig.phoneHref} className="text-primary underline underline-offset-2">{policyConfig.phone}</a>.
                    </p>
                    <Button variant="outline" onClick={() => setSent(false)}>Send another message</Button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                        <Input id="name" autoComplete="name" value={form.name} onChange={update("name")} className={fieldClass("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                        {errors.name && <p id="name-error" className="text-sm text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <Input id="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={update("email")} className={fieldClass("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                        {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone <span className="text-muted-foreground font-normal">(optional)</span>
                      </label>
                      <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="07X XXX XXXX" value={form.phone} onChange={update("phone")} className={fieldClass("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
                      {errors.phone && <p id="phone-error" className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input id="subject" placeholder="How can we help you?" value={form.subject} onChange={update("subject")} className={fieldClass("subject")} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} />
                      {errors.subject && <p id="subject-error" className="text-sm text-destructive">{errors.subject}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <Textarea id="message" placeholder="Your message..." rows={6} value={form.message} onChange={update("message")} className={fieldClass("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
                      {errors.message && <p id="message-error" className="text-sm text-destructive">{errors.message}</p>}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button type="submit" size="lg" disabled={submitting}>
                        {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : "Send Message"}
                      </Button>
                      <Button type="button" size="lg" variant="outline" asChild>
                        <a href={whatsappLink("Hi TableLK, I have a question")} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                        </a>
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:pl-10 min-w-0"
              >
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactItems.map(({ icon: Icon, title, body }) => (
                    <div key={title} className="flex items-start space-x-4">
                      <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-lg">{title}</h3>
                        <div className="text-muted-foreground mt-1 space-y-1">{body}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 pt-10 border-t">
                  <h3 className="font-medium text-lg mb-4">Follow Us</h3>
                  <a
                    href={policyConfig.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary/10 px-4 py-3 rounded-lg hover:bg-primary/20 transition-colors text-primary font-medium"
                    aria-label="TableLK on Facebook"
                  >
                    <Facebook className="h-5 w-5" /> Facebook
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Contact;
