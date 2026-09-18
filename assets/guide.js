/* =============================================================================
   ros2_rpi5 학습 가이드 — 공통 스크립트
   - 단계 목록(STAGES)이 유일한 진실이다. 사이드바·이전/다음·진행률이 전부 여기서 나온다.
   - 진행 기록(체크포인트)은 이 브라우저의 localStorage 에만 저장된다. 서버가 없다.
   ============================================================================= */
(function () {
  'use strict';

  var STAGES = [
    { id: 'index', file: 'rosproject.html', num: '00', title: '학습 로드맵', group: 'main' },
    { id: '01', file: '01-os-setup.html', num: '01', title: 'RPi 5 OS 선정과 설치', group: 'main' },
    { id: '02', file: '02-docker-ros2.html', num: '02', title: 'Docker + ROS 2 Humble', group: 'main' },
    { id: '03', file: '03-ros2-concepts.html', num: '03', title: 'ROS 2 핵심 개념', group: 'main' },
    { id: '04', file: '04-workspace-packages.html', num: '04', title: '워크스페이스와 패키지 — C++ 노드', group: 'main' },
    { id: '05', file: '05-tf2-urdf.html', num: '05', title: 'TF2와 URDF', group: 'main' },
    { id: '06a', file: '06a-mcu-protocol.html', num: '06a', title: 'MCU 프로토콜 선정', group: 'main' },
    { id: '06', file: '06-mcu-bridge.html', num: '06', title: 'MCU 브리지 (C++)', group: 'main' },
    { id: '07', file: '07-lidar.html', num: '07', title: 'LiDAR — /scan', group: 'main' },
    { id: '08', file: '08-camera.html', num: '08', title: '카메라 — libcamera', group: 'main' },
    { id: '08a', file: '08a-opencv.html', num: '08a', title: 'OpenCV와 cv_bridge', group: 'main' },
    { id: '08b', file: '08b-yolo.html', num: '08b', title: 'YOLO 객체 검출', group: 'main' },
    { id: '08c', file: '08c-hailo.html', num: '08c', title: 'Hailo-8 가속', group: 'main' },
    { id: '08d', file: '08d-tracking-fusion.html', num: '08d', title: '객체 추적과 거리 추정 — 융합', group: 'main' },
    { id: '09', file: '09-slam-nav2.html', num: '09', title: 'SLAM과 Nav2', group: 'main' },
    { id: '10', file: '10-autonomy.html', num: '10', title: '자율주행 노드 구성', group: 'main' },
    { id: '99', file: '99-troubleshooting.html', num: '99', title: '트러블슈팅', group: 'main' },
    { id: 'ref-rclcpp', file: 'ref-rclcpp.html', num: 'A', title: 'rclcpp 레퍼런스', group: 'ref' },
    { id: 'ref-opencv', file: 'ref-opencv.html', num: 'B', title: 'OpenCV 사용법', group: 'ref' },
    { id: 'ref-yolo', file: 'ref-yolo.html', num: 'C', title: 'YOLO 사용법', group: 'ref' }
  ];

  var STORE_KEY = 'rpi5guide.v1';

  function loadStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      if (!obj.checks) obj.checks = {};
      if (!obj.totals) obj.totals = {};
      return obj;
    } catch (e) {
      return { checks: {}, totals: {} };
    }
  }

  function saveStore(store) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* private mode 등 */ }
  }

  function stageById(id) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
    return null;
  }

  function stageProgress(store, id) {
    var total = store.totals[id] || 0;
    var done = 0;
    Object.keys(store.checks).forEach(function (k) {
      if (k.indexOf(id + ':') === 0 && store.checks[k]) done++;
    });
    return { total: total, done: done };
  }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }

  // ── 사이드바 ────────────────────────────────────────────────────────────
  function buildSidebar(currentId, store) {
    var side = document.querySelector('.sidebar');
    if (!side) return;
    side.innerHTML = '';
    var brand = el('a', { class: 'brand', href: 'rosproject.html' });
    brand.appendChild(document.createTextNode('ROS 2 자율주행 학습 가이드'));
    brand.appendChild(el('small', { text: 'Raspberry Pi 5 · Humble · C++ 주 / Python 보조' }));
    side.appendChild(brand);

    ['main', 'ref'].forEach(function (group) {
      side.appendChild(el('div', { class: 'group-title', text: group === 'main' ? '학습 단계' : '부록 · 레퍼런스' }));
      var ul = el('ul');
      STAGES.filter(function (s) { return s.group === group; }).forEach(function (s) {
        var a = el('a', { href: s.file, class: s.id === currentId ? 'current' : '' });
        var dot = el('span', { class: 'dot' });
        if (s.id !== 'index' && s.group === 'main') {
          var p = stageProgress(store, s.id);
          if (p.total > 0 && p.done >= p.total) dot.className = 'dot done';
          else if (p.done > 0) dot.className = 'dot part ' + (p.done / p.total >= 0.75 ? 'high' : (p.done / p.total <= 0.3 ? 'low' : ''));
          dot.title = p.total ? (p.done + ' / ' + p.total + ' 체크포인트') : '아직 방문하지 않음';
        } else {
          dot.style.visibility = 'hidden';
        }
        a.appendChild(dot);
        a.appendChild(el('span', { class: 'num', text: s.num }));
        a.appendChild(el('span', { text: s.title }));
        ul.appendChild(el('li', null, [a]));
      });
      side.appendChild(ul);
    });
  }

  // ── 모바일 상단바 ──────────────────────────────────────────────────────
  function buildTopbar(stage) {
    var bar = document.querySelector('.topbar');
    if (!bar) return;
    bar.innerHTML = '';
    var btn = el('button', { type: 'button', 'aria-label': '목차 열기', text: '☰ 목차' });
    btn.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
    bar.appendChild(btn);
    bar.appendChild(el('span', { class: 'title', text: (stage ? stage.num + ' · ' + stage.title : '가이드') }));
    var scrim = el('div', { class: 'scrim' });
    scrim.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    document.body.appendChild(scrim);
  }

  // ── 이전 / 다음 ────────────────────────────────────────────────────────
  function buildPager(currentId) {
    var pager = document.querySelector('.pager');
    if (!pager) return;
    var main = STAGES.filter(function (s) { return s.group === 'main'; });
    var idx = -1;
    for (var i = 0; i < main.length; i++) if (main[i].id === currentId) idx = i;
    if (idx < 0) return;
    pager.innerHTML = '';
    var prev = main[idx - 1], next = main[idx + 1];
    if (prev) {
      pager.appendChild(el('a', { href: prev.file, class: 'prev' }, [
        el('span', { class: 'dir', text: '← 이전' }),
        el('span', { class: 't', text: prev.num + ' · ' + prev.title })
      ]));
    } else {
      pager.appendChild(el('span'));
    }
    if (next) {
      pager.appendChild(el('a', { href: next.file, class: 'next' }, [
        el('span', { class: 'dir', text: '다음 →' }),
        el('span', { class: 't', text: next.num + ' · ' + next.title })
      ]));
    }
  }

  // ── 체크리스트 저장 ────────────────────────────────────────────────────
  function bindChecklists(stageId, store) {
    var boxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    if (!boxes.length) return;
    store.totals[stageId] = boxes.length;
    boxes.forEach(function (box, i) {
      var key = stageId + ':' + (box.getAttribute('data-key') || ('cp' + i));
      box.checked = !!store.checks[key];
      box.addEventListener('change', function () {
        store.checks[key] = box.checked;
        saveStore(store);
        renderProgress(stageId, store);
        buildSidebar(stageId, store);
      });
    });
    saveStore(store);
    renderProgress(stageId, store);
  }

  function renderProgress(stageId, store) {
    var p = stageProgress(store, stageId);
    document.querySelectorAll('.progress-line').forEach(function (line) {
      line.textContent = '체크포인트 ' + p.done + ' / ' + p.total +
        (p.total && p.done >= p.total ? ' — 이 단계 통과. 다음 단계로 가십시오.' : '  (이 브라우저에 저장됩니다)');
    });
    document.querySelectorAll('.progress-bar > span').forEach(function (bar) {
      bar.style.width = (p.total ? Math.round(100 * p.done / p.total) : 0) + '%';
    });
  }

  // ── index 의 진행 현황 표 ──────────────────────────────────────────────
  function renderOverview(store) {
    var box = document.getElementById('progress-overview');
    if (!box) return;
    box.innerHTML = '';
    var any = false;
    var ul = el('ul', { class: 'checklist' });
    STAGES.filter(function (s) { return s.group === 'main' && s.id !== 'index'; }).forEach(function (s) {
      var p = stageProgress(store, s.id);
      if (p.total) any = true;
      var li = el('li');
      var lab = el('label');
      var cb = el('input', { type: 'checkbox', disabled: 'disabled' });
      cb.checked = p.total > 0 && p.done >= p.total;
      lab.appendChild(cb);
      var txt = el('span');
      var a = el('a', { href: s.file, text: s.num + ' · ' + s.title });
      txt.appendChild(a);
      txt.appendChild(el('span', { class: 'sub', text: p.total ? ('체크포인트 ' + p.done + ' / ' + p.total) : '아직 열어보지 않음' }));
      lab.appendChild(txt);
      li.appendChild(lab);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    if (!any) box.appendChild(el('p', { class: 'small', text: '각 단계 페이지의 체크포인트를 체크하면 여기에 진행 상황이 모입니다. 기록은 이 브라우저에만 저장됩니다.' }));

    var reset = document.getElementById('reset-progress');
    if (reset) {
      var armed = false;
      reset.addEventListener('click', function () {
        if (!armed) { armed = true; reset.textContent = '정말 초기화하려면 다시 클릭'; setTimeout(function () { armed = false; reset.textContent = '진행 기록 초기화'; }, 4000); return; }
        try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
        window.location.reload();
      });
    }
  }

  // ── 코드 블록: 언어 라벨 + 복사 버튼 + 간단 하이라이트 ─────────────────
  var LANG_LABEL = { cpp: 'C++', python: 'Python', bash: 'bash', yaml: 'YAML', cmake: 'CMake', xml: 'XML', ini: 'ini', text: '' };
  var KEYWORDS = {
    cpp: ['auto', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'constexpr', 'static', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'using', 'namespace', 'template', 'typename', 'new', 'delete', 'this', 'nullptr', 'true', 'false', 'void', 'int', 'double', 'float', 'bool', 'char', 'unsigned', 'size_t', 'uint8_t', 'int16_t', 'int32_t', 'uint16_t', 'uint32_t', 'std', 'try', 'catch', 'throw', 'explicit', 'inline', 'enum', 'default'],
    python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'pass', 'None', 'True', 'False', 'self', 'lambda', 'yield', 'global', 'is', 'break', 'continue'],
    bash: ['sudo', 'cd', 'ls', 'cat', 'echo', 'export', 'source', 'if', 'then', 'fi', 'for', 'do', 'done', 'ros2', 'colcon', 'docker', 'ssh', 'scp', 'git', 'pip3', 'pip', 'python3', 'apt', 'apt-get', 'mkdir', 'cp', 'mv', 'rm', 'grep', 'tee', 'chmod'],
    cmake: ['cmake_minimum_required', 'project', 'find_package', 'add_executable', 'add_library', 'target_link_libraries', 'target_include_directories', 'ament_target_dependencies', 'install', 'ament_package', 'if', 'endif', 'set', 'REQUIRED', 'DESTINATION', 'TARGETS', 'DIRECTORY', 'add_compile_options', 'rclcpp_components_register_node'],
    yaml: [], xml: [], ini: [], text: []
  };
  var LINE_COMMENT = { cpp: '//', python: '#', bash: '#', cmake: '#', yaml: '#', ini: '#', xml: null, text: null };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(src, lang) {
    var kws = KEYWORDS[lang] || [];
    var lc = LINE_COMMENT[lang];
    var out = '';
    var i = 0, n = src.length;
    var kwSet = {};
    kws.forEach(function (k) { kwSet[k] = true; });
    while (i < n) {
      var ch = src[i];
      // XML comment
      if (lang === 'xml' && src.substr(i, 4) === '<!--') {
        var end = src.indexOf('-->', i + 4); end = end < 0 ? n : end + 3;
        out += '<span class="hl-cmt">' + escapeHtml(src.slice(i, end)) + '</span>'; i = end; continue;
      }
      // line comment (C++ 의 // 는 문자열 밖에서만; URL 의 :// 는 문자열 안이라 보호됨)
      if (lc && src.substr(i, lc.length) === lc && !(lang === 'bash' && i > 0 && src[i - 1] === '$')) {
        var e2 = src.indexOf('\n', i); e2 = e2 < 0 ? n : e2;
        out += '<span class="hl-cmt">' + escapeHtml(src.slice(i, e2)) + '</span>'; i = e2; continue;
      }
      // block comment (C++)
      if (lang === 'cpp' && src.substr(i, 2) === '/*') {
        var e3 = src.indexOf('*/', i + 2); e3 = e3 < 0 ? n : e3 + 2;
        out += '<span class="hl-cmt">' + escapeHtml(src.slice(i, e3)) + '</span>'; i = e3; continue;
      }
      // preprocessor
      if (lang === 'cpp' && ch === '#' && (i === 0 || src[i - 1] === '\n')) {
        var e4 = src.indexOf('\n', i); e4 = e4 < 0 ? n : e4;
        out += '<span class="hl-pp">' + escapeHtml(src.slice(i, e4)) + '</span>'; i = e4; continue;
      }
      // strings
      if (ch === '"' || ch === "'") {
        var j = i + 1;
        while (j < n && src[j] !== ch && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
        j = Math.min(j + 1, n);
        out += '<span class="hl-str">' + escapeHtml(src.slice(i, j)) + '</span>'; i = j; continue;
      }
      // identifiers / numbers
      if (/[A-Za-z_]/.test(ch)) {
        var k = i; while (k < n && /[A-Za-z0-9_\-]/.test(src[k])) k++;
        var word = src.slice(i, k);
        if (kwSet[word]) out += '<span class="hl-kw">' + word + '</span>'; else out += escapeHtml(word);
        i = k; continue;
      }
      if (/[0-9]/.test(ch) && (i === 0 || !/[A-Za-z0-9_]/.test(src[i - 1]))) {
        var m = i; while (m < n && /[0-9.xA-Fa-f]/.test(src[m])) m++;
        out += '<span class="hl-num">' + escapeHtml(src.slice(i, m)) + '</span>'; i = m; continue;
      }
      out += escapeHtml(ch); i++;
    }
    return out;
  }

  function enhanceCode() {
    document.querySelectorAll('pre').forEach(function (pre) {
      if (pre.classList.contains('diagram')) return;
      var code = pre.querySelector('code');
      if (!code) return;
      var lang = null;
      code.classList.forEach(function (c) { if (c.indexOf('lang-') === 0) lang = c.slice(5); });
      if (lang && KEYWORDS.hasOwnProperty(lang) && !code.querySelector('span')) {
        code.innerHTML = highlight(code.textContent, lang);
      }
      if (lang && LANG_LABEL[lang]) pre.appendChild(el('span', { class: 'lang', text: LANG_LABEL[lang] }));
      var btn = el('button', { type: 'button', class: 'copy-btn', text: '복사' });
      btn.addEventListener('click', function () {
        var txt = code.textContent;
        var done = function () { btn.textContent = '복사됨'; setTimeout(function () { btn.textContent = '복사'; }, 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
        } else { fallbackCopy(txt); done(); }
      });
      pre.appendChild(btn);
    });
  }

  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  // ── 제목 앵커 ──────────────────────────────────────────────────────────
  function addAnchors() {
    document.querySelectorAll('.content h2, .content h3').forEach(function (h) {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/[^\wㄱ-힝\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
      }
      var a = el('a', { class: 'anchor', href: '#' + h.id, text: '#', 'aria-label': '이 절의 링크' });
      h.appendChild(a);
    });
  }

  // ── 시작 ──────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var stageId = document.body.getAttribute('data-stage') || 'index';
    var stage = stageById(stageId);
    var store = loadStore();
    buildSidebar(stageId, store);
    buildTopbar(stage);
    buildPager(stageId);
    bindChecklists(stageId, store);
    renderOverview(store);
    enhanceCode();
    addAnchors();
  });

  window.RPI5_GUIDE = { STAGES: STAGES };
})();
