-- Cap every upload bucket at 1MB per object (limited Supabase storage).
-- Existing objects are not touched; only new uploads are limited.
-- If this fails (storage schema permissions), set the limit in
-- Dashboard -> Storage -> bucket -> Edit bucket -> File size limit = 1 MB.

update storage.buckets
set file_size_limit = 1048576 -- 1MB
where id in ('shop-logos', 'listing-images', 'verification-documents');
