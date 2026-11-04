/* Argent Clair · script de la page
   1. Carte « Mon solde » animée
   2. Calculateur 50/30/20
   3. Compte à rebours de l’offre
   4. Barre d’achat mobile */
(function () {
  "use strict";

  var NBSP = " ";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function group(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  }
  function money(n) {
    return group(n) + NBSP + "F";
  }

  /* ---------- 1. Carte « Mon solde » ---------- */

  var wallet = document.querySelector("[data-wallet]");

  if (wallet) {
    var el = {
      label: wallet.querySelector("[data-w-label]"),
      tag: wallet.querySelector("[data-w-tag]"),
      amount: wallet.querySelector("[data-w-amount]"),
      day: wallet.querySelector("[data-w-day]"),
      list: wallet.querySelector("[data-w-list]")
    };

    var SALARY = 200000;
    var SAVED = 40000;
    var EXPENSES = [
      { name: "Loyer", day: "le 1er", value: 60000 },
      { name: "Marché", day: "le 3", value: 45000 },
      { name: "Transport", day: "le 5", value: 30000 },
      { name: "Frais Mobile Money", day: "le 7", value: 15000 },
      { name: "Famille", day: "le 9", value: 50000 }
    ];

    var timers = [];
    var frame = 0;
    var running = false;
    var onScreen = false;

    function later(ms, fn) {
      timers.push(window.setTimeout(fn, ms));
    }

    function stop() {
      timers.forEach(window.clearTimeout);
      timers = [];
      window.cancelAnimationFrame(frame);
      running = false;
    }

    function tween(from, to, duration) {
      window.cancelAnimationFrame(frame);
      var start = performance.now();
      function step(now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.amount.textContent = money(from + (to - from) * eased);
        if (t < 1) frame = window.requestAnimationFrame(step);
      }
      frame = window.requestAnimationFrame(step);
    }

    function row(expense) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      var small = document.createElement("small");
      var minus = document.createElement("span");
      name.className = "wallet__name";
      name.textContent = expense.name;
      small.textContent = expense.day;
      name.appendChild(small);
      minus.className = "wallet__minus";
      minus.textContent = "−" + money(expense.value);
      li.appendChild(name);
      li.appendChild(minus);
      return li;
    }

    function cycle() {
      stop();
      running = true;
      wallet.classList.add("is-anim");
      wallet.classList.remove("is-kit", "is-empty");
      el.list.textContent = "";
      el.label.textContent = "Mon solde";
      el.tag.textContent = "Sans plan";
      el.amount.textContent = money(SALARY);
      el.day.textContent = "Le 1er du mois. La paie vient de tomber.";

      var balance = SALARY;
      var t = 900;

      EXPENSES.forEach(function (expense, i) {
        later(t, function () {
          var from = balance;
          balance -= expense.value;
          el.list.appendChild(row(expense));
          tween(from, balance, 650);
          el.day.textContent = i === EXPENSES.length - 1
            ? "On est le 9. Le mois n’est pas fini."
            : "On est " + expense.day + ".";
        });
        t += 1100;
      });

      later(t, function () {
        wallet.classList.add("is-empty");
      });
      t += 1900;

      later(t, function () {
        wallet.classList.remove("is-empty");
        wallet.classList.add("is-kit");
        el.label.textContent = "Mon épargne";
        el.tag.textContent = "Avec le Kit";
        el.day.textContent = "mis de côté dès le 1er du mois";
        tween(0, SAVED, 900);
      });
      t += 4800;

      later(t, cycle);
    }

    function update() {
      var shouldRun = onScreen && !document.hidden && !reduceMotion.matches;
      if (shouldRun && !running) cycle();
      if (!shouldRun && running) {
        stop();
        if (reduceMotion.matches) showStatic();
      }
    }

    // État fixe : la conclusion de l’histoire, sans mouvement.
    function showStatic() {
      wallet.classList.remove("is-anim", "is-kit", "is-empty");
      el.label.textContent = "Mon solde";
      el.tag.textContent = "Sans plan";
      el.amount.textContent = money(0);
      el.day.textContent = "On est le 9. Le mois n’est pas fini.";
      el.list.textContent = "";
      EXPENSES.forEach(function (expense) { el.list.appendChild(row(expense)); });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        update();
      }).observe(wallet);
    } else {
      onScreen = true;
      update();
    }
    document.addEventListener("visibilitychange", update);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", update);
  }

  /* ---------- 2. Calculateur 50/30/20 ---------- */

  var input = document.getElementById("salaire");

  if (input) {
    var out = {};
    document.querySelectorAll("[data-out]").forEach(function (node) {
      out[node.getAttribute("data-out")] = node;
    });
    var presets = document.querySelectorAll("[data-preset]");
    var MAX_DIGITS = 8;

    function digitsOf(value) {
      return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
    }

    function render(salary) {
      out.needs.textContent = money(salary * 0.5);
      out.wants.textContent = money(salary * 0.3);
      out.save.textContent = money(salary * 0.2);
      out.urgence.textContent = money(salary * 0.5 * 3);
      presets.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(Number(btn.getAttribute("data-preset")) === salary));
      });
    }

    function onInput() {
      // Reformate « 150000 » en « 150 000 » sans faire sauter le curseur.
      var caret = input.selectionStart || 0;
      var digitsBeforeCaret = digitsOf(input.value.slice(0, caret)).length;
      var digits = digitsOf(input.value);
      var formatted = digits ? group(Number(digits)) : "";

      if (input.value !== formatted) {
        input.value = formatted;
        var pos = 0;
        var seen = 0;
        while (pos < formatted.length && seen < digitsBeforeCaret) {
          if (/\d/.test(formatted[pos])) seen++;
          pos++;
        }
        try { input.setSelectionRange(pos, pos); } catch (e) { /* champ non focalisé */ }
      }
      render(digits ? Number(digits) : 0);
    }

    input.addEventListener("input", onInput);
    input.addEventListener("focus", function () {
      // Sur téléphone : place le curseur à la fin pour corriger facilement.
      var end = input.value.length;
      window.setTimeout(function () {
        try { input.setSelectionRange(end, end); } catch (e) { /* rien */ }
      }, 0);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") input.blur();
    });

    presets.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = Number(btn.getAttribute("data-preset"));
        input.value = group(value);
        render(value);
      });
    });

    onInput();
  }

  /* ---------- 3. Compte à rebours ---------- */

  // 9 novembre 2026, 23:59, heure de Niamey (UTC+1)
  var END = Date.parse("2026-11-09T23:59:00+01:00");
  var countdown = document.querySelector("[data-countdown]");

  function endOffer() {
    document.documentElement.classList.add("offer-ended");
    document.querySelectorAll("[data-now]").forEach(function (node) {
      node.textContent = money(5000);
    });
    var ended = document.querySelector("[data-ended]");
    if (countdown) countdown.hidden = true;
    if (ended) ended.hidden = false;
  }

  if (countdown) {
    var cells = {};
    countdown.querySelectorAll("[data-cd]").forEach(function (node) {
      cells[node.getAttribute("data-cd")] = node;
    });
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };

    var tick = function () {
      var left = END - Date.now();
      if (left <= 0) {
        endOffer();
        return;
      }
      var s = Math.floor(left / 1000);
      cells.d.textContent = pad(Math.floor(s / 86400));
      cells.h.textContent = pad(Math.floor((s % 86400) / 3600));
      cells.m.textContent = pad(Math.floor((s % 3600) / 60));
      cells.s.textContent = pad(s % 60);
      window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
  } else if (Date.now() >= END) {
    endOffer();
  }

  /* ---------- 4. Barre d’achat mobile ---------- */

  var bar = document.querySelector("[data-buybar]");
  var hero = document.querySelector(".hero");
  var priceCta = document.querySelector("[data-price-cta]");

  if (bar && hero && "IntersectionObserver" in window) {
    var heroVisible = true;
    var priceVisible = false;

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        else priceVisible = entry.isIntersecting;
      });
      // Visible après le hero, masquée quand le gros bouton du bloc prix est à l’écran.
      bar.classList.toggle("is-on", !heroVisible && !priceVisible);
    }).observe(hero);

    if (priceCta) {
      new IntersectionObserver(function (entries) {
        priceVisible = entries[0].isIntersecting;
        bar.classList.toggle("is-on", !heroVisible && !priceVisible);
      }).observe(priceCta);
    }
  }
})();
