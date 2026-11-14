import { breadcrumbLd, productLd, productSeo } from "@/lib/seo";
import SEOHead from "@/components/SEOHead";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Minus, Plus, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { policyConfig } from "@/lib/policyConfig";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useCustomerReviews";
import ReviewCard, { Stars } from "@/components/ReviewCard";
import PaymentBadges from "@/components/PaymentBadges";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { EASE_OUT, RevealGroup, RevealItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useCart, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import { TOP_FINISHES, type Finish } from "@/lib/finishes";
import { formatPrice, formatSize } from "@/lib/format";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Categories are spelled several ways in the data ("office", "Office"); match and show them as one. */
const keyOf = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const sentenceCase = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const finishFor = (colour: string): Finish | undefined => {
  const key = keyOf(colour);
  return TOP_FINISHES.find((f) => keyOf(f.name) === key || f.id === key);
};

/* ---- Description: the data holds one text blob with emoji bullets. Clean it up when rendering. ---- */

const EMOJI = /[\p{Extended_Pictographic}️‍⃣]/gu;
/** Emoji, symbols and dashes used as a bullet at the start of a line. */
const LEAD_MARK = /^[\p{Extended_Pictographic}️‍⃣•·←-⇿─-➿⬀-⯿*\-–—\s]+/u;
const cleanLine = (line: string) => line.replace(LEAD_MARK, "").replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();

type Block = { kind: "text"; text: string } | { kind: "list"; title?: string; items: string[] };

const tidyTitle = (text: string) => {
  const title = text.replace(/:\s*$/, "").trim();
  return title === title.toUpperCase() ? sentenceCase(title.toLowerCase()) : title;
};

const parseDescription = (raw: string): Block[] => {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { title?: string; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "text", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) {
      if (list.items.length === 0 && list.title) blocks.push({ kind: "text", text: list.title });
      else if (list.items.length === 1 && !list.title) blocks.push({ kind: "text", text: list.items[0] });
      else if (list.items.length) blocks.push({ kind: "list", title: list.title, items: list.items });
    }
    list = null;
  };

  raw.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      // A heading waits for its items across a blank line.
      if (list && list.items.length > 0) flushList();
      return;
    }
    const text = cleanLine(line);
    if (!text) return;
    const bullet = LEAD_MARK.test(line);
    const heading = !bullet && /:$/.test(text) && text.length <= 40;

    if (heading) {
      flushParagraph();
      flushList();
      list = { title: tidyTitle(text), items: [] };
    } else if (bullet || (list && list.title)) {
      flushParagraph();
      if (!list) list = { items: [] };
      list.items.push(text);
    } else {
      flushList();
      paragraph.push(text);
    }
  });
  flushParagraph();
  flushList();
  return blocks;
};

/** "Sturdy & Durable – Made from…" becomes a bold lead and the rest. */
const splitLead = (item: string): [string, string] | null => {
  const match = item.match(/^(.{2,48}?)\s+[–—-]\s+(.+)$/);
  return match ? [match[1], match[2]] : null;
};

/* ---- Gallery ---- */

const fallbackImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.src = "/placeholder.svg";
};

