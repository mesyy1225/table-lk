import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HeroSlide, useAllHeroSlides } from "@/hooks/useHeroSlides";
import { deleteUploadedImage, uploadImage } from "@/lib/uploadImage";

const FOCUS_OPTIONS = [
  { value: "center", label: "Centre" },
  { value: "50% 30%", label: "Top" },
  { value: "50% 70%", label: "Bottom" },
  { value: "30% 50%", label: "Left" },
  { value: "70% 50%", label: "Right" },
  { value: "70% 60%", label: "Right, lower" },
];

const db = () => (supabase as any).from("hero_slides");

const HeroSlidesManager: React.FC = () => {
  const qc = useQueryClient();
  const { data: slides = [], isLoading, error } = useAllHeroSlides();
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["hero_slides"] });

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      let order = slides.length ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0;
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "hero");
        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const { error: e } = await db().insert({ image_url: url, alt, sort_order: order++, object_position: "center" });
        if (e) throw new Error(e.message);
      }
      toast.success(files.length > 1 ? `${files.length} slides added` : "Slide added");
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const update = async (id: string, patch: Partial<HeroSlide>, quiet = false) => {
    setBusyId(id);
    const { error: e } = await db().update(patch).eq("id", id);
    setBusyId(null);
    if (e) return toast.error(e.message);
    if (!quiet) toast.success("Saved");
    refresh();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const a = slides[index];
    const b = slides[index + dir];
    if (!a || !b) return;
    setBusyId(a.id);
    // Renumber the whole list so equal sort_order values can't get stuck.
    const reordered = [...slides];
    reordered[index] = b;
    reordered[index + dir] = a;
    const results = await Promise.all(reordered.map((s, i) => db().update({ sort_order: i }).eq("id", s.id)));
    setBusyId(null);
    const failed = results.find((r: any) => r.error);
    if (failed) toast.error(failed.error.message);
    refresh();
  };

  const remove = async (s: HeroSlide) => {
    if (!window.confirm("Delete this slide? This cannot be undone.")) return;
    setBusyId(s.id);
    const { error: e } = await db().delete().eq("id", s.id);
    setBusyId(null);
    if (e) return toast.error(e.message);
    deleteUploadedImage(s.image_url).catch(() => undefined);
    toast.success("Slide deleted");
    refresh();
  };

  const activeCount = slides.filter((s) => s.active).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between space-y-0">
        <div>
          <CardTitle>Home page carousel</CardTitle>
          <CardDescription className="mt-1.5">
            Landscape photos work best (at least 1600px wide). Slides rotate every 6 seconds in the order below.
            The headline and text over the slides are edited in Site Content.
          </CardDescription>
        </div>
        <div className="shrink-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
            {uploading ? "Uploading..." : "Add slides"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">
            Couldn't load slides: {(error as Error).message}. If the table is missing, run the latest migration in the Supabase SQL Editor.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : slides.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No slides yet, so the home page shows the built-in product photos. Add your own with "Add slides".
          </p>
        ) : (
          <>
            {activeCount === 0 && (
              <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                All slides are hidden, so the home page is showing the built-in photos.
              </p>
            )}
            <ul className="space-y-4">
              {slides.map((s, i) => (
                <li key={s.id} className="flex flex-col md:flex-row gap-4 rounded-lg border p-3">
                  <div className="relative w-full md:w-64 aspect-video shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={s.image_url}
                      alt={s.alt}
                      className={`h-full w-full object-cover ${s.active ? "" : "opacity-40 grayscale"}`}
                      style={{ objectPosition: s.object_position }}
                      loading="lazy"
                    />
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">#{i + 1}</span>
                  </div>
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor={`alt-${s.id}`}>Description (for SEO and screen readers)</Label>
                      <Input
                        id={`alt-${s.id}`}
                        defaultValue={s.alt}
                        maxLength={160}
                        onBlur={(e) => e.target.value.trim() !== s.alt && update(s.id, { alt: e.target.value.trim() })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Focus point (mobile crop)</Label>
                      <Select value={s.object_position} onValueChange={(v) => update(s.id, { object_position: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FOCUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                          {!FOCUS_OPTIONS.some((o) => o.value === s.object_position) && (
                            <SelectItem value={s.object_position}>Custom ({s.object_position})</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <Switch
                        id={`active-${s.id}`}
                        checked={s.active}
                        onCheckedChange={(v) => update(s.id, { active: v }, true)}
                      />
                      <Label htmlFor={`active-${s.id}`}>{s.active ? "Shown" : "Hidden"}</Label>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2 md:justify-start">
                    <Button variant="outline" size="icon" aria-label="Move up" disabled={i === 0 || !!busyId} onClick={() => move(i, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Move down" disabled={i === slides.length - 1 || !!busyId} onClick={() => move(i, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Delete slide" disabled={!!busyId} onClick={() => remove(s)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HeroSlidesManager;
