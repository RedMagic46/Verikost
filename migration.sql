-- Migration to support Kost Verification Expiration, Dynamic Scheduling, and Payments
-- Copy and execute this complete script in the Supabase SQL Editor.

-- 1. Drop check constraint on kost_verifications status and re-add with new states
alter table public.kost_verifications drop constraint if exists kost_verifications_status_check;
alter table public.kost_verifications add constraint kost_verifications_status_check 
  check (status in ('pending', 'scheduled', 'paid', 'approved', 'rejected'));

-- 2. Add price, visitDate, paymentId, and expiredAt columns to kost_verifications
alter table public.kost_verifications add column if not exists price integer;
alter table public.kost_verifications add column if not exists "visitDate" text;
alter table public.kost_verifications add column if not exists "paymentId" text;
alter table public.kost_verifications add column if not exists "expiredAt" text;

-- 3. Drop check constraint on owner_payments paymentType and re-add to include 'verification'
alter table public.owner_payments drop constraint if exists owner_payments_paymentType_check;
alter table public.owner_payments add constraint owner_payments_paymentType_check 
  check ("paymentType" in ('subscription', 'promotion', 'verification'));
