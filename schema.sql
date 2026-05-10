-- ============================================================
-- BARRIO APP — Esquema completo de Supabase
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. PERFILES DE USUARIO
-- Se crea automáticamente al hacer login con Google
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Trigger: crea perfil automáticamente cuando se registra un usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- 2. BARES
create table if not exists bares (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  barrio text,
  precio_cana text,
  image_url text,
  lat double precision,
  lng double precision,
  added_by uuid references profiles(id),
  last_activity_at timestamptz default now(),
  created_at timestamptz default now()
);


-- 3. RESEÑAS (también sirven como posts del feed)
create table if not exists resenas (
  id uuid default gen_random_uuid() primary key,
  bar_id uuid references bares(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  score numeric(3,1) check (score >= 0 and score <= 10),
  tapa_score numeric(3,1) check (tapa_score >= 0 and tapa_score <= 10),
  review_text text,
  image_url text,
  nota_personal numeric(3,1), -- privada, solo visible para el autor
  created_at timestamptz default now(),
  unique (bar_id, user_id) -- una reseña por usuario por bar (se puede update)
);

-- Actualiza last_activity_at del bar cuando se añade una reseña
create or replace function update_bar_activity()
returns trigger as $$
begin
  update bares set last_activity_at = now() where id = new.bar_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_resena_insert on resenas;
create trigger on_resena_insert
  after insert on resenas
  for each row execute procedure update_bar_activity();


-- 4. FAVORITOS
create table if not exists favoritos (
  bar_id uuid references bares(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (bar_id, user_id)
);


-- 5. CHECKINS ("estuve aquí")
create table if not exists checkins (
  bar_id uuid references bares(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (bar_id, user_id)
);


-- 6. COMENTARIOS del feed
create table if not exists comentarios (
  id uuid default gen_random_uuid() primary key,
  resena_id uuid references resenas(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);


-- 7. LIKES en reseñas
create table if not exists likes (
  resena_id uuid references resenas(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (resena_id, user_id)
);


-- 8. REACCIONES en comentarios (emojis)
create table if not exists reacciones (
  id uuid default gen_random_uuid() primary key,
  comentario_id uuid references comentarios(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique (comentario_id, user_id, emoji)
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cualquier usuario autenticado puede leer todo.
-- Solo puedes modificar tus propios datos.
-- ============================================================

alter table profiles enable row level security;
alter table bares enable row level security;
alter table resenas enable row level security;
alter table favoritos enable row level security;
alter table checkins enable row level security;
alter table comentarios enable row level security;
alter table likes enable row level security;
alter table reacciones enable row level security;

-- PROFILES
create policy "Perfiles visibles para todos" on profiles for select using (true);
create policy "Editar solo tu perfil" on profiles for update using (auth.uid() = id);

-- BARES
create policy "Bares visibles para todos" on bares for select using (true);
create policy "Cualquier autenticado puede añadir bares" on bares for insert with check (auth.uid() is not null);
create policy "Solo el autor puede editar su bar" on bares for update using (auth.uid() = added_by);

-- RESEÑAS
create policy "Reseñas visibles para todos" on resenas for select using (true);
create policy "Solo el autor ve su nota personal" on resenas for select using (
  auth.uid() = user_id or nota_personal is null
);
create policy "Añadir reseña si estás autenticado" on resenas for insert with check (auth.uid() = user_id);
create policy "Editar solo tu reseña" on resenas for update using (auth.uid() = user_id);
create policy "Borrar solo tu reseña" on resenas for delete using (auth.uid() = user_id);

-- FAVORITOS
create policy "Favoritos visibles" on favoritos for select using (true);
create policy "Gestionar tus favoritos" on favoritos for all using (auth.uid() = user_id);

-- CHECKINS
create policy "Checkins visibles" on checkins for select using (true);
create policy "Gestionar tus checkins" on checkins for all using (auth.uid() = user_id);

-- COMENTARIOS
create policy "Comentarios visibles" on comentarios for select using (true);
create policy "Añadir comentarios autenticado" on comentarios for insert with check (auth.uid() = user_id);
create policy "Borrar tu comentario" on comentarios for delete using (auth.uid() = user_id);

-- LIKES
create policy "Likes visibles" on likes for select using (true);
create policy "Gestionar tus likes" on likes for all using (auth.uid() = user_id);

-- REACCIONES
create policy "Reacciones visibles" on reacciones for select using (true);
create policy "Gestionar tus reacciones" on reacciones for all using (auth.uid() = user_id);


-- ============================================================
-- REALTIME
-- Activa realtime para que los cambios se propaguen
-- ============================================================
alter publication supabase_realtime add table bares;
alter publication supabase_realtime add table resenas;
alter publication supabase_realtime add table favoritos;
alter publication supabase_realtime add table checkins;
alter publication supabase_realtime add table comentarios;
alter publication supabase_realtime add table likes;
alter publication supabase_realtime add table reacciones;


-- ============================================================
-- STORAGE: bucket para imágenes de bares
-- Crear en Dashboard > Storage > New bucket: "bar-images" (public)
-- O ejecutar:
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('bar-images', 'bar-images', true);
-- create policy "Imágenes públicas" on storage.objects for select using (bucket_id = 'bar-images');
-- create policy "Subir imagen autenticado" on storage.objects for insert with check (bucket_id = 'bar-images' and auth.uid() is not null);
