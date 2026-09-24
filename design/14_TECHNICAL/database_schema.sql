-- Core conceptual schema
CREATE TABLE accounts(id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE, astral_crystal INT DEFAULT 0);
CREATE TABLE characters(id BIGSERIAL PRIMARY KEY, account_id BIGINT, name TEXT UNIQUE, class_id TEXT, level INT, xp BIGINT, map_id TEXT, pos_x REAL, pos_y REAL);
CREATE TABLE inventory_items(id BIGSERIAL PRIMARY KEY, character_id BIGINT, item_id TEXT, quantity INT, enhance_level INT DEFAULT 0, bound_state TEXT, affixes JSONB);
CREATE TABLE character_skills(character_id BIGINT, skill_id TEXT, rank INT, hotbar_slot INT);
CREATE TABLE quest_states(character_id BIGINT, quest_id TEXT, step INT, counters JSONB, completed BOOLEAN DEFAULT FALSE);
CREATE TABLE guilds(id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE, level INT DEFAULT 1, gold BIGINT DEFAULT 0);
CREATE TABLE guild_members(guild_id BIGINT, character_id BIGINT, rank TEXT, contribution BIGINT DEFAULT 0);
CREATE TABLE auction_listings(id BIGSERIAL PRIMARY KEY, seller_character_id BIGINT, inventory_item_id BIGINT, price BIGINT, expires_at TIMESTAMP);
CREATE TABLE cash_shop_entries(shop_id TEXT PRIMARY KEY, category TEXT, price INT, active BOOLEAN, payload JSONB);
