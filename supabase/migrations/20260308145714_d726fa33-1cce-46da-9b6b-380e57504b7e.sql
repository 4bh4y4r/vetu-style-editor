
-- Boards table
CREATE TABLE public.boards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boards" ON public.boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON public.boards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON public.boards
  FOR UPDATE USING (auth.uid() = user_id);

-- Board pins table
CREATE TABLE public.board_pins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.board_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pins" ON public.board_pins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pins" ON public.board_pins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pins" ON public.board_pins
  FOR DELETE USING (auth.uid() = user_id);
