# CAHIER DES CHARGES FONCTIONNEL

## HOUSEZONE V1

### Plateforme immobilière Web & PWA

**Version :** 1.0
**Marché initial :** Burkina Faso
**Type d'application :** Application Web responsive installable en PWA
**Nom :** HOUSEZONE
**Signature :** *Trouvez votre prochain bien.*

---

# 1. PRÉSENTATION DU PROJET

## 1.1 Nom du projet

**HOUSEZONE**

## 1.2 Concept

HouseZone est une plateforme immobilière permettant de mettre en relation :

* les personnes recherchant un bien immobilier ;
* les propriétaires ;
* les agences immobilières ;
* les démarcheurs immobiliers ;
* les gestionnaires de résidences ;
* les gestionnaires d'appartements meublés.

La plateforme permet notamment de :

* rechercher un bien ;
* publier un bien ;
* consulter des annonces ;
* demander une visite ;
* communiquer avec un hôte ;
* enregistrer des favoris ;
* publier un avis de recherche ;
* gérer des annonces immobilières ;
* souscrire à un abonnement professionnel ;
* réserver certains logements meublés ;
* gérer les utilisateurs et les contenus depuis une administration.

HouseZone doit rester exclusivement orientée vers **l'immobilier**.

---

# 2. PROBLÈME À RÉSOUDRE

La recherche immobilière peut être difficile en raison de plusieurs problèmes :

* annonces dispersées sur plusieurs plateformes ;
* difficulté à trouver rapidement un bien correspondant à son budget ;
* informations incomplètes ;
* annonces frauduleuses ;
* faux propriétaires ou faux démarcheurs ;
* difficulté à vérifier les professionnels ;
* partage incontrôlé des coordonnées ;
* absence de système organisé de demande de visite ;
* difficulté pour les professionnels à présenter et gérer leurs biens ;
* manque de statistiques sur les performances des annonces.

HouseZone doit créer un environnement immobilier centralisé, organisé et sécurisé.

---

# 3. OBJECTIFS DE L'APPLICATION

## 3.1 Objectif principal

Permettre à un utilisateur de :

> **Trouver, vérifier et visiter un bien immobilier depuis une seule plateforme.**

---

## 3.2 Objectifs pour les clients

Le client doit pouvoir :

* créer un compte ;
* rechercher des biens immobiliers ;
* filtrer les résultats ;
* consulter les annonces ;
* enregistrer des favoris ;
* contacter les hôtes ;
* demander une visite ;
* suivre ses demandes de visite ;
* publier un avis de recherche ;
* recevoir des notifications ;
* signaler une annonce ou un utilisateur.

---

## 3.3 Objectifs pour les professionnels

Les hôtes doivent pouvoir :

* créer un profil professionnel ;
* demander une vérification ;
* souscrire à un abonnement ;
* publier des biens ;
* modifier leurs annonces ;
* désactiver un bien devenu indisponible ;
* gérer leurs demandes de visite ;
* échanger avec les clients ;
* consulter leurs statistiques ;
* consulter leurs paiements ;
* gérer leur abonnement.

---

## 3.4 Objectifs pour HouseZone

HouseZone doit permettre de :

* centraliser les annonces ;
* contrôler les publications ;
* vérifier les hôtes ;
* réduire les risques d'arnaque ;
* contrôler les échanges ;
* gérer les abonnements ;
* gérer les paiements ;
* modérer les contenus ;
* gérer les utilisateurs ;
* suivre l'activité globale de la plateforme.

---

# 4. TYPE D'APPLICATION

HouseZone V1 sera développée comme une :

## Application Web responsive

Elle doit fonctionner correctement sur :

* ordinateur ;
* tablette ;
* smartphone.

L'interface doit automatiquement s'adapter à la taille de l'écran.

## PWA — Progressive Web App

HouseZone doit également être installable depuis un navigateur compatible.

L'utilisateur pourra ainsi ajouter HouseZone sur l'écran d'accueil de son téléphone et l'utiliser avec une expérience proche d'une application mobile.

La V1 ne nécessite donc pas le développement séparé :

* d'une application Android native ;
* d'une application iOS native ;
* d'une application Flutter.

Une seule application Web constituera la base du produit.

---

# 5. TYPES D'UTILISATEURS

HouseZone possède trois grandes catégories d'utilisateurs.

## 5.1 Client

Le Client est une personne recherchant principalement un bien immobilier.

Tout nouvel utilisateur commence avec un compte Client.

Il peut ensuite demander l'activation d'un profil Hôte.

---

## 5.2 Hôte

Un Hôte est un utilisateur autorisé à publier et gérer des biens immobiliers.

Il existe quatre catégories.

### A. Propriétaire

Informations principales :

* nom ;
* prénom ;
* téléphone ;
* informations nécessaires à la vérification.

### B. Agence immobilière

Informations principales :

* nom de l'agence ;
* téléphone ;
* forme juridique ;
* numéro d'immatriculation ;
* informations complémentaires nécessaires.

### C. Démarcheur

Informations principales :

* nom ;
* prénom ;
* téléphone ;
* âge ;
* informations de vérification.

Âge minimum :

**18 ans.**

### D. Gestionnaire de résidence ou appartement meublé

Informations principales :

* nom ;
* prénom ;
* entreprise ;
* téléphone ;
* âge ;
* document d'identité.

Documents pouvant être demandés :

