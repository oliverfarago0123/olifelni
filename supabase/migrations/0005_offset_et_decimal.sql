-- ET is not always a whole number (ET 42.5 exists), so it gets one decimal like the other
-- wheel measurements. Existing values convert as they are: 35 becomes 35.0.

ALTER TABLE "listings" ALTER COLUMN "offset_et" SET DATA TYPE numeric(4, 1);
