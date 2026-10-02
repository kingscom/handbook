(function registerStructureView() {
  'use strict';

  const STAGES = ['계약', '분석', '보안', '설계', '개발', '검증', '운영'];
  let selectedIndex = -1;
  let viewMode = 'structure';

  function stageOrder(stage) {
    const index = STAGES.indexOf(stage);
    return index < 0 ? STAGES.length : index;
  }

  function grouped(rows, helpers) {
    const groups = {};
    rows.forEach(function(row, index) {
      const stage = helpers.category(row);
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push({ row: row, index: index });
    });
    return Object.keys(groups).sort(function(a, b) { return stageOrder(a) - stageOrder(b) || a.localeCompare(b, 'ko'); }).map(function(stage) {
      return { stage: stage, items: groups[stage] };
    });
  }

  function itemNumber(groupIndex, itemIndex) {
    return String(groupIndex + 1).padStart(2, '0') + '.' + String(itemIndex + 1).padStart(2, '0');
  }

  function focusClass(index) {
    if (selectedIndex < 0) return '';
    if (index === selectedIndex) return ' is-selected';
    if (index === selectedIndex - 1 || index === selectedIndex + 1) return ' is-related';
    return ' is-muted';
  }

  function structureMarkup(context) {
    const groups = grouped(context.rows, context.helpers);
    return '<div class="structure-outline">' + groups.map(function(group, groupIndex) {
      const color = context.helpers.color(group.stage);
      return '<section class="wbs-stage" style="--stage-color:' + color + '"><div class="wbs-stage-heading"><span class="wbs-stage-line"></span><span class="wbs-stage-number">' + String(groupIndex + 1).padStart(2, '0') + '</span><h2>' + context.helpers.escape(group.stage) + '</h2><span class="wbs-stage-count">' + group.items.length + '</span></div><ol class="wbs-items">' + group.items.map(function(item, itemIndex) {
        return '<li><button class="wbs-item' + focusClass(item.index) + '" type="button" onclick="structureFocus(' + item.index + ')" aria-label="' + context.helpers.escape(itemNumber(groupIndex, itemIndex) + ' ' + (item.row.항목명 || '항목명 없음') + ' 의존 관계 보기') + '"><span class="wbs-item-number">' + itemNumber(groupIndex, itemIndex) + '</span><span class="wbs-item-name">' + context.helpers.escape(item.row.항목명 || '(항목명 없음)') + '</span><span class="wbs-item-action" aria-hidden="true">관계 보기</span></button></li>';
      }).join('') + '</ol></section>';
    }).join('') + '</div>';
  }

  function dependencyMarkup(context) {
    const row = context.rows[selectedIndex];
    if (!row) return '<div class="dependency-empty"><p>업무 구조에서 업무를 선택하면 해당 업무의 관계를 표시합니다.</p></div>';
    const previous = context.rows[selectedIndex - 1];
    const next = context.rows[selectedIndex + 1];
    const node = function(kind, index, item) {
      if (!item) return '<div class="dependency-node is-empty"><span>' + kind + '</span><strong>없음</strong></div>';
      const stage = context.helpers.category(item);
      return '<button class="dependency-node" type="button" style="--stage-color:' + context.helpers.color(stage) + '" onclick="openDetail(' + index + ')"><span>' + kind + ' · ' + context.helpers.escape(stage) + '</span><strong>' + String(index + 1).padStart(2, '0') + '. ' + context.helpers.escape(item.항목명 || '(항목명 없음)') + '</strong></button>';
    };
    return '<div class="dependency-focus"><p class="dependency-caption">선택한 업무를 중심으로 입력 순서의 의존 관계만 표시합니다.</p><div class="dependency-map">' +
      '<div class="dependency-previous">' + node('Previous', selectedIndex - 1, previous) + '</div><div class="dependency-arrow dependency-arrow-in" aria-hidden="true">→</div>' +
      '<button class="dependency-current" type="button" style="--stage-color:' + context.helpers.color(context.helpers.category(row)) + '" onclick="openDetail(' + selectedIndex + ')" aria-label="' + context.helpers.escape((selectedIndex + 1) + '번 ' + (row.항목명 || '항목명 없음') + ' 상세 보기') + '"><span>Selected · ' + context.helpers.escape(context.helpers.category(row)) + '</span><strong>' + String(selectedIndex + 1).padStart(2, '0') + '. ' + context.helpers.escape(row.항목명 || '(항목명 없음)') + '</strong></button>' +
      '<div class="dependency-arrow dependency-arrow-out" aria-hidden="true">→</div><div class="dependency-next">' + node('Next', selectedIndex + 1, next) + '</div>' +
    '</div></div>';
  }

  function render(context) {
    const { grid, header, legend } = context;
    header.innerHTML = '';
    legend.innerHTML = '';
    grid.style.gridTemplateColumns = '';
    grid.style.gridTemplateRows = '';
    grid.innerHTML = '<div class="structure-toolbar"><div class="structure-tabs" role="tablist" aria-label="업무 구조 보기"><button type="button" role="tab" aria-selected="' + (viewMode === 'structure') + '" onclick="structureSetMode(\'structure\')">Structure</button><button type="button" role="tab" aria-selected="' + (viewMode === 'dependencies') + '" onclick="structureSetMode(\'dependencies\')">Dependencies</button></div><p>' + (viewMode === 'structure' ? '업무 체계를 먼저 확인하고, 업무를 선택해 관계를 확인하세요.' : '선택된 업무의 Previous / Next 관계입니다.') + '</p></div>' + (viewMode === 'structure' ? structureMarkup(context) : dependencyMarkup(context));
  }

  window.structureFocus = function(index) {
    selectedIndex = index;
    viewMode = 'dependencies';
    if (window.HandbookViews.e && window.__structureContext) render(window.__structureContext);
  };
  window.structureSetMode = function(mode) {
    viewMode = mode;
    if (window.HandbookViews.e && window.__structureContext) render(window.__structureContext);
  };

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.e = {
    label: '업무 구조',
    source: '(' + registerStructureView.toString() + ')();',
    styles: `
      .layout-structure .flow-header, .layout-structure .flow-menu-toggle, .layout-structure .process-legend { display: none !important; }
      .layout-structure .board-body { padding: 34px 40px 48px; background: rgba(255,255,255,.28); }
      .layout-structure .flow-board { max-width: 1060px; margin: 0 auto; }
      .layout-structure .flow-grid { display: block; }
      .layout-structure .flow-connectors { display: none; }
      .structure-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 25px; border-bottom: 1px solid var(--page-border); }
      .structure-toolbar p { color: var(--text-tertiary); font-size: .78rem; }
      .structure-tabs { display: inline-flex; gap: 3px; padding: 3px; border: 1px solid var(--page-border); border-radius: 8px; background: rgba(15,23,42,.035); }
      .structure-tabs button { min-height: 29px; padding: 4px 10px; border: 0; border-radius: 5px; background: transparent; color: var(--text-tertiary); font-size: .72rem; font-weight: 650; cursor: pointer; }
      .structure-tabs button[aria-selected="true"] { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(15,23,42,.1); }
      .structure-outline { padding-top: 18px; }
      .wbs-stage { padding: 22px 0 12px; border-bottom: 1px solid var(--page-border); }
      .wbs-stage-heading { display: flex; align-items: center; gap: 10px; min-height: 30px; }
      .wbs-stage-line { width: 3px; height: 22px; border-radius: 2px; background: var(--stage-color); }
      .wbs-stage-number { color: var(--text-quaternary); font: 650 .7rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .wbs-stage h2 { font-size: .94rem; font-weight: 700; letter-spacing: -.02em; }
      .wbs-stage-count { margin-left: auto; color: var(--text-quaternary); font-size: .7rem; }
      .wbs-items { margin: 10px 0 0 23px; padding: 0; list-style: none; }
      .wbs-item { display: grid; grid-template-columns: 56px minmax(0,1fr) auto; align-items: center; gap: 12px; width: 100%; min-height: 38px; padding: 6px 8px; border: 0; border-radius: 5px; background: transparent; color: var(--text-primary); text-align: left; cursor: pointer; }
      .wbs-item:hover, .wbs-item:focus-visible { background: rgba(0,113,227,.055); color: var(--text-primary); outline: 0; }
      .wbs-item-number { color: var(--text-tertiary); font: 600 .68rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .wbs-item-name { overflow: hidden; color: var(--text-primary); font-size: .82rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
      .wbs-item-action { color: var(--accent); font-size: .66rem; opacity: 0; transition: opacity .15s ease; }
      .wbs-item:hover .wbs-item-action, .wbs-item:focus-visible .wbs-item-action { opacity: 1; }
      .wbs-item.is-muted { opacity: .24; }
      .wbs-item.is-related { background: rgba(0,113,227,.045); }
      .wbs-item.is-selected { background: rgba(0,113,227,.1); color: var(--text-primary); }
      .dependency-focus { padding: 70px 0 45px; }
      .dependency-caption { margin-bottom: 32px; color: var(--text-tertiary); font-size: .78rem; text-align: center; }
      .dependency-map { display: grid; grid-template-columns: minmax(0,1fr) 36px minmax(220px,1.25fr) 36px minmax(0,1fr); align-items: center; gap: 10px; }
      .dependency-node, .dependency-current { display: flex; flex-direction: column; gap: 7px; min-height: 90px; padding: 15px; border: 1px solid var(--page-border); border-left: 3px solid var(--stage-color, transparent); border-radius: 7px; background: rgba(255,255,255,.5); color: var(--text-primary); text-align: left; }
      .dependency-node { cursor: pointer; }
      .dependency-node:hover { border-color: rgba(0,113,227,.26); background: #fff; }
      .dependency-node span, .dependency-current span { color: var(--text-quaternary); font-size: .65rem; font-weight: 650; }
      .dependency-node strong, .dependency-current strong { font-size: .8rem; font-weight: 650; line-height: 1.4; }
      .dependency-node.is-empty { justify-content: center; border-left-color: transparent; color: var(--text-quaternary); }
      .dependency-current { position: relative; width: 100%; cursor: pointer; border-color: color-mix(in srgb, var(--stage-color) 32%, var(--page-border)); border-left-width: 3px; background: rgba(255,255,255,.82); box-shadow: 0 8px 20px rgba(15,23,42,.06); transition: background .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .dependency-current:hover, .dependency-current:focus-visible { border-color: color-mix(in srgb, var(--stage-color) 60%, var(--page-border)); background: #fff; box-shadow: 0 10px 24px rgba(15,23,42,.09); outline: 0; }
      .dependency-arrow { color: var(--text-quaternary); font-size: 1.2rem; text-align: center; }
      .dependency-empty { padding: 96px 20px; color: var(--text-tertiary); font-size: .85rem; text-align: center; }
      .layout-structure .detail-screen { padding-top: 8px; }
      @media (max-width: 720px) { .layout-structure .board-body { padding: 24px 18px 32px; } .structure-toolbar { align-items: flex-start; flex-direction: column; gap: 12px; } .dependency-focus { padding-top: 38px; } .dependency-map { grid-template-columns: 1fr; gap: 10px; } .dependency-arrow { display: none; } .dependency-current { order: -1; } .wbs-items { margin-left: 8px; } }
    `,
    render: function(context) {
      window.__structureContext = context;
      render(context);
    },
    filter: function(context) { return context.rows.length; },
    connector: function() { return ''; }
  };
})();