* carte national nationale d'identité accepté ;
* passeport ;
* carte consulaire ;

---

## 5.3 Administrateur

L'Administrateur dispose de l'espace de gestion global de HouseZone.

Il peut gérer :

* utilisateurs ;
* hôtes ;
* annonces ;
* abonnements ;
* paiements ;
* signalements ;
* modération ;
* statistiques ;
* vérifications ;
* paramètres.

---

# 6. INSCRIPTION ET AUTHENTIFICATION

## 6.1 Création de compte

Un utilisateur doit pouvoir créer son compte.

Les informations demandées peuvent comprendre :

* nom ;
* prénom ;
* numéro de téléphone ;
* email si nécessaire ;
* mot de passe ;
* acceptation des conditions d'utilisation.

---

## 6.2 Connexion

L'utilisateur doit pouvoir se connecter à son compte.

Selon les méthodes retenues au lancement, l'application pourra proposer :

* email + mot de passe ;
* téléphone + OTP ;
* autres méthodes d'authentification compatibles.

---

## 6.3 Mot de passe oublié

L'utilisateur doit disposer d'un mécanisme sécurisé lui permettant de récupérer l'accès à son compte.

---

## 6.4 Sessions

L'application doit gérer :

* connexion ;
* déconnexion ;
* sessions actives ;
* expiration des sessions ;
* déconnexion de toutes les sessions lorsque nécessaire.

---

# 7. PROFIL CLIENT

Le client possède un espace personnel contenant notamment :

* photo de profil si utilisée ;
* nom ;
* prénom ;
* téléphone ;
* email ;
* favoris ;
* demandes de visite ;
* avis de recherche ;
* conversations ;
* notifications ;
* paramètres ;
* langue ;
* sécurité du compte.

Le client doit pouvoir modifier les informations autorisées de son profil.

---

# 8. DEVENIR HÔTE

Un client peut demander à devenir Hôte.

## 8.1 Parcours

**Profil → Devenir Hôte → Type d'Hôte → Formulaire → Documents → Envoi → Vérification**

---

## 8.2 Choix du type

L'utilisateur sélectionne :

* Propriétaire ;
* Agence immobilière ;
* Démarcheur ;
* Gestionnaire de résidence/appartement meublé.

---

## 8.3 Vérification

Après envoi :

### Vérification en cours

Le dossier est en attente de validation.

### Accepté

L'espace professionnel est activé.

### Refusé

La demande est refusée.

Lorsque cela est possible, une raison doit être communiquée.

---

## 8.4 Documents privés

Les documents transmis pour la vérification :

* ne sont jamais publics ;
* ne sont pas visibles par les clients ;
* doivent être accessibles uniquement aux utilisateurs administratifs autorisés.

---

# 9. ESSAI GRATUIT

Lors de la première activation du statut Hôte :

**3 jours d'essai gratuit** sont accordés.

Pendant cette période, l'Hôte peut découvrir les fonctionnalités professionnelles autorisées.

À la fin de l'essai :

* le compte Client reste utilisable ;
* les fonctionnalités professionnelles nécessitent un abonnement actif.

---

# 10. ABONNEMENTS

Chaque catégorie d'Hôte peut disposer de sa propre tarification.

## 10.1 Propriétaire

* 1 mois : **9 000 FCFA**
* 3 mois : **14 999 FCFA**

## 10.2 Agence immobilière

* 1 mois : **14 999 FCFA**
* 3 mois : **29 999 FCFA**

## 10.3 Démarcheur

* 1 mois : **3 000 FCFA**
* 3 mois : **5 999 FCFA**

## 10.4 Gestionnaire de résidence/appartement meublé

* 1 mois : **6 999 FCFA**
* 3 mois : **10 999 FCFA**

Les prix doivent pouvoir être modifiés ultérieurement par l'administration sans modifier le fonctionnement général de l'application.

---

# 11. GESTION DES ABONNEMENTS

Chaque abonnement possède notamment :

* utilisateur ;
* formule ;
* type d'Hôte ;
* montant ;
* date de début ;
* date de fin ;
* moyen de paiement ;
* statut.

Statuts possibles :

* essai ;
* actif ;
* expiré ;
* suspendu ;
* annulé.

L'Hôte doit pouvoir consulter :

* son offre ;
* sa date d'expiration ;
* son historique ;
* ses paiements ;
* les possibilités de renouvellement.

---

# 12. PUBLICATION DES BIENS

Seuls les Hôtes autorisés peuvent publier des annonces.

## 12.1 Création d'une annonce

Une annonce doit pouvoir contenir :

* titre ;
* description ;
* type de bien ;
* type d'opération ;
* prix ;
* ville ;
* quartier ;
* localisation ;
* caractéristiques ;
* photos ;
* éventuellement vidéo ;
* statut de disponibilité.

---

## 12.2 Types d'opérations

Une annonce peut notamment concerner :

* location ;
* vente ;
* réservation de logement meublé lorsque cette fonctionnalité est autorisée.

---

# 13. TYPES DE BIENS

HouseZone accepte uniquement des contenus immobiliers.

Exemples :

### Maisons

* studio ;
* chambre-salon ;
* mini-villa ;
* villa ;
* duplex.

### Appartements

* appartement ;
* appartement meublé ;
* résidence ;
* résidence meublée.

### Terrains

* terrain à vendre ;
* autres catégories de terrains définies par HouseZone.

Les catégories doivent pouvoir évoluer depuis l'administration.

