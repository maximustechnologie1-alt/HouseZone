-- Prepares the remaining languages from the multilingual architecture
-- (cahier des charges section 2). Active from the start: HouseZone V1
-- ships all ten languages immediately, no "coming soon" state.
insert into languages (code, name, active) values
  ('it', 'Italiano', true),
  ('ru', 'Русский', true),
  ('zh', '中文', true),
  ('ja', '日本語', true),
  ('hi', 'हिन्दी', true)
on conflict (code) do nothing;
