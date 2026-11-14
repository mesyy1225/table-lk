import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) => `LKR ${price.toLocaleString("en-LK")}`;

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const { state, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>Review your items before checkout</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 mt-6">
          <div className="flex-1 overflow-y-auto pr-1">
            {state.isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-muted-foreground">Loading your cart...</p>
              </div>
            ) : state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Looks like you haven't added any furniture to your cart yet.
                </p>
                <Button
                  onClick={() => {
                    onClose();
                    navigate("/shop");
                  }}
                >
                  Browse tables
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={`${item.product.id}-${item.color || ""}`} className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base text-gray-900 mb-1 line-clamp-2">{item.product.name}</h3>
                        {item.color && <p className="text-sm text-gray-500">Colour: {item.color}</p>}

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                          <div className="flex items-center border rounded-md bg-white">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.color)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="mx-2 text-sm w-6 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.color)}
                              disabled={item.quantity >= MAX_ITEM_QUANTITY}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id, item.color)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="mt-2 text-right">
                          <div className="font-semibold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
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

          {!state.isLoading && state.items.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(state.totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Delivery</span>
                  <span className="text-sm font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartPopup;