---

# 14. STATUT DES ANNONCES

Une annonce peut avoir les statuts :

* brouillon ;
* en attente de validation ;
* active ;
* refusée ;
* bloquée ;
* expirée ;
* indisponible ;
* louée ;
* vendue.

L'Hôte doit pouvoir retrouver ses anciennes annonces dans son espace privé.

---

# 15. BIEN INDISPONIBLE

L'Hôte possède une action :

**Marquer comme indisponible**

Lorsqu'elle est activée :

* le bien disparaît du catalogue public ;
* il disparaît des résultats de recherche ;
* les nouvelles demandes de visite sont désactivées ;
* l'annonce reste conservée dans l'espace Hôte ;
* l'administration conserve son historique.

---

# 16. PAGE D'ACCUEIL

La page d'accueil doit présenter immédiatement les fonctions essentielles.

## En-tête

* logo HouseZone ;
* navigation ;
* accès connexion/profil.

## Zone principale

Une barre de recherche visible :

**« Que recherchez-vous ? »**

Filtres rapides :

* ville ;
* quartier ;
* budget ;
* type de bien ;
* location ;
* vente.

---

## Catégories

Exemples :

* Maisons ;
* Appartements ;
* Résidences ;
* Meublés ;
* Terrains ;
* Villas ;
* Duplex.

---

## Sélections immobilières

Des sections peuvent présenter :

* biens récents ;
* résidences et appartements meublés ;
* maisons ;
* appartements ;
* terrains ;
* biens populaires ou mis en avant.

---

# 17. RECHERCHE DE BIENS

La recherche constitue une fonctionnalité centrale.

Le client doit pouvoir rechercher selon :

* mot-clé ;
* ville ;
* quartier ;
* type ;
* budget minimum ;
* budget maximum ;
* location/vente ;
* caractéristiques disponibles.

Les résultats doivent pouvoir être actualisés selon les filtres appliqués.

---

# 18. RÉSULTATS DE RECHERCHE

Chaque résultat peut afficher :

* image principale ;
* titre ;
* prix ;
* localisation ;
* type ;
* statut ;
* badge de vérification de l'Hôte si applicable ;
* bouton favoris.

Le client doit pouvoir ouvrir une annonce pour afficher ses détails.

---

# 19. FICHE D'UN BIEN

La page détaillée doit présenter notamment :

* galerie photos ;
* vidéo si autorisée ;
* titre ;
* prix ;
* localisation ;
* type ;
* caractéristiques ;
* description ;
* disponibilité ;
* informations autorisées sur l'Hôte ;
* badge vérifié ;
* bouton Favoris ;
* bouton Demander une visite ;
* bouton Contacter l'Hôte ;
* bouton Signaler.

---

# 20. FAVORIS

Un client connecté doit pouvoir :

* ajouter un bien aux favoris ;
* retirer un bien ;
* consulter tous ses favoris.

Un Hôte peut consulter le **nombre de personnes** ayant enregistré une annonce.

Les informations personnelles des personnes ayant ajouté le bien aux favoris ne doivent pas nécessairement lui être communiquées.

---

# 21. DEMANDE DE VISITE

Depuis une annonce, le client peut sélectionner :

**Demander une visite**

Il renseigne :

* date ;
* heure ;
* message facultatif.

---

## 21.1 Traitement par l'Hôte

L'Hôte peut :

### Accepter

La visite est confirmée.

### Reprogrammer

L'Hôte propose :

* une nouvelle date ;
* une nouvelle heure.

### Refuser

La demande est refusée.

---

## 21.2 Statuts d'une visite

Exemples :

* en attente ;
* acceptée ;
* reprogrammation proposée ;
* refusée ;
* annulée ;
* terminée.

Le client doit être informé de chaque modification importante.

---

# 22. AVIS DE RECHERCHE

Un client qui ne trouve pas le bien souhaité peut publier une demande.

Exemple :

> Recherche villa à Ouaga 2000
> Minimum 3 chambres
> Budget : 500 000 FCFA/mois

Informations possibles :

* type de bien recherché ;
* ville ;
* quartier ;
* budget ;
* caractéristiques ;
* description.

---

# 23. ACCÈS AUX AVIS DE RECHERCHE

Les avis de recherche constituent un espace professionnel.

Seuls les Hôtes disposant des droits nécessaires et d'un abonnement actif peuvent consulter les demandes correspondant aux règles de HouseZone.

Cela permet aux professionnels de découvrir des clients recherchant réellement un bien.

---

# 24. PROTECTION DES AVIS DE RECHERCHE

L'espace « Avis de recherche » ne doit pas devenir un espace publicitaire.

Un Hôte ne doit pas pouvoir se faire passer pour un client afin de publier une annonce telle que :

* Villa disponible ;
* Terrain à vendre ;
* Appartement à louer.

Lorsque le système détecte ce type de contenu :

* publication refusée ;
* avertissement possible ;
* contenu envoyé en modération si nécessaire.

---

# 25. MESSAGERIE

HouseZone possède une messagerie interne.

Elle permet les échanges :

**Client ↔️ Hôte**

Les utilisateurs doivent pouvoir :

* démarrer une conversation depuis une annonce ;
* envoyer des messages ;
* recevoir des messages ;
* consulter leurs conversations ;
* connaître le bien concerné par l'échange ;
* recevoir une notification de nouveau message.

---

