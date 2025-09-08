-- Fix the function security warning by setting search_path
CREATE OR REPLACE FUNCTION normalize_db_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove "DB " prefix if present (case insensitive)
  IF NEW.db_no ILIKE 'DB %' THEN
    NEW.db_no = TRIM(SUBSTRING(NEW.db_no FROM 4));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;