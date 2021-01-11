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
  seriesName  TEXT    NOT NULL,
  seriesId    INTEGER NOT NULL,
  created     INTEGER NOT NULL,
  price       INTEGER NOT NULL,
  buyer       TEXT    NOT NULL,
  seller      TEXT    NOT NULL,
  issuer      TEXT    NOT NULL,
  flags       INTEGER NOT NULL,
  pdfname     TEXT
);

CREATE UNIQUE INDEX Invoice_ix_serie ON Invoice (seriesName, seriesId);
CREATE INDEX Invoice_ix_created ON Invoice (created);
CREATE INDEX Invoice_ix_buyer ON Invoice (buyer);

CREATE TABLE LineItem (
  id        INTEGER PRIMARY KEY,
  name      TEXT    NOT NULL,
  unit      TEXT    NOT NULL,
  amount    INTEGER NOT NULL,
  price     INTEGER NOT NULL,

  invoiceId  INTEGER NOT NULL,
  CONSTRAINT LineItem_fk_invoiceId FOREIGN KEY (invoiceId)
    REFERENCES Invoice (id) ON UPDATE CASCADE ON DELETE CASCADE
);


CREATE INDEX LineItem_ix_invoiceId ON LineItem (invoiceId);
CREATE INDEX LineItem_ix_name ON LineItem (name);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX LineItem_ix_invoiceId;
DROP TABLE LineItem;

DROP INDEX Invoice_ix_buyer;
DROP INDEX Invoice_ix_created;
DROP INDEX Invoice_ix_serie;
DROP TABLE Invoice;

DROP INDEX Setting_ix_name;
DROP TABLE Setting;