const Gallery: React.FC<{ images: string[]; name: string; index: number; onSelect: (index: number) => void }> = ({
  images,
  name,
  index,
  onSelect,
}) => {
  const reduce = useReducedMotion();
  const count = images.length;
  const step = (by: number) => onSelect((index + by + count) % count);

  return (
    <div>
      <motion.div
        className="relative aspect-square overflow-hidden rounded-2xl bg-secondary sm:aspect-[4/3]"
        style={{ touchAction: "pan-y" }}
        onPanEnd={(_e, info) => {
          if (count < 2) return;
          const { x, y } = info.offset;
          if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.5) step(x < 0 ? 1 : -1);
        }}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={`${index}-${images[index]}`}
            src={images[index]}
            alt={count > 1 ? `${name}, photo ${index + 1} of ${count}` : name}
            draggable={false}
            decoding="async"
            className="absolute inset-0 h-full w-full select-none object-cover"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.5, ease: EASE_OUT }}
            onError={fallbackImage}
          />
        </AnimatePresence>
        {count > 1 && (
          <span className="num pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white">
            {index + 1} / {count}
          </span>
        )}
      </motion.div>

      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:gap-3" aria-label="Photos">
          {images.map((image, i) => (
            <li key={`${i}-${image}`}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "block aspect-square w-full overflow-hidden rounded-xl bg-secondary outline-offset-4 transition-[opacity,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.96]",
                  i === index
                    ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-ash"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={fallbackImage} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ---- Colour options ---- */

const ColourOptions: React.FC<{ colours: string[]; value?: string; onChange: (value: string) => void }> = ({
  colours,
  value,
  onChange,
}) => {
  const finishes = colours.map(finishFor);
  const allFinishes = finishes.every(Boolean);

  // Every option is one of our board finishes: show them as sample chips.
  if (allFinishes) {
    return (
      <RadioGroupPrimitive.Root value={value} onValueChange={onChange} aria-label="Colour" className="grid grid-cols-4 gap-2">
        {colours.map((colour, i) => (
          <RadioGroupPrimitive.Item
            key={colour}
            value={colour}
            className="group/sw flex flex-col gap-1.5 rounded-xl text-left outline-offset-2 transition-transform duration-300 ease-out-expo active:scale-[0.97]"
          >
            <span className="block rounded-[0.95rem] border-2 border-transparent p-[3px] transition-colors duration-300 group-hover/sw:border-ink/25 group-data-[state=checked]/sw:border-ink">
              <span
                className={cn("chip block h-12 w-full border border-ink/15", finishes[i]!.mat)}
                style={{ "--hole": "0.2rem", "--hole-x": "0.65rem", "--hole-y": "0.65rem" } as React.CSSProperties}
              />
            </span>
            <span className="px-1 text-[0.8125rem] font-medium leading-tight text-steel transition-colors duration-300 group-data-[state=checked]/sw:text-ink">
              {colour}
            </span>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    );
  }

  return (
    <RadioGroupPrimitive.Root value={value} onValueChange={onChange} aria-label="Colour" className="flex flex-wrap gap-2">
      {colours.map((colour, i) => (
        <RadioGroupPrimitive.Item
          key={colour}
          value={colour}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/25 bg-board px-4 text-[0.9375rem] font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo hover:border-ink active:scale-[0.97] data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-white"
        >
          {finishes[i] && <span className={cn("h-4 w-4 rounded-full border border-ink/20", finishes[i]!.mat)} aria-hidden="true" />}
          {colour}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
};

/* ---- Page ---- */

const relatedTo = (product: Product, all: Product[]) => {
  const own = new Set(product.categories.map(keyOf));
  return all
    .filter((p) => String(p.id) !== String(product.id))
    .map((p, order) => ({ p, order, shared: p.categories.filter((c) => own.has(keyOf(c))).length }))
    .sort((a, b) => b.shared - a.shared || a.order - b.order)
    .slice(0, 4)
    .map((entry) => entry.p);
};

const ProductDetailView: React.FC<{ id?: string }> = ({ id }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const reduce = useReducedMotion();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [showBar, setShowBar] = useState(false);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  // Reviews are managed in Admin → Reviews and linked to database products.
  const { data: reviews = [] } = useProductReviews(product ? String(product.id) : undefined);

  // Phone bar: shown once the main buttons have scrolled away under the header,
  // hidden again when the end of the page (and the footer) comes into view.
  const productId = product ? String(product.id) : undefined;
  useEffect(() => {
    const buttons = buttonsRef.current;
    const end = endRef.current;
    if (!buttons || !end || typeof IntersectionObserver === "undefined") return;
    let past = false;
    let ended = false;
    const update = () => setShowBar(past && !ended);
    const buttonsObserver = new IntersectionObserver(([entry]) => {
      past = !entry.isIntersecting && entry.boundingClientRect.top < 120;
      update();
    });
    const endObserver = new IntersectionObserver(([entry]) => {
      ended = entry.isIntersecting || entry.boundingClientRect.top < 0;
      update();
    });
    buttonsObserver.observe(buttons);
    endObserver.observe(end);
    return () => {
      buttonsObserver.disconnect();
      endObserver.disconnect();
    };
  }, [productId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="shell pt-6 md:pt-10" role="status" aria-label="Loading table">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-7">
              <div className="aspect-square animate-pulse rounded-2xl bg-secondary sm:aspect-[4/3]" />
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary" />
                ))}
              </div>
            </div>
            <div className="space-y-4 lg:col-span-5">
              <div className="h-9 w-4/5 animate-pulse rounded-lg bg-secondary" />
              <div className="h-8 w-1/3 animate-pulse rounded-lg bg-secondary" />
              <div className="h-28 animate-pulse rounded-xl bg-secondary" />
              <div className="h-[3.25rem] animate-pulse rounded-full bg-secondary" />
              <div className="h-[3.25rem] animate-pulse rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <SEOHead title="Table not found | TableLK" noindex />
        <div className="shell flex min-h-[55vh] flex-col items-start justify-center py-16">
          <h1 className="display-lg max-w-[14ch]">We could not find that table</h1>
          <p className="mt-4 max-w-[48ch] text-steel md:text-lg">
            It may have been removed from the catalogue, or the link is wrong. Every table we make is in the shop.
          </p>
          <Button size="lg" className="mt-8" onClick={() => navigate("/shop")}>
            Back to the shop
          </Button>
        </div>
      </Layout>
    );
  }

  // Ensure that all product images exist, use a placeholder if not
  const validatedImages = (product.images.length ? product.images : ["/placeholder.svg"]).map((img) => (img ? img : "/placeholder.svg"));
  const imageIndex = Math.min(activeImageIndex, validatedImages.length - 1);

  const handleQuantityChange = (change: number) => {
    setQuantity((q) => Math.min(MAX_ITEM_QUANTITY, Math.max(1, q + change)));
  };

  const colors = product.colors?.filter(Boolean) ?? [];
  const color = selectedColor && colors.includes(selectedColor) ? selectedColor : colors[0];

  const handleAddToCart = () => {
    addToCart(product, quantity, color);
  };

  const handleBuyNow = () => {
    navigate("/checkout", { state: { buyNow: { productId: product.id, quantity, color } } });
  };

  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const { western, other } = policyConfig.deliveryFee;
  const minFee = Math.min(western, other);
  const deliveryFeeText = western === 0 && other === 0 ? "Free" : `from ${formatPrice(minFee)}`;

  const availableOptions = product.description.includes("Customizable Sizes")
    ? (product.description.split("Customizable Sizes")[1] || "").split("\n\n")[0].trim()
    : "";
  const optionLines = availableOptions.split(/\r?\n/).map(cleanLine).filter(Boolean);

  const size = formatSize(product.dimensions);
  // The colour list in the text repeats the colour picker, so it is left out when there is a picker.
  const blocks = parseDescription(product.description).filter(
    (b) => !(b.kind === "list" && colors.length > 0 && /^colou?rs?$/i.test(b.title ?? "")),
  );
  const categories = Array.from(new Set(product.categories.map(keyOf).filter(Boolean)));
  const related = relatedTo(product, allProducts);
  const reviewWord = reviews.length === 1 ? "review" : "reviews";

  return (
    <Layout>
      <SEOHead
        {...productSeo(product)}
        ogImage={validatedImages[0]}
        jsonLd={[
          productLd(product, reviews),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.name, path: `/product/${product.id}` },
          ]),
        ]}
      />
      <div className="shell pt-5 md:pt-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex min-h-11 items-center gap-1.5 text-sm text-steel md:mb-6">
          <Link to="/shop" className="link-draw font-medium text-ink">
            Shop
          </Link>
          {categories[0] && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <Link to={`/shop?category=${encodeURIComponent(categories[0])}`} className="link-draw font-medium text-ink">
                {sentenceCase(categories[0])}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
          <span className="truncate" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-y-9 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-14 xl:gap-x-16">
          <div className="min-w-0 lg:col-span-7">
            <Gallery images={validatedImages} name={product.name} index={imageIndex} onSelect={setActiveImageIndex} />
          </div>

          {/* Purchase panel: sticks under the header on desktop (top-header), in normal flow on phones. */}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2">
            <div className="lg:sticky lg:top-header">
              <h1 className="display-md">{product.name}</h1>

              {hasReviews && (
                <a href="#reviews" className="group mt-3 inline-flex min-h-11 items-center gap-2.5 text-sm text-steel">
                  <Stars rating={Math.round(averageRating)} />
                  <span className="num font-semibold text-ink">{averageRating.toFixed(1)}</span>
                  <span className="link-draw">
                    {reviews.length} {reviewWord}
                  </span>
                </a>
              )}

              <p className={cn("num font-display text-[2rem] font-bold leading-none tracking-[-0.02em]", hasReviews ? "mt-2" : "mt-4")}>
                {formatPrice(product.price)}
              </p>

              <dl className="mt-6 border-t border-ink/10 text-[0.9375rem]">
                {size && (
                  <div className="flex items-baseline justify-between gap-6 border-b border-ink/10 py-3">
                    <dt className="label shrink-0 text-steel">Size</dt>
                    <dd className="num text-right font-medium">
                      {size} <span className="font-normal text-steel">(L × W × H)</span>
                    </dd>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-baseline justify-between gap-6 border-b border-ink/10 py-3">
                    <dt className="label shrink-0 text-steel">Material</dt>
                    <dd className="text-right font-medium">{product.material}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-6 border-b border-ink/10 py-3">
                  <dt className="label shrink-0 text-steel">Availability</dt>
                  <dd className={cn("text-right font-medium", !product.inStock && "text-destructive")}>
                    {product.inStock ? "In stock" : "Out of stock"}
                  </dd>
                </div>
              </dl>

              {colors.length > 0 && (
                <div className="mt-5">
                  <h2 className="label mb-2.5 text-steel">
                    Colour <span className="ml-1.5 normal-case tracking-normal text-ink">{color}</span>
                  </h2>
                  <ColourOptions colours={colors} value={color} onChange={setSelectedColor} />
                </div>
              )}

              <div ref={buttonsRef} className="mt-6 space-y-3">
                <div className="flex gap-3">
                  <div
                    role="group"
                    aria-label="Quantity"
                    className="flex h-[3.25rem] shrink-0 items-center rounded-full border border-ink/25 bg-board px-1"
                  >
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink/[0.07] active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="num w-8 text-center text-base font-semibold" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink/[0.07] active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= MAX_ITEM_QUANTITY}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="h-[3.25rem] min-w-0 flex-1 px-4 text-base"
                  >
                    <ShoppingBag aria-hidden="true" />
                    Add to cart
                  </Button>
                </div>

                {quantity >= MAX_ITEM_QUANTITY && (
                  <p className="text-sm text-steel">
                    Need more than {MAX_ITEM_QUANTITY}?{" "}
                    <Link to="/contact" className="font-semibold text-ink underline underline-offset-4">
                      Contact us
                    </Link>
                  </p>
                )}

                <Button
                  size="lg"
                  variant="teak"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="group h-[3.25rem] w-full text-base"
                >
                  Buy now
                  <ArrowRight className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              </div>

              <PaymentBadges className="mt-5" />

              <div className="mt-5 space-y-2.5 border-t border-ink/10 pt-5 text-sm text-steel">
                <p className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
                  <span>
                    Delivery: <span className="font-semibold text-ink">{deliveryFeeText}</span> · {policyConfig.colomboDeliveryDays}{" "}
                    (Western Province), {policyConfig.outstationDeliveryDays} elsewhere
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
                  <span>
                    Island-wide delivery ·{" "}
                    <Link to="/return-policy" className="font-medium text-ink underline underline-offset-4">
                      {policyConfig.returnWindowDays}-day returns
                    </Link>{" "}
                    on standard items ·{" "}
                    <Link to="/shipping-policy" className="font-medium text-ink underline underline-offset-4">
                      Delivery info
                    </Link>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* The long description, as plain paragraphs and lists. */}
          <div className="min-w-0 lg:col-span-7">
            <h2 className="display-md">About this table</h2>

            <div className="mt-5 space-y-5">
              {blocks.map((block, i) =>
                block.kind === "text" ? (
                  <p key={i} className="max-w-[62ch] text-[1.0625rem] leading-relaxed text-steel">
                    {block.text}
                  </p>
                ) : (
                  <div key={i} className="pt-3">
                    {block.title && <h3 className="mb-1 text-lg">{block.title}</h3>}
                    <ul className="border-t border-ink/10">
                      {block.items.map((item, j) => {
                        const lead = splitLead(item);
                        return (
                          <li key={j} className="border-b border-ink/10 py-3.5 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-6">
                            {lead ? (
                              <>
                                <span className="block font-semibold">{lead[0]}</span>
                                <span className="mt-0.5 block text-steel sm:mt-0">{lead[1]}</span>
                              </>
                            ) : (
                              <span className="sm:col-span-2">{item}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ),
              )}
            </div>

            {optionLines.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg">Available options</h3>
                <div className="mt-2 max-w-[62ch] space-y-1 text-steel">
                  {optionLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div className="mt-8">
                <h3 className="label text-steel">More in</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {categories.map((key) => (
                    <li key={key}>
                      <Link
                        to={`/shop?category=${encodeURIComponent(key)}`}
                        className="inline-flex h-11 items-center rounded-full border border-ink/20 px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-out-expo hover:border-ink hover:bg-ink hover:text-white active:scale-[0.97]"
                      >
                        {sentenceCase(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <section id="reviews" className="scroll-mt-header mt-16 border-t border-ink/15 pt-12 md:mt-24 md:pt-16">
          <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
            <h2 className="display-md">Customer reviews</h2>
            {hasReviews && (
              <div className="flex items-center gap-3 text-steel">
                <Stars rating={Math.round(averageRating)} />
                <span className="num">
                  {averageRating.toFixed(1)} from {reviews.length} {reviewWord}
                </span>
              </div>
            )}
          </div>

          {hasReviews ? (
            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          ) : (
            <p className="max-w-[56ch] text-steel md:text-lg">
              No reviews for this table yet.{" "}
              <a
                href={policyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline underline-offset-4"
              >
                See what our customers say on Facebook
              </a>
            </p>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-16 border-t border-ink/15 pt-12 md:mt-24 md:pt-16">
            <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
              <h2 className="display-md">More tables</h2>
              <Link to="/shop" className="group inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold">
                <span className="link-draw">See all tables</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </Link>
            </div>
            <RevealGroup className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {related.map((p) => (
                <RevealItem key={p.id}>
                  <ProductCard product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}

        <div ref={endRef} aria-hidden="true" />
      </div>

      {/* Phone bar. It stops short of the right edge so the chat bubble in the corner stays free. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showBar && (
              <motion.div
                role="region"
                aria-label="Add this table to your cart"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 72 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 72 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="fixed bottom-[calc(0.875rem+env(safe-area-inset-bottom))] left-3 right-[4.75rem] z-30 flex h-14 items-center justify-between gap-3 rounded-full bg-ink pl-5 pr-1.5 text-white shadow-hover lg:hidden"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs leading-tight text-white/70">
                    {quantity > 1 ? `${quantity} × ${product.name}` : product.name}
                  </p>
                  <p className="num font-display text-[1.0625rem] font-bold leading-tight">{formatPrice(product.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-teak px-4 text-sm font-semibold text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-teak/85 active:scale-[0.96] disabled:opacity-50"
                >
                  {product.inStock ? "Add to cart" : "Out of stock"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </Layout>
  );
};

/** Each product gets a fresh view, so the photo, quantity and colour never carry over from the last table. */
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailView key={id} id={id} />;
};

export default ProductDetail;
