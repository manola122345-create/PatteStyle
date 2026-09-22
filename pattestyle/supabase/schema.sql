-- Schéma PatteStyle — à exécuter dans Supabase > SQL Editor
-- Ces tables correspondent exactement aux champs utilisés par les fonctions /api/*.

create table if not exists products (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  subtitle text default '',
  description text default '',
  price numeric not null,
  compare_at_price numeric,
  category text default 'Accessoires',
  pet_type text default 'Les deux',
  images jsonb default '[]'::jsonb,
  variants jsonb default '[]'::jsonb,
  stock_quantity integer default 10,
  is_active boolean default true,
  is_featured boolean default false,
  is_best_seller boolean default false,
  delivery_estimate text default 'Livraison 48h - 72h en Europe',
  badge text,
  created_at timestamptz default now()
);

create table if not exists customers (
  id bigint generated always as identity primary key,
  name text,
  email text unique not null,
  phone text default '',
  country text default 'France',
  total_orders integer default 0,
  total_spent numeric default 0,
  created_at timestamptz default now()
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  order_number text unique not null,
  customer_name text,
  customer_email text not null,
  customer_phone text default '',
  shipping_address jsonb,
  shipping_zone text default 'Europe Standard',
  shipping_fee numeric default 0,
  items jsonb not null,
  subtotal numeric not null,
  total numeric not null,
  status text default 'Payée',
  payment_method text default 'Stripe CB',
  payment_status text default 'Reçu',
  tracking_number text,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text default '',
  verified_purchase boolean default true,
  pet_info text default 'Propriétaire vérifié',
  created_at timestamptz default now()
);

create table if not exists store_settings (
  key text primary key,
  value text
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_pet_type on products(pet_type);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_order_number on orders(order_number);
create index if not exists idx_reviews_product_id on reviews(product_id);

-- Sécurité : le frontend n'accède jamais directement à Supabase (tout passe par
-- les fonctions /api/* qui utilisent la clé service_role côté serveur).
-- On active RLS sans policy publique : personne ne peut lire/écrire ces tables
-- directement avec la clé anon, seule la clé service_role (jamais exposée au
-- client) peut le faire.
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table store_settings enable row level security;
