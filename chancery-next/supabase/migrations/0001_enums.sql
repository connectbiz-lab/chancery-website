-- 0001_enums.sql — enum types mirroring Django `choices`.
create type hotel_slug         as enum ('chancery', 'pavilion');
create type venue_kind         as enum ('ballroom','banquet','conference','private_dining','executive','al_fresco','divisible');
create type gallery_category   as enum ('hotel','lobby','rooms','dining','events');
create type page_kind          as enum ('home','rooms','faq','careers','catering','privacy','terms','accessibility','sitemap','hotel_home','accommodation','dining','events','offers','gallery','contact','experience','destination');
create type section_kind       as enum ('text','text_image','image_text','callout','cta');
create type lead_interest      as enum ('stay','dining','event','catering','careers','other');
create type hotel_interest     as enum ('chancery','pavilion','either');
create type lead_status        as enum ('new','in_progress','resolved');
create type department         as enum ('reservations','dining','sales','events','catering','careers','general');
create type hotel_scope        as enum ('chancery','pavilion','both');
