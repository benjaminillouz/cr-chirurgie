# CR Chirurgie - Compte Rendu Opératoire

Application de création de comptes rendus opératoires pour la chirurgie orale et l'implantologie.

## Fonctionnalités

- Formulaire multi-étapes avec navigation intuitive
- Support des types d'interventions :
  - Implantologie
  - Chirurgie Pré Implantaire
  - Avulsions
  - Freinectomies
  - Mini Vis
- Sélection interactive des dents (notation FDI)
- Upload de fichiers (radiographies, traçabilité)
- Pré-remplissage via paramètres URL

## Paramètres URL

L'application accepte les paramètres URL suivants pour pré-remplir les informations :

| Paramètre | Description |
|-----------|-------------|
| `patientName` | Nom du patient |
| `patientSurname` | Prénom du patient |
| `idPraticien` | ID du praticien |
| `idCentre` | ID du centre |
| `idPatient` | ID du patient |
| `centre` | Nom de l'établissement |
| `patientMail` | Email du patient |
| `praticien` | Nom du praticien |

Exemple :
```
https://cr-chirurgie.cemedis.app/?patientName=DUPONT&patientSurname=Jean&praticien=Docteur+MARTIN
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
```

## Technologies

- React 18
- Vite
- Tailwind CSS 4
- Thème personnalisé Cemedis
