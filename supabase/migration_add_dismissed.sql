-- Migration: add 'dismissed' to job_status enum
-- Run this in Supabase Dashboard → SQL Editor → New Query

ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'dismissed';
