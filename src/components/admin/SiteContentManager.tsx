import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContentMap {
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

const DEFAULTS: ContentMap = {
  hero_title: "",
  hero_subtitle: "",
  about_text: "",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
};

const SiteContentManager: React.FC = () => {
  const [content, setContent] = useState<ContentMap>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any).from("site_content").select("key, value");
      if (error) toast.error(error.message);
      else {
        const map = { ...DEFAULTS };
        (data || []).forEach((row: any) => {
          if (row.key in map) (map as any)[row.key] = row.value?.text ?? "";
        });
        setContent(map);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = Object.entries(content).map(([key, text]) => ({ key, value: { text } }));
    const { error } = await (supabase as any)
      .from("site_content")
      .upsert(rows, { onConflict: "key" });
    if (error) toast.error(error.message);
    else toast.success("Site content saved");
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader><CardTitle>Site Content</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Hero title</Label>
          <Input value={content.hero_title} onChange={(e) => setContent({ ...content, hero_title: e.target.value })} />
        </div>
        <div>
          <Label>Hero subtitle</Label>
          <Textarea rows={2} value={content.hero_subtitle} onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })} />
        </div>
        <div>
          <Label>About text</Label>
          <Textarea rows={6} value={content.about_text} onChange={(e) => setContent({ ...content, about_text: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Contact email</Label>
            <Input value={content.contact_email} onChange={(e) => setContent({ ...content, contact_email: e.target.value })} />
          </div>
          <div>
            <Label>Contact phone</Label>
            <Input value={content.contact_phone} onChange={(e) => setContent({ ...content, contact_phone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Contact address</Label>
          <Textarea rows={2} value={content.contact_address} onChange={(e) => setContent({ ...content, contact_address: e.target.value })} />
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
};

export default SiteContentManager;
