// ═══════════════════════════════════════════════════════
// LAZY LOADER UTILITIES
// ═══════════════════════════════════════════════════════
(function () {
  'use strict';

  function onIdle(cb, timeout) {
    timeout = timeout || 2000;
    if ('requestIdleCallback' in window) {
      requestIdleCallback(cb, { timeout: timeout });
    } else {
      setTimeout(cb, 200);
    }
  }

  function onVisible(target, cb, opts) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) { onIdle(cb, 3000); return; }
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) { cb(el); return; }
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { cb(entry.target); obs.unobserve(entry.target); }
      });
    }, Object.assign({ threshold: 0.05, rootMargin: '100px' }, opts || {}));
    observer.observe(el);
  }

  window.__onIdle    = onIdle;
  window.__onVisible = onVisible;

  window.__throttledScroll = function (handler, fps) {
    fps = fps || 60;
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last < 1000 / fps) return;
      last = now;
      handler.apply(this, arguments);
    };
  };

  // Auto lazy-load semua <img> tanpa atribut loading
  onIdle(function () {
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  });
})();


// ═══════════════════════════════════════════════════════
// PARALLAX SYSTEM  — defer ke requestIdleCallback
// ═══════════════════════════════════════════════════════
window.__onIdle(function () {

  var isMobile      = window.matchMedia('(max-width: 900px)').matches;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // ── 1. STAR FIELD ──────────────────────────────────
  var starField  = document.getElementById('star-field');
  var STAR_COUNT = isMobile ? 40 : 100;
  var stars      = [];

  for (var i = 0; i < STAR_COUNT; i++) {
    var star    = document.createElement('div');
    star.className = 'star';
    var size    = Math.random() * 2 + 0.5;
    var opacity = Math.random() * 0.5 + 0.1;
    var dur     = 2 + Math.random() * 4;
    var delay   = Math.random() * 6;
    var depth   = Math.random();

    star.style.cssText = [
      'width:'             + size    + 'px;',
      'height:'            + size    + 'px;',
      'left:'              + (Math.random() * 100) + '%;',
      'top:'               + (Math.random() * 100) + '%;',
      '--star-opacity:'    + opacity + ';',
      'animation-duration:' + dur   + 's;',
      'animation-delay:-'  + delay  + 's;',
    ].join('');

    starField.appendChild(star);
    stars.push({ el: star, depth: depth, x: parseFloat(star.style.left), y: parseFloat(star.style.top) });
  }

  // ── 2. BACKGROUND ORBS ─────────────────────────────
  var parallaxBg  = document.getElementById('parallax-bg');
  var orbConfigs  = [
    { color: 'rgba(0,245,212,0.06)',  size: 600, x: '10%', y: '20%', dur: 18, depth: 0.05 },
    { color: 'rgba(124,58,237,0.08)', size: 500, x: '80%', y: '30%', dur: 22, depth: 0.08 },
    { color: 'rgba(247,37,133,0.05)', size: 400, x: '60%', y: '70%', dur: 15, depth: 0.03 },
    { color: 'rgba(0,245,212,0.04)',  size: 700, x: '30%', y: '80%', dur: 25, depth: 0.06 },
    { color: 'rgba(124,58,237,0.05)', size: 350, x: '90%', y: '80%', dur: 19, depth: 0.04 },
    { color: 'rgba(251,191,36,0.03)', size: 300, x: '5%',  y: '70%', dur: 20, depth: 0.02 },
  ];

  var orbs = orbConfigs.map(function (cfg) {
    var el = document.createElement('div');
    el.className = 'parallax-orb';
    el.style.cssText = [
      'width:'              + cfg.size + 'px;',
      'height:'             + cfg.size + 'px;',
      'background: radial-gradient(circle,' + cfg.color + ' 0%,transparent 70%);',
      'left:'               + cfg.x   + ';',
      'top:'                + cfg.y   + ';',
      'margin-left:-'       + (cfg.size / 2) + 'px;',
      'margin-top:-'        + (cfg.size / 2) + 'px;',
      'animation-duration:' + cfg.dur + 's;',
      'animation-delay:-'   + (Math.random() * cfg.dur) + 's;',
      'animation-fill-mode:both;',
    ].join('');
    parallaxBg.appendChild(el);
    return { el: el, depth: cfg.depth };
  });

  // ── 3. FLOATING CODE FRAGMENTS — tunda 4 detik ──────
  if (!isMobile) {
    var codeSnippets = [
      'const x = () => {}', 'import React', 'npm run dev',
      'git commit -m', 'flex items-center', '@tailwind base',
      'Route::get()', 'useState(null)', 'border-radius: 8px',
      'console.log()', 'async/await', 'SELECT * FROM',
      'php artisan', 'useEffect(() =>', '.env.local',
    ];
    function spawnCodeFragment() {
      var el      = document.createElement('div');
      el.className = 'float-code';
      var snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      var x       = 5 + Math.random() * 90;
      var dur     = 12 + Math.random() * 18;
      el.textContent = snippet;
      el.style.cssText = [
        'left:'              + x   + '%;',
        'animation-duration:' + dur + 's;',
        'animation-delay:-'  + (Math.random() * dur) + 's;',
        'color:rgba(0,245,212,' + (0.04 + Math.random() * 0.08) + ');',
        'font-size:'         + (0.55 + Math.random() * 0.2) + 'rem;',
      ].join('');
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, (dur + 2) * 1000);
    }
    // Tunda spawn awal 4 detik, lalu interval normal
    setTimeout(function () {
      for (var k = 0; k < 4; k++) setTimeout(spawnCodeFragment, k * 1800);
      setInterval(spawnCodeFragment, 3000);
    }, 4000);
  }

  // ── 4. HERO GEOMETRIC SHAPES ──────────────────────
  var heroLayer = document.getElementById('heroLayer1');
  if (heroLayer) {
    var shapes = [
      { type: 'circle',   size: 120, x: '15%', y: '25%', color: 'rgba(0,245,212,0.04)',  border: 'rgba(0,245,212,0.12)',  depth: 0.15, delay: 0.2 },
      { type: 'circle',   size: 60,  x: '85%', y: '60%', color: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.18)', depth: 0.25, delay: 0.5 },
      { type: 'square',   size: 80,  x: '75%', y: '20%', color: 'transparent',           border: 'rgba(247,37,133,0.15)', depth: 0.1,  delay: 0.3 },
      { type: 'circle',   size: 200, x: '5%',  y: '70%', color: 'rgba(0,245,212,0.02)',  border: 'rgba(0,245,212,0.06)',  depth: 0.05, delay: 0.8 },
      { type: 'square',   size: 40,  x: '90%', y: '40%', color: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.2)',  depth: 0.3,  delay: 0.1 },
      { type: 'triangle', size: 50,  x: '50%', y: '85%', color: 'transparent',           border: 'rgba(124,58,237,0.2)',  depth: 0.2,  delay: 0.6 },
    ];

    shapes.forEach(function (s, idx) {
      var el       = document.createElement('div');
      el.className = 'geo-shape';
      el.dataset.depth = s.depth;
      var isCircle = s.type === 'circle';
      var isSquare = s.type === 'square';
      el.style.cssText = [
        'width:'            + s.size + 'px;',
        'height:'           + s.size + 'px;',
        'left:'             + s.x   + ';',
        'top:'              + s.y   + ';',
        'margin-left:-'     + (s.size / 2) + 'px;',
        'margin-top:-'      + (s.size / 2) + 'px;',
        'background:'       + s.color  + ';',
        'border:1px solid ' + s.border + ';',
        'border-radius:'    + (isCircle ? '50%' : isSquare ? '4px' : '0') + ';',
        'transform:'        + (isSquare ? 'rotate(' + (30 + idx * 15) + 'deg)' : '') + ';',
        'animation-delay:'  + s.delay + 's;',
        'animation-duration:1.8s;',
        'box-shadow:0 0 '   + (s.size / 4) + 'px ' + s.border + ';',
      ].join('');
      heroLayer.appendChild(el);
    });
  }

  // ── 5. PARALLAX GRID ─────────────────────────────
  var grid = document.getElementById('parallaxGrid');

  // ── 6. SCROLL PARALLAX ────────────────────────────
  var scrollY = 0, targetScrollY = 0, ticking = false;

  function onScroll() {
    targetScrollY = window.pageYOffset;
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  function updateParallax() {
    scrollY += (targetScrollY - scrollY) * 0.08;
    var sy = scrollY;

    stars.forEach(function (s) {
      s.el.style.transform = 'translateY(' + (-sy * s.depth * 0.5) + 'px)';
    });

    orbs.forEach(function (o) {
      o.el.style.transform = 'translateY(' + (-sy * o.depth) + 'px)';
    });

    if (grid) {
      grid.style.transform       = 'translateY(' + (sy * 0.03) + 'px)';
      grid.style.backgroundSize  = (60 + sy * 0.005) + 'px ' + (60 + sy * 0.005) + 'px';
    }

    if (heroLayer) {
      heroLayer.querySelectorAll('.geo-shape').forEach(function (shape) {
        var depth    = parseFloat(shape.dataset.depth) || 0.1;
        var rotation = sy * depth * 0.2;
        shape.style.transform = 'translateY(' + (-sy * depth) + 'px) rotate(' + rotation + 'deg)';
      });
    }

    var heroLeft  = document.querySelector('.hero-left');
    var heroRight = document.querySelector('.hero-right');
    if (heroLeft  && sy < window.innerHeight) heroLeft.style.transform  = 'translateY(' + (sy * 0.12) + 'px)';
    if (heroRight && sy < window.innerHeight) heroRight.style.transform = 'translateY(' + (sy * 0.08) + 'px)';

    ticking = false;
    if (Math.abs(targetScrollY - scrollY) > 0.5) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', window.__throttledScroll(onScroll, 60), { passive: true });

  // ── 7. MOUSE PARALLAX ─────────────────────────────
  if (!isMobile) {
    var mouseX = 0.5, mouseY = 0.5, currentMX = 0.5, currentMY = 0.5;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });

    function animateMouse() {
      currentMX += (mouseX - currentMX) * 0.06;
      currentMY += (mouseY - currentMY) * 0.06;
      var dx = (currentMX - 0.5) * 2;
      var dy = (currentMY - 0.5) * 2;

      orbs.forEach(function (o, idx) {
        var strength = (idx + 1) * 8 * o.depth;
        var cy = parseFloat((o.el.style.transform || '').match(/translateY\(([^)]+)\)/) ? (o.el.style.transform.match(/translateY\(([^)]+)\)/)[1]) : '0') || 0;
        o.el.style.transform = 'translateY(' + cy + 'px) translate(' + (dx * strength) + 'px,' + (dy * strength) + 'px)';
      });

      if (heroLayer) {
        heroLayer.querySelectorAll('.geo-shape').forEach(function (shape) {
          var depth        = parseFloat(shape.dataset.depth) || 0.1;
          var strength     = depth * 40;
          var scrollOffset = scrollY * depth;
          var rotation     = scrollY * depth * 0.2;
          shape.style.transform =
            'translateY(' + (-scrollOffset + dy * strength * 0.3) + 'px)' +
            ' translateX(' + (dx * strength * 0.5) + 'px)' +
            ' rotate(' + (rotation + dx * strength * 0.5) + 'deg)';
        });
      }

      requestAnimationFrame(animateMouse);
    }
    animateMouse();
  }

  // ── 8. TILT CARDS — saat kartu masuk viewport ─────
  window.__onIdle(function () {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
      window.__onVisible(card, function (c) {
        c.addEventListener('mousemove', function (e) {
          var rect = c.getBoundingClientRect();
          var dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
          var dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
          c.style.transform  = 'translateY(-4px) rotateX(' + (-dy * 8) + 'deg) rotateY(' + (dx * 8) + 'deg)';
          c.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        });
        c.addEventListener('mouseleave', function () {
          c.style.transform  = '';
          c.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
        });
      });
    });
  }, 3000);

  // ── 9. SECTION ENTRY ANIMATIONS — idle ────────────
  window.__onIdle(function () {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('revealed'); }, i * 50);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.parallax-reveal').forEach(function (el) { revealObs.observe(el); });
  }, 2500);

  // ── 10. SCROLL PROGRESS BAR ───────────────────────
  var progressBar = document.createElement('div');
  progressBar.style.cssText = [
    'position:fixed;top:0;left:0;',
    'height:2px;',
    'background:linear-gradient(90deg,var(--accent),var(--accent2),var(--accent3));',
    'z-index:9999;pointer-events:none;',
    'transition:width 0.1s linear;',
    'box-shadow:0 0 8px rgba(0,245,212,0.6);',
  ].join('');
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', function () {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = ((window.pageYOffset / maxScroll) * 100) + '%';
  }, { passive: true });

}, 1500); // delay idle hint


