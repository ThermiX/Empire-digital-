import type { ArticleSource } from "./types";

export const ENTREPRENDRE_FINANCE: ArticleSource[] = [
  {
    slug: "separer-caisse-et-poche",
    title: "Commerçant, freelance : séparez la caisse de l’activité et votre poche",
    excerpt:
      "Le premier réflexe qui fait grandir une petite activité : ne plus mélanger l’argent de l’entreprise et l’argent du foyer. Mode d’emploi concret.",
    category: "entrepreneuriat",
    level: "Débutant",
    updatedAt: "2026-10-18",
    featured: true,
    takeaways: [
      "Le chiffre d’affaires n’est pas votre revenu : seul le bénéfice l’est.",
      "Versez-vous un salaire fixe depuis la caisse de l’activité.",
      "Utilisez deux comptes ou deux portefeuilles mobiles distincts.",
      "Notez chaque entrée et sortie, même petite, chaque jour.",
    ],
    blocks: [
      {
        type: "p",
        text: "Une boutique qui vend 50 000 FCFA par jour semble prospère. Pourtant, beaucoup d’activités ferment alors qu’elles vendent bien. La raison est souvent la même : le propriétaire puise dans la caisse pour ses besoins personnels, sans savoir ce que l’activité gagne réellement. Le stock n’est plus renouvelé, et l’activité s’épuise.",
      },
      { type: "h2", id: "ca-benefice", text: "Chiffre d’affaires, marge, bénéfice" },
      {
        type: "list",
        items: [
          "**Chiffre d’affaires** : l’ensemble de ce que vous encaissez.",
          "**Marge** : le chiffre d’affaires moins le coût d’achat de ce que vous avez vendu.",
          "**Bénéfice** : la marge moins toutes les autres charges (loyer de la boutique, transport, électricité, salaires, frais mobile money…).",
        ],
      },
      {
        type: "figures",
        title: "Exemple d’un mois de boutique",
        rows: [
          { label: "Ventes encaissées", value: "1 200 000 FCFA" },
          { label: "Coût des marchandises vendues", value: "− 780 000 FCFA" },
          { label: "Loyer, transport, électricité, frais", value: "− 210 000 FCFA" },
          { label: "Bénéfice réel du mois", value: "210 000 FCFA", emphasis: true },
        ],
        note: "Sur 1 200 000 FCFA de ventes, seuls 210 000 FCFA peuvent être utilisés sans fragiliser l’activité.",
      },
      { type: "h2", id: "salaire", text: "Versez-vous un salaire" },
      {
        type: "p",
        text: "Fixez-vous un **salaire mensuel**, inférieur à votre bénéfice moyen, et versez-le à date fixe depuis la caisse de l’activité vers votre compte personnel. Toute autre sortie personnelle est interdite. Ce qui reste dans la caisse sert à renouveler le stock, à faire face aux mois creux et à investir.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "La règle des trois parts",
        text: "Chaque mois, répartissez le bénéfice en trois : votre salaire, une réserve pour les mois difficiles, et un fonds de réinvestissement. Même avec 10 % pour la réserve, vous passerez les mois creux sans emprunter.",
      },
      { type: "h2", id: "outils", text: "Les outils les plus simples" },
      {
        type: "list",
        items: [
          "Deux comptes ou deux portefeuilles mobile money : un « activité », un « personnel ».",
          "Un cahier ou une application de caisse : date, libellé, entrée, sortie. Cinq minutes chaque soir.",
          "Une photo de chaque reçu fournisseur, classée par mois.",
          "Un point mensuel : ventes, bénéfice, état du stock, trésorerie disponible.",
        ],
      },
      {
        type: "p",
        text: "Cette discipline vous servira aussi le jour où vous solliciterez un microcrédit : une institution financière accorde plus facilement un prêt à une activité capable de montrer ses chiffres.",
      },
    ],
  },
  {
    slug: "lancer-activite-petit-budget",
    title: "Lancer une activité avec un petit budget : tester avant d’investir",
    excerpt:
      "Avant d’engager toutes vos économies, validez votre idée à petite échelle. Une méthode en quatre étapes pour limiter les risques.",
    category: "entrepreneuriat",
    level: "Intermédiaire",
    updatedAt: "2026-09-14",
    takeaways: [
      "Testez votre idée avec un premier lot de vente avant d’investir lourdement.",
      "N’engagez jamais votre fonds d’urgence dans un projet d’entreprise.",
      "Calculez votre prix à partir de vos coûts réels, pas du prix du voisin.",
      "Un microcrédit se rembourse avec le bénéfice, pas avec le chiffre d’affaires.",
    ],
    blocks: [
      {
        type: "p",
        text: "Restauration, couture, revente de vêtements, services numériques : les idées ne manquent pas. Ce qui fait la différence, c’est la manière de démarrer. Investir 1 000 000 FCFA d’un coup sur une idée non testée, c’est parier. Tester avec 100 000 FCFA, c’est apprendre.",
      },
      { type: "h2", id: "etape-1", text: "Étape 1 : un test grandeur nature" },
      {
        type: "p",
        text: "Proposez votre produit ou service à petite échelle : un premier lot vendu à votre entourage et sur les réseaux sociaux, quelques prestations à prix de lancement. L’objectif est de vérifier qu’il existe des clients prêts à **payer**, pas seulement à dire que l’idée est bonne.",
      },
      { type: "h2", id: "etape-2", text: "Étape 2 : calculer le vrai prix de revient" },
      {
        type: "p",
        text: "Additionnez tout ce que coûte une unité vendue : matière première, emballage, transport, commission de paiement mobile, et une part de vos charges fixes. Ajoutez ensuite votre marge. Si le prix obtenu est trop élevé pour votre marché, revoyez vos fournisseurs ou votre offre avant de vous lancer.",
      },
      {
        type: "figures",
        title: "Prix de revient d’un plat préparé (exemple)",
        rows: [
          { label: "Ingrédients", value: "650 FCFA" },
          { label: "Emballage", value: "150 FCFA" },
          { label: "Gaz et part des charges", value: "200 FCFA" },
          { label: "Coût de revient", value: "1 000 FCFA" },
          { label: "Prix de vente conseillé (marge 50 %)", value: "1 500 FCFA", emphasis: true },
        ],
      },
      { type: "h2", id: "etape-3", text: "Étape 3 : financer sans se mettre en danger" },
      {
        type: "list",
        items: [
          "Commencez avec une épargne dédiée au projet, distincte de votre fonds d’urgence.",
          "Une tontine bien organisée peut financer un premier équipement.",
          "Un microcrédit auprès d’une institution agréée peut accélérer, une fois le test réussi.",
          "Évitez les prêts informels à taux très élevés, qui absorbent tout le bénéfice.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Calculez le remboursement avant de signer",
        text: "Un microcrédit de 500 000 FCFA remboursé sur 10 mois avec intérêts peut représenter 55 000 à 60 000 FCFA par mois. Votre bénéfice mensuel doit couvrir largement cette somme, en plus de votre salaire.",
      },
      { type: "h2", id: "etape-4", text: "Étape 4 : grandir avec les chiffres" },
      {
        type: "p",
        text: "Une fois le test concluant, augmentez progressivement les volumes. Chaque mois, comparez ventes, bénéfice et trésorerie. Ce sont ces chiffres, et non l’intuition, qui doivent guider vos décisions d’embauche, d’équipement ou d’ouverture d’un deuxième point de vente.",
      },
    ],
  },
  {
    slug: "credit-taux-et-endettement",
    title: "Crédit : comprendre le vrai coût et le taux d’endettement",
    excerpt:
      "Prêt bancaire, microcrédit, avance sur salaire, crédit mobile : avant d’emprunter, apprenez à calculer ce que cela vous coûte vraiment.",
    category: "finance-personnelle",
    level: "Intermédiaire",
    updatedAt: "2026-10-08",
    takeaways: [
      "Comparez les crédits sur leur coût total, pas sur la mensualité.",
      "Vos remboursements ne devraient pas dépasser un tiers de vos revenus.",
      "Les petits crédits rapides sur mobile sont souvent les plus chers.",
      "Un crédit doit financer un projet utile, pas un train de vie.",
    ],
    blocks: [
      {
        type: "p",
        text: "Emprunter n’est ni bon ni mauvais en soi. Un crédit qui finance une moto pour travailler ou un équipement productif peut améliorer vos revenus. Un crédit qui finance une fête ou un téléphone dernier cri vous appauvrit. Dans tous les cas, il faut savoir combien il coûte réellement.",
      },
      { type: "h2", id: "cout-total", text: "Le coût total, seul vrai juge" },
      {
        type: "p",
        text: "Une mensualité faible peut cacher un crédit très cher, simplement parce qu’il dure longtemps. Pour comparer deux offres, calculez le **coût total** : la somme de toutes les mensualités, plus les frais de dossier et d’assurance, moins le montant emprunté.",
      },
      {
        type: "figures",
        title: "Deux offres pour emprunter 1 000 000 FCFA",
        rows: [
          { label: "Offre A : 12 mois × 92 000 FCFA", value: "Coût : 104 000 FCFA" },
          { label: "Offre B : 24 mois × 52 000 FCFA", value: "Coût : 248 000 FCFA", emphasis: true },
        ],
        note: "L’offre B semble plus confortable chaque mois, mais elle coûte plus du double. Montants indicatifs.",
      },
      { type: "h2", id: "endettement", text: "Le taux d’endettement" },
      {
        type: "p",
        text: "C’est la part de vos revenus consacrée aux remboursements. Les établissements financiers considèrent généralement qu’il ne doit pas dépasser **un tiers** du revenu net. Au-delà, le moindre imprévu peut provoquer un incident de paiement.",
      },
      {
        type: "callout",
        tone: "example",
        title: "Calcul rapide",
        text: "Avec un salaire net de 450 000 FCFA, vos remboursements mensuels cumulés (tous crédits confondus) ne devraient pas dépasser 150 000 FCFA.",
      },
      { type: "h2", id: "credits-rapides", text: "Attention aux crédits rapides" },
      {
        type: "p",
        text: "Les avances instantanées proposées par téléphone sont pratiques, mais leurs frais, exprimés sur quelques jours ou quelques semaines, représentent souvent un coût annuel très élevé. Utilisez-les exceptionnellement, et jamais pour rembourser un autre crédit.",
      },
      { type: "h2", id: "avant-signer", text: "Avant de signer : la check-list" },
      {
        type: "list",
        ordered: true,
        items: [
          "Le crédit finance-t-il quelque chose qui me rapporte ou m’est indispensable ?",
          "Ai-je comparé au moins deux offres sur leur coût total ?",
          "Mon taux d’endettement reste-t-il sous un tiers après ce crédit ?",
          "Que se passe-t-il si je rembourse en retard ou par anticipation ?",
          "Ai-je toujours un fonds d’urgence après cet engagement ?",
        ],
      },
    ],
  },
  {
    slug: "investir-a-la-brvm-premiers-pas",
    title: "Investir à la BRVM : les premiers pas, sans précipitation",
    excerpt:
      "La Bourse régionale des valeurs mobilières permet d’investir dans des entreprises de l’UEMOA. Comment ça marche, et quand est-on prêt à se lancer ?",
    category: "finance-personnelle",
    level: "Avancé",
    updatedAt: "2026-09-30",
    takeaways: [
      "N’investissez en Bourse qu’après avoir constitué votre fonds d’urgence.",
      "Investir en actions, c’est accepter des baisses parfois fortes.",
      "On passe par une société de gestion et d’intermédiation (SGI) agréée.",
      "Diversifier et investir régulièrement réduit le risque de mal tomber.",
    ],
    blocks: [
      {
        type: "p",
        text: "La BRVM, basée à Abidjan, est la Bourse commune aux huit pays de l’UEMOA. On y achète des actions (des parts d’entreprises) et des obligations (des prêts à des États ou à des entreprises). C’est un moyen de faire travailler son épargne sur le long terme, mais pas un raccourci vers la richesse.",
      },
      { type: "h2", id: "pret", text: "Êtes-vous prêt ? Les trois prérequis" },
      {
        type: "list",
        ordered: true,
        items: [
          "Un **fonds d’urgence** complet, placé à part.",
          "**Aucune dette coûteuse** en cours (crédits à la consommation, avances rapides).",
          "De l’argent dont vous n’aurez **pas besoin avant au moins cinq ans**.",
        ],
      },
      { type: "h2", id: "fonctionnement", text: "Comment investir concrètement" },
      {
        type: "p",
        text: "On ne peut pas acheter des actions directement : il faut ouvrir un compte-titres auprès d’une **SGI** (société de gestion et d’intermédiation) agréée par l’autorité de marché régionale. La SGI transmet vos ordres d’achat et de vente et conserve vos titres. Elle facture des frais : comparez-les avant de choisir.",
      },
      {
        type: "list",
        items: [
          "**Actions** : vous devenez copropriétaire d’une entreprise. Vous pouvez recevoir des dividendes, et la valeur de l’action fluctue.",
          "**Obligations** : vous prêtez de l’argent contre des intérêts réguliers. Généralement moins risqué que les actions, mais pas sans risque.",
          "**Fonds communs de placement (FCP)** : vous confiez votre argent à un gestionnaire qui le répartit sur plusieurs titres. Une porte d’entrée pratique pour diversifier.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Les performances passées ne garantissent rien",
        text: "Le cours d’une action peut baisser fortement et durablement. N’investissez jamais une somme dont la perte mettrait votre famille en difficulté, et méfiez-vous de quiconque vous promet un rendement garanti.",
      },
      { type: "h2", id: "strategie", text: "Une stratégie simple pour débuter" },
      {
        type: "p",
        text: "Plutôt que de chercher le « bon moment », investissez une petite somme fixe à intervalle régulier, par exemple chaque trimestre. Répartissez-la entre plusieurs entreprises de secteurs différents, ou passez par un fonds. Réinvestissez les dividendes et gardez votre plan au moins cinq ans.",
      },
      {
        type: "p",
        text: "Cet article a une vocation éducative : il ne constitue pas un conseil en investissement. Avant toute décision, renseignez-vous auprès d’un professionnel agréé.",
      },
    ],
  },
];
