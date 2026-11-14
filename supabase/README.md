# TableLK backend setup (Supabase project `hraxbaajigsfymqybqdc`)

The old Supabase project is gone. These steps set up the new, empty project once.

## 1. Create the database

1. Open https://supabase.com/dashboard/project/hraxbaajigsfymqybqdc → **SQL Editor** → **New query**.
2. Paste the whole of `supabase/setup.sql` and click **Run** (confirm the "destructive operation" warning; it only drops policies it recreates).
3. It runs in one transaction: tables, security rules, functions, the `product-images` storage bucket and the 6 starter products. Run it only once.

## 2. Create the admin account

1. Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Email `kalanabimsara@tablelk.com`, a password of your choice, tick **Auto Confirm User**.
3. That email gets the admin role automatically. To make any *other* existing user an admin, run in the SQL Editor:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'someone@example.com'
on conflict do nothing;
```

## 3. Deploy the edge functions

Install the Supabase CLI (https://supabase.com/docs/guides/local-development/cli/getting-started, e.g. `npm i -g supabase` or `scoop install supabase`), then from the project folder:

```bash
supabase login
supabase link --project-ref hraxbaajigsfymqybqdc
supabase functions deploy admin-users --no-verify-jwt
supabase functions deploy payhere-checkout --no-verify-jwt
supabase functions deploy payhere-notify --no-verify-jwt
```

## 4. PayHere card payments

```bash
supabase secrets set PAYHERE_MERCHANT_ID=xxxxxxx PAYHERE_MERCHANT_SECRET=xxxxxxxx PAYHERE_SANDBOX=true SITE_URL=https://www.tablelk.com
```

- **Sandbox credentials:** sign up at https://sandbox.payhere.lk → **Settings → Domains & Credentials** → add the domain `www.tablelk.com`. The Merchant ID is shown there and the Merchant Secret is generated for that domain.
- **Going live:** after PayHere approves your live account, add `www.tablelk.com` under the live account's Domains & Credentials and run
  `supabase secrets set PAYHERE_MERCHANT_ID=<live id> PAYHERE_MERCHANT_SECRET=<live secret> PAYHERE_SANDBOX=false`.
- Until the secrets are set, card checkout answers "Card payments are not configured yet"; cash on delivery and WhatsApp orders keep working.
- PayHere reports payments to `https://hraxbaajigsfymqybqdc.supabase.co/functions/v1/payhere-notify`, which marks orders paid. Logs: Dashboard → Edge Functions → payhere-notify → Logs.

## 5. Auth URLs

Dashboard → **Authentication → URL Configuration**:

- Site URL: `https://www.tablelk.com`
- Redirect URLs: add `https://www.tablelk.com/reset-password`

## 6. Redeploy the website

The site's Supabase URL and key changed in the code (`src/integrations/supabase/client.ts`, `.env`). Redeploy the Netlify site after pulling these changes, otherwise the live site keeps talking to the old, deleted project.