// ─── FLIP CARD ───────────────────────────────────────────
var flipCard = document.getElementById('flipCard');
if (flipCard) {
  flipCard.addEventListener('click', function () {
    if (!window.matchMedia('(hover: hover)').matches) flipCard.classList.toggle('flipped');
  });
}

// ─── CUSTOM CURSOR ───────────────────────────────────────
var cursor = document.getElementById('cursor');
var ring   = document.getElementById('cursorRing');
var mx = 0, my = 0, rx = 0, ry = 0;
if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches && cursor && ring) {
  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  (function animCursor() {
    cursor.style.left = (mx - 6) + 'px';
    cursor.style.top  = (my - 6) + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = (rx - 18) + 'px';
    ring.style.top  = (ry - 18) + 'px';
    requestAnimationFrame(animCursor);
  })();
}

// ─── HAMBURGER ───────────────────────────────────────────
var hamburger = document.getElementById('hamburger');
var mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});
function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}
mobileNav.addEventListener('click', function (e) { if (e.target === mobileNav) closeMobileNav(); });

// ─── FADE IN ─────────────────────────────────────────────
var fadeObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e, i) {
    if (e.isIntersecting) setTimeout(function () { e.target.classList.add('visible'); }, i * 80);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(function (el) { fadeObs.observe(el); });

// ─── SKILL BARS — saat section masuk viewport ────────────
window.__onIdle(function () {
  var skillObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-level-fill').forEach(function (b) {
          b.style.width = b.dataset.width;
        });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('#skills').forEach(function (el) { skillObs.observe(el); });
}, 3000);


