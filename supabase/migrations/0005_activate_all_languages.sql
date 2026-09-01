-- HouseZone V1 correction: all ten languages ship active immediately, no
-- "prepared but not activated" state. Covers rows inserted by 0001/0004
-- with active = false before this correction, without touching an admin's
-- later choice to deactivate a language again via /admin/langues.
update languages set active = true where code in ('en', 'es', 'pt', 'ar', 'it', 'ru', 'zh', 'ja', 'hi');
