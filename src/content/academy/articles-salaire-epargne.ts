import type { ArticleSource } from "./types";

export const SALAIRE_EPARGNE: ArticleSource[] = [
  {
    slug: "methode-des-enveloppes-salaire",
    title: "Le jour de paie : la méthode en 5 enveloppes pour ne plus finir le mois à découvert",
    excerpt:
      "La fin du mois commence souvent le 10. Voici une routine simple, à appliquer le jour même où votre salaire tombe, pour donner un rôle à chaque franc.",
    category: "salaire",
    level: "Débutant",
    updatedAt: "2026-10-12",
    featured: true,
    takeaways: [
      "Le jour de paie, répartissez immédiatement votre salaire en 5 enveloppes.",
      "L’épargne se prélève en premier, jamais avec « ce qui reste ».",
      "Un compte ou un portefeuille mobile séparé par enveloppe limite les tentations.",
      "Révisez vos enveloppes une fois par trimestre, pas chaque semaine.",
    ],
    blocks: [
      {
        type: "p",
        text: "Le salaire tombe, on règle le loyer, on rembourse un ami, on fait un gros marché… et dès le 10, le compte est déjà fatigué. Ce scénario n’est pas une question de revenu : il touche aussi bien les salaires de 150 000 FCFA que ceux de 1 500 000 FCFA. Le problème, c’est l’absence de plan **au moment précis** où l’argent arrive.",
      },
      { type: "h2", id: "principe", text: "Le principe : chaque franc a un rôle" },
      {
        type: "p",
        text: "La méthode des enveloppes est l’une des plus anciennes techniques de gestion. Nos parents la pratiquaient avec de vraies enveloppes en papier rangées dans une armoire. Aujourd’hui, on peut la reproduire avec plusieurs comptes, des sous-comptes de mobile money ou simplement un tableau. L’idée reste la même : **avant de dépenser, on décide où va chaque franc**.",
      },
      { type: "h2", id: "cinq-enveloppes", text: "Les 5 enveloppes à créer" },
      {
        type: "list",
        ordered: true,
        items: [
          "**Épargne** : prélevée en premier, dès réception du salaire. Visez 10 à 20 %.",
          "**Charges fixes** : loyer, électricité, eau, internet, scolarité, remboursements.",
          "**Vie courante** : marché, transport, crédit téléphonique. C’est l’enveloppe qui se dépense au quotidien.",
          "**Solidarité** : la part pour la famille, les cérémonies, les cotisations. Fixée à l’avance.",
          "**Plaisir** : sorties, habits, petits cadeaux. Une fois vide, on attend le mois suivant.",
        ],
      },
      {
        type: "figures",
        title: "Exemple pour un salaire net de 300 000 FCFA",
        rows: [
          { label: "Épargne (15 %)", value: "45 000 FCFA", emphasis: true },
          { label: "Charges fixes", value: "120 000 FCFA" },
          { label: "Vie courante", value: "75 000 FCFA" },
          { label: "Solidarité", value: "30 000 FCFA" },
          { label: "Plaisir", value: "30 000 FCFA" },
        ],
        note: "Total : 300 000 FCFA. Chaque franc est attribué avant d’être dépensé.",
      },
      { type: "h2", id: "routine", text: "La routine du jour de paie, en 20 minutes" },
      {
        type: "list",
        ordered: true,
        items: [
          "Vérifiez le montant net réellement reçu (et non le salaire brut du contrat).",
          "Transférez immédiatement l’enveloppe épargne vers un compte distinct.",
          "Payez ou provisionnez les charges fixes qui tombent dans le mois.",
          "Placez l’enveloppe vie courante sur le compte ou le portefeuille que vous utilisez au quotidien.",
          "Notez les montants des enveloppes solidarité et plaisir, et tenez-vous-y.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Astuce : divisez la vie courante par semaine",
        text: "Si votre enveloppe vie courante est de 80 000 FCFA, ne gardez que 20 000 FCFA disponibles chaque semaine. Vous verrez immédiatement si vous dépensez trop vite, au lieu de le découvrir le 25.",
      },
      { type: "h2", id: "imprevus", text: "Et quand un imprévu arrive ?" },
      {
        type: "p",
        text: "Un imprévu n’est pas une raison d’abandonner la méthode. Si une dépense sort du cadre, on la finance en **réduisant une autre enveloppe** (le plaisir, d’abord), jamais en vidant l’épargne sans réfléchir. Et si les imprévus se répètent chaque mois, ce ne sont plus des imprévus : ils doivent rejoindre vos charges fixes.",
      },
      {
        type: "quote",
        text: "Ce n’est pas ce que vous gagnez qui vous enrichit, c’est ce que vous décidez de garder.",
      },
      {
        type: "p",
        text: "Pour trouver vos propres montants, testez votre budget dans le simulateur Argent Clair : il calcule automatiquement votre reste disponible et vous indique si votre objectif d’épargne est réaliste.",
      },
    ],
  },
  {
    slug: "comprendre-sa-fiche-de-paie",
    title: "Brut, net, retenues : comprendre enfin sa fiche de paie",
    excerpt:
      "Pourquoi le salaire versé est-il inférieur au montant du contrat ? Décryptage des principales lignes d’un bulletin de paie dans l’espace UEMOA.",
    category: "salaire",
    level: "Débutant",
    updatedAt: "2026-09-28",
    takeaways: [
      "Votre budget se construit toujours à partir du salaire net réellement versé.",
      "Les cotisations sociales financent votre retraite et votre protection : vérifiez qu’elles sont déclarées.",
      "Conservez toutes vos fiches de paie : elles prouvent vos droits et vos revenus.",
    ],
    blocks: [
      {
        type: "p",
        text: "Beaucoup de jeunes salariés découvrent avec surprise que le montant reçu est inférieur à celui négocié. Ce n’est pas une erreur : entre le salaire brut et le salaire net, il y a des retenues obligatoires. Les comprendre permet de mieux négocier, de mieux planifier… et de vérifier que vos droits sont respectés.",
      },
      { type: "h2", id: "brut-net", text: "Salaire brut et salaire net" },
      {
        type: "p",
        text: "Le **salaire brut** est le montant total prévu par votre contrat, avant toute retenue. Le **salaire net** est ce que vous recevez réellement, après déduction des cotisations sociales et de l’impôt prélevé à la source lorsque votre pays l’applique. Pour votre budget, seul le net compte.",
      },
      { type: "h2", id: "lignes", text: "Les lignes que l’on retrouve souvent" },
      {
        type: "list",
        items: [
          "**Salaire de base** : la rémunération fixe liée à votre poste et à votre catégorie.",
          "**Primes et indemnités** : transport, logement, ancienneté, rendement. Certaines sont imposables, d’autres non.",
          "**Cotisations sociales** : versées à la caisse de sécurité sociale ou de retraite de votre pays (CNSS, CNPS, IPRES…). Elles financent votre pension et certaines prestations.",
          "**Impôt sur le salaire** : selon les pays, un impôt est retenu directement par l’employeur.",
          "**Avances et acomptes** : si vous avez demandé une avance sur salaire, elle est déduite ici.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Attention aux cotisations non déclarées",
        text: "Si votre employeur retient des cotisations mais ne les reverse pas, vous perdez des droits à la retraite. Demandez régulièrement votre relevé auprès de votre caisse de sécurité sociale.",
      },
      { type: "h2", id: "budget", text: "Ce que cela change pour votre budget" },
      {
        type: "p",
        text: "Une prime exceptionnelle n’est pas un revenu régulier : ne l’intégrez pas à votre budget mensuel. Utilisez-la plutôt pour accélérer un objectif (fonds d’urgence, remboursement d’une dette, projet). De même, si votre salaire varie selon les heures ou les commissions, construisez votre budget sur votre **mois le plus bas** des six derniers mois.",
      },
      {
        type: "figures",
        title: "Lecture rapide d’un bulletin (exemple simplifié)",
        rows: [
          { label: "Salaire brut", value: "420 000 FCFA" },
          { label: "Cotisations sociales salariales", value: "− 25 200 FCFA" },
          { label: "Impôt retenu à la source", value: "− 24 800 FCFA" },
          { label: "Salaire net versé", value: "370 000 FCFA", emphasis: true },
        ],
        note: "Les taux varient selon les pays et les tranches de revenus. Exemple fictif à visée pédagogique.",
      },
      {
        type: "p",
        text: "Gardez vos fiches de paie dans un dossier, papier ou numérique. Elles vous seront demandées pour un crédit, une location, un visa ou pour faire valoir vos droits en cas de litige.",
      },
    ],
  },
  {
    slug: "fonds-urgence-premier-objectif",
    title: "Le fonds d’urgence : votre premier objectif d’épargne",
    excerpt:
      "Panne, maladie, perte d’emploi : un matelas de sécurité vous évite de vous endetter au pire moment. Combien mettre de côté, et où le placer ?",
    category: "epargne",
    level: "Débutant",
    updatedAt: "2026-10-20",
    featured: true,
    takeaways: [
      "Visez 3 à 6 mois de dépenses essentielles.",
      "Commencez par un premier palier d’un mois : c’est déjà une protection réelle.",
      "Placez ce fonds sur un support séparé, disponible rapidement, et sans risque.",
      "Le fonds d’urgence n’est pas fait pour les opportunités ni pour les fêtes.",
    ],
    blocks: [
      {
        type: "p",
        text: "Sans réserve, le moindre imprévu se transforme en crise : on emprunte à un collègue, on demande une avance, on vend un bien à perte. Le fonds d’urgence est une somme mise de côté **uniquement** pour faire face aux coups durs. C’est la première brique de toute stratégie financière, avant même d’investir.",
      },
      { type: "h2", id: "combien", text: "Combien faut-il mettre de côté ?" },
      {
        type: "p",
        text: "La règle courante : **3 à 6 mois de dépenses essentielles**. Les dépenses essentielles, ce sont les besoins : logement, alimentation, transport, factures, santé, scolarité, remboursements. Pas les sorties ni les achats plaisir.",
      },
      {
        type: "figures",
        title: "Exemple : dépenses essentielles de 200 000 FCFA par mois",
        rows: [
          { label: "Palier 1 — 1 mois", value: "200 000 FCFA" },
          { label: "Palier 2 — 3 mois", value: "600 000 FCFA", emphasis: true },
          { label: "Palier 3 — 6 mois", value: "1 200 000 FCFA" },
        ],
        note: "Si vos revenus sont irréguliers (commerce, freelance), visez plutôt le palier 3.",
      },
      { type: "h2", id: "ou-placer", text: "Où placer son fonds d’urgence ?" },
      {
        type: "list",
        items: [
          "**Un compte d’épargne bancaire** ou de microfinance (SFD agréé), distinct du compte courant.",
          "**Un portefeuille mobile dédié**, utilisé uniquement pour l’épargne, si vous n’avez pas de compte bancaire.",
          "Évitez de garder des sommes importantes en espèces à la maison : risque de vol, de perte, et tentation permanente.",
          "Évitez les placements bloqués ou risqués (actions, cryptomonnaies, terrains) : l’argent doit rester disponible en quelques jours.",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Le bon réflexe : un nom qui protège",
        text: "Si votre application le permet, renommez le compte « Urgence — ne pas toucher ». Cela paraît anodin, mais nommer un compte réduit fortement l’envie de l’utiliser pour autre chose.",
      },
      { type: "h2", id: "construire", text: "Le construire sans se priver de tout" },
      {
        type: "p",
        text: "Inutile d’attendre d’avoir un gros montant. Programmez un virement automatique dès réception du salaire, même modeste : 10 000 FCFA par mois représentent 120 000 FCFA en un an. Ajoutez-y une partie de chaque prime, du 13e mois ou des cadeaux reçus.",
      },
      { type: "h2", id: "utiliser", text: "Quand l’utiliser (et quand ne pas le faire)" },
      {
        type: "p",
        text: "Une urgence est **imprévue, nécessaire et urgente** : une hospitalisation, une réparation indispensable de votre outil de travail, une perte de revenu. Une fête, une promotion sur un téléphone ou une « opportunité » d’investissement ne sont pas des urgences. Après chaque utilisation, la priorité est de reconstituer le fonds.",
      },
    ],
  },
  {
    slug: "tontine-avantages-et-pieges",
    title: "Tontines : comment profiter de l’épargne collective sans se faire piéger",
    excerpt:
      "La tontine est l’un des outils d’épargne les plus puissants d’Afrique de l’Ouest. Bien choisie, elle discipline. Mal encadrée, elle peut coûter cher.",
    category: "epargne",
    level: "Intermédiaire",
    updatedAt: "2026-10-05",
    takeaways: [
      "La tontine apporte discipline et accès rapide à une somme importante.",
      "Elle ne rapporte pas d’intérêts : c’est un outil de discipline, pas de placement.",
      "Ne rejoignez qu’un groupe de personnes connues, avec des règles écrites.",
      "Ne cotisez jamais plus que ce que votre budget peut supporter chaque mois.",
    ],
    blocks: [
      {
        type: "p",
        text: "Chaque membre verse une cotisation fixe à intervalle régulier, et à chaque tour, un membre reçoit la totalité de la cagnotte. Simple, sociale, sans banque : la tontine permet de rassembler en une fois une somme qu’il aurait été difficile d’économiser seul.",
      },
      { type: "h2", id: "pourquoi", text: "Pourquoi la tontine fonctionne si bien" },
      {
        type: "list",
        items: [
          "**La pression sociale** remplace la volonté individuelle : on ne veut pas décevoir le groupe.",
          "**L’accès rapide** à une somme importante, utile pour un équipement, un stock ou un loyer d’avance.",
          "**Aucun frais** dans la plupart des tontines entre proches.",
        ],
      },
      {
        type: "figures",
        title: "Exemple : 10 membres, 20 000 FCFA par mois",
        rows: [
          { label: "Cotisation mensuelle", value: "20 000 FCFA" },
          { label: "Cagnotte versée à chaque tour", value: "200 000 FCFA", emphasis: true },
          { label: "Total cotisé sur 10 mois", value: "200 000 FCFA" },
        ],
        note: "Celui qui reçoit en premier bénéficie d’une avance sans intérêts ; le dernier a simplement épargné.",
      },
      { type: "h2", id: "limites", text: "Les limites à connaître" },
      {
        type: "p",
        text: "La tontine ne fait pas fructifier votre argent : vous récupérez exactement ce que vous avez versé. Avec l’inflation, le dernier bénéficiaire perd même un peu de pouvoir d’achat. Surtout, le risque principal est humain : un membre qui disparaît après avoir touché la cagnotte.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Méfiez-vous des « tontines » qui promettent des gains",
        text: "Une tontine classique ne rapporte rien de plus que les cotisations. Si quelqu’un vous promet de doubler votre mise en recrutant de nouveaux membres, il s’agit d’une pyramide financière : les derniers entrés perdent tout.",
      },
      { type: "h2", id: "regles", text: "Les règles d’une tontine saine" },
      {
        type: "list",
        ordered: true,
        items: [
          "Des membres que vous connaissez personnellement, idéalement liés par le travail, le quartier ou la famille.",
          "Des règles écrites : montant, calendrier, ordre de passage, sanctions en cas de retard.",
          "Un ou une trésorière de confiance, et un registre des versements partagé (un simple groupe de messagerie avec captures des transferts suffit).",
          "Une cotisation compatible avec votre budget, même lors d’un mois difficile.",
        ],
      },
      {
        type: "p",
        text: "Utilisée intelligemment, la tontine est un excellent complément à votre épargne personnelle. Elle ne la remplace pas : gardez toujours un fonds d’urgence à vous, disponible sans attendre votre tour.",
      },
    ],
  },
];
