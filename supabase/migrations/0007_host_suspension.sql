-- Section 50 du cahier des charges : l'admin doit pouvoir suspendre/réactiver
-- le statut Hôte indépendamment du bannissement complet du compte (qui
-- existait déjà via profiles.status). Sans cette valeur, la seule manière de
-- retirer l'accès pro à un hôte était de bannir tout son compte utilisateur.
alter type verification_status add value if not exists 'suspendu';
