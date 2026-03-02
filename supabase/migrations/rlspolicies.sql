-- RLS: catches (user_id = auth.uid())
CREATE POLICY "User catches only" ON catches FOR ALL USING (user_id = auth.uid());