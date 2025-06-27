
import React, { useState } from "react";
import { X, ShoppingBag, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import CheckoutForm from "@/components/CheckoutForm";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateQuantity } = useCart();
  const { state: authState } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const formatPrice = (price: number) => {
    return `LKR ${price.toLocaleString('en-LK')}`;
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
    onClose();
  };

  // If not authenticated, don't render the cart
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />
            
            {/* Cart panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md sm:max-w-lg lg:max-w-xl bg-background shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between bg-white flex-shrink-0">
                <h2 className="font-medium text-xl flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Your Cart {authState.isAuthenticated && "(Synced)"}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Cart items - Scrollable content */}
              <div className="flex-1 overflow-y-auto bg-gray-50/30">
                {state.isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-muted-foreground">Loading your cart...</p>
                  </div>
                ) : state.items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Looks like you haven't added any furniture to your cart yet.
                    </p>
                    <Button onClick={onClose}>Continue Shopping</Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {state.items.map((item) => (
                      <div key={item.product.id} className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={item.product.images && item.product.images[0] ? item.product.images[0] : "/placeholder.svg"} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{item.product.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.product.material}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="mx-2 text-sm w-6 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFromCart(item.product.id)}
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            </div>
                            
                            {/* Price */}
                            <div className="mt-2 text-right">
                              <span className="font-semibold text-sm text-primary">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              <p className="text-xs text-gray-500">
                                {formatPrice(item.product.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer with total and checkout */}
              {!state.isLoading && state.items.length > 0 && (
                <div className="border-t p-4 bg-white flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(state.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <span className="text-sm font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(state.totalPrice)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={handleCheckout}>
                      Proceed to Checkout
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onClose}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Form */}
      <CheckoutForm 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
};

export default CartPopup;
