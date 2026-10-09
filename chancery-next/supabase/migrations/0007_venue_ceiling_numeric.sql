-- Ceiling heights come in half-feet (Sigma 12.5 ft, Indian Affair 9.5 ft,
-- Esquire 7.5 ft per the hotel's F&B team, Oct 2026); smallint could not hold them.
alter table venue alter column ceiling_ft type numeric(4,1);
