/* =============================================================================
   ros2_rpi5 학습 가이드 — 공통 스크립트
   - 단계 목록(STAGES)이 유일한 진실이다. 사이드바·이전/다음·진행률이 전부 여기서 나온다.
   - 그룹(GROUPS): STAGES 의 group 값이 사이드바 묶음과 이전/다음의 범위를 정한다. 항목이 없는 그룹은 그리지 않는다.
   - 체크박스 키는 '<단계 id>:<data-key>' 다. data-key 는 쪽 안에서 유일해야 하고, 한번 정하면 바꾸지 않는다.
     바꾸거나 다른 쪽으로 옮길 때는 같은 커밋에서 MIGRATE 표에 '옛 키 → 새 키' 한 줄을 넣는다.
     표에 없는 옛 키는 고아가 되어 그 쪽을 열 때 지워진다(지운 기록은 BACKUP_KEY 에 쌓인다 — pruneOrphans 참고).
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
    // 06b 는 번호로는 06 의 짝이지만 선행이 펌웨어 F19 라서 08d 뒤(09 앞)에 둔다 — 이전/다음이 하는 순서를 따른다.
    { id: '06b', file: '06b-bench-integration.html', num: '06b', title: '실물 MCU 벤치 통합', group: 'main' },
    { id: '09a', file: '09a-assembly-gate.html', num: '09a', title: '조립·실측 관문', group: 'main' },
    { id: '09', file: '09-slam-nav2.html', num: '09', title: 'SLAM과 Nav2', group: 'main' },
    { id: '10', file: '10-autonomy.html', num: '10', title: '자율주행 노드 구성', group: 'main' },
    { id: '99', file: '99-troubleshooting.html', num: '99', title: '트러블슈팅', group: 'main' },
    // MCU 펌웨어 A-Z 가이드 (fw 그룹) — fw_style §1-1 의 id·num·file·title. 있는 쪽만 등록한다(2026-09-22: fw-00~fw-06)
    { id: 'fw-00', file: 'fw-00-map.html', num: 'F0', title: '지도와 준비', group: 'fw' },
    { id: 'fw-01', file: 'fw-01-pinmap.html', num: 'F1', title: '핀맵과 내 보드 확인', group: 'fw' },
    { id: 'fw-02', file: 'fw-02-toolchain.html', num: 'F2', title: '툴체인과 빈 프로젝트', group: 'fw' },
    { id: 'fw-03', file: 'fw-03-clock-console.html', num: 'F3', title: '클럭 520 MHz 와 VCP 콘솔', group: 'fw' },
    { id: 'fw-04', file: 'fw-04-debugger.html', num: 'F4', title: '디버거', group: 'fw' },
    { id: 'fw-05', file: 'fw-05-cli.html', num: 'F5', title: '명령 창(mini CLI)', group: 'fw' },
    { id: 'fw-06', file: 'fw-06-tick-watchdog.html', num: 'F6', title: '1 kHz 박자와 워치독', group: 'fw' },
    { id: 'fw-07', file: 'fw-07-memory-dma.html', num: 'F7', title: '메모리 지도 — DTCM·DMA·캐시', group: 'fw' },
    { id: 'fw-08', file: 'fw-08-pwm-safe-output.html', num: 'F8', title: 'PWM 과 안전 출력단', group: 'fw' },
    { id: 'fw-09', file: 'fw-09-encoder.html', num: 'F9', title: '엔코더', group: 'fw' },
    { id: 'fw-10', file: 'fw-10-i2c-ina226.html', num: 'F10', title: 'I2C 와 INA226', group: 'fw' },
    { id: 'fw-11', file: 'fw-11-power-sequence.html', num: 'F11', title: '전원 시퀀스와 첫 통전', group: 'fw' },
    { id: 'fw-12', file: 'fw-12-adc.html', num: 'F12', title: 'ADC — 배터리 전류와 선택 채널', group: 'fw' },
    { id: 'fw-13', file: 'fw-13-pid-protection.html', num: 'F13', title: '속도 PID + 보호 3종', group: 'fw' },
    { id: 'fw-14', file: 'fw-14-wt901.html', num: 'F14', title: 'WT901', group: 'fw' },
    { id: 'fw-15', file: 'fw-15-bno055.html', num: 'F15', title: 'BNO055', group: 'fw' },
    { id: 'fw-16', file: 'fw-16-flash-store.html', num: 'F16', title: '플래시 저장', group: 'fw' },
    { id: 'fw-17', file: 'fw-17-link-v2.html', num: 'F17', title: '계약 v2 링크', group: 'fw' },
    { id: 'fw-18', file: 'fw-18-safety-fsm.html', num: 'F18', title: '안전 상태기계', group: 'fw' },
    { id: 'fw-19', file: 'fw-19-bench-acceptance.html', num: 'F19', title: '모듈 정리와 벤치 수용 시험', group: 'fw' },
    { id: 'fw-20', file: 'fw-20-after-assembly.html', num: 'F20', title: '조립 후 마무리', group: 'fw' },
    { id: 'l-00', file: 'l-00-map.html', num: 'L0', title: '지도와 준비', group: 'lidar' },
    { id: 'l-01', file: 'l-01-link.html', num: 'L1', title: '살아 있는가', group: 'lidar' },
    { id: 'l-02', file: 'l-02-device-id.html', num: 'L2', title: '기기에게 묻는다', group: 'lidar' },
    { id: 'l-03', file: 'l-03-one-point.html', num: 'L3', title: '5바이트를 손으로 판다', group: 'lidar' },
    { id: 'l-04', file: 'l-04-one-turn.html', num: 'L4', title: '한 바퀴와 기록 파일', group: 'lidar' },
    { id: 'l-05', file: 'l-05-bandwidth-modes.html', num: 'L5', title: '왜 점이 이것뿐인가', group: 'lidar' },
    { id: 'l-06', file: 'l-06-three-sources.html', num: 'L6', title: '세 개의 입구', group: 'lidar' },
    { id: 'l-07', file: 'l-07-cross-verify.html', num: 'L7', title: '두 경로가 서로를 채점한다', group: 'lidar' },
    { id: 'l-08', file: 'l-08-floor-plan.html', num: 'L8', title: '점을 방으로', group: 'lidar' },
    { id: 'l-09', file: 'l-09-occupancy.html', num: 'L9', title: '광선과 격자 한 장', group: 'lidar' },
    { id: 'l-10', file: 'l-10-clusters.html', num: 'L10', title: '덩어리로 자르기', group: 'lidar' },
    { id: 'l-11', file: 'l-11-lines.html', num: 'L11', title: '선분과 코너', group: 'lidar' },
    { id: 'l-12', file: 'l-12-clearance.html', num: 'L12', title: '벽까지의 거리와 통로 폭', group: 'lidar' },
    { id: 'l-13', file: 'l-13-motion.html', num: 'L13', title: '두 장의 차', group: 'lidar' },
    { id: 'l-14', file: 'l-14-alignment.html', num: 'L14', title: '정합의 원리', group: 'lidar' },
    { id: 'l-15', file: 'l-15-illusions.html', num: 'L15', title: '착시 셋과 재질', group: 'lidar' },
    { id: 'l-16', file: 'l-16-node.html', num: 'L16', title: '도구를 노드로', group: 'lidar' },
    { id: 'l-17', file: 'l-17-acceptance.html', num: 'L17', title: '라이다 벤치 수용', group: 'lidar' },
    { id: 'ref-rclcpp', file: 'ref-rclcpp.html', num: 'A', title: 'rclcpp 레퍼런스', group: 'ref' },
    { id: 'ref-opencv', file: 'ref-opencv.html', num: 'B', title: 'OpenCV 사용법', group: 'ref' },
    { id: 'ref-yolo', file: 'ref-yolo.html', num: 'C', title: 'YOLO 사용법', group: 'ref' },
    { id: 'ref-abbr', file: 'ref-abbr.html', num: 'D', title: '약어 모음 — MCU · 펌웨어', group: 'ref' }
  ];

  // 그룹: 배열 순서 = 사이드바에 그리는 순서. 이전/다음은 그룹 경계를 넘지 않는다.
  var GROUPS = [
    { id: 'main', label: '학습 단계' },
    { id: 'fw', label: 'MCU 펌웨어 가이드' },
    { id: 'lidar', label: '라이다 가이드' },
    { id: 'ref', label: '부록 · 레퍼런스' }
  ];

  var STORE_KEY = 'rpi5guide.v1';
  var BACKUP_KEY = 'rpi5guide.v1.bak';   // 지운 체크 기록을 쌓아 두는 보관함: { checks: { '<지운 키>': true, ... } }

  // 이행 표: '<옛 단계 id>:<옛 data-key>' → '<새 단계 id>:<새 data-key>'. 뒤를 잇는 항목 없이 없앤 것은 null.
  //   예) '06:cp7': 'fw-03:enc-count',   '05:cp12': null
  // 체크 항목을 다른 쪽으로 옮기거나 data-key 를 바꾸는 커밋에는 반드시 여기에 한 줄을 함께 넣는다.
  // 기준선은 .restructure/checklist_keys.tsv(개편 전의 키 전부)이고, scripts/validate_guide.py 의 V6 이
  // "기준선 키가 쪽에서 사라졌는데 이 표에 없다"를 ERROR 로 잡는다.
  // 규칙: ① 새 키는 지금 쪽에 실제로 있는 키다 — 사슬을 만들지 말고 언제나 최종 키를 가리킨다
  //       ② 옛 키는 지금 어느 쪽에도 없다 ③ 값은 문자열 리터럴이나 null 만 쓴다(검증기가 정규식으로 읽는다)
  //       ④ 옛 키 여럿이 한 새 키를 가리키면, 그중 하나라도 체크돼 있었으면 새 항목이 체크된다.
  var MIGRATE = {
    // 05: 실측 세 항목은 조립·실측 관문(09a)으로 간다. 사용자는 체크하지 않았다(2026-09-22). 원문은 .restructure/gate_holding/05.md
    '05:cp2': null,
    '05:cp3': null,
    '05:cp7': null,
    // 06: 펌웨어 항목 다섯 개 — 받을 fw 쪽(fw-14·16·17·19)이 생기면 null 을 그쪽 키로 바꾼다(보관함에서 되살아난다)
    '06:cp3': null,
    '06:cp6': null,
    '06:cp7': null,
    '06:cp8': null,
    '06:cp9': null,
    // 06: 실물 MCU 가 있어야 닫히는 항목은 06b 로
    '06:cp10': '06b:imu-compare-table',
    '06:cp11': '06b:imu-bias-and-integral',
    '06:cp12': '06b:raw-frames-no-crc-error',
    '06:cp13': '06b:teleop-direction-encoder-watchdog',
    '06:cp14': '06b:fault-injection-event',
    '06:cp18': '06b:imu-gz-overlap',
    // 06 · 07: 조립된 로봇이 있어야 닫히는 항목은 09a 로(원문은 .restructure/gate_holding/06.md · 07.md).
    //   셋 다 null 로 둔다 — 잇지 않는다. 이유는 하나다: **조립된 로봇 없이는 참일 수 없는 항목**이라
    //   지금 체크돼 있다면 그것은 오체크이고, applyMigrate 는 옛 키가 체크돼 있으면 새 키를 자동으로
    //   체크하므로 그 오체크를 관문 항목에 퍼뜨린다. 학습자는 재지 않은 값을 잰 것으로 보게 된다.
    //   (cp15 는 셋으로 갈라지기까지 해 '옛 키 하나 → 새 키 하나'도 안 된다.)
    //   기록이 정말 있다면 관문에서 그 항목 하나를 다시 체크하면 된다 — 잃는 것이 얻는 것보다 작다.
    '06:cp15': null,   // 2 m 직진·5바퀴·사각형 — 바닥 주행이 필요하다
    '06:cp17': null,   // 360° 회전에서 EKF yaw 비교 — 바닥 주행이 필요하다
    '07:cp12': null    // 라이다 장착 위치 실측 — 차체에 올려야 잰다
  };

  // JSON 이 객체가 아닌 것(null·숫자·배열)을 담고 있어도 뒤의 코드가 죽지 않게 형태를 확인한다.
  function isDict(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  function loadStore() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      if (!isDict(obj)) obj = {};
      if (!isDict(obj.checks)) obj.checks = {};
      if (!isDict(obj.totals)) obj.totals = {};
      return obj;
    } catch (e) {
      return { checks: {}, totals: {} };
    }
  }

  function saveStore(store) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* private mode 등 */ }
  }

  // ── 지운 기록 보관함 ────────────────────────────────────────────────────
  // 옛 형식(정리 직전의 store 를 통째로 복사한 것)도 checks 를 갖고 있으므로 그대로 읽힌다.
  function loadBackup() {
    try {
      var raw = window.localStorage.getItem(BACKUP_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return { checks: (isDict(obj) && isDict(obj.checks)) ? obj.checks : {} };
    } catch (e) {
      return { checks: {} };
    }
  }

  function saveBackup(bak) {
    try {
      if (Object.keys(bak.checks).length) window.localStorage.setItem(BACKUP_KEY, JSON.stringify(bak));
      else window.localStorage.removeItem(BACKUP_KEY);
    } catch (e) { /* private mode 등 */ }
  }

  // removed: { '<지운 키>': 지울 때의 값 }. 체크돼 있던 것만 쌓는다(체크 안 된 기록은 없는 것과 같다).
  // 같은 키가 나중에 체크 안 된 채로 다시 지워지면 보관함에서도 뺀다 — 나중 상태가 이긴다.
  function stashRemoved(removed) {
    var keys = Object.keys(removed);
    if (!keys.length) return;
    var bak = loadBackup();
    keys.forEach(function (k) {
      if (removed[k]) bak.checks[k] = true; else delete bak.checks[k];
    });
    saveBackup(bak);
  }

  // ── 이행 표 적용 ────────────────────────────────────────────────────────
  // 고아 정리보다 먼저, 모든 쪽에서 돈다(체크박스가 없는 로드맵 쪽의 진행 현황도 옮긴 뒤의 키로 세야 한다).
  // ① store 에 남은 옛 키를 새 키로 옮긴다.
  // ② 표가 옮긴 커밋보다 늦게 들어와 옛 키가 이미 지워졌으면, 보관함에 있는 것을 되살려 옮긴다(보관함을 읽는 유일한 곳).
  // 새 키에 이미 기록이 있으면 그것을 둔다 — 새 쪽에서 직접 누른 것이 더 최근이다.
  // store 가 바뀌었으면 true 를 돌려준다(부른 쪽이 저장한다).
  function applyMigrate(store) {
    var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
    var changed = false, dropped = {}, bak = null, bakChanged = false;
    Object.keys(MIGRATE).forEach(function (oldKey) {
      var newKey = MIGRATE[oldKey];
      if (newKey === oldKey || (newKey !== null && typeof newKey !== 'string')) return;   // 잘못 쓴 줄은 건드리지 않는다
      if (has(store.checks, oldKey)) {
        var val = store.checks[oldKey];
        delete store.checks[oldKey];
        changed = true;
        if (newKey === null) dropped[oldKey] = val;
        else if (val && !has(store.checks, newKey)) store.checks[newKey] = true;
      }
      if (newKey === null) return;   // 없앤 항목의 기록은 보관함에 그대로 둔다
      if (bak === null) bak = loadBackup();
      if (has(bak.checks, oldKey)) {
        if (bak.checks[oldKey] && !has(store.checks, newKey)) { store.checks[newKey] = true; changed = true; }
        delete bak.checks[oldKey];
        bakChanged = true;
      }
    });
    if (bakChanged) saveBackup(bak);
    stashRemoved(dropped);
    return changed;
  }

  function stageById(id) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
    return null;
  }

  function stagesInGroup(groupId) {
    return STAGES.filter(function (s) { return s.group === groupId; });
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

    GROUPS.forEach(function (g) {
      var items = stagesInGroup(g.id);
      if (!items.length) return;   // 빈 그룹은 제목도 그리지 않는다
      side.appendChild(el('div', { class: 'group-title', text: g.label }));
      var ul = el('ul');
      items.forEach(function (s) {
        var a = el('a', { href: s.file, class: s.id === currentId ? 'current' : '' });
        var dot = el('span', { class: 'dot' });
        if (s.id !== 'index' && s.group !== 'ref') {
          var p = stageProgress(store, s.id);
          if (p.total > 0 && p.done >= p.total) dot.className = 'dot done';
          else if (p.done > 0 && p.total > 0) dot.className = 'dot part ' + (p.done / p.total >= 0.75 ? 'high' : (p.done / p.total <= 0.3 ? 'low' : ''));
          else if (p.done > 0) dot.className = 'dot part low';   // 옮겨 온 기록만 있고 아직 열지 않은 쪽: 전체 개수를 모르므로 가장 낮게 그린다
          dot.title = p.total ? (p.done + ' / ' + p.total + ' 체크포인트') : ((p.done ? '기록 ' + p.done + '개 · ' : '') + '아직 방문하지 않음');
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
    keepCurrentVisible(side);
  }

  // 사이드바는 100vh 안에서 따로 스크롤된다. 쪽을 옮길 때마다 맨 위로 돌아가면 뒤쪽 그룹(F14, L10 …)의
  // 현재 항목이 화면 밖으로 나간다. 지난 스크롤 위치를 이어받고, 그래도 현재 항목이 안 보이면 가운데로 끌어온다.
  var SIDE_SCROLL_KEY = 'rpi5guide.sidebar.scrollTop';
  function keepCurrentVisible(side) {
    var saved = null;
    try { saved = sessionStorage.getItem(SIDE_SCROLL_KEY); } catch (e) { /* 비공개 창 등 */ }
    if (saved !== null && !isNaN(parseInt(saved, 10))) side.scrollTop = parseInt(saved, 10);
    var cur = side.querySelector('a.current');
    if (cur) {
      var top = cur.offsetTop - side.offsetTop;          // 사이드바 안에서의 위치
      var bottom = top + cur.offsetHeight;
      var margin = 40;                                   // 가장자리에 걸치면 안 보이는 것과 같다
      if (top < side.scrollTop + margin || bottom > side.scrollTop + side.clientHeight - margin) {
        side.scrollTop = Math.max(0, top - (side.clientHeight - cur.offsetHeight) / 2);
      }
    }
    var timer = null;
    side.addEventListener('scroll', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        try { sessionStorage.setItem(SIDE_SCROLL_KEY, String(Math.round(side.scrollTop))); } catch (e) { /* ignore */ }
      }, 100);
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
    // 같은 그룹 안에서만 이전/다음을 만든다. 부록(ref)은 순서가 없으므로 그리지 않는다.
    var cur = stageById(currentId);
    if (!cur || cur.group === 'ref') return;
    var list = stagesInGroup(cur.group);
    var idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === currentId) idx = i;
    if (idx < 0) return;
    pager.innerHTML = '';
    var prev = list[idx - 1], next = list[idx + 1];
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
  // 고아 키 정리. 체크 항목을 다른 쪽으로 옮기거나 data-key 를 바꾸면 옛 키가 store.checks 에 남는다.
  // stageProgress 는 접두사(stageId + ':')로만 세므로 그 옛 키도 done 에 들어가고, total 은 줄었으니
  // done >= total 이 되어 다 하지 않았는데도 "이 단계 통과"가 뜬다. 그래서 이 쪽에 지금 없는 키는 지운다.
  // 옮긴 항목은 MIGRATE 표가 먼저 새 키로 옮겨 놓으므로(applyMigrate), 여기까지 남은 것은 표에 없는 키뿐이다.
  // 지운 키는 BACKUP_KEY 에 쌓는다. 정리할 때마다 쌓이므로 나중에 생긴 고아도 남고,
  // MIGRATE 에 그 키의 줄이 뒤늦게 들어오면 applyMigrate 가 보관함에서 되살려 새 키로 옮긴다.
  function pruneOrphans(stageId, store, liveKeys) {
    var prefix = stageId + ':';
    var orphans = Object.keys(store.checks).filter(function (k) {
      return k.indexOf(prefix) === 0 && !liveKeys[k];
    });
    if (!orphans.length) return false;
    var removed = {};
    orphans.forEach(function (k) { removed[k] = store.checks[k]; delete store.checks[k]; });
    stashRemoved(removed);
    return true;
  }

  function bindChecklists(stageId, store) {
    var boxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    if (!boxes.length) return;   // 체크박스가 없는 쪽은 정리도 하지 않는다
    var firstVisit = !store.totals[stageId];
    store.totals[stageId] = boxes.length;
    var liveKeys = {};
    boxes.forEach(function (box, i) {
      var key = stageId + ':' + (box.getAttribute('data-key') || ('cp' + i));
      liveKeys[key] = true;
      box.checked = !!store.checks[key];
      box.addEventListener('change', function () {
        store.checks[key] = box.checked;
        saveStore(store);
        renderProgress(stageId, store);
        buildSidebar(stageId, store);
      });
    });
    var pruned = pruneOrphans(stageId, store, liveKeys);
    saveStore(store);
    renderProgress(stageId, store);
    // 사이드바는 이 함수보다 먼저 그려졌다. 정리로 done 이 줄었으면 이 쪽의 진행 점을 다시 그린다.
    // 옮겨 온 기록이 있는 쪽을 처음 연 경우도 같다 — 방금 전까지는 전체 개수를 몰라 비율을 그리지 못했다.
    if (pruned || (firstVisit && stageProgress(store, stageId).done > 0)) buildSidebar(stageId, store);
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
    function row(s) {
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
      txt.appendChild(el('span', { class: 'sub', text: p.total ? ('체크포인트 ' + p.done + ' / ' + p.total) : ((p.done ? '기록 ' + p.done + '개 · ' : '') + '아직 열어보지 않음') }));
      lab.appendChild(txt);
      li.appendChild(lab);
      return li;
    }
    // main 은 쪽의 h2("진행 현황")가 곧 제목이다. 그 밖의 그룹(fw)은 항목이 있을 때만 소제목을 달아 잇는다.
    GROUPS.forEach(function (g) {
      if (g.id === 'ref') return;
      var items = stagesInGroup(g.id).filter(function (s) { return s.id !== 'index'; });
      if (!items.length) return;
      if (g.id !== 'main') box.appendChild(el('h4', { text: g.label }));
      var ul = el('ul', { class: 'checklist' });
      items.forEach(function (s) { ul.appendChild(row(s)); });
      box.appendChild(ul);
    });
    if (!any) box.appendChild(el('p', { class: 'small', text: '각 단계 페이지의 체크포인트를 체크하면 여기에 진행 상황이 모입니다. 기록은 이 브라우저에만 저장됩니다.' }));

    var reset = document.getElementById('reset-progress');
    if (reset) {
      var armed = false;
      reset.addEventListener('click', function () {
        if (!armed) { armed = true; reset.textContent = '정말 초기화하려면 다시 클릭'; setTimeout(function () { armed = false; reset.textContent = '진행 기록 초기화'; }, 4000); return; }
        try { window.localStorage.removeItem(STORE_KEY); window.localStorage.removeItem(BACKUP_KEY); } catch (e) { /* ignore */ }
        window.location.reload();
      });
    }
  }

  // ── 코드 블록: 언어 라벨 + 복사 버튼 + 간단 하이라이트 ─────────────────
  var LANG_LABEL = { cpp: 'C++', c: 'C', python: 'Python', bash: 'bash', yaml: 'YAML', cmake: 'CMake', xml: 'XML', ini: 'ini', text: '' };
  var KEYWORDS = {
    cpp: ['auto', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'constexpr', 'static', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'using', 'namespace', 'template', 'typename', 'new', 'delete', 'this', 'nullptr', 'true', 'false', 'void', 'int', 'double', 'float', 'bool', 'char', 'unsigned', 'size_t', 'uint8_t', 'int16_t', 'int32_t', 'uint16_t', 'uint32_t', 'std', 'try', 'catch', 'throw', 'explicit', 'inline', 'enum', 'default'],
    c: ['auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long', 'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', '_Bool', 'bool', 'true', 'false', 'NULL', 'size_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'intptr_t', 'uintptr_t'],
    python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'pass', 'None', 'True', 'False', 'self', 'lambda', 'yield', 'global', 'is', 'break', 'continue'],
    bash: ['sudo', 'cd', 'ls', 'cat', 'echo', 'export', 'source', 'if', 'then', 'fi', 'for', 'do', 'done', 'ros2', 'colcon', 'docker', 'ssh', 'scp', 'git', 'pip3', 'pip', 'python3', 'apt', 'apt-get', 'mkdir', 'cp', 'mv', 'rm', 'grep', 'tee', 'chmod'],
    cmake: ['cmake_minimum_required', 'project', 'find_package', 'add_executable', 'add_library', 'target_link_libraries', 'target_include_directories', 'ament_target_dependencies', 'install', 'ament_package', 'if', 'endif', 'set', 'REQUIRED', 'DESTINATION', 'TARGETS', 'DIRECTORY', 'add_compile_options', 'rclcpp_components_register_node'],
    yaml: [], xml: [], ini: [], text: []
  };
  var LINE_COMMENT = { cpp: '//', c: '//', python: '#', bash: '#', cmake: '#', yaml: '#', ini: '#', xml: null, text: null };

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(src, lang) {
    var kws = KEYWORDS[lang] || [];
    var cLike = (lang === 'cpp' || lang === 'c');   // 블록 주석·전처리기는 C 와 C++ 가 같다
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
      // line comment (C·C++ 의 // 는 문자열 밖에서만; URL 의 :// 는 문자열 안이라 보호됨)
      if (lc && src.substr(i, lc.length) === lc && !(lang === 'bash' && i > 0 && src[i - 1] === '$')) {
        var e2 = src.indexOf('\n', i); e2 = e2 < 0 ? n : e2;
        out += '<span class="hl-cmt">' + escapeHtml(src.slice(i, e2)) + '</span>'; i = e2; continue;
      }
      // block comment (C / C++)
      if (cLike && src.substr(i, 2) === '/*') {
        var e3 = src.indexOf('*/', i + 2); e3 = e3 < 0 ? n : e3 + 2;
        out += '<span class="hl-cmt">' + escapeHtml(src.slice(i, e3)) + '</span>'; i = e3; continue;
      }
      // preprocessor
      if (cLike && ch === '#' && (i === 0 || src[i - 1] === '\n')) {
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

  // ── 약어 자동 링크 ────────────────────────────────────────────────────
  // 사전은 assets/abbr.js (생성물 — 정본은 ref-abbr.html, scripts/gen_abbr_js.py 가 만든다).
  // 본문의 약어를 약어 쪽의 그 줄로 가는 링크로 바꾼다. 쪽의 HTML 은 고치지 않는다.
  // 걸지 않는 곳: pre · 링크 · 제목 · summary · 체크 항목 · 여러 낱말이 든 인라인 code.
  var ABBR_STAGES = { '06': 1, '06a': 1, '06b': 1, 'ref-abbr': 1 };   // 그룹 'fw' 는 전부

  function loadAbbr(stage) {
    if (!stage || !(stage.group === 'fw' || ABBR_STAGES[stage.id])) return;
    var sc = document.createElement('script');
    sc.src = 'assets/abbr.js';
    sc.onload = function () { if (window.RPI5_ABBR) linkAbbr(window.RPI5_ABBR); };
    document.head.appendChild(sc);
  }

  function linkAbbr(list) {
    var root = document.querySelector('.content');
    if (!root || !list.length) return;
    var map = {};
    list.forEach(function (e) { map[e[0]] = e; });
    var alt = list.map(function (e) { return e[0]; })
      .sort(function (a, b) { return b.length - a.length; })          // 긴 것 먼저: ST-LINK 가 ST 보다 앞
      .map(function (t) { return t.replace(/[^A-Za-z0-9]/g, '\\$&') + (map[t][3] ? '\\d*' : ''); })
      .join('|');
    var re = new RegExp('(^|[^A-Za-z0-9_])(' + alt + ')(?![A-Za-z0-9_])', 'g');
    var whole = new RegExp('^(?:' + alt + ')$');
    var SKIP = { PRE: 1, A: 1, H1: 1, H2: 1, H3: 1, H4: 1, SUMMARY: 1, BUTTON: 1, KBD: 1, SCRIPT: 1 };

    function makeLink(txt) {
      var e = map[txt] || map[txt.replace(/\d+$/, '')];
      if (!e) return document.createTextNode(txt);
      return el('a', { class: 'abbr', href: 'ref-abbr.html#' + e[1], title: e[2] + (e[4] ? ' — ' + e[4] : ''), text: txt });
    }
    function skipped(node) {
      for (var p = node.parentNode; p && p !== root; p = p.parentNode) {
        if (SKIP[p.nodeName]) return true;
        if (p.classList && (p.classList.contains('checklist') || p.classList.contains('kicker') || p.classList.contains('pager'))) return true;
        // 약어 쪽 자신: 약어 칸과 풀이 칸은 그대로 둔다
        if (p.nodeName === 'TD' && p.cellIndex < 2 && p.parentNode.hasAttribute('data-abbr')) return true;
      }
      return false;
    }

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var txt = node.nodeValue, par = node.parentNode;
      if (!txt || txt.length < 2 || !par || skipped(node)) return;
      if (par.nodeName === 'CODE') {                                   // 인라인 code 는 통째로 약어일 때만
        if (whole.test(txt)) par.replaceChild(makeLink(txt), node);
        return;
      }
      var m, last = 0, frag = null;
      re.lastIndex = 0;
      while ((m = re.exec(txt))) {
        var start = m.index + m[1].length;
        if (!frag) frag = document.createDocumentFragment();
        if (start > last) frag.appendChild(document.createTextNode(txt.slice(last, start)));
        frag.appendChild(makeLink(m[2]));
        last = start + m[2].length;
      }
      if (frag) {
        if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
        par.replaceChild(frag, node);
      }
    });
  }

  // ── 시작 ──────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var stageId = document.body.getAttribute('data-stage') || 'index';
    var stage = stageById(stageId);
    var store = loadStore();
    if (applyMigrate(store)) saveStore(store);   // 고아 정리(bindChecklists)보다 먼저
    buildSidebar(stageId, store);
    buildTopbar(stage);
    buildPager(stageId);
    bindChecklists(stageId, store);
    renderOverview(store);
    enhanceCode();
    addAnchors();
    loadAbbr(stage);
  });

  window.RPI5_GUIDE = { STAGES: STAGES };
})();