# 26. DROITS DE MESSAGERIE DES HÔTES

## Hôte avec abonnement actif

Il peut normalement :

* consulter ses conversations ;
* répondre ;
* envoyer des messages ;
* gérer les échanges liés aux annonces ;
* traiter les demandes.

## Hôte sans abonnement

Après expiration :

* certaines notifications peuvent continuer à être reçues ;
* les fonctionnalités professionnelles sont limitées ;
* il doit renouveler son abonnement pour retrouver l'accès normal.

---

# 27. ANTI-CONTOURNEMENT DE LA MESSAGERIE

HouseZone doit pouvoir empêcher ou limiter le partage de coordonnées personnelles destiné à contourner la plateforme.

Le système doit rechercher notamment :

### Téléphones

Même lorsqu'ils sont écrits :

* normalement ;
* avec espaces ;
* avec tirets ;
* avec indicatif ;
* partiellement en lettres ;
* avec caractères intermédiaires.

### Emails

Détection des adresses électroniques.

### Réseaux sociaux

Exemples :

* WhatsApp ;
* Facebook ;
* Instagram ;
* TikTok ;
* Telegram ;
* Snapchat.

### Liens

Détection :

* URL ;
* liens courts ;
* liens externes ;
* liens de messagerie.

Lorsque le contenu enfreint les règles :

* le message peut être bloqué ;
* l'utilisateur reçoit une explication ;
* les événements suspects peuvent être enregistrés.

---

# 28. CONTRÔLE DES IMAGES

Les photos publiées doivent correspondre au bien immobilier.

Exemples autorisés :

* façade ;
* chambre ;
* salon ;
* cuisine ;
* terrasse ;
* terrain ;
* piscine ;
* appartement ;
* résidence.

Les images contenant volontairement des informations destinées à détourner les clients doivent pouvoir être refusées.

Exemples :

* numéro de téléphone ;
* adresse email ;
* URL ;
* identifiant de réseau social ;
* QR Code ;
* publicité externe.

---

# 29. OCR

Avant ou pendant la modération d'une image, un système OCR pourra analyser le texte présent dans celle-ci.

Parcours :

**Image → Analyse OCR → Détection → Validation ou signalement**

Lorsqu'une information interdite est détectée :

* image refusée automatiquement ou envoyée en vérification ;
* l'Hôte peut être invité à remplacer l'image.

---

# 30. MODÉRATION DES ANNONCES

Chaque annonce peut être soumise à plusieurs contrôles.

## Texte

Recherche de :

* coordonnées ;
* liens ;
* spam ;
* contenu interdit ;
* contenu non immobilier.

## Images

Contrôle :

* OCR ;
* contenu interdit ;
* éléments de contournement.

## Profil

Contrôle :

* identité ;
* statut ;
* niveau de vérification ;
* abonnement.

## Comportement

Analyse des actions considérées comme suspectes.

---

# 31. BADGE VÉRIFIÉ

HouseZone peut attribuer un badge de vérification.

Le badge signifie que l'Hôte a satisfait aux contrôles définis par la plateforme.

Il ne doit pas être automatiquement attribué uniquement parce qu'un utilisateur paie.

L'administration contrôle :

* attribution ;
* retrait ;
* suspension du badge.

---

# 32. SIGNALEMENTS

Chaque utilisateur peut signaler :

* arnaque ;
* faux bien ;
* faux propriétaire ;
* faux professionnel ;
* information mensongère ;
* comportement suspect ;
* harcèlement ;
* tentative de contournement ;
* contenu interdit.

Un signalement possède :

* auteur ;
* cible ;
* motif ;
* commentaire éventuel ;
* date ;
* statut.

Statuts possibles :

* nouveau ;
* en analyse ;
* traité ;
* rejeté ;
* action effectuée.

---

# 33. SYSTÈME ANTI-FRAUDE

HouseZone doit pouvoir attribuer différents niveaux de risque à certains comportements.

Exemple :

* faible ;
* à surveiller ;
* risqué ;
* critique.

Selon le risque, l'administration peut :

* demander une vérification supplémentaire ;
* bloquer une publication ;
* limiter un compte ;
* suspendre un compte ;
* bannir un utilisateur.

---

# 34. PAIEMENTS

HouseZone doit gérer les paiements nécessaires à son modèle économique.

Les moyens prévus sont notamment :

* Mobile Money ;
* carte bancaire.

Le fournisseur exact de paiement pourra être sélectionné séparément selon les solutions disponibles au Burkina Faso et les conditions commerciales applicables.

---

# 35. PAIEMENT DES ABONNEMENTS

Parcours simplifié :

**Choisir une formule → Choisir le moyen de paiement → Payer → Vérification serveur → Activation**

Une simple page indiquant « paiement réussi » ne doit pas suffire.

L'abonnement doit être activé uniquement après confirmation valide de la transaction.

---

# 36. MOBILE MONEY

Parcours :

**Abonnement → Mobile Money → Informations demandées → Paiement → Confirmation → Activation**

Le renouvellement peut être manuel selon les possibilités du prestataire.

---

# 37. CARTE BANCAIRE

Lorsque le fournisseur de paiement le permet, HouseZone pourra proposer le renouvellement automatique.

L'Hôte doit pouvoir :

* activer le renouvellement ;
* le désactiver ;
* consulter la prochaine échéance.

---

# 38. RAPPELS D'EXPIRATION

