-- Supabase Storage: bucket assets + папка car Icons для иконок автомобилей
-- Применить: Supabase SQL Editor или `supabase db push`

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assets',
  'assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Публичное чтение всех файлов bucket assets
create policy "Public read assets bucket"
on storage.objects
for select
to public
using (bucket_id = 'assets');

-- Загрузка только в папку car Icons (авторизованные пользователи)
create policy "Authenticated upload car Icons"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = 'car Icons'
);

create policy "Authenticated update car Icons"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = 'car Icons'
)
with check (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = 'car Icons'
);

create policy "Authenticated delete car Icons"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'assets'
  and (storage.foldername(name))[1] = 'car Icons'
);
