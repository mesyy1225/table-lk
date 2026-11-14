import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Product } from "@/lib/data";
import { useCart, MAX_ITEM_QUANTITY } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { EASE_OUT } from "@/components/motion";

interface CartItemProps {
  product: Product;
  quantity: number;
  color?: string;
}

const stepButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink/[0.07] active:scale-90 disabled:pointer-events-none disabled:opacity-35";

/**
 * One line of the cart drawer. Rendered inside <AnimatePresence>, so a removed line
 * closes its own height instead of making the list jump.
 */
const CartItem = React.forwardRef<HTMLLIElement, CartItemProps>(({ product, quantity, color }, ref) => {
  const { removeFromCart, updateQuantity } = useCart();
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : 0.28;

  return (
    <motion.li
      ref={ref}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration, ease: EASE_OUT }}
      className="overflow-hidden border-b border-ink/10"
    >
      <div className="flex gap-4 py-5">
        <Link
          to={`/product/${product.id}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-white"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={product.images?.[0] || "/placeholder.svg"}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.svg";
            }}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-sans text-[0.9375rem] font-semibold leading-snug tracking-normal">
              <Link to={`/product/${product.id}`} className="line-clamp-2 rounded-sm hover:underline hover:underline-offset-4">
                {product.name}
              </Link>
            </h3>
            <p className="num shrink-0 text-[0.9375rem] font-semibold">{formatPrice(product.price * quantity)}</p>
          </div>
          <p className="mt-1 text-sm text-steel">
            {color ? `Colour: ${color}` : product.material}
            {quantity > 1 && <span className="num"> · {formatPrice(product.price)} each</span>}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-full border border-ink/20 bg-white" role="group" aria-label={`Quantity of ${product.name}`}>
              <button
                type="button"
                className={stepButton}
                onClick={() => updateQuantity(product.id, quantity - 1, color)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="num w-7 text-center text-[0.9375rem] font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className={stepButton}
                onClick={() => updateQuantity(product.id, quantity + 1, color)}
                disabled={quantity >= MAX_ITEM_QUANTITY}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart(product.id, color)}
              aria-label={`Remove ${product.name} from cart`}
              className="-mr-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-steel transition-[color,background-color,transform] duration-300 ease-out-expo hover:bg-destructive/10 hover:text-destructive active:scale-95"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
});
CartItem.displayName = "CartItem";

export default CartItem;
