-- The schema dump assigns object ownership to role "borec".
-- The application itself connects as the superuser (POSTGRES_USER), so this
-- role only needs to exist for the ownership statements in 01_schema.sql to apply.
CREATE ROLE borec;
