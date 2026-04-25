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