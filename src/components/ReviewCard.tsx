import React, { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CustomerReview } from "@/hooks/useCustomerReviews";
import { cn } from "@/lib/utils";

const formatDate = (d: string) => {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const Stars: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => (
  <div className={cn("flex gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        aria-hidden="true"
        className={cn("h-4 w-4", n <= rating ? "fill-teak text-teak" : "fill-ink/10 text-ink/10")}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

interface ReviewCardProps {
  review: CustomerReview;
  productName?: string;
  className?: string;
}

const MAX_PHOTOS = 4;

/** One customer review, set like a card in the sample book: stars, the words, then who and where. */
const ReviewCard: React.FC<ReviewCardProps> = ({ review, productName, className }) => {
  const [open, setOpen] = useState<string | null>(null);
  const imgs = review.images ?? [];
  const shown = imgs.slice(0, MAX_PHOTOS);
  const extra = imgs.length - shown.length;
  const meta = [review.location, formatDate(review.review_date)].filter(Boolean).join(" · ");

  return (
    <article className={cn("flex flex-col rounded-2xl border border-ink/10 bg-board p-5 md:p-6", className)}>
      <Stars rating={review.rating} />

      <p className="mt-4 flex-1 whitespace-pre-line text-[1.0625rem] leading-relaxed text-ink">{review.review}</p>

      {shown.length > 0 && (
        <div
          className={cn(
            "mt-5 grid gap-2",
            shown.length === 1 ? "grid-cols-1" : shown.length === 2 ? "grid-cols-2" : shown.length === 3 ? "grid-cols-3" : "grid-cols-4",
          )}
        >
          {shown.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(src)}
              className={cn(
                "group/photo relative overflow-hidden rounded-xl bg-secondary transition-transform duration-300 ease-out-expo active:scale-[0.97]",
                shown.length === 1 ? "aspect-[4/3]" : "aspect-square",
              )}
              aria-label={`View photo ${i + 1} from ${review.customer_name}`}
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover/photo:scale-[1.06]"
                loading="lazy"
                decoding="async"
              />
              {extra > 0 && i === shown.length - 1 && (
                <span className="num absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-semibold text-white">
                  +{extra}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <footer className="mt-5 border-t border-ink/10 pt-4">
        <p className="font-display text-[1.0625rem] font-semibold leading-tight tracking-[-0.01em]">{review.customer_name}</p>
        {meta && <p className="num mt-1 text-sm text-steel">{meta}</p>}
        {productName && <p className="mt-1 text-sm text-steel">{productName}</p>}
      </footer>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl overflow-hidden rounded-2xl border-none bg-ink p-2 sm:rounded-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white [&>button]:text-ink [&>button]:opacity-100">
          <DialogTitle className="sr-only">Photo from {review.customer_name}</DialogTitle>
          {open && (
            <img
              src={open}
              alt={`Photo shared by ${review.customer_name}`}
              className="max-h-[85vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default ReviewCard;
