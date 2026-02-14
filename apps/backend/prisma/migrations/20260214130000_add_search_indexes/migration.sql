-- Enable pg_trgm extension for trigram-based search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for fast ILIKE '%search%' queries
CREATE INDEX IF NOT EXISTS "item_name_search_idx" ON "item" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "store_name_search_idx" ON "store" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "expense_category_name_search_idx" ON "expense_category" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "income_category_name_search_idx" ON "income_category" USING GIN ("name" gin_trgm_ops);
