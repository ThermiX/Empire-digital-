// =============================================================
//  public/js/app.js — Petits plus dans le navigateur.
//  L'app fonctionne sans ce fichier ; il ajoute :
//   1. la déconnexion automatique (avec alerte 60 s avant)
//   2. les confirmations avant une action importante
//   3. l'anti double-clic sur les formulaires
//   4. afficher / cacher le mot de passe
//   5. les lignes de champs des gabarits (ajouter / retirer)
//   6. le montant pré-rempli selon l'offre (paiements)
//   7. les bulles du graphique (toucher une colonne)
//   8. WhatsApp : noter l'envoi, partager le fichier, copier le lien
//   9. l'aperçu des images choisies et du message WhatsApp
// =============================================================
(() => {
  'use strict';

  const $ = (selecteur, racine = document) => racine.querySelector(selecteur);
  const $$ = (selecteur, racine = document) => [...racine.querySelectorAll(selecteur)];
  const jetonCsrf = $('meta[name="csrf"]')?.content || '';

  /** Appel POST discret au serveur (avec le jeton anti-CSRF) */
  function appeler(url) {
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'X-CSRF-Token': jetonCsrf, Accept: 'application/json' },
    });
  }

  /** Change le texte d'un bouton sans effacer son icône */
  function texteBouton(bouton, texte) {
    const noeud = [...bouton.childNodes].reverse().find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (noeud) noeud.textContent = texte;
    else bouton.append(texte);
  }

  // ---------- 1. Déconnexion automatique ----------
  const delai = Number(document.body.dataset.inactivite || 0);
  if (delai > 0) {
    const ALERTE_AVANT_MS = Math.min(60_000, delai / 3); // 60 s avant (moins si le délai est très court)
    const PING_TOUTES_MS = 60_000;
    const alerte = $('#alerte-session');
    const secondes = $('#alerte-secondes');
    let derniereActivite = Date.now(); // le serveur a compté le chargement de la page
    let dernierPing = Date.now();
    let termine = false;

    const deconnecter = () => {
      if (termine) return;
      termine = true;
      $('#form-deconnexion')?.submit();
    };

    // Prévient le serveur que l'admin est toujours là
    const prolonger = () => {
      dernierPing = Date.now();
      appeler('/ping')
        .then((r) => {
          if (r.ok) {
            derniereActivite = Date.now();
            alerte.hidden = true;
          } else if (r.status === 401) {
            location.href = '/connexion?raison=inactivite';
          }
        })
        .catch(() => {});
    };

    const verifier = () => {
      if (termine) return;
      const reste = delai - (Date.now() - derniereActivite);
      if (reste <= 0) return deconnecter();
      if (reste <= ALERTE_AVANT_MS) {
        secondes.textContent = String(Math.ceil(reste / 1000));
        alerte.hidden = false;
      } else {
        alerte.hidden = true;
      }
    };

    // Toucher l'écran ou taper au clavier = activité (1 appel par minute maximum)
    for (const type of ['pointerdown', 'keydown']) {
      document.addEventListener(
        type,
        () => {
          const reste = delai - (Date.now() - derniereActivite);
          if (!termine && reste > 0 && Date.now() - dernierPing > PING_TOUTES_MS) prolonger();
        },
        { passive: true },
      );
    }
    $('#rester-connecte')?.addEventListener('click', prolonger);
    setInterval(verifier, 1000);
    document.addEventListener('visibilitychange', verifier); // retour sur l'onglet après une pause
  }

  // ---------- 2 & 3. Confirmations + anti double-clic ----------
  document.addEventListener('submit', (evenement) => {
    const formulaire = evenement.target;
    if (formulaire.dataset.confirmer && !window.confirm(formulaire.dataset.confirmer)) {
      evenement.preventDefault();
      return;
    }
    const bouton = evenement.submitter || $('[type="submit"]', formulaire);
    if (!bouton) return;
    // Désactivé juste après l'envoi (sinon le navigateur annulerait l'envoi)
    setTimeout(() => {
      bouton.disabled = true;
      bouton.dataset.desactive = '1';
      if (bouton.dataset.texteEnvoi) texteBouton(bouton, bouton.dataset.texteEnvoi);
    }, 0);
  });
  // Retour arrière du navigateur : on réactive les boutons
  window.addEventListener('pageshow', () => {
    $$('[data-desactive]').forEach((b) => {
      b.disabled = false;
      delete b.dataset.desactive;
    });
  });

  // ---------- 4. Voir le mot de passe ----------
  $$('[data-voir-mdp]').forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const champ = document.getElementById(bouton.dataset.voirMdp);
      const visible = champ.type === 'text';
      champ.type = visible ? 'password' : 'text';
      bouton.textContent = visible ? 'Voir' : 'Cacher';
    });
  });

  // ---------- 5. Champs d'un gabarit ----------
  const listeChamps = $('#champs-gabarit');
  const modeleChamp = $('#modele-champ');
  if (listeChamps && modeleChamp) {
    $('#ajouter-champ')?.addEventListener('click', () => {
      const ligne = modeleChamp.content.firstElementChild.cloneNode(true);
      listeChamps.append(ligne);
      $('input', ligne).focus();
    });
    listeChamps.addEventListener('click', (evenement) => {
      const bouton = evenement.target.closest('.retirer-champ');
      if (bouton) bouton.closest('.ligne-champ').remove();
    });
  }

  // ---------- 6. Montant pré-rempli selon l'offre ----------
  $$('[data-remplir-montant]').forEach((liste) => {
    const champ = document.getElementById(liste.dataset.remplirMontant);
    const remplir = (forcer) => {
      const prix = liste.selectedOptions[0]?.dataset.prix;
      if (prix && (forcer || !champ.value)) champ.value = prix.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };
    liste.addEventListener('change', () => remplir(true));
    remplir(false);
  });

  // ---------- 7. Bulles du graphique ----------
  $$('[data-graph]').forEach((graphique) => {
    const bulle = $('.graph-bulle', graphique);
    const trace = $('.graph-trace', graphique);
    // Courbe uniquement : repère vertical + point sur la courbe
    const repere = $('.graph-repere', graphique);
    const point = $('.graph-point', graphique);
    const colonnes = $$('.colonne', graphique);
    // Colonne mise en avant au repos : aujourd'hui (data-defaut) ou la dernière
    const parDefaut = $('.colonne[data-defaut]', graphique) || colonnes[colonnes.length - 1];
    let active = null;

    // Centre horizontal d'une colonne, en pixels dans la zone du graphique
    const centre = (colonne) => {
      const zone = $('.zone', colonne).getBoundingClientRect();
      return zone.left + zone.width / 2 - trace.getBoundingClientRect().left;
    };
    // Place le point sur la courbe (la courbe va de 0 en bas à 1 en haut)
    const placerPoint = (colonne) => {
      if (!point || !colonne) return;
      if (colonne.dataset.proportion === undefined) {
        point.hidden = true; // jour à venir : pas de valeur sur la courbe
        return;
      }
      point.style.left = `${centre(colonne)}px`;
      point.style.top = `${trace.offsetHeight * (1 - Number(colonne.dataset.proportion || 0))}px`;
      point.hidden = false;
    };

    const montrer = (colonne) => {
      if (!colonne || colonne === active) return;
      active?.classList.remove('survol');
      active = colonne;
      colonne.classList.add('survol');
      // textContent : jamais de HTML injecté
      const valeur = document.createElement('strong');
      valeur.textContent = colonne.dataset.texte;
      const jour = document.createElement('span');
      jour.textContent = colonne.dataset.libelle;
      bulle.replaceChildren(valeur, jour);
      if (colonne.dataset.extra) {
        // 3e ligne facultative (ex. : valeur du mois précédent)
        const extra = document.createElement('span');
        extra.textContent = colonne.dataset.extra;
        bulle.append(extra);
      }
      bulle.hidden = false;
      const demi = bulle.offsetWidth / 2;
      const x = centre(colonne);
      bulle.style.left = `${Math.max(demi, Math.min(trace.offsetWidth - demi, x))}px`;
      if (repere) {
        repere.style.left = `${x}px`;
        repere.hidden = false;
      }
      placerPoint(colonne);
    };
    const cacher = () => {
      active?.classList.remove('survol');
      active = null;
      bulle.hidden = true;
      if (repere) repere.hidden = true;
      placerPoint(parDefaut); // le point revient sur aujourd'hui
    };
    // Au chargement (et si l'écran tourne) : point sur la valeur du jour
    placerPoint(parDefaut);
    window.addEventListener('resize', () => placerPoint(active || parDefaut));

    $$('.colonne', graphique).forEach((colonne) => {
      colonne.addEventListener('focus', () => montrer(colonne));
      colonne.addEventListener('blur', cacher);
    });
    // Souris ou doigt qui glisse : on suit la colonne sous le pointeur
    trace.addEventListener('pointermove', (e) => montrer(document.elementFromPoint(e.clientX, e.clientY)?.closest('.colonne')));
    trace.addEventListener('pointerdown', (e) => montrer(document.elementFromPoint(e.clientX, e.clientY)?.closest('.colonne')));
    trace.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') cacher();
    });
    document.addEventListener('pointerdown', (e) => {
      if (!graphique.contains(e.target)) cacher();
    });
  });

  // ---------- 8. WhatsApp ----------
  // a) Noter l'envoi quand on ouvre WhatsApp
  $$('[data-noter-envoi]').forEach((lien) => {
    lien.addEventListener('click', () => {
      appeler(lien.dataset.noterEnvoi)
        .then((r) => r.json())
        .then((donnees) => {
          const cellule = $('[data-dernier-envoi]');
          if (donnees.ok && cellule) cellule.textContent = "À l'instant";
        })
        .catch(() => {});
    });
  });

  // b) Partager le fichier vidéo (téléphone : choisir WhatsApp puis le contact)
  $$('[data-partager-video]').forEach((bouton) => {
    let fichier = null;
    try {
      const test = new File([''], 'test.mp4', { type: 'video/mp4' });
      if (!navigator.canShare || !navigator.canShare({ files: [test] })) return;
    } catch {
      return;
    }
    bouton.hidden = false;
    bouton.addEventListener('click', async () => {
      bouton.disabled = true;
      try {
        if (!fichier) {
          texteBouton(bouton, 'Préparation…');
          const reponse = await fetch(bouton.dataset.partagerVideo, { credentials: 'same-origin' });
          const blob = await reponse.blob();
          fichier = new File([blob], bouton.dataset.nomFichier, { type: blob.type || 'video/mp4' });
        }
        await navigator.share({ files: [fichier], text: bouton.dataset.texte });
        texteBouton(bouton, 'Partager le fichier');
      } catch (erreur) {
        // Fichier trop long à préparer : le navigateur demande un 2e appui
        if (erreur.name === 'NotAllowedError') texteBouton(bouton, 'Partager maintenant');
        else if (erreur.name !== 'AbortError') {
          texteBouton(bouton, 'Partager le fichier');
          window.alert("Le partage n'a pas fonctionné. Utilisez « Télécharger », puis envoyez le fichier sur WhatsApp.");
        } else texteBouton(bouton, 'Partager le fichier');
      } finally {
        bouton.disabled = false;
      }
    });
  });

  // c) Copier le lien de la vidéo
  $$('[data-copier]').forEach((bouton) => {
    bouton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bouton.dataset.copier);
        texteBouton(bouton, 'Lien copié ✓');
        setTimeout(() => texteBouton(bouton, 'Copier le lien de la vidéo'), 2500);
      } catch {
        // Copie automatique impossible (site en http) : on affiche le lien
        window.prompt('Copiez le lien :', bouton.dataset.copier);
      }
    });
  });

  // ---------- 9. Aperçus ----------
  // a) Image choisie (capture de preuve, miniature)
  $$('input[type="file"][data-apercu]').forEach((champ) => {
    champ.addEventListener('change', () => {
      const image = document.getElementById(champ.dataset.apercu);
      const fichier = champ.files[0];
      if (!image) return;
      if (fichier && fichier.type.startsWith('image/')) {
        image.src = URL.createObjectURL(fichier);
        image.hidden = false;
      } else {
        image.hidden = true;
      }
    });
  });

  // b) Message WhatsApp (Paramètres)
  const zoneMessage = $('[data-apercu-message]');
  if (zoneMessage) {
    const apercu = document.getElementById(zoneMessage.dataset.apercuMessage);
    const exemple = JSON.parse(zoneMessage.dataset.exemple || '{}');
    const mettreAJour = () => {
      apercu.textContent = zoneMessage.value.replace(/\{(\w+)\}/g, (tout, cle) => (Object.hasOwn(exemple, cle) ? String(exemple[cle]) : tout));
    };
    zoneMessage.addEventListener('input', mettreAJour);
    $$('[data-inserer]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const debut = zoneMessage.selectionStart ?? zoneMessage.value.length;
        const fin = zoneMessage.selectionEnd ?? debut;
        zoneMessage.setRangeText(bouton.dataset.inserer, debut, fin, 'end');
        zoneMessage.focus();
        mettreAJour();
      });
    });
  }

  // ---------- Apparence : aperçu immédiat de la palette choisie ----------
  $$('[data-choix-palette]').forEach((choix) => {
    choix.addEventListener('change', () => {
      if (choix.checked) document.documentElement.dataset.palette = choix.value;
    });
  });

  // ---------- Menu "Plus" : se ferme en touchant ailleurs ----------
  const menuPlus = $('.barre-bas details');
  document.addEventListener('click', (e) => {
    if (menuPlus?.open && !menuPlus.contains(e.target)) menuPlus.open = false;
  });
})();