// ═══════════════════════════════════════════════════════
// MUSIC PLAYER
// ═══════════════════════════════════════════════════════
var musicToggle   = document.getElementById('musicToggle');
var musicPanel    = document.getElementById('musicPanel');
var panelClose    = document.getElementById('panelClose');
var playBtn       = document.getElementById('playBtn');
var prevBtn       = document.getElementById('prevBtn');
var nextBtn       = document.getElementById('nextBtn');
var shuffleBtn    = document.getElementById('shuffleBtn');
var repeatBtn     = document.getElementById('repeatBtn');
var albumArt      = document.getElementById('albumArt');
var trackNameEl   = document.getElementById('trackName');
var trackArtistEl = document.getElementById('trackArtist');
var progressBarEl = document.getElementById('progressBar');
var progressFill  = document.getElementById('progressFill');
var currentTimeEl = document.getElementById('currentTime');
var totalTimeEl   = document.getElementById('totalTime');
var volSlider     = document.getElementById('volSlider');
var volFill       = document.getElementById('volFill');
var toggleBars    = document.getElementById('toggleBars');
var vizBars       = document.querySelectorAll('.viz-bar');
var audio         = document.getElementById('audio');
var beatFlash     = document.getElementById('beatFlash');
var trackListEl   = document.getElementById('trackList');
var listToggle    = document.getElementById('trackListToggle');
var listChevron   = document.getElementById('listChevron');
var countBadge    = document.getElementById('trackCountBadge');
var pxnowPlaying  = document.getElementById('pxNowPlaying');

var tracks = [
  { name: 'JVKE - golden hour',                              artist: 'Wahyu · Late Night', emoji: '🌙', color: 'linear-gradient(135deg,#f72585,#7c3aed)', src: 'music/JVKE - golden hour (Lyrics).mp3' },
  { name: 'Golden Brown',                                    artist: 'Wahyu · Late Night', emoji: '🎵', color: 'linear-gradient(135deg,#7c3aed,#00f5d4)', src: 'music/Golden Brown.mp3' },
  { name: 'JVK - her',                                       artist: 'Wahyu · Late Night', emoji: '💫', color: 'linear-gradient(135deg,#f72585,#7c3aed)', src: 'music/JVK - her.mp3' },
  { name: 'The 1975 - About You',                            artist: 'Wahyu · Late Night', emoji: '😔', color: 'linear-gradient(135deg,#0d1f2d,#7c3aed)', src: 'music/The 1975 - About You.mp3' },
  { name: 'Perfection _ Sempurna English Version - BBIBEEB', artist: 'Wahyu · Late Night', emoji: '✨', color: 'linear-gradient(135deg,#f72585,#ff6db3)', src: 'music/Perfection _ Sempurna English Version - BBIBEEB.mp3' },
  { name: 'Hantu _ Multo Indonesian Version - BBIBEEB',      artist: 'Wahyu · Late Night', emoji: '👻', color: 'linear-gradient(135deg,#1a1040,#f72585)', src: 'music/Hantu _ Multo Indonesian Version - BBIBEEB.mp3' },
  { name: 'Sparkle (Instrumental Only)',                      artist: 'Wahyu · Late Night', emoji: '🎆', color: 'linear-gradient(135deg,#1a1040,#f72585)', src: 'music/Sparkle (Instrumental Only).mp3' },
];

var currentTrack = 0, isPlaying = false, shuffleOn = false, repeatOn = false;
var volumeLevel  = 0.7, panelOpen = false, listOpen = false;
audio.volume = volumeLevel;

