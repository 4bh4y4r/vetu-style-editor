
CREATE TABLE public.outfit_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  outfit_date DATE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outfit_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own outfit posts
CREATE POLICY "Users can view own outfit posts"
  ON public.outfit_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public posts visible to everyone
CREATE POLICY "Public outfit posts are viewable by all"
  ON public.outfit_posts FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Users can insert their own posts
CREATE POLICY "Users can insert own outfit posts"
  ON public.outfit_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own outfit posts"
  ON public.outfit_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own outfit posts"
  ON public.outfit_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