HouseZone peut prévenir l'Hôte avant la fin de son abonnement.

Exemple :

* J-7 ;
* J-3 ;
* J-1 ;
* jour d'expiration.

Les valeurs exactes pourront être configurables.

---

# 39. REÇUS DE PAIEMENT

Après un paiement confirmé, HouseZone doit pouvoir générer un reçu contenant :

* identité ou nom professionnel ;
* type d'Hôte ;
* abonnement ;
* montant ;
* moyen de paiement ;
* référence ;
* date ;
* statut ;
* échéance.

---

# 40. RÉSERVATION DE LOGEMENTS MEUBLÉS

Pour les résidences et appartements meublés autorisés, HouseZone pourra permettre une réservation directement depuis l'application.

Parcours :

**Choix du logement → Réservation → Paiement → Confirmation → Reçu**

Cette fonctionnalité ne s'applique qu'aux biens et catégories autorisés par HouseZone.

---

# 41. TRANSACTIONS IMMOBILIÈRES

La vente définitive ou le paiement complet d'un bien immobilier classique n'a pas vocation à être réalisé directement dans HouseZone V1.

La plateforme sert principalement à :

* découvrir ;
* rechercher ;
* communiquer ;
* organiser une visite ;
* mettre en relation ;
* gérer certains logements meublés autorisés.

---

# 42. NOTIFICATIONS

HouseZone doit posséder un système de notifications.

## Client

Notifications possibles :

* nouveau message ;
* visite acceptée ;
* visite reprogrammée ;
* visite refusée ;
* nouvelle information concernant une demande ;
* annonce correspondant éventuellement à un avis de recherche.

## Hôte

Notifications possibles :

* nouveau message ;
* nouvelle demande de visite ;
* nouveau favori ;
* annonce approuvée ;
* annonce refusée ;
* publication bloquée ;
* paiement confirmé ;
* abonnement bientôt expiré ;
* signalement important.

## Administrateur

Notifications possibles :

* nouvelle demande Hôte ;
* annonce suspecte ;
* signalement ;
* comportement suspect ;
* paiement nécessitant une vérification.

---

# 43. NOTIFICATIONS PUSH PWA

Lorsque l'utilisateur l'autorise et que son environnement le permet, HouseZone pourra envoyer des notifications Web Push.

L'utilisateur doit pouvoir :

* accepter les notifications ;
* les refuser ;
* désactiver ultérieurement l'autorisation.

Les notifications internes à HouseZone doivent continuer à exister indépendamment des notifications Push.

---

# 44. ESPACE HÔTE

L'Hôte possède son propre tableau de bord.

Il doit notamment accéder à :

### Dashboard

* statistiques ;
* activité récente ;
* abonnement ;
* notifications importantes.

### Mes annonces

* liste ;
* création ;
* modification ;
* statut ;
* disponibilité.

### Visites

* demandes ;
* confirmations ;
* reprogrammations ;
* historique.

### Messages

* conversations clients.

### Avis de recherche

* demandes accessibles.

### Abonnement

* formule ;
* expiration ;
* renouvellement ;
* paiement.

### Profil professionnel

* informations ;
* statut de vérification ;
* documents autorisés.

---

# 45. STATISTIQUES HÔTE

Un Hôte doit pouvoir consulter selon son offre :

* vues des annonces ;
* nombre de favoris ;
* nombre de messages ;
* nombre de demandes de visite ;
* annonces les plus performantes ;
* autres indicateurs pertinents.

Des statistiques plus avancées pourront être réservées au Premium.

---

# 46. PREMIUM

Une formule ou des options Premium pourront ajouter :

* publications supplémentaires ou illimitées ;
* mise en avant ;
* boost ;
* statistiques avancées ;
* meilleure visibilité.

Les règles exactes doivent pouvoir évoluer.

---

# 47. ADMINISTRATION HOUSEZONE

Un espace Administration séparé doit être disponible.

Il est réservé aux comptes autorisés.

---

# 48. DASHBOARD ADMINISTRATEUR

Le tableau de bord doit présenter des indicateurs tels que :

* nombre d'utilisateurs ;
* nombre d'Hôtes ;
* nouveaux comptes ;
* annonces ;
* annonces actives ;
* annonces bloquées ;
* abonnements actifs ;
* abonnements expirés ;
* paiements ;
* revenus ;
* demandes de vérification ;
* signalements ;
* statistiques générales.

---

# 49. GESTION DES UTILISATEURS

L'Admin peut :

* rechercher un utilisateur ;
* consulter son profil ;
* consulter son statut ;
* suspendre ;
* réactiver ;
* bannir lorsque nécessaire ;
* consulter certains historiques autorisés.

---

# 50. GESTION DES HÔTES

L'Admin peut :

* consulter les demandes ;
* examiner les informations ;
* consulter les documents autorisés ;
* accepter ;
* refuser ;
* suspendre ;
* réactiver ;
* retirer le statut ;
* gérer la vérification ;
* attribuer ou retirer le badge.

---

# 51. GESTION DES ANNONCES

L'administration doit pouvoir :

* voir toutes les annonces ;
* rechercher ;
* filtrer ;
* consulter ;
* approuver ;
* refuser ;
* désactiver ;
* bloquer ;
* restaurer lorsque cela est autorisé.

Une raison peut être enregistrée lors des actions de modération.

---

# 52. GESTION DES SIGNALEMENTS

L'Admin doit pouvoir :

