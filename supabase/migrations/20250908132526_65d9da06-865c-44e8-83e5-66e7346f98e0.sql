-- Clean up existing data by removing "DB " prefix
UPDATE files 
SET db_no = TRIM(SUBSTRING(db_no FROM 4))
WHERE db_no LIKE 'DB %';

-- Create function to normalize db_no by removing "DB " prefix
CREATE OR REPLACE FUNCTION normalize_db_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove "DB " prefix if present (case insensitive)
  IF NEW.db_no ILIKE 'DB %' THEN
    NEW.db_no = TRIM(SUBSTRING(NEW.db_no FROM 4));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically normalize db_no on insert/update
CREATE TRIGGER normalize_db_no_trigger
  BEFORE INSERT OR UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION normalize_db_no();