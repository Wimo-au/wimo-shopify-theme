/* WIMO — cinematic hero choreography, scroll reveals, page dots, quick-buy */
(function () {
  function init() {
    var html = document.documentElement;
    html.classList.add('wimo-js');

    var hero = document.querySelector('.chero');
    var revealEls = [].slice.call(document.querySelectorAll('[data-reveal]'));
    var snapSecs = [].slice.call(document.querySelectorAll('[data-snap]'));
    var quickbuy = document.querySelector('.wimo-quickbuy');
    var isIndex = document.body.classList.contains('tpl-index');

    // build page-dot navigation (homepage only)
    var dots = [];
    if (isIndex && snapSecs.length > 1) {
      var nav = document.createElement('div');
      nav.className = 'wimo-dots';
      snapSecs.forEach(function (s) {
        var row = document.createElement('button');
        row.type = 'button';
        row.className = 'wimo-dot-row';
        row.innerHTML = '<span class="wimo-dot-label">' + (s.getAttribute('data-label') || '') + '</span><span class="wimo-dot"></span>';
        row.addEventListener('click', function () {
          var y = s.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        });
        nav.appendChild(row);
        dots.push(row);
      });
      document.body.appendChild(nav);
    }

    if (hero) html.style.scrollSnapType = 'y proximity';

    var bg = hero && hero.querySelector('.chero__bg');
    var quiet = hero && hero.querySelector('.chero__quiet');
    var title = hero && hero.querySelector('.chero__title');
    var detail = hero && hero.querySelector('.chero__detail');
    var cue = hero && hero.querySelector('.chero__cue');

    function lerp(a, b, t) { return a + (b - a) * t; }
    function cl(t) { return Math.max(0, Math.min(1, t)); }
    function seg(t, a, b) { return cl((t - a) / (b - a)); }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var vh = window.innerHeight;

        // hero beats
        if (hero) {
          var dist = hero.offsetHeight - vh;
          var into = -hero.getBoundingClientRect().top;
          var p = dist > 0 ? cl(into / dist) : 0;

          if (bg) { var b = seg(p, 0, 0.55); bg.style.filter = 'blur(' + lerp(16, 0, b) + 'px)'; bg.style.transform = 'scale(' + lerp(1.16, 1, b) + ')'; }
          if (quiet) { quiet.style.opacity = lerp(1, 0, seg(p, 0.05, 0.2)); }
          if (title) {
            var a = seg(p, 0.18, 0.46);
            var rise = seg(p, 0.46, 0.86);
            var ty = lerp(22, 0, a) - rise * vh * 0.27;
            var sc = lerp(1.22, 1, a) - rise * 0.2;
            title.style.opacity = a;
            title.style.transform = 'scale(' + sc + ') translateY(' + ty + 'px)';
            title.style.filter = 'blur(' + lerp(7, 0, a) + 'px)';
          }
          if (detail) { var ad = seg(p, 0.6, 0.86); detail.style.opacity = ad; detail.style.transform = 'translateY(' + lerp(38, 0, ad) + 'px)'; }
          if (cue) { cue.style.opacity = lerp(0.85, 0, seg(p, 0, 0.12)); }
          if (quickbuy) { quickbuy.classList.toggle('show', p > 0.92); }
        }

        // scroll reveals
        for (var i = 0; i < revealEls.length; i++) {
          if (revealEls[i].getBoundingClientRect().top < vh * 0.85) revealEls[i].classList.add('in');
        }

        // active page dot
        if (dots.length) {
          var act = 0;
          snapSecs.forEach(function (s, idx) { if (s.getBoundingClientRect().top <= vh * 0.5) act = idx; });
          dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === act); });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
