
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star, Users, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">WebApp</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">Home</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>
          <Button>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Welcome to Our Amazing Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the power of modern web technology with our innovative solutions 
            designed to help you succeed in the digital world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Premium Quality</CardTitle>
                <CardDescription>
                  We deliver exceptional quality in everything we do, ensuring your success.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Expert Team</CardTitle>
                <CardDescription>
                  Our experienced professionals are dedicated to bringing your vision to life.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Built with security and reliability in mind, you can trust our platform.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Web Development</CardTitle>
                <CardDescription>
                  Custom web applications built with modern technologies and best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Design Services</CardTitle>
                <CardDescription>
                  Beautiful, user-friendly designs that engage and convert your audience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Consulting</CardTitle>
                <CardDescription>
                  Strategic guidance to help you make the best technology decisions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
                <CardDescription>
                  Ongoing support and maintenance to keep your systems running smoothly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">WebApp</h4>
              <p className="text-muted-foreground">
                Building the future of web applications, one project at a time.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="text-muted-foreground space-y-2">
                <p>Email: hello@webapp.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Address: 123 Web Street, Digital City</p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 WebApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
