-- Admin-managed home page carousel slides and customer reviews.
-- Images are uploaded to the existing public "product-images" bucket
-- (folders hero/ and reviews/), whose admin upload policies already exist.
-- Safe to run more than once.

-- 1. Home page carousel slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  -- CSS object-position focal point, e.g. 'center', '70% 60%'
  object_position TEXT NOT NULL DEFAULT 'center',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active slides are public" ON public.hero_slides;
CREATE POLICY "Active slides are public" ON public.hero_slides
FOR SELECT USING (active OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage slides" ON public.hero_slides;
CREATE POLICY "Admins manage slides" ON public.hero_slides
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Customer reviews (entered manually by admins)
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  location TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  published BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT true, -- show on the home page
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_reviews_product_id_idx ON public.customer_reviews (product_id);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published reviews are public" ON public.customer_reviews;
CREATE POLICY "Published reviews are public" ON public.customer_reviews
FOR SELECT USING (published OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage reviews" ON public.customer_reviews;
CREATE POLICY "Admins manage reviews" ON public.customer_reviews
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS customer_reviews_updated_at ON public.customer_reviews;
CREATE TRIGGER customer_reviews_updated_at
BEFORE UPDATE ON public.customer_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. API role grants
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT SELECT ON public.customer_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.customer_reviews TO authenticated;

-- 4. Seed the carousel with the current real product photos (only when empty)
INSERT INTO public.hero_slides (image_url, alt, object_position, sort_order)
SELECT v.image_url, v.alt, v.pos, v.ord
FROM (VALUES
  ('https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg', 'TableLK L-shaped office table with ash-white top and black steel frame', '70% 60%', 0),
  ('https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg', 'TableLK teak-finish dining table on a black steel frame', '60% 50%', 1),
  ('https://u.cubeupload.com/Tablelkk/WhatsAppImage2025031.jpg', 'TableLK smart computer table with black top and white steel frame', '70% 55%', 2),
  ('https://u.cubeupload.com/Tablelkk/IMG20250120WA0011.jpg', 'TableLK modern L-shaped workstation with teak top and white frame', '65% 55%', 3)
) AS v(image_url, alt, pos, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

-- Ask the API to pick up the new tables immediately
NOTIFY pgrst, 'reload schema';
