import type { ArticleSource } from "./types";

export const ERREURS: ArticleSource[] = [
  {
    slug: "sept-erreurs-premier-salaire",
    title: "Les 7 erreurs les plus fréquentes avec un premier salaire",
    excerpt:
      "Le premier salaire donne un sentiment de liberté… qui peut vite se transformer en piège. Les erreurs à éviter dès le premier mois.",
    category: "erreurs",
    level: "Débutant",
    updatedAt: "2026-10-25",
    featured: true,
    takeaways: [
      "Fixez votre budget avant le premier virement, pas après.",
      "Augmentez votre épargne en même temps que votre salaire.",
      "Ne laissez pas les attentes des autres décider de votre budget.",
      "Évitez tout crédit pendant les six premiers mois d’emploi.",
    ],
    blocks: [
      {
        type: "p",
        text: "Le premier salaire est un moment fort. Mais c’est aussi le moment où se prennent des habitudes qui dureront des années. Voici les sept erreurs que nous voyons le plus souvent, et comment les éviter.",
      },
      { type: "h2", id: "erreur-1", text: "1. Dépenser avant d’avoir fait un budget" },
      {
        type: "p",
        text: "Sans plan, l’argent part vers ce qui est le plus visible : sorties, vêtements, gadgets. Prenez une heure avant même de recevoir votre premier salaire pour estimer vos dépenses fixes et votre objectif d’épargne.",
      },
      { type: "h2", id: "erreur-2", text: "2. Gonfler son train de vie trop vite" },
      {
        type: "p",
        text: "Un appartement plus cher, une voiture, un nouveau téléphone : chaque engagement permanent réduit votre marge pour des années. Attendez six mois de stabilité avant d’augmenter vos charges fixes.",
      },
      { type: "h2", id: "erreur-3", text: "3. Épargner « ce qui reste »" },
      {
        type: "p",
        text: "À la fin du mois, il ne reste presque jamais rien. L’épargne doit être prélevée **le jour de la paie**, avant toute autre dépense.",
      },
      { type: "h2", id: "erreur-4", text: "4. Dire oui à toutes les demandes" },
      {
        type: "p",
        text: "Soutenir sa famille est une valeur forte et respectable. Mais sans limite claire, la solidarité peut empêcher de construire quoi que ce soit. Fixez une enveloppe mensuelle dédiée, et expliquez-la avec bienveillance : vous pourrez aider plus longtemps si vous restez solide.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Une phrase qui aide",
        text: "« Ce mois-ci, mon enveloppe pour la famille est de 30 000 FCFA. Je peux t’aider à hauteur de 10 000. » Annoncer un cadre est plus facile que de refuser.",
      },
      { type: "h2", id: "erreur-5", text: "5. Emprunter dès le premier contrat" },
      {
        type: "p",
        text: "Avec un contrat de travail, les offres de crédit arrivent vite. Pendant les premiers mois, vous ne connaissez pas encore vos vraies dépenses : un crédit à ce stade est un risque.",
      },
      { type: "h2", id: "erreur-6", text: "6. Ne pas suivre ses petites dépenses" },
      {
        type: "p",
        text: "Le crédit téléphonique, les petits achats de rue, les frais de transfert : pris un par un, ils semblent insignifiants. Cumulés, ils dépassent souvent 15 % du budget. Notez-les pendant un mois : le résultat surprend toujours.",
      },
      { type: "h2", id: "erreur-7", text: "7. Remettre la protection à plus tard" },
      {
        type: "p",
        text: "Sans fonds d’urgence ni couverture santé, un accident ou une maladie peut effacer des mois d’efforts. Commencez votre fonds d’urgence dès le premier mois, même avec une petite somme, et renseignez-vous sur la mutuelle proposée par votre employeur.",
      },
    ],
  },
  {
    slug: "arnaques-financieres-reconnaitre",
    title: "Arnaques financières : 6 signaux d’alerte pour protéger votre argent",
    excerpt:
      "Faux placements, pyramides, faux agents de mobile money : les escroqueries évoluent, mais leurs signaux restent les mêmes. Apprenez à les reconnaître.",
    category: "erreurs",
    level: "Débutant",
    updatedAt: "2026-10-28",
    takeaways: [
      "Un rendement élevé et garanti est le premier signe d’une arnaque.",
      "Ne communiquez jamais votre code secret ou un code reçu par SMS.",
      "Vérifiez l’agrément de toute structure qui collecte votre épargne.",
      "L’urgence et le secret sont des techniques de manipulation.",
    ],
    blocks: [
      {
        type: "p",
        text: "Chaque année, des milliers de personnes perdent leurs économies dans des placements miracles, des pyramides déguisées en « business » ou des arnaques par téléphone. Les escrocs sont souvent convaincants, et parfois ce sont des proches qui, eux-mêmes trompés, vous recrutent.",
      },
      { type: "h2", id: "signal-1", text: "1. Un rendement trop beau pour être vrai" },
      {
        type: "p",
        text: "« Doublez votre mise en 30 jours », « 20 % par mois garantis » : aucun placement honnête ne peut promettre cela. Plus le rendement promis est élevé et « sûr », plus le risque de perdre tout est grand.",
      },
      { type: "h2", id: "signal-2", text: "2. Gagner en recrutant d’autres personnes" },
      {
        type: "p",
        text: "Si l’essentiel des gains vient du parrainage de nouveaux membres plutôt que de la vente d’un vrai produit, il s’agit d’un système pyramidal. Il s’effondre toujours, et ce sont les derniers entrés qui perdent leur argent.",
      },
      { type: "h2", id: "signal-3", text: "3. On vous demande votre code secret" },
      {
        type: "p",
        text: "Aucun opérateur, aucune banque, aucun agent ne vous demandera votre code PIN ou un code reçu par SMS. Un appel d’un faux service client qui annonce une « erreur de transfert » est une technique très répandue.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "L’arnaque au faux transfert",
        text: "Vous recevez un SMS imitant une notification de dépôt, puis un appel : « Je me suis trompé de numéro, renvoyez-moi l’argent ». Vérifiez toujours votre solde réel dans l’application ou via le code officiel avant de renvoyer quoi que ce soit.",
      },
      { type: "h2", id: "signal-4", text: "4. L’urgence et la pression" },
      {
        type: "p",
        text: "« L’offre se termine ce soir », « il ne reste que deux places » : la pression empêche de réfléchir et de demander conseil. Une vraie opportunité supporte un délai de réflexion.",
      },
      { type: "h2", id: "signal-5", text: "5. Une structure introuvable ou non agréée" },
      {
        type: "p",
        text: "Toute entité qui collecte l’épargne du public doit être autorisée. Dans l’UEMOA, les banques et institutions de microfinance relèvent de la BCEAO et des ministères des finances ; les intermédiaires boursiers de l’autorité régionale des marchés financiers. Vérifiez sur les listes officielles avant de confier votre argent.",
      },
      { type: "h2", id: "signal-6", text: "6. Le secret" },
      {
        type: "p",
        text: "« N’en parle pas à ta famille, ils ne comprendront pas. » Celui qui vous demande de garder le secret cherche à vous isoler des personnes qui pourraient vous alerter.",
      },
      { type: "h2", id: "victime", text: "Si vous pensez être victime" },
      {
        type: "list",
        ordered: true,
        items: [
          "Cessez immédiatement tout versement, même si l’on vous promet de « débloquer » vos gains.",
          "Contactez votre opérateur ou votre banque par les canaux officiels pour bloquer ce qui peut l’être.",
          "Conservez toutes les preuves : messages, reçus, numéros.",
          "Déposez plainte auprès de la police ou de la gendarmerie, et prévenez votre entourage.",
        ],
      },
    ],
  },
];
