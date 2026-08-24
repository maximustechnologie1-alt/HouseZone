-- ============================================================================
-- HOUSEZONE — STORAGE BUCKETS & POLICIES
-- Run after creating the buckets below in the Supabase dashboard (or via API):
--   - "listing-images"      → public
--   - "avatars"             → public
--   - "verification-docs"   → private (no public URL, ever)
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('listing-images', 'listing-images', true),
  ('avatars', 'avatars', true),
  ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

-- listing-images: any authenticated host can upload into their own folder
-- (path convention: <host_id>/<listing_id>/<filename>), everyone can read.
create policy "listing_images_public_read" on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "listing_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "listing_images_owner_delete" on storage.objects for delete
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- avatars: public read, owner write (path convention: <user_id>/<filename>)
create policy "avatars_public_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- verification-docs: strictly private — owner can upload/read their own,
-- admins can read everything. No public access, no public policy at all.
create policy "verification_docs_owner_read" on storage.objects for select
  using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "verification_docs_admin_read" on storage.objects for select
  using (bucket_id = 'verification-docs' and is_admin(auth.uid()));

create policy "verification_docs_owner_write" on storage.objects for insert
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);
