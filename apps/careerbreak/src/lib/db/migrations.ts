// Append-only. Never edit an entry that has shipped; add a new one.
export const MIGRATIONS: string[] = [
  `
  create table tags (
    id serial primary key,
    name text not null,
    color text not null,
    created_at timestamptz not null default now()
  );
  create unique index tags_name_lower on tags (lower(name));
  create table goals (
    id serial primary key,
    week_start date not null,
    title text not null,
    tag_id int not null references tags(id) on delete restrict,
    hit boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index goals_week on goals (week_start);
  create table todos (
    id serial primary key,
    date date not null,
    planned_date date not null,
    title text not null,
    tag_id int not null references tags(id) on delete restrict,
    goal_id int references goals(id) on delete set null,
    done boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index todos_date on todos (date);
  create index todos_planned on todos (planned_date);
  create table week_notes (
    week_start date primary key,
    went_well text not null default '',
    improve text not null default ''
  );
  `,
]
