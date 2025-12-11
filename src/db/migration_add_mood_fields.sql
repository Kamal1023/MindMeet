-- Migration: Add mood_score and user_note to bookings table
-- Run this if you have an existing database

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS mood_score INTEGER CHECK (mood_score IS NULL OR (mood_score >= 1 AND mood_score <= 5));

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS user_note TEXT;

