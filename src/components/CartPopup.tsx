import React from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/CartItem";
import { EASE_OUT } from "@/components/motion";
import { formatPrice } from "@/lib/format";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RowSkeleton: React.FC = () => (
  <div className="flex animate-pulse gap-4 border-b border-ink/10 py-5">
    <div className="h-20 w-20 shrink-0 rounded-xl bg-ink/10" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 w-3/4 rounded bg-ink/10" />
      <div className="h-3 w-1/3 rounded bg-ink/10" />
      <div className="h-9 w-28 rounded-full bg-ink/10" />
    </div>
  </div>
);

/** Cart drawer opened from the header: lines, a pinned subtotal and one way forward. */
const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const { state } = useCart();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const count = state.totalItems;
  const isEmpty = !state.isLoading && state.items.length === 0;
  const hasItems = !state.isLoading && state.items.length > 0;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          data-lenis-prevent
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[28rem] flex-col border-l border-ink/10 bg-ash shadow-hover ease-out-expo focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-500 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300"
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink/10 py-3 pl-5 pr-3 md:pl-7 md:pr-5">
            <div className="flex min-w-0 items-baseline gap-3">
              <Dialog.Title className="font-display text-2xl font-bold tracking-[-0.02em]">Your cart</Dialog.Title>
              {count > 0 && (
                <span className="num text-[0.9375rem] text-steel">
                  {count} {count === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <Dialog.Description className="sr-only">Review your items before checkout.</Dialog.Description>
            <Dialog.Close
              aria-label="Close cart"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-300 ease-out-expo hover:bg-ink/[0.07] active:scale-90"
            >
              <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-7">
            {state.isLoading ? (
              <div role="status" aria-label="Loading your cart">
                <RowSkeleton />
                <RowSkeleton />
              </div>
            ) : (
              <>
                <ul aria-label="Cart items">
                  <AnimatePresence initial={false}>
                    {state.items.map((item) => (
                      <CartItem
                        key={`${item.product.id}-${item.color || ""}`}
                        product={item.product}
                        quantity={item.quantity}
                        color={item.color}
                      />
                    ))}
                  </AnimatePresence>
                </ul>

                {isEmpty && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }}
                    className="flex flex-col items-center px-2 pb-10 pt-16 text-center"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teak-tint text-teak-deep">
                      <ShoppingBag className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-xl">Your cart is empty</h3>
                    <p className="mt-2 max-w-[30ch] text-steel">
                      Tables you add will wait here until you are ready to order.
                    </p>
                    <Button size="lg" className="mt-7" onClick={() => go("/shop")}>
                      Browse tables
                      <ArrowRight aria-hidden="true" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {hasItems && (
            <footer className="shrink-0 border-t border-ink/15 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 md:px-7">
              <dl className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="font-semibold">Subtotal</dt>
                  <dd className="num font-display text-2xl font-bold tracking-[-0.02em]">{formatPrice(state.totalPrice)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 text-sm text-steel">
                  <dt>Delivery</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>

              <Button className="mt-5 h-14 w-full text-base" size="lg" onClick={() => go("/checkout")}>
                Checkout
                <ArrowRight aria-hidden="true" />
              </Button>
              <div className="mt-1 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium text-ink"
                >
                  <span className="link-draw">Keep shopping</span>
                </button>
              </div>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CartPopup;
