create table if not exists users (
    id bigserial primary key,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    role varchar(40)
);
create table if not exists tokens (
    id bigserial primary key,
    token varchar(255) unique,
    token_type varchar(40),
    revoked boolean not null,
    expired boolean not null,
    user_id bigint references users(id)
);
create table if not exists user_preferences (
    user_id bigint primary key references users(id),
    cycle_length integer,
    period_length integer,
    birth_control_use boolean,
    notifications_enabled boolean,
    ai_coach_enabled boolean,
    voice_processing_enabled boolean,
    analytics_opt_in boolean,
    reminder_time time,
    export_requested_at timestamp,
    delete_requested_at timestamp,
    created_at timestamp,
    updated_at timestamp
);
create table if not exists aif_callback_nonces (
    request_id uuid primary key,
    expires_at timestamp with time zone
);
