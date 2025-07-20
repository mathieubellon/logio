-- =====================================================
-- EXTENSIONS
-- =====================================================
-- Enable necessary PostgreSQL extensions for the Caltrack app

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions (if needed in future)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
