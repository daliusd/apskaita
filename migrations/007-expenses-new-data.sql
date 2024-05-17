ALTER TABLE Expense ADD COLUMN invoiceno TEXT;
ALTER TABLE Expense ADD COLUMN seller TEXT;
ALTER TABLE Expense ADD COLUMN items TEXT;
UPDATE Expense SET price = round(price * 100);
