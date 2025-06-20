import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";
const Contact: React.FC = () => {
  return <Layout>
      <div className="pt-24 pb-16">
        {/* Header */}
        <div className="bg-primary/10 py-12">
          <div className="container mx-auto px-6 text-center">
            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6
          }} className="text-4xl font-serif font-bold mb-4">
              Contact Us
            </motion.h1>
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.1
          }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you.
            </motion.p>
          </div>
        </div>

        {/* Contact Form & Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div initial={{
              opacity: 0,
              x: -30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Your Name
                      </label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea id="message" placeholder="Your message..." rows={6} required />
                  </div>
                  <Button type="submit" size="lg">
                    Send Message
                  </Button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div initial={{
              opacity: 0,
              x: 30
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="lg:pl-10">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Address</h3>
                      <p className="text-muted-foreground mt-1">TableLK Furniture, Maragahahena, Thalgahawila Road, Kudauduwa, Horana, Horana, Sri Lanka.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Phone</h3>
                      <p className="text-muted-foreground mt-1">‎+94 76 902 7347</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Email</h3>
                      <p className="text-muted-foreground mt-1">bossfurniturelk@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Business Hours</h3>
                      <div className="text-muted-foreground mt-1 space-y-1">
                        <p>Open Everyday: 8am - 6pm</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t">
                  <h3 className="font-medium text-lg mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/people/TableLK/100088083387315/" target="_blank" rel="noopener noreferrer" className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.7 1H5.3C3 1 1 3 1 5.3v13.4C1 21 3 23 5.3 23h13.4c2.3 0 4.3-2 4.3-4.3V5.3C23 3 21 1 18.7 1zm-3.6 8.8h-1.4v-1c0-.8.3-1 1-1h.5V6h-1.6c-1.9 0-2.6 1.4-2.6 2.9v1H9v1.8h2v5.3h2.1v-5.3h1.4l.6-1.9z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.2 6c-.8.3-1.6.6-2.5.7.9-.5 1.6-1.4 1.9-2.4-.8.5-1.7.8-2.7 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .6.1.9-3.5-.2-6.6-1.9-8.7-4.4-.4.6-.6 1.4-.6 2.1 0 1.5.8 2.8 1.9 3.5-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.7 2.1 2.9 3.9 2.9-1.4 1.1-3.2 1.8-5.1 1.8-.3 0-.7 0-1-.1 1.8 1.2 4 1.9 6.3 1.9 7.6 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-primary/10 p-3 rounded-lg hover:bg-primary/20 transition-colors">
                      <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 7.5c0 .4-.4.8-.8.8s-.8-.4-.8-.8-.4-.8-.8-.8-.8.4-.8.8-.4.8-.8.8-.8-.4-.8-.8c0-1.4 1.8-2.5 3.2-2.5 1.4 0 1.8 1.1 1.8 2.5zM12 18c-2.5 0-4.6-1.5-5.5-3.5 2.3 1.5 7.5 1.2 8.5-1 0 0 .5 3.5-3 4.5zm1-7.5c0 .4-.4.8-.8.8s-.8-.4-.8-.8.4-.8.8-.8.8.4.8.8zm-2 0c0 .4-.4.8-.8.8s-.8-.4-.8-.8.4-.8.8-.8.8.4.8.8zm-.5-4.2c-1.4-.3-2.8.9-3.1 2.3-.1.7.3.9.8.7 0 0 .3-.2.7-.5 0 0 1-1.3 2-1.2 1 .1 1.1.3 1.9.2.3 0 .7-.4.2-1-.3-.5-1.2-.7-2.5-.5z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>;
};
export default Contact;