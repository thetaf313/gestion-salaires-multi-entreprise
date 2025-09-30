# Cahier des charges – Application de Gestion des Salaires

## 1. Contexte et objectifs
De nombreuses petites et moyennes entreprises gèrent encore leurs salaires de manière manuelle (Excel, papier), ce qui entraîne des erreurs, un manque de suivi et des difficultés à générer des justificatifs fiables.  

L’objectif de ce projet est de développer une **application web de gestion des salaires multi-entreprises** permettant :  
- de gérer les **employés** avec différents types de contrats (journalier, salaire fixe, honoraire),  
- de générer des **cycles de paie (pay runs)** et des **bulletins de salaire** (payslips),  
- de suivre les **paiements partiels ou totaux** avec génération de **reçus PDF**,  
- d’offrir un **dashboard de suivi** (cartes, courbes),  
- de permettre la **gestion multi-entreprises** avec rôles utilisateurs (super-admin, admin, caissier).  
---

## 2. Périmètre du projet
### Inclus
- Gestion multi-entreprises  
- Gestion des employés  
- Gestion des cycles de paie (Pay Run)  
- Gestion des bulletins de paie (Payslip)  
- Gestion des paiements (versements partiels et totaux)  
- Génération de documents PDF (reçus, factures, liste des paiements, bulletins)  
- Dashboard (indicateurs clés, graphiques)  
- Filtrage avancé des employés (statut, poste, type de contrat, actif/inactif)  
- Rôles utilisateurs et permissions  
- Activation/désactivation d’employés (vacataires)  

### Hors périmètre (future évolution)
- Intégration bancaire automatisée  
- Déclarations sociales et fiscales  
- Gestion des congés et absences  
- Intégration mobile (application native)  

---

## 3. Acteurs et rôles
- **Super-Administrateur** : gère toutes les entreprises, crée et supprime des comptes entreprise.  
- **Administrateur (Entreprise)** : gère son entreprise, ses employés, lance les cycles de paie, approuve les bulletins.  
- **Caissier** : enregistre les paiements, génère les reçus et listes, consulte les bulletins.  
- **Employé (optionnel)** : peut recevoir ses bulletins par email ou espace personnel (phase 2).  

---

## 4. Fonctionnalités
### 4.1 Tableau de bord
- Affichage des KPI : masse salariale, montant payé, montant restant, nombre d’employés actifs.  
- Graphique de l’évolution de la masse salariale (6 derniers mois).  
- Liste des prochains paiements à effectuer.  

### 4.2 Gestion des entreprises
- Créer, modifier, supprimer une entreprise.  
- Paramètres : logo, adresse, devise, type de période (mensuelle/hebdo/journalière).  
- Ajouter des utilisateurs (admin, caissier).  

### 4.3 Gestion des employés
- Créer, modifier, supprimer un employé.  
- Champs : nom complet, poste, type de contrat (journalier, fixe, honoraire), taux/salaire, coordonnées bancaires.  
- Activer/désactiver un employé (vacataire en congé).  
- Filtrer les employés par statut, poste, contrat, actif/inactif.  

### 4.4 Cycles de paie (Pay Run)
- Créer un cycle (mensuel, hebdo, journalier).  
- Générer automatiquement les bulletins (payslips).  
- Pour les journaliers : saisir le nombre de jours travaillés.  
- Statuts : brouillon, approuvé, clôturé.  

### 4.5 Bulletins de paie (Payslip)
- Contenir : informations employé + entreprise, brut, déductions, net à payer.  
- Être modifiable tant que le cycle est en brouillon.  
- Être verrouillé après approbation du cycle.  
- Export PDF individuel ou en lot.  

### 4.6 Paiements
- Enregistrer un paiement total ou partiel.  
- Modes : espèces, virement bancaire, Orange Money, Wave, etc.  
- Génération automatique de **reçus PDF**.  
- Statut du bulletin : payé, partiel, en attente.  

### 4.7 Génération de documents
- **Reçu PDF** (après chaque paiement).  
- **Bulletin de paie PDF** (par employé ou en lot).  
- **Liste des paiements PDF** (par période).  
- **Liste des emargements PDF** (par période).  
- **Facture pro PDF** (optionnelle).  

### 4.8 Sécurité & permissions
- Authentification (email/mot de passe).  
- Rôles et autorisations strictes (RBAC).  
- Super-admin : multi-entreprise.  
- Admin : entreprise unique.  
- Caissier : entreprise unique (paiements uniquement).  

---

## 5. Contraintes techniques
- **Backend** : Nodejs.  
- **Frontend** : React + Tailwind CSS.  
- **Base de données** : MySQL.  
- **PDF** : vous etes libre.  
- **Sécurité** : Hashage des mots de passe.  

---

## 6. Livrables
- Cahier des charges validé.  
- Diagrammes UML (use case, classes, séquence).  
- Base de données (MCD, MLD, scripts migrations).  
- Application web fonctionnelle (MVP).  
- Documentation technique (API, installation).  
- Documentation utilisateur (guide d’utilisation).  

---

## 7. Planning (sprints agiles)
- **Sprint 0** : Setup projet, auth.  
- **Sprint 1** : Gestion des employés (+ filtres, activation/désactivation).  
- **Sprint 2** : Gestion des cycles de paie + bulletins.  
- **Sprint 3** : Gestion des paiements + PDF reçus.  
- **Sprint 4** : Dashboard KPI + graphiques.  
- **Sprint 5** : Tests, documentation, déploiement MVP.  

---

## 8. Indicateurs de succès
- L’entreprise peut gérer **100+ employés sans erreur**.  
- Génération des PDF **instantanée** (<2s par reçu).  
- Recherche et filtres employés **<1s**.  
- Dashboard en temps réel.  
- Satisfaction utilisateur (admins/caissiers) ≥ 90%.  