* consulter les nouveaux signalements ;
* ouvrir le contenu concerné ;
* consulter le compte concerné ;
* enregistrer une décision ;
* fermer le signalement ;
* prendre une sanction lorsque nécessaire.

---

# 53. GESTION DES ABONNEMENTS

L'administration doit pouvoir :

* consulter les abonnements ;
* rechercher par utilisateur ;
* filtrer par statut ;
* consulter les échéances ;
* consulter l'historique ;
* gérer les offres ;
* modifier les tarifs autorisés.

---

# 54. GESTION DES PAIEMENTS

L'Admin doit pouvoir consulter :

* transaction ;
* utilisateur ;
* montant ;
* moyen de paiement ;
* référence ;
* date ;
* statut.

Statuts possibles :

* initié ;
* en attente ;
* réussi ;
* échoué ;
* annulé ;
* remboursé si cette possibilité existe.

---

# 55. JOURNAL D'AUDIT

Les opérations administratives sensibles doivent être enregistrées.

Pour chaque événement important :

* administrateur ;
* date/heure ;
* action ;
* élément concerné ;
* utilisateur concerné ;
* motif lorsque nécessaire.

Exemples :

* utilisateur suspendu ;
* annonce bloquée ;
* Hôte validé ;
* badge retiré ;
* changement d'abonnement.

---

# 56. SÉCURITÉ DES COMPTES

HouseZone doit prévoir :

* protection des sessions ;
* limitation des tentatives de connexion ;
* protection contre les attaques par force brute ;
* validation des autorisations ;
* contrôle des rôles ;
* journalisation des actions sensibles.

Pour les comptes administrateurs :

**authentification renforcée / 2FA obligatoire ou fortement imposée selon le mécanisme retenu.**

---

# 57. CONFIDENTIALITÉ DES DONNÉES

Les utilisateurs ne doivent accéder qu'aux données correspondant à leurs droits.

Exemples :

### Client

Ne doit pas accéder :

* aux documents privés d'un Hôte ;
* aux données administratives ;
* aux conversations des autres utilisateurs.

### Hôte

Ne doit pas accéder :

* aux données privées d'un autre Hôte ;
* aux informations administratives ;
* aux conversations qui ne le concernent pas.

### Administrateur

Accède uniquement aux données nécessaires selon ses autorisations administratives.

---

# 58. PROTECTION DES DOCUMENTS

Les documents d'identité doivent être stockés dans un espace privé.

Ils doivent :

* être protégés ;
* ne pas utiliser de lien public permanent ;
* être accessibles uniquement aux utilisateurs autorisés ;
* pouvoir être supprimés ou archivés suivant la politique retenue.

---

# 59. MULTILINGUE

L'architecture de l'application doit être préparée pour plusieurs langues.

Langue de départ recommandée :

**Français**

Le système pourra ensuite accueillir notamment :

* anglais ;
* espagnol ;
* portugais ;
* arabe ;
* italien ;
* russe ;
* chinois ;
* japonais ;
* hindi.

La V1 n'est pas obligée de traduire immédiatement toute l'application dans toutes ces langues.

L'objectif est surtout de ne pas empêcher l'ajout futur de nouvelles traductions.

---

# 60. NAVIGATION CLIENT

Sur mobile/PWA, la navigation principale peut être :

**Accueil | Recherche | Avis de recherche | Favoris | Profil**

D'autres éléments sont accessibles depuis les écrans concernés :

* messages ;
* notifications ;
* visites ;
* paramètres.

---

# 61. NAVIGATION HÔTE

Lorsque le statut Hôte est actif :

**Dashboard | Annonces | Avis de recherche | Messages | Profil**

avec accès également à :

* visites ;
* abonnement ;
* statistiques ;
* paiements.

---

# 62. ÉCRANS CLIENT

La V1 doit prévoir notamment :

1. Splash / lancement
2. Inscription
3. Connexion
4. Mot de passe oublié
5. Accueil
6. Recherche
7. Filtres
8. Résultats
9. Détails d'un bien
10. Galerie
11. Demande de visite
12. Mes visites
13. Favoris
14. Avis de recherche
15. Nouvel avis de recherche
16. Messages
17. Conversation
18. Notifications
19. Profil
20. Paramètres
21. Langue
22. Signalement

---

# 63. ÉCRANS HÔTE

23. Devenir Hôte
24. Choisir le statut
25. Formulaire professionnel
26. Documents
27. Vérification en cours
28. Dashboard Hôte
29. Mes annonces
30. Nouvelle annonce
31. Modifier une annonce
32. Statistiques
33. Demandes de visite
34. Messagerie
35. Profil professionnel
36. Abonnement
37. Paiement
38. Historique des paiements
39. Premium
40. Gestion de disponibilité

---

# 64. ÉCRANS ADMINISTRATION

41. Connexion Admin
42. Authentification renforcée
43. Dashboard
44. Utilisateurs
45. Hôtes
46. Vérifications
47. Annonces
48. Modération
49. Signalements
50. Paiements
51. Abonnements
52. Premium
53. Avis de recherche
54. Statistiques
55. Journal d'audit
56. Paramètres
57. Gestion des catégories
58. Gestion des langues

---

# 65. DONNÉES PRINCIPALES À GÉRER

Sans imposer ici le schéma technique définitif de la base de données, HouseZone devra gérer au minimum les informations relatives aux :

