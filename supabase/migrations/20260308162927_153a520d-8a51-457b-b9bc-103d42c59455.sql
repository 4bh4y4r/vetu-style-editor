
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see follows
CREATE POLICY "Follows are viewable by authenticated users"
  ON public.follows FOR SELECT TO authenticated
  USING (true);

-- Users can follow others
CREATE POLICY "Users can insert their own follows"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can delete their own follows"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);
