ALTER TABLE Invoice ADD COLUMN alreadyPaid INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Invoice ADD COLUMN vat INTEGER NOT NULL DEFAULT 0;
