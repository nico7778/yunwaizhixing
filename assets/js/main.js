(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 导航：滚动后变实底；手机菜单
  var nav = document.getElementById('nav');
  var btn = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  function solid() { if (nav) nav.classList.toggle('is-solid', document.body.classList.contains('sub') || window.scrollY > 24); }
  solid();
  window.addEventListener('scroll', solid, { passive: true });
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (btn && links) {
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // 滚动出现
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      // 同一组里的元素依次出现
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      io.observe(el);
    });
  }

  // 老板的日常：横向滑动
  var row = document.getElementById('daily-row');
  var bar = document.getElementById('daily-bar');
  if (row) {
    var arrows = document.querySelectorAll('.daily-ctrl .arrow');
    function update() {
      var max = row.scrollWidth - row.clientWidth;
      var p = max > 0 ? row.scrollLeft / max : 0;
      if (bar) {
        var w = Math.max(row.clientWidth / row.scrollWidth, 0.12);
        bar.style.width = (w * 100) + '%';
        bar.style.transform = 'translateX(' + (p * (1 - w) / w * 100) + '%)';
      }
      if (arrows.length) {
        arrows[0].disabled = row.scrollLeft < 4;
        arrows[1].disabled = row.scrollLeft > max - 4;
      }
    }
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    arrows.forEach(function (a) {
      a.addEventListener('click', function () {
        var card = row.querySelector('.pain');
        var step = card ? card.getBoundingClientRect().width + 20 : 320;
        row.scrollBy({ left: step * Number(a.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    // 桌面端可按住拖动
    var down = false, sx = 0, sl = 0, moved = false;
    row.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = row.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; row.classList.add('is-drag'); }
      row.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      row.classList.remove('is-drag');
    });
    row.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') row.scrollBy({ left: 320, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') row.scrollBy({ left: -320, behavior: 'smooth' });
    });
  }

  // 复制微信号
  var copy = document.getElementById('copy-wx');
  if (copy) {
    var label = copy.querySelector('span');
    copy.addEventListener('click', function () {
      var text = copy.getAttribute('data-copy');
      function done(ok) {
        label.textContent = ok ? '已复制，去微信搜索添加' : '微信号：' + text;
        setTimeout(function () { label.textContent = '复制微信号'; }, 2600);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var t = document.createElement('textarea');
          t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
          document.body.appendChild(t); t.select();
          done(document.execCommand('copy'));
          document.body.removeChild(t);
        } catch (err) { done(false); }
      }
    });
  }
})();
