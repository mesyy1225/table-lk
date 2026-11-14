-- =============================================================================
-- TableLK - full database setup for the NEW, EMPTY Supabase project
-- (project ref: hraxbaajigsfymqybqdc)
--
-- HOW TO USE: Supabase Dashboard -> SQL Editor -> New query -> paste this whole
-- file -> Run. Run it ONCE on the new empty project. It is wrapped in a single
-- transaction, so if anything fails nothing is applied and you can fix and re-run.
--
-- Contents, in order:
--   1. Every migration in supabase/migrations (schema, RLS, functions, storage)
--   2. Seed data: the 6 products from src/lib/data.ts
--
-- GENERATED FILE - regenerate it if migrations or seed products change.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Migration: 20260318181328_28c3ce6d-0fd4-474b-99a8-a99287ee593a.sql
-- -----------------------------------------------------------------------------
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create user_cart_items table
CREATE TABLE public.user_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_cart_items ENABLE ROW LEVEL SECURITY;

-- Users can manage their own cart
CREATE POLICY "Users can read own cart" ON public.user_cart_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON public.user_cart_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON public.user_cart_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart" ON public.user_cart_items
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
;

-- -----------------------------------------------------------------------------
-- Migration: 20260318185407_2577f66f-2bd3-4b07-a71e-c343c8a707de.sql
-- -----------------------------------------------------------------------------
-- Create a security definer function to check if an email already exists in auth.users
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = email_to_check
  );
$$;

-- Grant execute to anon and authenticated so it can be called from the client
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;
;

-- -----------------------------------------------------------------------------
-- Migration: 20260425153530_16bf40a3-4fb7-4ba0-89eb-86ac6a28d234.sql
-- -----------------------------------------------------------------------------
-- 1. Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins view all orders" ON public.orders
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update orders" ON public.orders
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete orders" ON public.orders
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Site content key/value store
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content readable by everyone" ON public.site_content
FOR SELECT USING (true);

CREATE POLICY "Admins manage site content" ON public.site_content
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Allow admins to view all profiles (for Users management)
CREATE POLICY "Admins view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Product images publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update product images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete product images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
;

-- -----------------------------------------------------------------------------
-- Migration: 20260425153620_44711911-d960-428b-8bb4-75413c6f39a2.sql
-- -----------------------------------------------------------------------------
-- Tighten orders insert policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

CREATE POLICY "Customers and guests can create orders" ON public.orders
FOR INSERT
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);

-- Restrict storage SELECT so anonymous listing isn't allowed.
-- Public CDN URLs still work because they bypass RLS via the public bucket flag,
-- but list operations through the API will be blocked for non-admins.
DROP POLICY IF EXISTS "Product images publicly readable" ON storage.objects;

CREATE POLICY "Admins list product images" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
;

-- -----------------------------------------------------------------------------
-- Migration: 20260425153725_a9140fb5-dc99-4789-890a-2c638e295caf.sql
-- -----------------------------------------------------------------------------
-- Replace handle_new_user to also seed admin role for the super admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );

  IF NEW.email = 'kalanabimsara@tablelk.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
;

-- -----------------------------------------------------------------------------
-- Migration: 20260925114826_a5da295b-3642-4656-99ae-a39edb5ea03e.sql
-- -----------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS colors text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dimensions jsonb NOT NULL DEFAULT '{"width":0,"length":0,"height":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.user_cart_items ALTER COLUMN product_id TYPE text USING product_id::text;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT ON public.orders TO anon, authenticated;
;

-- -----------------------------------------------------------------------------
-- Migration: 20261114120000_checkout_contact_newsletter.sql
-- -----------------------------------------------------------------------------
-- Checkout (COD / WhatsApp / PayHere card), contact form and newsletter.
-- Idempotent where practical so it can be re-run safely.

-- ---------------------------------------------------------------------------
-- 1. Orders: reference, delivery details, payment tracking
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_ref text NOT NULL
    DEFAULT ('TLK-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 5))),
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payhere_payment_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER TABLE public.orders ALTER COLUMN customer_email SET DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_ref_key') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_order_ref_key UNIQUE (order_ref);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_method_check') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IN ('card', 'cod', 'whatsapp'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'cancelled', 'refunded', 'chargedback'));
  END IF;
END $$;

-- Clients may only create unpaid COD / WhatsApp orders.
-- Card orders are created exclusively by the payhere-checkout edge function (service role).
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers and guests can create orders" ON public.orders;
CREATE POLICY "Customers and guests can create orders" ON public.orders
FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR auth.uid() = user_id)
  AND payment_method IN ('cod', 'whatsapp')
  AND payment_status = 'unpaid'
  AND status = 'pending'
  AND payhere_payment_id IS NULL
  AND paid_at IS NULL
);

