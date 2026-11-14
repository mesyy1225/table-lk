import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerReview, useAllReviews } from "@/hooks/useCustomerReviews";
import { useProducts } from "@/hooks/useProducts";
import { deleteUploadedImage, uploadImage } from "@/lib/uploadImage";

const MAX_IMAGES = 4;
const NO_PRODUCT = "none";
const db = () => (supabase as any).from("customer_reviews");
const today = () => new Date().toISOString().slice(0, 10);
const isUuid = (v: unknown) => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

type Draft = {
  id?: string;
  customer_name: string;
  location: string;
  rating: number;
  review: string;
  images: string[];
  product_id: string;
  review_date: string;
  published: boolean;
  featured: boolean;
};

const emptyDraft = (): Draft => ({
  customer_name: "",
  location: "",
  rating: 5,
  review: "",
  images: [],
  product_id: NO_PRODUCT,
  review_date: today(),
  published: true,
  featured: true,
});

const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1" role="radiogroup" aria-label="Rating">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        role="radio"
        aria-checked={value === n}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        onClick={() => onChange(n)}
        className="p-0.5"
      >
        <Star className={`h-6 w-6 ${n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

const ReviewsManager: React.FC = () => {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading, error } = useAllReviews();
  const { data: products = [] } = useProducts();
  const dbProducts = products.filter((p) => isUuid(p.id));
  const productName = (id: string | null) => products.find((p) => String(p.id) === id)?.name;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Images uploaded in this dialog session that aren't saved yet (cleaned up on cancel).
  const [pendingUploads, setPendingUploads] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer_reviews"] });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const openNew = () => {
    setPendingUploads([]);
    setDraft(emptyDraft());
  };
  const openEdit = (r: CustomerReview) => {
    setPendingUploads([]);
    setDraft({
      id: r.id,
      customer_name: r.customer_name,
      location: r.location ?? "",
      rating: r.rating,
      review: r.review,
      images: r.images ?? [],
      product_id: r.product_id ?? NO_PRODUCT,
      review_date: r.review_date,
      published: r.published,
      featured: r.featured,
    });
  };
  const closeDialog = () => {
    pendingUploads.forEach((u) => deleteUploadedImage(u).catch(() => undefined));
    setPendingUploads([]);
    setDraft(null);
  };

  const handleImages = async (files: FileList | null) => {
    if (!files?.length || !draft) return;
    const room = MAX_IMAGES - draft.images.length;
    if (room <= 0) return toast.error(`Up to ${MAX_IMAGES} photos per review`);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, room)) urls.push(await uploadImage(f, "reviews", 1600));
      setPendingUploads((p) => [...p, ...urls]);
      setDraft((d) => (d ? { ...d, images: [...d.images, ...urls] } : d));
      if (files.length > room) toast.message(`Only the first ${room} photo(s) were added (max ${MAX_IMAGES}).`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    set("images", draft!.images.filter((u) => u !== url));
    if (pendingUploads.includes(url)) {
      deleteUploadedImage(url).catch(() => undefined);
      setPendingUploads((p) => p.filter((u) => u !== url));
    }
  };

  const save = async () => {
    if (!draft) return;
    const name = draft.customer_name.trim();
    const text = draft.review.trim();
    if (!name) return toast.error("Customer name is required");
    if (text.length < 5) return toast.error("Please enter the review text");
    setSaving(true);
    const row = {
      customer_name: name,
      location: draft.location.trim() || null,
      rating: draft.rating,
      review: text,
      images: draft.images,
      product_id: draft.product_id === NO_PRODUCT ? null : draft.product_id,
      review_date: draft.review_date || today(),
      published: draft.published,
      featured: draft.featured,
    };
    const { error: e } = draft.id ? await db().update(row).eq("id", draft.id) : await db().insert(row);
    setSaving(false);
    if (e) return toast.error(e.message);
    // Images removed from an existing review: delete the files now that the row no longer uses them.
    if (draft.id) {
      const before = reviews.find((r) => r.id === draft.id)?.images ?? [];
      before.filter((u) => !draft.images.includes(u)).forEach((u) => deleteUploadedImage(u).catch(() => undefined));
    }
    setPendingUploads([]);
    setDraft(null);
    toast.success(draft.id ? "Review updated" : "Review added");
    refresh();
  };

  const toggle = async (r: CustomerReview, patch: Partial<CustomerReview>) => {
    const { error: e } = await db().update(patch).eq("id", r.id);
    if (e) return toast.error(e.message);
    refresh();
  };

  const remove = async (r: CustomerReview) => {
    if (!window.confirm(`Delete the review from ${r.customer_name}? This cannot be undone.`)) return;
    const { error: e } = await db().delete().eq("id", r.id);
    if (e) return toast.error(e.message);
    r.images.forEach((u) => deleteUploadedImage(u).catch(() => undefined));
    toast.success("Review deleted");
    refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between space-y-0">
        <div>
          <CardTitle>Customer reviews</CardTitle>
          <CardDescription className="mt-1.5">
            Add real reviews from customers (for example from Facebook or WhatsApp) with photos of their table.
            "On home page" reviews appear on the landing page; reviews linked to a product also show on that product's page.
          </CardDescription>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Add review
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">
            Couldn't load reviews: {(error as Error).message}. If the table is missing, run the latest migration in the Supabase SQL Editor.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. The home page shows a link to your Facebook reviews until you add some.</p>
        ) : (
          <ul className="divide-y">
            {reviews.map((r) => (
              <li key={r.id} className="py-4 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 shrink-0">
                  {r.images.length ? (
                    r.images.slice(0, 2).map((u) => (
                      <img key={u} src={u} alt="" className="h-16 w-16 rounded-md object-cover bg-muted" loading="lazy" />
                    ))
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                      {r.customer_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.customer_name}</span>
                    {r.location && <span className="text-sm text-muted-foreground">· {r.location}</span>}
                    <span className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      ))}
                    </span>
                    {!r.published && <Badge variant="secondary">Hidden</Badge>}
                    {r.published && r.featured && <Badge>On home page</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.review}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.review_date}
                    {r.product_id && productName(r.product_id) && <> · {productName(r.product_id)}</>}
                    {r.images.length > 0 && <> · {r.images.length} photo{r.images.length > 1 ? "s" : ""}</>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={r.published} onCheckedChange={(v) => toggle(r, { published: v })} /> Published
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={r.featured} onCheckedChange={(v) => toggle(r, { featured: v })} /> Home page
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" aria-label="Edit review" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Delete review" onClick={() => remove(r)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!draft} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit review" : "Add review"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rv-name">Customer name *</Label>
                  <Input id="rv-name" value={draft.customer_name} maxLength={80} onChange={(e) => set("customer_name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rv-loc">Location</Label>
                  <Input id="rv-loc" placeholder="e.g. Colombo" value={draft.location} maxLength={60} onChange={(e) => set("location", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <StarInput value={draft.rating} onChange={(v) => set("rating", v)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rv-text">Review *</Label>
                <Textarea id="rv-text" rows={4} maxLength={1500} value={draft.review} onChange={(e) => set("review", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Photos ({draft.images.length}/{MAX_IMAGES})</Label>
                <div className="flex flex-wrap gap-2">
                  {draft.images.map((u) => (
                    <div key={u} className="relative h-20 w-20">
                      <img src={u} alt="" className="h-20 w-20 rounded-md object-cover bg-muted" />
                      <button
                        type="button"
                        onClick={() => removeImage(u)}
                        aria-label="Remove photo"
                        className="absolute -right-2 -top-2 rounded-full bg-black/70 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {draft.images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="h-20 w-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center text-xs text-muted-foreground hover:bg-muted"
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 mb-1" />}
                      {uploading ? "" : "Add"}
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImages(e.target.files)}
                />
                <p className="text-xs text-muted-foreground">Photos of the delivered table or a screenshot of the original review. Only use photos the customer agreed to share.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Product (optional)</Label>
                  <Select value={draft.product_id} onValueChange={(v) => set("product_id", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_PRODUCT}>Not linked</SelectItem>
                      {dbProducts.map((p) => (
                        <SelectItem key={String(p.id)} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rv-date">Review date</Label>
                  <Input id="rv-date" type="date" value={draft.review_date} max={today()} onChange={(e) => set("review_date", e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={draft.published} onCheckedChange={(v) => set("published", v)} /> Published
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={draft.featured} onCheckedChange={(v) => set("featured", v)} /> Show on home page
                </label>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {draft?.id ? "Save changes" : "Add review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ReviewsManager;
