--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Setting (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  value       TEXT NOT NULL
);

CREATE UNIQUE INDEX Setting_ix_name ON Setting (name);

CREATE TABLE Invoice (
  id          INTEGER PRIMARY KEY,
  serieName   TEXT    NOT NULL,
  serieId     INTEGER NOT NULL,
  created     INTEGER NOT NULL,
  price       INTEGER NOT NULL,
  buyer       TEXT    NOT NULL
);

CREATE UNIQUE INDEX Invoice_ix_serie ON Invoice (serieName, serieId);
CREATE INDEX Invoice_ix_created ON Invoice (created);
CREATE INDEX Invoice_ix_buyer ON Invoice (buyer);

CREATE TABLE Good (
  id        INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL,
  amount    INTEGER NOT NULL,
  price     INTEGER NOT NULL,

  invoiceId  INTEGER NOT NULL,
  CONSTRAINT Good_fk_invoiceId FOREIGN KEY (invoiceId)
    REFERENCES Invoice (id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE INDEX Good_ix_invoiceId ON Good (invoiceId);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX Good_ix_invoiceId;
DROP TABLE Good;

DROP INDEX Invoice_ix_buyer;
DROP INDEX Invoice_ix_created;
DROP INDEX Invoice_ix_serie;
DROP TABLE Invoice;

DROP INDEX Setting_ix_name;
DROP TABLE Setting;
