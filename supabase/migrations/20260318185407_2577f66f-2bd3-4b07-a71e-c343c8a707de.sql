
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