function renderList() {
  trackListEl.innerHTML = '';
  countBadge.textContent = tracks.length;
  tracks.forEach(function (t, i) {
    var item = document.createElement('div');
    item.className = 'track-item' + (i === currentTrack ? ' active' : '');
    item.innerHTML =
      '<div class="track-num">'  + (i + 1) + '</div>' +
      '<div class="track-eq '   + (isPlaying && i === currentTrack ? 'playing' : '') + '"><span></span><span></span><span></span></div>' +
      '<div class="track-thumb" style="background:' + t.color + '">' + t.emoji + '</div>' +
      '<div class="track-item-info">' +
        '<div class="track-item-name">'   + t.name   + '</div>' +
        '<div class="track-item-artist">' + t.artist + '</div>' +
      '</div>';
    item.addEventListener('click', function () { selectTrack(i); });
    trackListEl.appendChild(item);
  });
}

function scrollActiveIntoView() {
  var a = trackListEl.querySelector('.track-item.active');
  if (a) a.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

listToggle.addEventListener('click', function () {
  listOpen = !listOpen;
  trackListEl.classList.toggle('open', listOpen);
  listChevron.classList.toggle('open', listOpen);
  if (listOpen) setTimeout(scrollActiveIntoView, 420);
});

function loadTrack(index) {
  var t = tracks[index];
  if (pxnowPlaying) pxnowPlaying.textContent = t.name + ' - ' + t.artist;
  trackNameEl.textContent   = t.name;
  trackArtistEl.textContent = t.artist;
  albumArt.textContent      = t.emoji;
  albumArt.style.background = t.color;
  audio.src = t.src;
  audio.load();
  progressFill.style.width   = '0%';
  currentTimeEl.textContent  = '0:00';
  totalTimeEl.textContent    = '0:00';
  renderList();
}

function selectTrack(i) {
  currentTrack = i;
  loadTrack(i);
  if (isPlaying) audio.play();
  else renderList();
  scrollActiveIntoView();
}

currentTrack = Math.floor(Math.random() * tracks.length);
loadTrack(currentTrack);
renderList();

// ── AUDIO CONTEXT — lazy, hanya saat play ─────────────
var audioCtx, analyser, sourceNode, dataArray, bufferLength;
var audioContextReady = false;

function setupAudioContext() {
  if (audioContextReady) return;
  try {
    audioCtx     = new (window.AudioContext || window.webkitAudioContext)();
    analyser     = audioCtx.createAnalyser();
    analyser.fftSize   = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray    = new Uint8Array(bufferLength);
    sourceNode   = audioCtx.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    audioContextReady = true;
  } catch (e) {}
}

var auraRAF, lastBeatTime = 0;

function updateAura() {
  if (!isPlaying || !audioContextReady) { auraRAF = requestAnimationFrame(updateAura); return; }
  analyser.getByteFrequencyData(dataArray);

  var bassSum = 0;
  for (var b = 0; b < 8; b++) bassSum += dataArray[b];
  var bassAvg      = bassSum / 8;
  var totalSum     = 0;
  for (var j = 0; j < bufferLength; j++) totalSum += dataArray[j];
  var intensity     = Math.min(totalSum / bufferLength / 128, 1);
  var bassIntensity = Math.min(bassAvg / 200, 1);

  document.documentElement.style.setProperty('--aura-intensity', intensity.toFixed(3));

  var now = Date.now();
  if (bassAvg > 180 && now - lastBeatTime > 300) { lastBeatTime = now; triggerBeat(bassIntensity); }

  document.querySelectorAll('.skill-card').forEach(function (card, idx) {
    var hue = (idx * 40 + totalSum / bufferLength) % 360;
    card.style.boxShadow = 'oscarbox-shadow: 0 0 ' + (8 + intensity * 20) + 'px hsla(' + hue + ',80%,60%,' + (0.04 + intensity * 0.12) + ')';
    card.style.boxShadow = '0 0 ' + (8 + intensity * 20) + 'px hsla(' + hue + ',80%,60%,' + (0.04 + intensity * 0.12) + ')';
  });

  var avatarRing = document.querySelector('.avatar-ring');
  if (avatarRing) avatarRing.style.transform = 'scale(' + (1 + bassIntensity * 0.06) + ')';

  progressFill.style.boxShadow = '0 0 ' + (4 + intensity * 16) + 'px rgba(0,245,212,' + (0.3 + intensity * 0.7) + ')';

  vizBars.forEach(function (bar, idx) {
    var dataIdx = Math.floor(idx * bufferLength / vizBars.length);
    bar.style.height  = Math.max(5, (dataArray[dataIdx] / 255) * 100) + '%';
    bar.style.opacity = (0.3 + intensity * 0.7).toFixed(2);
  });

  document.querySelectorAll('.parallax-orb').forEach(function (orb) {
    var boost = 1 + bassIntensity * 0.3;
    orb.style.filter = 'blur(' + (70 - bassIntensity * 20) + 'px) brightness(' + boost + ')';
  });

  auraRAF = requestAnimationFrame(updateAura);
}

function triggerBeat(intensity) {
  beatFlash.style.opacity = (0.02 + intensity * 0.06).toString();
  setTimeout(function () { beatFlash.style.opacity = '0'; }, 80);

  var nav = document.querySelector('nav');
  nav.style.borderBottomColor = 'rgba(0,245,212,' + (0.1 + intensity * 0.4) + ')';
  setTimeout(function () { nav.style.borderBottomColor = ''; }, 200);

  if (window.butterflyBeat) window.butterflyBeat();

  document.querySelectorAll('.geo-shape').forEach(function (shape) {
    shape.style.boxShadow = '0 0 ' + (20 + intensity * 30) + 'px rgba(0,245,212,' + (0.1 + intensity * 0.3) + ')';
    setTimeout(function () { shape.style.boxShadow = ''; }, 150);
  });
}

function clearAura() {
  document.documentElement.style.setProperty('--aura-intensity', '0');
  document.querySelectorAll('.skill-card').forEach(function (c) { c.style.boxShadow = ''; });
  var ar = document.querySelector('.avatar-ring');
  if (ar) ar.style.transform = '';
  progressFill.style.boxShadow = '';
  vizBars.forEach(function (b) { b.style.height = '20%'; b.style.opacity = '0.3'; });
  document.querySelectorAll('.parallax-orb').forEach(function (o) { o.style.filter = ''; });
}

function formatTime(s) {
  return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
}

audio.addEventListener('play', function () {
  isPlaying = true;
  setupAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  document.body.classList.add('music-playing');
  playBtn.textContent = '⏸';
  albumArt.classList.add('playing');
  toggleBars.classList.add('visible');
  renderList();
  if (!auraRAF) updateAura();
  if (window.butterflyStart) window.butterflyStart();
});

audio.addEventListener('pause', function () {
  isPlaying = false;
  document.body.classList.remove('music-playing');
  playBtn.textContent = '▶';
  albumArt.classList.remove('playing');
  toggleBars.classList.remove('visible');
  renderList();
  clearAura();
  if (window.butterflyStop) window.butterflyStop();
});

audio.addEventListener('loadedmetadata', function () {
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', function () {
  if (!audio.duration) return;
  progressFill.style.width    = (audio.currentTime / audio.duration * 100) + '%';
  currentTimeEl.textContent   = formatTime(audio.currentTime);
});

audio.addEventListener('ended', function () {
  if (repeatOn) { audio.currentTime = 0; audio.play(); }
  else nextTrack();
});

playBtn.addEventListener('click', function () { isPlaying ? audio.pause() : audio.play(); });

function nextTrack() {
  currentTrack = shuffleOn
    ? Math.floor(Math.random() * tracks.length)
    : (currentTrack + 1) % tracks.length;
  selectTrack(currentTrack);
  audio.play();
}
function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  selectTrack(currentTrack);
  audio.play();
}

nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

shuffleBtn.addEventListener('click', function () {
  shuffleOn = !shuffleOn;
  shuffleBtn.classList.toggle('active', shuffleOn);
});
repeatBtn.addEventListener('click', function () {
  repeatOn = !repeatOn;
  repeatBtn.classList.toggle('active', repeatOn);
});

progressBarEl.addEventListener('click', function (e) {
  var rect = this.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

volSlider.addEventListener('click', function (e) {
  var rect = this.getBoundingClientRect();
  volumeLevel = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.volume = volumeLevel;
  volFill.style.width = (volumeLevel * 100) + '%';
});

function togglePanel() {
  panelOpen = !panelOpen;
  musicPanel.classList.toggle('open', panelOpen);
  musicToggle.classList.toggle('panel-open', panelOpen);
}
musicToggle.addEventListener('click', togglePanel);
panelClose.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });

var hasInteracted = false;
document.addEventListener('click', function unlockPlay(e) {
  if (e.target.closest('#flipCard') || e.target.closest('#musicPlayer')) return;
  if (hasInteracted) return;
  hasInteracted = true;
  setupAudioContext();
  audio.play().catch(function () {});
  document.removeEventListener('click', unlockPlay);
});


// ─── SECRET ──────────────────────────────────────────────
var secretTrigger = document.getElementById('secretTrigger');
var secretSection = document.getElementById('secret-section');
var secretClicks  = 0, secretTimer = null;

if (secretTrigger) {
  secretTrigger.addEventListener('click', function () {
    secretClicks++;
    clearTimeout(secretTimer);
    secretTrigger.className = 'secret-trigger';
    if (secretClicks >= 2) secretTrigger.classList.add('h1');
    if (secretClicks >= 4) secretTrigger.classList.add('h2');
    if (secretClicks >= 6) secretTrigger.classList.add('h3');
    if (secretClicks >= 7) {
      secretTrigger.style.display = 'none';
      secretSection.classList.add('revealed');
      secretSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      secretClicks = 0;
    } else {
      secretTimer = setTimeout(function () {
        secretClicks = 0;
        secretTrigger.className = 'secret-trigger';
      }, 2000);
    }
  });
}

function closeSecret() {
  secretSection.classList.remove('revealed');
  setTimeout(function () { secretSection.style.display = 'none'; }, 400);
  if (secretTrigger) secretTrigger.style.display = 'inline-block';
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}


