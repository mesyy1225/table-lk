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
  <div className={cn("flex", className)} role="img" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
    ))}
  </div>
);

interface ReviewCardProps {
  review: CustomerReview;
  productName?: string;
  className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, productName, className }) => {
  const [open, setOpen] = useState<string | null>(null);
  const imgs = review.images ?? [];

  return (
    <article className={cn("flex flex-col rounded-lg bg-white shadow-soft overflow-hidden", className)}>
      {imgs.length > 0 && (
        <div className={cn("grid gap-0.5 bg-muted", imgs.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {imgs.slice(0, 4).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(src)}
              className={cn(
                "relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                imgs.length === 1 ? "aspect-[4/3]" : "aspect-square",
                imgs.length === 3 && i === 0 && "row-span-2 aspect-auto"
              )}
              aria-label={`View photo ${i + 1} from ${review.customer_name}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <Stars rating={review.rating} className="mb-3" />
        <p className="text-muted-foreground whitespace-pre-line flex-1">"{review.review}"</p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {review.customer_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{review.customer_name}</p>
            <p className="text-xs text-muted-foreground">
              {[review.location, formatDate(review.review_date)].filter(Boolean).join(" · ")}
              {productName && <> · {productName}</>}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black border-none">
          <DialogTitle className="sr-only">Photo from {review.customer_name}</DialogTitle>
          {open && <img src={open} alt={`Photo shared by ${review.customer_name}`} className="max-h-[85vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default ReviewCard;
