create extension if not exists "pgcrypto";

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  lat double precision,
  lng double precision,
  status text not null default 'Submitted' check (status in ('Submitted', 'Under Review', 'Resolved')),
  is_anonymous boolean not null default false,
  user_id uuid null,
  reporter_name text,
  contact_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_images (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues (id) on delete cascade,
  user_id uuid null,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists issues_status_idx on public.issues (status);
create index if not exists issues_created_at_idx on public.issues (created_at desc);
create index if not exists issue_images_issue_idx on public.issue_images (issue_id);
create index if not exists issue_comments_issue_idx on public.issue_comments (issue_id);

create policy "issues are viewable by everyone" on public.issues
for select using (true);

create policy "anonymous users can insert issues" on public.issues
for insert with check (true);

create policy "authenticated users can update their own issues" on public.issues
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "issues images are viewable by everyone" on public.issue_images
for select using (true);

create policy "images can be inserted by anyone" on public.issue_images
for insert with check (true);

create policy "comments are viewable by everyone" on public.issue_comments
for select using (true);

create policy "comments can be inserted by anyone" on public.issue_comments
for insert with check (true);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.issues;
create trigger set_updated_at
before update on public.issues
for each row
execute function public.handle_updated_at();

-- Storage bucket used for issue media
-- create bucket cirp-images with public=true;