// ═══════════════════════════════════════════════════════
// BUTTERFLY SYSTEM — lazy, init hanya saat audio play
// ═══════════════════════════════════════════════════════
(function () {
  var canvas, ctx, butterflies = [], animId = null, active = false;
  var butterflyInited = false;

  function initButterfly() {
    if (butterflyInited) return;
    butterflyInited = true;

    canvas = document.getElementById('butterfly-canvas');
    ctx    = canvas.getContext('2d');

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    var PALETTES = [
      ['#00f5d4','#7c3aed','#00e5ff'],
      ['#f72585','#7c3aed','#ff6db3'],
      ['#00f5d4','#f72585','#a78bfa'],
      ['#ffbe0b','#00f5d4','#fb5607'],
    ];
    function rp() { return PALETTES[Math.floor(Math.random() * PALETTES.length)]; }

    function Butterfly() { this.reset(true); }
    Butterfly.prototype.reset = function (initial) {
      this.x         = initial ? Math.random() * canvas.width  : -60;
      this.y         = initial ? Math.random() * canvas.height : 80 + Math.random() * (canvas.height - 160);
      this.vx        = 0.18 + Math.random() * 0.35;
      this.vy        = (Math.random() - 0.5) * 0.4;
      this.size      = 14 + Math.random() * 18;
      this.palette   = rp();
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = 0.04 + Math.random() * 0.03;
      this.wobbleAmp = 0.5 + Math.random() * 0.8;
      this.wobbleFreq   = 0.02 + Math.random() * 0.02;
      this.wobbleOffset = Math.random() * Math.PI * 2;
      this.trail     = [];
      this.trailLen  = 18 + Math.floor(Math.random() * 12);
      this.alpha     = 0;
      this.fadeIn    = true;
      this.rotation  = 0;
      this.beatScale = 1;
    };
    Butterfly.prototype.update = function (beat) {
      this.wingPhase += this.wingSpeed;
      this.x += this.vx;
      this.y += this.vy + Math.sin(this.x * this.wobbleFreq + this.wobbleOffset) * this.wobbleAmp;
      this.rotation = Math.sin(this.wingPhase * 0.5) * 0.15;
      if (beat) this.beatScale = 1.35;
      this.beatScale += (1 - this.beatScale) * 0.12;
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > this.trailLen) this.trail.pop();
      if (this.fadeIn) this.alpha = Math.min(1, this.alpha + 0.03);
      if (this.x > canvas.width + 80) this.alpha -= 0.04;
      if (this.alpha <= 0 && !this.fadeIn) this.reset();
    };
    Butterfly.prototype.drawWing = function (ctx, cx, cy, side, wingOpen, size, color) {
      var sw = side, wAngle = wingOpen * sw;
      ctx.save(); ctx.globalAlpha = this.alpha; ctx.translate(cx, cy); ctx.rotate(this.rotation);
      ctx.beginPath(); ctx.moveTo(0, 0);
      var ux1 = sw * size * 0.9 * Math.cos(wAngle),  uy1 = -size * 0.5 + sw * size * 0.1 * Math.sin(wAngle);
      var ux2 = sw * size * 1.1 * Math.cos(wAngle),  uy2 = size * 0.5;
      ctx.bezierCurveTo(ux1 - sw * 4, uy1 - 8, ux2, uy2 * 0.3, ux2 * 0.7, uy2);
      ctx.bezierCurveTo(ux2 * 0.3, uy2 * 1.1, sw * 4, size * 0.3, 0, 0);
      var g = ctx.createRadialGradient(ux1 * 0.5, uy1 * 0.5, 0, ux1 * 0.5, uy1 * 0.5, size * 0.9);
      g.addColorStop(0, color + 'cc'); g.addColorStop(0.5, color + '66'); g.addColorStop(1, color + '11');
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.strokeStyle = color + 'bb'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();

      ctx.save(); ctx.globalAlpha = this.alpha; ctx.translate(cx, cy); ctx.rotate(this.rotation);
      ctx.beginPath(); ctx.moveTo(0, 0);
      var lx1 = sw * size * 0.7 * Math.cos(wAngle * 0.8), ly1 = size * 0.5;
      var lx2 = sw * size * 0.5 * Math.cos(wAngle * 0.8), ly2 = size * 1.1;
      ctx.bezierCurveTo(lx1, ly1 - 4, lx2 + sw * 6, ly2, lx2 * 0.5, ly2 * 0.9);
      ctx.bezierCurveTo(sw * 2, size * 0.8, sw * 2, size * 0.4, 0, 0);
      var g2 = ctx.createRadialGradient(lx1, ly1, 0, lx1, ly1, size * 0.6);
      g2.addColorStop(0, this.palette[1] + 'aa'); g2.addColorStop(1, this.palette[1] + '11');
      ctx.fillStyle = g2; ctx.fill();
      ctx.shadowBlur = 10; ctx.shadowColor = this.palette[1]; ctx.strokeStyle = this.palette[1] + '99'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    };
    Butterfly.prototype.draw = function (ctx) {
      if (this.alpha <= 0) return;
      var wingOpen = Math.sin(this.wingPhase) * Math.PI * 0.42 * this.beatScale;
      var self = this;
      this.trail.forEach(function (pt, i) {
        var t = 1 - i / self.trailLen;
        ctx.save(); ctx.globalAlpha = self.alpha * t * 0.18;
        ctx.shadowBlur = 8; ctx.shadowColor = self.palette[0]; ctx.fillStyle = self.palette[0];
        ctx.beginPath(); ctx.arc(pt.x, pt.y, (self.size * 0.08) * t, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      this.drawWing(ctx, this.x, this.y,  1, wingOpen, this.size, this.palette[0]);
      this.drawWing(ctx, this.x, this.y, -1, wingOpen, this.size, this.palette[0]);
      ctx.save(); ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10; ctx.shadowColor = this.palette[2] || '#fff';
      ctx.strokeStyle = this.palette[2] || '#fff'; ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size * 0.55);
      ctx.lineTo(this.x, this.y + this.size * 0.55); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.size * 0.5);
      ctx.quadraticCurveTo(this.x - 6, this.y - this.size * 0.9, this.x - 8, this.y - this.size * 1.1);
      ctx.moveTo(this.x, this.y - this.size * 0.5);
      ctx.quadraticCurveTo(this.x + 6, this.y - this.size * 0.9, this.x + 8, this.y - this.size * 1.1);
      ctx.stroke(); ctx.restore();
    };

    function spawnButterflies(count) {
      for (var n = 0; n < count; n++) {
        (function (delay) {
          setTimeout(function () { butterflies.push(new Butterfly()); }, delay);
        })(n * 180);
      }
    }

    var beatFlag = false;

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      butterflies.forEach(function (bf) { bf.update(beatFlag); bf.draw(ctx); });
      beatFlag = false;
      animId = requestAnimationFrame(loop);
    }

    window.butterflyStart = function () {
      if (active) return;
      active = true;
      canvas.classList.add('active');
      butterflies = [];
      spawnButterflies(7);
      loop();
    };
    window.butterflyStop = function () {
      active = false;
      canvas.classList.remove('active');
      cancelAnimationFrame(animId);
      animId = null;
      butterflies = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    window.butterflyBeat = function () {
      beatFlag = true;
      if (butterflies.length < 12 && Math.random() < 0.25) butterflies.push(new Butterfly());
    };
  }

  // Inisialisasi hanya saat audio pertama kali play
  var audioEl = document.getElementById('audio');
  if (audioEl) {
    audioEl.addEventListener('play', function firstPlay() {
      initButterfly();
      audioEl.removeEventListener('play', firstPlay);
    });
  }
})();


