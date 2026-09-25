import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock: number;
  featured: boolean;
  short_description: string | null;
  images: string[];
  categories: string[];
  colors: string[];
  material: string | null;
  dimensions: { width: number; length: number; height: number };
  sort_order: number;
}

const empty: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  image_url: "",
  category: "",
  stock: 0,
  featured: false,
  short_description: "",
  images: [],
  categories: [],
  colors: [],
  material: "",
  dimensions: { width: 0, length: 0, height: 0 },
  sort_order: 0,
};

const ProductsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(empty);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      image_url: p.image_url ?? "",
      category: p.category ?? "",
      stock: p.stock,
      featured: p.featured,
      short_description: p.short_description ?? "",
      images: p.images ?? (p.image_url ? [p.image_url] : []),
      categories: p.categories ?? [],
      colors: p.colors ?? [],
      material: p.material ?? "",
      dimensions: p.dimensions ?? { width: 0, length: 0, height: 0 },
      sort_order: p.sort_order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: f.image_url || data.publicUrl, images: [...f.images, data.publicUrl] }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { ...form, image_url: form.images[0] || form.image_url || null };
    if (editing) {
      const { error } = await (supabase as any).from("products").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await (supabase as any).from("products").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Product created");
    }
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["products"] });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await (supabase as any).from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> New product
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.image_url && (
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>Rs. {Number(p.price).toLocaleString()}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{p.featured ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No products yet. Click "New product".
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={5}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (Rs.)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Short description</Label>
              <Input value={form.short_description ?? ""} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div>
              <Label>Material</Label>
              <Input value={form.material ?? ""} onChange={(e) => setForm({ ...form, material: e.target.value })} />
            </div>
            <div>
              <Label>Categories (comma separated)</Label>
              <Input value={form.categories.join(", ")}
                onChange={(e) => setForm({ ...form, categories: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
            </div>
            <div>
              <Label>Colours (comma separated)</Label>
              <Input value={form.colors.join(", ")}
                onChange={(e) => setForm({ ...form, colors: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(["width", "length", "height"] as const).map((d) => (
                <div key={d}>
                  <Label className="capitalize">{d} (in)</Label>
                  <Input type="number" value={form.dimensions[d]} onChange={(e) => setForm({ ...form, dimensions: { ...form.dimensions, [d]: Number(e.target.value) } })} />
                </div>
              ))}
              <div>
                <Label>Display order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Photos (one link per line — first is the main photo)</Label>
              <Textarea rows={4} value={form.images.join("\n")} onChange={(e) => setForm({ ...form, images: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((src) => <img key={src} src={src} alt="" className="w-16 h-16 object-cover rounded" />)}
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
                {uploading && <Upload className="h-4 w-4 animate-pulse" />}
              </div>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
              <Input
                className="mt-2"
                placeholder="or paste image URL"
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
              <Label>Featured on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductsManager;
