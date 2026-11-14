import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { policyConfig } from "@/lib/policyConfig";
import { useProduct } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useCustomerReviews";
import ReviewCard from "@/components/ReviewCard";
import PaymentBadges from "@/components/PaymentBadges";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart, Star, Check, Info, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const { product, isLoading } = useProduct(id);
  // Reviews are managed in Admin → Reviews and linked to database products.
  const { data: reviews = [] } = useProductReviews(product ? String(product.id) : undefined);

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK')}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">Loading...</div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold mb-6">Product Not Found</h1>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </Layout>
    );
  }

  // Ensure that all product images exist, use a placeholder if not
  const validatedImages = product.images.map(img =>
    img ? img : "/placeholder.svg"
  );

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

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Images */}
          <div className="product-images">
            <motion.div
              className="main-image-container aspect-[4/3] w-full max-h-[500px] rounded-lg overflow-hidden mb-4 bg-secondary/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={validatedImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg";
                }}
              />
            </motion.div>

            <div className="image-thumbnails grid grid-cols-5 gap-2">
              {validatedImages.map((image, index) => (
                <div
                  key={index}
                  className={`h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                    index === activeImageIndex ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{product.name}</h1>

            {hasReviews && (
              <a href="#reviews" className="flex items-center mb-4 w-fit">
                <div className="flex items-center text-amber-500 mr-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground underline-offset-2 hover:underline">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </a>
            )}

            <div className="text-2xl font-semibold mt-4 mb-2">{formatPrice(product.price)}</div>
            <p className="flex items-start gap-2 text-sm text-muted-foreground mb-6">
              <Truck className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Delivery: <span className="font-medium text-foreground">{deliveryFeeText}</span> · {policyConfig.colomboDeliveryDays} (Western Province), {policyConfig.outstationDeliveryDays} elsewhere
              </span>
            </p>

            <p className="text-muted-foreground mb-6 whitespace-pre-line">
              {product.description.split('\n\n')[0]}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-secondary/50 rounded-md">
                <h3 className="font-medium mb-2">Dimensions</h3>
                <p className="text-sm text-muted-foreground">
                  W: {product.dimensions.width}" <br />
                  L: {product.dimensions.length}" <br />
                  H: {product.dimensions.height}"
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-md">
                <h3 className="font-medium mb-2">Material</h3>
                <p className="text-sm text-muted-foreground">{product.material}</p>
              </div>
            </div>

            {colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Colour: <span className="font-normal text-muted-foreground">{color}</span></h3>
                <RadioGroup
                  value={color}
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-4"
                >
                  {colors.map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <RadioGroupItem value={c} id={`color-${c}`} />
                      <Label htmlFor={`color-${c}`}>{c}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center mb-8">
              {product.inStock ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">In Stock</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <Info className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-2">Quantity</h3>
              <div className="flex items-center">
                <button
                  className="h-10 w-10 rounded-l-md border border-input flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="h-10 w-14 border-t border-b border-input flex items-center justify-center font-medium">
                  {quantity}
                </div>
                {quantity >= MAX_ITEM_QUANTITY && (
                  <span className="ml-3 text-xs text-muted-foreground">
                    Need more? <Link to="/contact" className="underline underline-offset-2">Contact us</Link>
                  </span>
                )}
                <button
                  className="h-10 w-10 rounded-r-md border border-input flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= MAX_ITEM_QUANTITY}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-4">
              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full text-base bg-green-600 hover:bg-green-700"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Buy Now
              </Button>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                variant="outline"
                className="w-full text-base"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            <PaymentBadges className="mb-2" />

            <div className="mt-8">
              <h3 className="text-sm font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-xs rounded-full text-muted-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {availableOptions && (
              <div className="mt-8 bg-secondary/30 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Available Options:</p>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{availableOptions}</div>
              </div>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Island-wide delivery ·{" "}
              <Link to="/return-policy" className="underline underline-offset-2 hover:text-foreground">{policyConfig.returnWindowDays}-day returns</Link>{" "}
              on standard items ·{" "}
              <Link to="/shipping-policy" className="underline underline-offset-2 hover:text-foreground">Delivery info</Link>
            </p>
          </div>
        </div>

        <div id="reviews" className="reviews-section mb-20 scroll-mt-28">
          <h2 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h2>

          {hasReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} className="border" />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No reviews for this table yet.{" "}
              <a
                href={policyConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                See what our customers say on Facebook
              </a>
            </p>
          )}
        </div>
      </div>

    </Layout>
  );
};

export default ProductDetail;