// ═══════════════════════════════════════════════════════
// PIXEL CODING ROOM — lazy, hanya saat section masuk viewport
// ═══════════════════════════════════════════════════════
(function () {
  var pixelTarget = document.getElementById('pxClock') ||
                    document.getElementById('pxEditorBody') ||
                    document.querySelector('.pixel-room');

  function initPixelRoom() {

    // ── Clock ──────────────────────────────────────
    function updatePixelClock() {
      var now = new Date();
      var h   = String(now.getHours()).padStart(2, '0');
      var m   = String(now.getMinutes()).padStart(2, '0');
      var s   = String(now.getSeconds()).padStart(2, '0');
      var el  = document.getElementById('pxClock');
      if (el) el.textContent = h + ':' + m + ':' + s;
      var totalSec  = now.getSeconds();
      var totalMin  = now.getMinutes() * 60 + totalSec;
      var totalHour = (now.getHours() % 12) * 3600 + totalMin;
      var secEl     = document.getElementById('pxSec');
      var minEl     = document.getElementById('pxMin');
      var hourEl    = document.getElementById('pxHour');
      if (secEl && minEl && hourEl) {
        secEl.style.transform  = 'rotate(' + (totalSec * 6)      + 'deg)';
        minEl.style.transform  = 'rotate(' + (totalMin / 10)     + 'deg)';
        hourEl.style.transform = 'rotate(' + (totalHour / 120)   + 'deg)';
      }
    }
    updatePixelClock();
    setInterval(updatePixelClock, 1000);

    // ── Keyboard rows ──────────────────────────────
    var pxRows = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'wide'],
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'wide'],
      ['space'],
    ];
    ['pxRow1', 'pxRow2', 'pxRow3'].forEach(function (id, ri) {
      var row = document.getElementById(id);
      if (!row) return;
      pxRows[ri].forEach(function (k) {
        var d = document.createElement('div');
        d.className = 'px-key' + (k === 'wide' ? ' wide' : k === 'space' ? ' space' : '');
        row.appendChild(d);
      });
    });

    setInterval(function randomPxKeyPress() {
      var keys = document.querySelectorAll('.px-key');
      if (!keys.length) return;
      var key = keys[Math.floor(Math.random() * keys.length)];
      key.classList.add('active');
      setTimeout(function () { key.classList.remove('active'); }, 80);
    }, 120);

    // ── Typing code ────────────────────────────────
    var pxCodeLines = [
      '<span class="px-kw">import</span> <span class="px-br">{</span> <span class="px-ac">useState</span> <span class="px-br">}</span> <span class="px-kw">from</span> <span class="px-str">\'react\'</span>',
      '<span class="px-kw">import</span> <span class="px-ac">axios</span> <span class="px-kw">from</span> <span class="px-str">\'axios\'</span>',
      '',
      '<span class="px-kw">const</span> <span class="px-fn">Portfolio</span> <span class="px-op">=</span> <span class="px-br">()</span> <span class="px-op">=></span> <span class="px-br">{</span>',
      '&nbsp;&nbsp;<span class="px-kw">const</span> <span class="px-br">[</span><span class="px-ac">name</span><span class="px-br">,</span> <span class="px-ac">setName</span><span class="px-br">]</span> <span class="px-op">=</span> <span class="px-fn">useState</span><span class="px-br">(</span><span class="px-str">\'Wahyu\'</span><span class="px-br">)</span>',
      '&nbsp;&nbsp;<span class="px-kw">const</span> <span class="px-ac">stack</span> <span class="px-op">=</span> <span class="px-br">[</span><span class="px-str">\'React\'</span><span class="px-br">,</span> <span class="px-str">\'Laravel\'</span><span class="px-br">]</span>',
      '',
      '&nbsp;&nbsp;<span class="px-cm">// crafting with ❤️</span>',
      '&nbsp;&nbsp;<span class="px-kw">return</span> <span class="px-br">(</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="px-op">&lt;</span><span class="px-fn">div</span> <span class="px-ac">className</span><span class="px-op">=</span><span class="px-str">"app"</span><span class="px-op">&gt;</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="px-op">&lt;</span><span class="px-fn">Hero</span> <span class="px-ac">name</span><span class="px-op">={</span><span class="px-ac">name</span><span class="px-op">}</span> <span class="px-op">/&gt;</span>',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="px-op">&lt;/</span><span class="px-fn">div</span><span class="px-op">&gt;</span>',
      '&nbsp;&nbsp;<span class="px-br">)</span>',
      '<span class="px-br">}</span>',
      '',
      '<span class="px-kw">export default</span> <span class="px-fn">Portfolio</span>',
    ];

    var pxLineIdx    = 0;
    var pxEditorBody = document.getElementById('pxEditorBody');

    function pxTypeLine() {
      if (!pxEditorBody) return;
      if (pxLineIdx >= pxCodeLines.length) {
        setTimeout(function () { pxEditorBody.innerHTML = ''; pxLineIdx = 0; pxTypeLine(); }, 3000);
        return;
      }
      var lineEl  = document.createElement('div');
      lineEl.className = 'px-code-line';
      var lineNum = String(pxLineIdx + 1).padStart(2, '0');
      lineEl.innerHTML = '<span class="px-ln">' + lineNum + '</span><span>' + pxCodeLines[pxLineIdx] + '</span>';
      pxEditorBody.appendChild(lineEl);
      pxEditorBody.scrollTop = pxEditorBody.scrollHeight;
      pxEditorBody.querySelectorAll('.px-cursor-blink').forEach(function (c) { c.remove(); });
      var cur = document.createElement('span');
      cur.className = 'px-cursor-blink';
      lineEl.appendChild(cur);
      var delay = pxCodeLines[pxLineIdx] === '' ? 180 : 380 + Math.random() * 200;
      pxLineIdx++;
      setTimeout(pxTypeLine, delay);
    }
    pxTypeLine();

    // ── Music wave bars ────────────────────────────
    var pxMusicWave = document.getElementById('pxMusicWave');
    if (pxMusicWave) {
      [8, 18, 14, 26, 12, 22, 10, 16].forEach(function (h) {
        var bar = document.createElement('div');
        bar.className = 'px-wave-bar';
        bar.style.setProperty('--h', h + 'px');
        bar.style.height = h + 'px';
        pxMusicWave.appendChild(bar);
      });
    }

    // ── Particles ──────────────────────────────────
    var pxParticlesEl = document.getElementById('pxParticles');
    var pxColors      = ['#00f5d4', '#7c3aed', '#f72585', '#38bdf8', '#fbbf24'];

    setInterval(function spawnPxParticle() {
      if (!pxParticlesEl) return;
      var p     = document.createElement('div');
      p.className = 'px-particle';
      var x     = 200 + Math.random() * 400;
      var dur   = 3 + Math.random() * 4;
      var drift = (Math.random() - 0.5) * 40;
      var color = pxColors[Math.floor(Math.random() * pxColors.length)];
      p.style.cssText = [
        'left:'             + x   + 'px;',
        'bottom:120px;',
        'background:'       + color + ';',
        'box-shadow:0 0 4px ' + color + ';',
        '--drift:'          + drift + 'px;',
        'animation-duration:' + dur + 's;',
        'animation-delay:'  + (Math.random() * 3) + 's;',
      ].join('');
      pxParticlesEl.appendChild(p);
      setTimeout(function () { p.remove(); }, (dur + 3) * 1000);
    }, 500);
  }

  // Jalankan hanya saat pixel room masuk viewport
  if (pixelTarget) {
    window.__onVisible(pixelTarget, function () {
      window.__onIdle(initPixelRoom, 1000);
    });
  } else {
    // Fallback: idle setelah 5 detik
    window.__onIdle(initPixelRoom, 5000);
  }
})();


