import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/context/CartContext";
import { formatPrice, formatSize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Kept for callers that pass a list position; entrances are staggered by the parent. */
  index?: number;
  className?: string;
}

/**
 * A table in the catalogue, set like a sample label: photo on top, then name, size and price.
 * The whole card links to the product; the round button adds one to the cart.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const image = product.images?.[0] || "/placeholder.svg";
  const size = formatSize(product.dimensions);
  const category = product.categories?.[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.colors?.[0]);
  };

  return (
    <article className={cn("group relative flex h-full flex-col", className)}>
      <Link to={`/product/${product.id}`} className="flex h-full flex-col rounded-xl" aria-label={`${product.name}, ${formatPrice(product.price)}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.06]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.svg";
            }}
          />
          {!product.inStock && (
            <span className="label absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-white">Out of stock</span>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[1.0625rem] font-bold leading-tight tracking-[-0.02em] md:text-lg">{product.name}</h3>
          </div>
          <p className="mt-1 text-sm text-steel first-letter:uppercase">{[category, size].filter(Boolean).join(" · ")}</p>
          <p className="num mt-auto pt-3 text-[1.0625rem] font-semibold">{formatPrice(product.price)}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Add ${product.name} to cart`}
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-chip transition-[transform,background-color,color] duration-300 ease-out-expo hover:scale-105 hover:bg-teak active:scale-95 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100 md:transition-all"
      >
        <Plus className="h-5 w-5" strokeWidth={2} />
      </button>
    </article>
  );
};

export default ProductCard;
