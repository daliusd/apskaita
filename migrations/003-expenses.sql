CREATE TABLE Expense (
  id              INTEGER PRIMARY KEY,
  description     TEXT    NOT NULL,
  created         INTEGER NOT NULL,
  price           INTEGER NOT NULL,
  gdriveId        TEXT,
  webContentLink  TEXT,
  webViewLink     TEXT
);

CREATE UNIQUE INDEX Expense_ix_description ON Expense (description);
CREATE INDEX Expense_ix_created ON Expense (created);