// ═══════════════════════════════════════════════════════
// PIXEL GREETING CONTROLLER
// ═══════════════════════════════════════════════════════
(function () {
  var wrap       = document.getElementById('pxAvatarWrap');
  var bubble     = document.getElementById('pxBubble');
  var bubbleText = document.getElementById('pxBubbleText');
  var typeCursor = document.getElementById('pxTypeCursor');
  var bubbleHint = document.getElementById('pxBubbleHint');

  if (!wrap || !bubble) return;

  var greetings = [
    { msg: 'Halo! Selamat datang 👋',        hint: 'klik untuk chat'  },
    { msg: 'Klik Aku Ada Sesuatu Buat Kamu! 👀', hint: 'klik dimana aja' },
    { msg: 'Saya Wahyu, Web Dev!',            hint: 'klik untuk lanjut' },
    { msg: 'React · Laravel · Tailwind ⚡',  hint: '' },
    { msg: 'Open for projects! 🚀',           hint: 'klik untuk tau lebih' },
    { msg: 'Kopi dulu ga? ☕',               hint: '' },
    { msg: 'Scroll kebawah dulu~ 👇',         hint: '' },
  ];

  var clickReplies = [
    'Hihi, Ga nyangka kamu bakal klik! 😄',
    'Hai! Apa kabar? 😄',
    'Wah kamu klik aku!',
    'Makasih udah mampir~',
    'Jangan lupa hubungi ya!',
    'Kopi dulu ga? ☕',
    'Semangat ngodingnya! 💻',
    'Bug hari ini? 🐛',
    'Stay productive! ✨',
    'Gasss! 🔥',
    'Error? Coba restart~ 😅',
  ];

  var greetIdx = 0, clickIdx = 0, typeTimer = null, autoTimer = null;

  function typeMessage(text, hint, onDone) {
    if (typeTimer) clearInterval(typeTimer);
    bubbleText.textContent = '';
    typeCursor.style.display = 'inline-block';
    bubbleHint.textContent   = '';
    var i = 0;
    typeTimer = setInterval(function () {
      bubbleText.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(typeTimer);
        typeCursor.style.display = 'none';
        bubbleHint.textContent   = hint || '';
        if (onDone) onDone();
      }
    }, 55);
  }

  function showGreeting(idx) {
    var g = greetings[idx % greetings.length];
    bubble.style.display   = 'block';
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubbleIn 0.4s cubic-bezier(.34,1.56,.64,1) both';
    typeMessage(g.msg, g.hint, function () {
      autoTimer = setTimeout(function () {
        greetIdx = (greetIdx + 1) % greetings.length;
        showGreeting(greetIdx);
      }, 3500);
    });
  }

  function triggerWave() {
    wrap.classList.remove('waving');
    void wrap.offsetWidth;
    wrap.classList.add('waving');
    setTimeout(function () { wrap.classList.remove('waving'); }, 900);
  }

  function spawnParticles() {
    var colors = ['#00f5d4', '#7c3aed', '#f72585', '#fbbf24'];
    for (var i = 0; i < 6; i++) {
      (function (delay) {
        setTimeout(function () {
          var p     = document.createElement('div');
          p.className = 'px-float-particle';
          var color = colors[Math.floor(Math.random() * colors.length)];
          var x     = (Math.random() - 0.5) * 60;
          var dur   = 1 + Math.random() * 0.8;
          p.style.cssText = [
            'background:'      + color + ';',
            'box-shadow:0 0 4px ' + color + ';',
            '--fx:'            + x + 'px;',
            'left:'            + (20 + Math.random() * 30) + 'px;',
            'bottom:60px;',
            'animation-duration:' + dur + 's;',
            'width:'           + (2 + Math.random() * 3) + 'px;',
            'height:'          + (2 + Math.random() * 3) + 'px;',
          ].join('');
          wrap.appendChild(p);
          setTimeout(function () { p.remove(); }, dur * 1000 + 100);
        }, delay);
      })(i * 80);
    }
  }

  function spawnRipple() {
    var r = document.createElement('div');
    r.className = 'px-click-ripple';
    wrap.appendChild(r);
    setTimeout(function () { r.remove(); }, 500);
  }

  wrap.addEventListener('click', function () {
    if (autoTimer) clearTimeout(autoTimer);
    if (typeTimer) clearInterval(typeTimer);
    triggerWave(); spawnParticles(); spawnRipple();
    var reply = clickReplies[clickIdx % clickReplies.length];
    clickIdx++;
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = 'bubbleIn 0.35s cubic-bezier(.34,1.56,.64,1) both';
    typeMessage(reply, 'klik lagi!', function () {
      autoTimer = setTimeout(function () {
        greetIdx = (greetIdx + 1) % greetings.length;
        showGreeting(greetIdx);
      }, 2500);
    });
  });

  bubble.addEventListener('click', function () { wrap.click(); });

  setTimeout(function () { triggerWave(); showGreeting(0); }, 800);

  wrap.addEventListener('mouseenter', function () { wrap.style.filter = 'drop-shadow(0 0 12px rgba(0,245,212,0.4))'; });
  wrap.addEventListener('mouseleave', function () { wrap.style.filter = ''; });

  var bodyObserver = new MutationObserver(function () {
    wrap.style.filter = document.body.classList.contains('music-playing')
      ? 'drop-shadow(0 0 16px rgba(0,245,212,0.6)) hue-rotate(0deg)'
      : '';
  });
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();