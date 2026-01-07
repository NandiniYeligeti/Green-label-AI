
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT NOT NULL,
  name TEXT,
  brand TEXT,
  image_url TEXT,
  green_score INTEGER,
  nutrition_grade TEXT,
  ecoscore_grade TEXT,
  packaging_info TEXT,
  ingredients_text TEXT,
  source TEXT NOT NULL, -- 'openfoodfacts' or 'gpt4'
  raw_data TEXT, -- JSON string of complete product data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_barcode ON products(barcode);