* utilisateurs ;
* profils ;
* profils Hôtes ;
* documents de vérification ;
* annonces ;
* images ;
* catégories ;
* villes ;
* quartiers ;
* caractéristiques immobilières ;
* favoris ;
* demandes de visite ;
* conversations ;
* messages ;
* avis de recherche ;
* abonnements ;
* offres ;
* paiements ;
* reçus ;
* notifications ;
* signalements ;
* vérifications ;
* sanctions ;
* journaux d'audit ;
* statistiques.

---

# 66. RÈGLES DE GESTION IMPORTANTES

### RG01

Tout utilisateur commence avec un compte Client.

### RG02

Un Client peut demander à devenir Hôte.

### RG03

Un Hôte doit satisfaire aux contrôles nécessaires avant de bénéficier de toutes les fonctionnalités professionnelles.

### RG04

Les fonctionnalités professionnelles payantes nécessitent un abonnement actif après l'essai gratuit.

### RG05

Les comptes Client restent gratuits.

### RG06

Seuls les Hôtes autorisés peuvent publier des biens.

### RG07

HouseZone n'accepte que des contenus en rapport avec l'immobilier.

### RG08

Une annonce indisponible ne doit plus apparaître dans les recherches publiques.

### RG09

Une demande de visite appartient à un client, à un bien et à son Hôte.

### RG10

Un utilisateur ne peut pas accéder à une conversation dont il n'est pas participant.

### RG11

Le partage de coordonnées interdites peut être bloqué.

### RG12

Les images peuvent être analysées avant publication.

### RG13

Les documents de vérification sont privés.

### RG14

Un badge vérifié correspond à une véritable validation.

### RG15

Un paiement doit être confirmé côté serveur avant d'activer un abonnement.

### RG16

Toute action administrative sensible doit être journalisée.

### RG17

Les droits d'accès dépendent du rôle et du statut de l'utilisateur.

### RG18

Un compte suspendu ou banni perd les fonctionnalités définies par la sanction.

---

# 67. PWA

HouseZone doit disposer d'un comportement PWA.

Elle doit notamment prévoir :

* manifest de l'application ;
* nom HouseZone ;
* icônes ;
* écran et couleurs adaptés ;
* installation sur écran d'accueil ;
* ouverture dans une interface dédiée ;
* service worker lorsque nécessaire ;
* gestion adaptée de la connexion ;
* notification Push lorsque compatible.

La PWA doit utiliser la même application et les mêmes données que la version Web.

---

# 68. RESPONSIVE DESIGN

HouseZone doit être conçue en priorité pour une utilisation mobile tout en restant parfaitement exploitable sur ordinateur.

Elle doit fonctionner sur :

* petits smartphones ;
* smartphones ;
* tablettes ;
* ordinateurs portables ;
* écrans desktop.

Aucune fonctionnalité essentielle ne doit nécessiter une application native.

---

# 69. UI/UX

L'interface doit être :

* moderne ;
* professionnelle ;
* premium ;
* très simple à comprendre ;
* orientée immobilier ;
* rassurante ;
* rapide à utiliser.

---

# 70. IDENTITÉ VISUELLE

## Couleurs principales

* Bleu marine : `#082B5C`
* Bleu vif : `#0066CC`
* Or : `#F4B400`
* Blanc : `#FFFFFF`
* Bleu clair : `#EAF4FF`
* Texte : `#10233F`

## Police

**Inter**

Déclinaisons :

* Regular ;
* Medium ;
* SemiBold ;
* Bold.

## Style

* beaucoup d'espace ;
* grandes photos immobilières ;
* cartes arrondies ;
* bleu dominant ;
* or utilisé principalement pour les éléments Premium ;
* boutons clairement identifiables ;
* interface mobile simple.

---

# 71. PERFORMANCE

L'application doit notamment chercher à garantir :

* chargement rapide ;
* images optimisées ;
* pagination ou chargement progressif ;
* recherche fluide ;
* navigation rapide ;
* interface adaptée aux connexions mobiles.

Les images immobilières ne doivent pas être chargées inutilement en résolution maximale.

---

# 72. SÉCURITÉ

Les principes suivants sont obligatoires :

* authentification sécurisée ;
* autorisation par rôle ;
* protection des données ;
* contrôle d'accès aux fichiers ;
* validation des données ;
* limitation des requêtes sensibles ;
* protection contre les opérations non autorisées ;
* séparation des données publiques et privées ;
* journalisation des actions critiques ;
* secrets et clés API jamais exposés inutilement côté navigateur.

---

# 73. TECHNOLOGIES À UTILISER

La stack souhaitée pour HouseZone est volontairement simple.

## Frontend et application Web

**Next.js**

Pour :

* interface Web ;
* pages ;
* espace Client ;
* espace Hôte ;
* administration ;
* PWA ;
* logique serveur Next.js lorsque nécessaire.

---

## Langage

**TypeScript**

Pour le développement de l'application.

---

## Interface

**Tailwind CSS**

Pour le design responsive.

---

## Backend principal

**Supabase**

Supabase sera utilisé principalement pour :

### PostgreSQL

Base de données de HouseZone.

### Supabase Auth

Authentification des utilisateurs.

### Supabase Storage

Stockage des :

* photos ;
* documents ;
* fichiers.

### Supabase Realtime

Fonctionnalités temps réel lorsque nécessaires, notamment pour la messagerie et certains événements.

### Supabase Row Level Security — RLS

