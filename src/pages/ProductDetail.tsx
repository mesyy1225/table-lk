import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "@/lib/data";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart, Star, Check, Info, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import BuyNowForm from "@/components/BuyNowForm";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);

  const productId = parseInt(id || "0");
  const product = getProductById(productId);

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK')}`;
  };

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
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} has been added to your cart.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Images */}
          <div className="product-images">
            <motion.div 
              className="main-image-container h-[500px] rounded-lg overflow-hidden mb-4"
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
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-amber-500 mr-3">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            
            <div className="text-2xl font-semibold mb-6">{formatPrice(product.price)}</div>
            
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

            {product.colors && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Available Colors</h3>
                <RadioGroup 
                  defaultValue={product.colors[0]} 
                  onValueChange={setSelectedColor}
                  className="flex flex-wrap gap-4"
                >
                  {product.colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <RadioGroupItem value={color} id={`color-${color}`} />
                      <Label htmlFor={`color-${color}`}>{color}</Label>
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
                  className="h-10 w-10 rounded-l-md border border-input flex items-center justify-center text-muted-foreground hover:bg-secondary"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="h-10 w-14 border-t border-b border-input flex items-center justify-center font-medium">
                  {quantity}
                </div>
                <button 
                  className="h-10 w-10 rounded-r-md border border-input flex items-center justify-center text-muted-foreground hover:bg-secondary"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 mb-4">
              <Button 
                size="lg" 
                onClick={() => setIsBuyNowOpen(true)}
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

            <div className="mt-8 bg-secondary/30 p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Available Options:</p>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {product.description.includes('Customizable Sizes') && 
                  product.description.split('Customizable Sizes')[1].split('\n\n')[0]}
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <span className="font-medium text-green-600 mr-2">💳</span>
              <span className="text-sm font-medium">Cash on Delivery (COD) Available!</span>
            </div>
          </div>
        </div>
        
        <div className="reviews-section mb-20">
          <h2 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h2>
          
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-muted-foreground">This product doesn't have any reviews yet.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{review.userName}</h3>
                      <div className="flex items-center text-amber-500 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Buy Now Form Modal */}
      <BuyNowForm 
        product={product}
        isOpen={isBuyNowOpen}
        onClose={() => setIsBuyNowOpen(false)}
      />
    </Layout>
  );
};

export default ProductDetail;
