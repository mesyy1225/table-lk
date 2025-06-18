
import React from "react";
import { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

interface CartItemProps {
  product: Product;
  quantity: number;
}

const CartItem: React.FC<CartItemProps> = ({ product, quantity }) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  const handleQuantityIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className="flex flex-col sm:flex-row items-start sm:items-center py-6 border-b last:border-0"
    >
      <div className="flex-shrink-0 w-full sm:w-24 h-24 mb-4 sm:mb-0 sm:mr-6 relative rounded-md overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-primary/90 line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {product.material}
        </p>
        
        <div className="flex flex-wrap items-center">
          <div className="flex items-center mr-6 mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleQuantityDecrease}
              aria-label="Decrease quantity"
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="mx-2 w-6 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleQuantityIncrease}
              aria-label="Increase quantity"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeFromCart(product.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 sm:ml-4 text-right">
        <span className="font-semibold text-lg">${product.price}</span>
        <p className="text-sm text-muted-foreground">
          ${product.price} × {quantity}
        </p>
      </div>
    </motion.div>
  );
};

export default CartItem;
