import SEOHead from "@/components/SEOHead";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found - TableLK";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <Layout>
      <SEOHead title="Page not found | TableLK" noindex />
      <section className="shell py-16 md:py-28">
        <h1 className="display-lg max-w-[14ch]">We can't find that page.</h1>
        <p className="mt-5 max-w-[52ch] text-steel md:text-lg">
          There is nothing at <span className="break-all font-medium text-ink">{location.pathname}</span>. The link may
          be old, or the address may have a typing mistake.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/shop">
              Shop tables
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">Go to the home page</Link>
          </Button>
        </div>
        <p className="num mt-10 border-t border-ink/15 pt-5 text-sm text-steel">Error 404</p>
      </section>
    </Layout>
  );
};

export default NotFound;
