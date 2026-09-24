create table if not exists wellness_profiles (
    user_id bigint primary key references users(id) on delete cascade,
    dietary_pattern varchar(40),
    activity_level varchar(40),
    created_at timestamp,
    updated_at timestamp
);
create table if not exists wellness_profile_allergens (user_id bigint not null references wellness_profiles(user_id) on delete cascade, allergen varchar(40) not null);
create table if not exists wellness_profile_intolerances (user_id bigint not null references wellness_profiles(user_id) on delete cascade, intolerance varchar(40) not null);
create table if not exists wellness_profile_nutrition_goals (user_id bigint not null references wellness_profiles(user_id) on delete cascade, goal varchar(50) not null);
create table if not exists wellness_profile_activities (user_id bigint not null references wellness_profiles(user_id) on delete cascade, activity varchar(50) not null);
create table if not exists wellness_profile_exercise_goals (user_id bigint not null references wellness_profiles(user_id) on delete cascade, goal varchar(50) not null);
create table if not exists wellness_profile_limitations (user_id bigint not null references wellness_profiles(user_id) on delete cascade, limitation varchar(60) not null);