-- Public order status lookup by reference (used by the payment result page for guests).
CREATE OR REPLACE FUNCTION public.get_order_status(_order_ref text)
RETURNS TABLE (order_ref text, status text, payment_status text, total numeric, payment_method text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_ref, o.status, o.payment_status, o.total, o.payment_method
  FROM public.orders o
  WHERE o.order_ref = _order_ref
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_status(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_status(text) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Contact messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(email) BETWEEN 3 AND 320
  AND email LIKE '%_@_%'
  AND (phone IS NULL OR char_length(phone) <= 50)
  AND (subject IS NULL OR char_length(subject) <= 200)
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Admins view contact messages" ON public.contact_messages;
CREATE POLICY "Admins view contact messages" ON public.contact_messages
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update contact messages" ON public.contact_messages;
CREATE POLICY "Admins update contact messages" ON public.contact_messages
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins delete contact messages" ON public.contact_messages
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 3. Newsletter subscribers (duplicate email -> unique violation 23505)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_key
  ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (char_length(email) BETWEEN 3 AND 320 AND email LIKE '%_@_%');

DROP POLICY IF EXISTS "Admins view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins view subscribers" ON public.newsletter_subscribers
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- 4. Explicit table privileges. New Supabase projects may not grant the API
--    roles access to public tables automatically; RLS still decides row access.
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon, authenticated;
;

-- -----------------------------------------------------------------------------
-- Seed: products (skipped if the products table already has rows)
-- -----------------------------------------------------------------------------
INSERT INTO public.products
  (name, description, short_description, price, image_url, images, categories, category,
   material, colors, dimensions, stock, featured, sort_order)
SELECT v.name, v.description, v.short_description, v.price, v.image_url, v.images, v.categories,
       v.category, v.material, v.colors, v.dimensions, v.stock, v.featured, v.sort_order
FROM (VALUES
  (
    '5ft x 2ft Smart Table',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine computer table with steel frame',
    18200.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250601WA0022.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250601WA0022.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0009.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250402WA0001.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250501WA0007.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250501WA0006.jpg']::text[],
    ARRAY['computer', 'Modern', 'Office']::text[],
    'computer',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":24,"length":60,"height":30}'::jsonb,
    10,
    true,
    0
  ),
  (
    '4ft x 2ft Smart Table',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine computer table with steel frame',
    16200.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250606WA0017.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250606WA0017.jpg', 'https://u.cubeupload.com/Tablelkk/Screenshot2025060516.jpg', 'https://u.cubeupload.com/Tablelkk/20250321115351.jpg', 'https://u.cubeupload.com/Tablelkk/1deIMG20250308WA0022.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250308WA0022.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250503WA0012.jpg', 'https://u.cubeupload.com/Tablelkk/WhatsAppImage2025031.jpg']::text[],
    ARRAY['computer', 'Modern', 'office Room']::text[],
    'computer',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":24,"length":48,"height":30}'::jsonb,
    10,
    true,
    1
  ),
  (
    '3ft x 2ft Smart Table',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine study desk with steel frame',
    14600.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250120WA0019.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250120WA0019.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250120WA0013.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250120WA0021.jpg', 'https://u.cubeupload.com/Tablelkk/BusinessSuitecreatio.jpeg', 'https://u.cubeupload.com/Tablelkk/IMG20250528WA0022.jpg']::text[],
    ARRAY['Office', 'Modern', 'Desk']::text[],
    'Office',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":24,"length":36,"height":30}'::jsonb,
    10,
    false,
    2
  ),
  (
    '2.5ft x 2ft Smart Table',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine office table with steel frame',
    13400.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250120WA0020.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250120WA0020.jpg', 'https://u.cubeupload.com/Tablelkk/545IMG20250120WA0012.jpg', 'https://u.cubeupload.com/Tablelkk/VideoCapture20250514.jpg', 'https://u.cubeupload.com/Tablelkk/20250321121437.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250120WA0019.jpg']::text[],
    ARRAY['office', 'Modern', 'Living Room']::text[],
    'office',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":24,"length":32,"height":30}'::jsonb,
    10,
    true,
    3
  ),
  (
    'Modern L-Shaped Tables',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine L-Shaped table with steel frame',
    22000.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250120WA0011.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250120WA0008.jpg', 'https://u.cubeupload.com/Tablelkk/9b7WhatsAppImage2025031.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250514WA0006.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250311WA0003.jpg']::text[],
    ARRAY['Executive Table', 'Modern', 'Office']::text[],
    'Executive Table',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":24,"length":48,"height":36}'::jsonb,
    10,
    false,
    4
  ),
  (
    'Modern Dining Table',
    $desc$Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!$desc$,
    'Modern melamine dining table with steel frame',
    16500.00,
    'https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg',
    ARRAY['https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0002.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0003.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0010.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0008.jpg', 'https://u.cubeupload.com/Tablelkk/IMG20250330WA0013.jpg']::text[],
    ARRAY['dining Table', 'Modern', 'Living Room']::text[],
    'dining Table',
    '15mm Melamine Particleboard with Steel Frame',
    ARRAY['White', 'American Ash White', 'Black', 'Teak']::text[],
    '{"width":36,"length":60,"height":30}'::jsonb,
    10,
    true,
    5
  )
) AS v(name, description, short_description, price, image_url, images, categories, category,
       material, colors, dimensions, stock, featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.products);

COMMIT;
