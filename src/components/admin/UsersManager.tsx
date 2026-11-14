import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_admin: boolean;
}

const call = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("admin-users", { body });
  if (error) {
    const status = (error as any).context?.status;
    // Not deployed (404) or unreachable (fetch/CORS failure) -> explain how to fix it.
    if (status === 404 || error.name === "FunctionsFetchError" || error.name === "FunctionsRelayError") {
      throw new Error(
        "The admin-users server function isn't deployed to the new Supabase project yet. " +
          "Deploy it (see supabase/README.md, step 3) and reload this page."
      );
    }
    let msg = error.message;
    try { msg = (await (error as any).context.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
};

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pwUser, setPwUser] = useState<AdminUser | null>(null);
  const [newPw, setNewPw] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const d = await call({ action: "list" });
      setUsers(d.users);
    } catch (e: any) {
      setLoadError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (u: AdminUser, role: string) => {
    try {
      await call({ action: "set_role", user_id: u.id, role });
      toast.success("Role updated");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const sendReset = async (u: AdminUser) => {
    try {
      await call({ action: "send_reset", email: u.email, redirect_to: `${window.location.origin}/reset-password` });
      toast.success(`Reset email sent to ${u.email}`);
    } catch (e: any) { toast.error(e.message); }
  };

  const savePw = async () => {
    if (!pwUser) return;
    try {
      await call({ action: "set_password", user_id: pwUser.id, password: newPw });
      toast.success("Password changed");
      setPwUser(null);
      setNewPw("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loadError && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <Button size="sm" variant="outline" onClick={load}>Try again</Button>
          </div>
        )}
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Select value={u.is_admin ? "admin" : "user"} onValueChange={(v) => changeRole(u, v)}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button size="sm" variant="outline" onClick={() => sendReset(u)}>Email reset link</Button>
                    <Button size="sm" onClick={() => setPwUser(u)}>Set password</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!pwUser} onOpenChange={(o) => !o && setPwUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set new password for {pwUser?.email}</DialogTitle>
          </DialogHeader>
          <Input type="text" placeholder="New password (min 6 characters)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwUser(null)}>Cancel</Button>
            <Button onClick={savePw} disabled={newPw.length < 6}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UsersManager;