Contrôle des droits d'accès aux données.

### Supabase Edge Functions

Logique backend spécifique lorsque nécessaire.

---

## Hébergement Web

**Vercel**

Pour déployer l'application Next.js.

---

## Cartographie

Une API cartographique adaptée, par exemple :

**Google Maps**

ou une alternative validée lors du développement.

---

## Paiement

Une passerelle compatible avec :

* Mobile Money ;
* carte bancaire.

Le fournisseur sera choisi séparément selon les disponibilités, coûts et conditions applicables.

---

## OCR

Une solution OCR compatible avec les besoins de HouseZone sera utilisée pour analyser les images.

Le fournisseur exact sera sélectionné lors de l'implémentation.

---

## Notifications

* notifications internes HouseZone ;
* **Web Push** pour la PWA lorsque compatible.

---

# 74. ARCHITECTURE SIMPLIFIÉE

```text
                       HOUSEZONE
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          CLIENT         HÔTE          ADMIN
             │             │             │
             └─────────────┼─────────────┘
                           │
                         Next.js
                           │
          ┌────────────────┼────────────────┐
          │                │                │
        Pages          API serveur         PWA
                           │
                        Supabase
                           │
        ┌─────────┬────────┼────────┬──────────┐
        │         │        │        │          │
     Postgres    Auth    Storage  Realtime    RLS
                           │
                    Services externes
                           │
             ┌─────────────┼─────────────┐
             │             │             │
         Paiement        Maps           OCR
```

---

# 75. PÉRIMÈTRE V1 / MVP

Pour éviter de créer une première version inutilement complexe, la priorité de HouseZone V1 doit être :

## Phase 1 — Fondations

* inscription ;
* connexion ;
* profils ;
* rôles ;
* sécurité ;
* base de données.

## Phase 2 — Marketplace

* accueil ;
* recherche ;
* filtres ;
* catégories ;
* annonces ;
* détails ;
* favoris.

## Phase 3 — Hôtes

* devenir Hôte ;
* vérification ;
* dashboard ;
* création d'annonces ;
* gestion des annonces.

## Phase 4 — Interaction

* messagerie ;
* demandes de visite ;
* notifications ;
* avis de recherche.

## Phase 5 — Monétisation

* abonnements ;
* paiement ;
* Mobile Money ;
* carte ;
* reçus ;
* expiration.

## Phase 6 — Sécurité et modération

* signalements ;
* anti-coordonnées ;
* OCR ;
* modération ;
* contrôles anti-fraude.

## Phase 7 — Premium

* boost ;
* publications supplémentaires ;
* statistiques avancées.

## Phase 8 — Administration

* utilisateurs ;
* Hôtes ;
* annonces ;
* vérifications ;
* signalements ;
* paiements ;
* statistiques ;
* audit.

---

# 76. FONCTIONNALITÉS POUVANT ÊTRE REPORTÉES APRÈS LA V1

Selon les délais et le budget, les fonctionnalités suivantes pourront évoluer après le lancement :

* traduction complète dans 10 langues ;
* moteur anti-fraude avancé ;
* analyse intelligente avancée des images ;
* recommandations personnalisées ;
* statistiques professionnelles avancées ;
* Premium très évolué ;
* système avancé de boost ;
* réservation plus complexe ;
* automatisations supplémentaires ;
* développement éventuel d'applications natives Android/iOS.

---

# 77. OBJECTIF FINAL DE LA V1

HouseZone V1 doit permettre un parcours complet.

## Parcours Client

**Ouverture de HouseZone → inscription → recherche → filtres → consultation d'un bien → favoris → contact → demande de visite → notifications**

## Parcours Hôte

**Compte Client → devenir Hôte → vérification → essai → abonnement → paiement → création d'annonce → publication → messages → visites → statistiques**

## Parcours Administrateur

**Connexion sécurisée → dashboard → vérification des Hôtes → contrôle des annonces → paiements → abonnements → signalements → modération → statistiques → audit**

---

# 78. PRINCIPE CENTRAL

HouseZone doit rester avant tout une plateforme immobilière.

Sa promesse fonctionnelle peut être résumée par :

# 🏠 Trouver. Vérifier. Visiter.

L'utilisateur vient sur HouseZone pour :

* trouver un bien ;
* publier un bien ;
* vérifier l'environnement dans lequel il échange ;
* organiser une visite ;
* communiquer ;
* réserver certains biens autorisés ;
* réaliser ses démarches immobilières dans un cadre organisé.

---

# 79. STACK FINALE HOUSEZONE V1

Pour résumer simplement :

**Next.js + TypeScript + Tailwind CSS + Supabase + Vercel**

Avec, lorsque nécessaire :

**API de paiement + API cartographique + OCR + Web Push**

Il n'est pas prévu d'utiliser Flutter ni Firebase pour HouseZone V1.

HouseZone sera une **application Web responsive installable en PWA**, avec une seule base applicative pour ordinateur, tablette et smartphone.

---

# 80. RÉSULTAT ATTENDU

À la fin du développement, HouseZone doit être une véritable plateforme immobilière exploitable permettant :

**Client :**
rechercher → comparer → enregistrer → contacter → visiter.

**Hôte :**
se faire vérifier → s'abonner → publier → gérer → échanger → analyser.

**HouseZone :**
contrôler → sécuriser → monétiser → modérer → administrer.

**Une seule plateforme. Une seule base applicative. Web + PWA.**