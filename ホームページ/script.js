(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ロゴ差し替え(logo-data.js の base64 を使う) */
  var raw = (window.LOGO_BASE64 || '').trim();
  if (raw) {
    var src = raw.indexOf('data:') === 0 ? raw : 'data:' + (window.LOGO_MIME || 'image/png') + ';base64,' + raw;
    document.querySelectorAll('.js-logo').forEach(function (img) { img.src = src; });
    var fav = document.getElementById('favicon');
    if (fav) { fav.type = (src.match(/^data:([^;]+)/) || [])[1] || 'image/png'; fav.href = src; }
  }

  /* 実験日数(2026-11-04 を1日目として数える) */
  var fd = ((window.SITE && SITE.lab.founded) || "2026-11-04").split("-");
  var start = new Date(+fd[0], +fd[1] - 1, +fd[2]);
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var days = Math.max(1, Math.floor((today - start) / 86400000) + 1);

  /* 数字のカウントアップ */
  function countUp(el, to) {
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('[data-days]').forEach(function (el) { countUp(el, days); });
  document.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, +el.dataset.count); });

  /* 液面ゲージ(スクロール量) */
  var fill = document.getElementById('gaugeFill');
  function gauge() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.height = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', gauge, { passive: true });
  gauge();

  /* 研究テーマの開閉 */
  document.querySelectorAll('.theme').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    });
  });

  /* メンバーの絞り込み */
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('is-on'); });
      c.classList.add('is-on');
      var f = c.dataset.filter;
      document.querySelectorAll('.member').forEach(function (m) {
        m.classList.toggle('is-hidden', f !== 'all' && m.dataset.role !== f);
      });
    });
  });

  /* manifest.json のタイピング表示 */
  var codeEl = document.getElementById('manifestCode');
  var manifest = ((window.SITE && SITE.manifest) || []).join('\n');
  function highlight(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/("[^"\n]*")(\s*:)/g, '<span class="k">$1</span>$2')
      .replace(/:\s*("[^"\n]*")/g, function (m, v) { return m.replace(v, '<span class="s">' + v + '</span>'); })
      .replace(/\[("[^\]]*")\]/g, function (m) { return m.replace(/"[^"]*"/g, '<span class="s">$&</span>'); })
      .replace(/:\s*(\d+)/g, function (m, v) { return m.replace(v, '<span class="n">' + v + '</span>'); });
  }
  function typeManifest() {
    if (reduce) { codeEl.innerHTML = highlight(manifest); return; }
    var i = 0;
    codeEl.classList.add('typing');
    (function tick() {
      i += 2;
      codeEl.innerHTML = highlight(manifest.slice(0, i));
      if (i < manifest.length) setTimeout(tick, 28);
      else { codeEl.innerHTML = highlight(manifest); codeEl.classList.remove('typing'); }
    })();
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { typeManifest(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(codeEl);
  } else { typeManifest(); }

})();

/* ===== 追加: スクロール表示アニメーション / コピー ===== */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var map = [
    ['.sec-head h2', 'rv-wipe'], ['.sec-head p', 'rv-up'],
    ['.about-grid .panel', 'alt'], ['.theme', 'rv-zoom'], ['.flow li', 'rv-up'],
    ['.diagram .node', 'rv-zoom'], ['.tech .panel', 'rv-flip'], ['.filters', 'rv-up'],
    ['.member', 'rv-flip'], ['.project', 'rv-up'], ['.timeline li', 'rv-left'],
    ['.code', 'rv-left'], ['.explain li', 'rv-right'], ['.week div', 'rv-up'],
    ['.faq details', 'rv-left'], ['.join .panel', 'alt'], ['.contact', 'rv-zoom']
  ];
  var els = [];
  map.forEach(function (m) {
    var groups = new Map();
    document.querySelectorAll(m[0]).forEach(function (el) {
      var key = el.parentElement;
      var i = groups.get(key) || 0; groups.set(key, i + 1);
      var cls = m[1] === 'alt' ? (i % 2 ? 'rv-right' : 'rv-left') : m[1];
      el.classList.add('rv', cls);
      el.style.setProperty('--d', (Math.min(i, 5) * 0.09) + 's');
      els.push(el);
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  var copy = document.getElementById('copyMail');
  if (copy) copy.addEventListener('click', function () {
    var done = function () { copy.textContent = 'コピーしました'; setTimeout(function () { copy.textContent = 'アドレスをコピー'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText((document.querySelector('.mail') || {}).textContent || '').then(done, function () {});
    else done();
  });
})();

/* ページ先頭へ戻るボタン */
(function () {
  var b = document.getElementById('toTop');
  if (!b) return;
  window.addEventListener('scroll', function () { b.classList.toggle('show', window.scrollY > 600); }, { passive: true });
  b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
