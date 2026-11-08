/* site-data.js の内容をページに流し込むプログラム(ふつうは編集しなくてOK) */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) { console.error('site-data.js が読み込めていません'); return; }
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (p) { return p.split('.').reduce(function (o, k) { return o && o[k]; }, S); };
  var put = function (id, html) { var e = $(id); if (e) e.innerHTML = html; };
  var each = function (a, f) { return (a || []).map(f).join(''); };

  /* 文字の差し込み: data-bind(文字) / data-html(改行など) */
  document.querySelectorAll('[data-bind]').forEach(function (e) { var v = get(e.dataset.bind); if (v != null) e.textContent = v; });
  document.querySelectorAll('[data-html]').forEach(function (e) { var v = get(e.dataset.html); if (v != null) e.innerHTML = v; });

  /* メールアドレス */
  var mail = S.lab.email;
  document.querySelectorAll('[data-mail]').forEach(function (a) {
    a.href = 'mailto:' + mail + (a.hasAttribute('data-subject') ? '?subject=' + encodeURIComponent(S.lab.mailSubject) : '');
    if (a.hasAttribute('data-mail-text')) a.textContent = mail;
  });

  /* 数字(メンバー数・役割数) */
  var roleKeys = []; S.members.forEach(function (m) { if (roleKeys.indexOf(m.role) < 0) roleKeys.push(m.role); });
  $('statMembers').dataset.count = S.members.length;
  $('statRoles').dataset.count = roleKeys.length;

  put('marqueeTrack', each(S.marquee.concat(S.marquee), function (t) { return '<span>' + esc(t) + '</span>'; }));

  put('newsList', each(S.news.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }), function (n) {
    return '<article class="news-item"><time>' + esc(n.date.replace(/-/g, '.')) + '</time><span class="pill">' + esc(n.tag) + '</span><div><b>' + esc(n.title) + '</b><p>' + esc(n.body) + '</p></div></article>';
  }));
  put('aboutGrid', each(S.about, function (a) { return '<article class="panel"><h3>' + esc(a.title) + '</h3><p>' + esc(a.body) + '</p></article>'; }));
  put('themeList', each(S.themes, function (t) { return '<button class="theme" aria-expanded="false"><span class="theme-title">' + esc(t.title) + '</span><span class="theme-body">' + esc(t.body) + '</span></button>'; }));
  put('flowList', each(S.flow, function (f, i) { return '<li><b>' + (i + 1) + '. ' + esc(f.title) + '</b><span>' + esc(f.who) + '</span><p>' + esc(f.body) + '</p></li>'; }));
  put('techList', each(S.tech, function (t) { return '<article class="panel"><h3>' + esc(t.title) + '</h3><p>' + esc(t.body) + '</p></article>'; }));

  put('filters', '<button class="chip is-on" data-filter="all">全員</button>' + each(roleKeys, function (k) { return '<button class="chip" data-filter="' + esc(k) + '">' + esc(S.roles[k] || k) + '</button>'; }));
  var avatarCls = { test: ' a-amber', design: ' a-ink' };
  put('memberList', each(S.members, function (m) {
    return '<article class="member" data-role="' + esc(m.role) + '"><div class="avatar' + (avatarCls[m.role] || '') + '">' + esc(m.name.charAt(0)) + '</div><h3>' + esc(m.name) + '</h3><p class="role">' + esc(S.roles[m.role] || m.role) + '</p><p>' + esc(m.desc) + '</p><ul>' + each(m.tasks, function (t) { return '<li>' + esc(t) + '</li>'; }) + '</ul></article>';
  }));

  put('projectList', each(S.projects, function (p) {
    var st = S.statuses[p.status] || { label: p.status, cls: '' };
    var bar = typeof p.progress === 'number' ? '<div class="bar" style="--p:' + Math.max(0, Math.min(100, p.progress)) + '%"><i></i><span>進み具合 ' + p.progress + '%</span></div>' : '';
    return '<article class="project"><span class="status ' + st.cls + '">' + esc(st.label) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.body) + '</p>' + bar + '<p class="meta">主な担当: ' + esc((p.team || []).join(' / ')) + '</p></article>';
  }));

  put('timelineList', each(S.timeline, function (t) { return '<li' + (t.done ? ' class="done"' : '') + '><time>' + esc(t.date) + '</time><b>' + esc(t.title) + '</b><p>' + esc(t.body) + '</p></li>'; }));
  put('weekList', each(S.week, function (w) { return '<div><b>' + esc(w.title) + '</b><p>' + esc(w.body) + '</p></div>'; }));
  put('faqList', each(S.faq, function (f) { return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a.replace(/\{email\}/g, mail)) + '</p></details>'; }));
  put('joinList', each(S.join.welcome, function (w) { return '<li>' + esc(w) + '</li>'; }));
})();
