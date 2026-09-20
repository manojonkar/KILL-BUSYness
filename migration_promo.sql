CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  discount_percent INT,
  fixed_price INT,
  active BOOLEAN DEFAULT TRUE
);

-- Insert some dummy data for now
INSERT INTO promo_codes (code, discount_percent) VALUES ('DISCOUNT10', 10) ON CONFLICT DO NOTHING;
INSERT INTO promo_codes (code, fixed_price) VALUES ('SPECIAL999', 999) ON CONFLICT DO NOTHING;
