/* ============================================
   messages.js — Guestbook "Tinggalkan Pesan"
   Baca  : messages.json (statis, dari repo)
   Tulis : POST ke Cloudflare Worker -> commit ke messages.json
   ============================================ */
(function () {
  'use strict';

  // ⚙️ ISI INI setelah deploy worker (lihat SETUP-PESAN.md).
  // Kosong = mode demo (pesan hanya tampil di browser pengunjung).
  var ENDPOINT = 'https://porto.msg-porto.workers.dev';
  var MESSAGES_URL = 'messages.json';
  var MAX_SHOW = 60;

  var form   = document.getElementById('msgForm');
  if (!form) return;
  var nameEl = document.getElementById('msgName');
  var textEl = document.getElementById('msgText');
  var hpEl   = document.getElementById('msgWebsite');
  var countEl= document.getElementById('msgCount');
  var sendEl = document.getElementById('msgSend');
  var statEl = document.getElementById('msgStatus');
  var listEl = document.getElementById('msgList');
  var totalEl= document.getElementById('msgTotal');

  var messages = [];
  var lastSent = 0;

  function setStatus(msg, kind) {
    statEl.textContent = msg || '';
    statEl.className = 'msg-status' + (kind ? ' ' + kind : '');
  }

  function timeAgo(iso) {
    var t = new Date(iso).getTime();
    if (isNaN(t)) return '';
    var d = Math.max(0, (Date.now() - t) / 1000);
    if (d < 60) return 'baru saja';
    if (d < 3600) return Math.floor(d / 60) + ' mnt lalu';
    if (d < 86400) return Math.floor(d / 3600) + ' jam lalu';
    if (d < 2592000) return Math.floor(d / 86400) + ' hari lalu';
    return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function render() {
    var visible = messages.filter(function (m) { return m && m.approved !== false; });
    totalEl.textContent = visible.length + ' pesan';
    listEl.textContent = '';
    if (!visible.length) {
      var e = document.createElement('div');
      e.className = 'msg-empty';
      e.textContent = 'belum ada pesan — jadi yang pertama!';
      listEl.appendChild(e);
      return;
    }
    visible.slice(-MAX_SHOW).forEach(function (m) {
      var item = document.createElement('div');
      item.className = 'msg-item ' + (m.name === 'Wahyu' ? 'owner' : 'guest');
      var head = document.createElement('div');
      head.className = 'msg-head';
      var who = document.createElement('span');
      who.className = 'msg-who';
      who.textContent = String(m.name || 'anon').slice(0, 30);   // textContent = aman dari XSS
      var when = document.createElement('span');
      when.className = 'msg-when';
      when.textContent = timeAgo(m.time);
      head.appendChild(who); head.appendChild(when);
      var bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = String(m.text || '').slice(0, 280);
      item.appendChild(head); item.appendChild(bubble);
      listEl.appendChild(item);
    });
    listEl.scrollTop = listEl.scrollHeight;   // chat: pesan terbaru di bawah
  }

  function load() {
    fetch(MESSAGES_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { messages = Array.isArray(data) ? data : []; render(); })
      .catch(function () {
        messages = [];
        listEl.textContent = '';
        var e = document.createElement('div');
        e.className = 'msg-empty';
        e.textContent = 'pesan belum bisa dimuat.';
        listEl.appendChild(e);
      });
  }

  function autoGrow() {
    textEl.style.height = 'auto';
    textEl.style.height = Math.min(textEl.scrollHeight, 90) + 'px';
  }
  textEl.addEventListener('input', function () {
    countEl.textContent = textEl.value.length + '/280';
    autoGrow();
  });
  // Enter = kirim, Shift+Enter = baris baru
  textEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : sendEl.click(); }
  });

  // ingat nama pengirim
  try { var saved = localStorage.getItem('guestName'); if (saved) nameEl.value = saved; } catch (e) {}

  // jam di status bar HP
  var timeEl = document.getElementById('phoneTime');
  function tick() {
    if (!timeEl) return;
    var d = new Date();
    timeEl.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  tick(); setInterval(tick, 20000);

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (hpEl.value) return;                                  // honeypot: bot
    var name = nameEl.value.trim();
    var text = textEl.value.trim();
    if (!name || !text) { setStatus('Isi nama dan pesan dulu ya.', 'err'); return; }
    if (Date.now() - lastSent < 15000) { setStatus('Tunggu sebentar sebelum kirim lagi.', 'err'); return; }

    sendEl.disabled = true;
    setStatus('Mengirim…');

    var optimistic = { id: 'local-' + Date.now(), name: name, text: text, time: new Date().toISOString(), approved: true };

    function done(extra) {
      lastSent = Date.now();
      textEl.value = ''; countEl.textContent = '0/280'; autoGrow();
      try { localStorage.setItem('guestName', name); } catch (e) {}
      sendEl.disabled = false;
      if (extra.show) { messages.push(optimistic); render(); }
      setStatus(extra.msg, 'ok');
    }

    if (!ENDPOINT) {                                         // mode demo
      setTimeout(function () {
        done({ show: true, msg: 'Mode demo: pesan hanya tampil di browser kamu. Hubungkan worker untuk menyimpan ke messages.json.' });
      }, 400);
      return;
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, text: text, website: hpEl.value })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'Gagal mengirim');
        done({ show: !res.j.pending, msg: res.j.pending ? 'Terkirim! Pesan tampil setelah disetujui.' : 'Terkirim! 🎉 (di situs bisa butuh ±1 menit untuk update permanen)' });
      })
      .catch(function (err) {
        sendEl.disabled = false;
        setStatus(err.message === 'Failed to fetch' ? 'Tidak bisa terhubung ke server.' : err.message, 'err');
      });
  });

  load();
})();
