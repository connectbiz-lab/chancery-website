-- Two more seating layouts the hotels quote (Oct 2026 feedback): cluster
-- (rounds of 6–10) and boardroom. Both hotels replace "banquet" with cluster.
alter table venue
  add column if not exists cap_cluster integer,
  add column if not exists cap_boardroom integer;
