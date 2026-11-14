import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Mail, MailOpen, RefreshCw, Trash2 } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  // Quote every cell and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

const downloadCsv = (filename: string, rows: (string | number | null)[][]) => {
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const MessagesManager: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [m, s] = await Promise.all([
      (supabase as any).from("contact_messages").select("*").order("created_at", { ascending: false }),
      (supabase as any).from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
    ]);
    if (m.error) toast.error(`Messages: ${m.error.message}`);
    else setMessages(m.data || []);
    if (s.error) toast.error(`Subscribers: ${s.error.message}`);
    else setSubscribers(s.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("contact_messages").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const removeMessage = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    const { error } = await (supabase as any).from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Message deleted");
    setMessages((ms) => ms.filter((m) => m.id !== id));
  };

  const removeSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber? This cannot be undone.")) return;
    const { error } = await (supabase as any).from("newsletter_subscribers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Subscriber removed");
    setSubscribers((ss) => ss.filter((s) => s.id !== id));
  };

  const exportSubscribers = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`tablelk-newsletter-subscribers-${date}.csv`, [
      ["email", "subscribed_at"],
      ...subscribers.map((s) => [s.email, s.created_at]),
    ]);
  };

  const unread = messages.filter((m) => m.status === "new").length;

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>
            Contact messages ({messages.length}){unread > 0 && <Badge className="ml-2">{unread} new</Badge>}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((m) => {
                  const isNew = m.status === "new";
                  const open = expanded === m.id;
                  return (
                    <TableRow key={m.id} className={isNew ? "bg-primary/5" : undefined}>
                      <TableCell className="text-sm whitespace-nowrap align-top">{new Date(m.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm align-top">
                        <div className={isNew ? "font-semibold" : "font-medium"}>{m.name}</div>
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Your message to TableLK"}`)}`} className="text-primary hover:underline break-all">
                          {m.email}
                        </a>
                        {m.phone && (
                          <div>
                            <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">{m.phone}</a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm align-top max-w-md">
                        <button
                          type="button"
                          className="text-left w-full"
                          onClick={() => {
                            setExpanded(open ? null : m.id);
                            if (isNew && !open) setStatus(m.id, "read");
                          }}
                        >
                          <div className={isNew ? "font-semibold" : "font-medium"}>{m.subject || "(no subject)"}</div>
                          <p className={`text-muted-foreground whitespace-pre-wrap break-words ${open ? "" : "line-clamp-2"}`}>{m.message}</p>
                        </button>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant={isNew ? "default" : "secondary"}>{m.status}</Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title={isNew ? "Mark as read" : "Mark as new"}
                            aria-label={isNew ? "Mark as read" : "Mark as new"}
                            onClick={() => setStatus(m.id, isNew ? "read" : "new")}
                          >
                            {isNew ? <MailOpen className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="destructive" aria-label="Delete message" onClick={() => removeMessage(m.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {messages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No messages yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Newsletter subscribers ({subscribers.length})</CardTitle>
          <Button size="sm" variant="outline" onClick={exportSubscribers} disabled={subscribers.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm break-all">{s.email}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" aria-label="Remove subscriber" onClick={() => removeSubscriber(s.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No subscribers yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesManager;
