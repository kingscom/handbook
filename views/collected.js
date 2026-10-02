(function registerCollectedView() {
  'use strict';

  function getColumns() {
    const board = document.getElementById('boardBody');
    const width = board ? board.clientWidth - 64 : 960;
    return Math.max(2, Math.floor((width + 48) / 198));
  }

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.c = {
    label: '모아 보기',
    source: '(' + registerCollectedView.toString() + ')();',
    rerenderOnResize: true,
    styles: `
      .layout-process .flow-header,
      .layout-process .flow-menu-toggle { display: none !important; }
      .layout-process .board-body { padding: 0 22px 16px; }
      .layout-process .flow-board { padding: 14px 16px 8px; }
      .layout-process .detail-screen { padding-top: 40px; }
      .layout-process .process-legend {
        display: flex; align-items: center; flex-wrap: wrap; gap: 8px 16px;
        margin: 10px 0 0; padding: 10px 16px;
        border: 1px solid var(--page-border); border-radius: 8px;
        background: rgba(0, 113, 227, 0.08); color: var(--text-tertiary);
        font-size: 0.76rem; font-weight: 650;
      }
      .process-area-label {
        display: inline-flex; align-items: center; min-height: 18px; padding-right: 12px;
        border-right: 1px solid var(--page-border-strong); color: var(--text-secondary);
        font-size: 0.7rem; font-weight: 750; letter-spacing: 0.06em;
      }
      .process-legend-item { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      .process-legend-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cat-color); }
      .layout-process .flow-grid {
        display: grid; grid-template-columns: repeat(var(--process-columns), minmax(0, 1fr)) !important;
        grid-auto-rows: minmax(56px, auto); column-gap: 48px; row-gap: 40px;
        width: 100%; align-items: center;
      }
      .layout-process .flow-cell {
        grid-column: var(--process-column) !important; grid-row: var(--process-row) !important;
      }
      .layout-process .node-card {
        display: flex; align-items: center; gap: 8px; min-height: 56px; padding: 8px 2px;
        overflow: visible; border: 0; border-radius: 0;
        border-bottom: 1px solid rgba(15, 23, 42, 0.14); background: transparent; box-shadow: none;
      }
      .layout-process .node-card::before {
        position: static; flex: 0 0 9px; width: 9px; height: 9px;
        border-radius: 50%; background: var(--cat-color, var(--accent));
      }
      .layout-process .node-card:hover { transform: translateY(-2px); border-color: var(--cat-color, var(--accent)); box-shadow: none; }
      .layout-process .node-head { display: flex; align-items: baseline; gap: 7px; min-width: 0; }
      .layout-process .node-index { flex: 0 0 auto; font-size: 0.68rem; }
      .layout-process .node-name { font-size: 0.8rem; font-weight: 650; line-height: 1.35; }
      .layout-process .node-details { display: none; }
      .layout-process .node-card[title] { cursor: pointer; }
      .layout-process .flow-connector { stroke: rgba(105, 113, 124, 0.52); stroke-width: 1.25; }
      @media (max-width: 900px) {
        .layout-process .flow-grid { column-gap: 24px; }
        .layout-process .flow-connectors { display: block; }
      }
      @media (max-width: 860px) {
        .layout-process .flow-board { padding: 36px 8px 56px; }
      }
    `,

    render: function(context) {
      const { rows, columns, grid, header, legend, helpers } = context;
      const count = getColumns();
      grid.style.setProperty('--process-columns', count);
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      header.innerHTML = '';
      legend.innerHTML = '<span class="process-area-label">업무 흐름</span>' + columns.map(function(cat) {
        return '<span class="process-legend-item" style="--cat-color:' + helpers.color(cat) + '"><span class="process-legend-dot"></span>' + helpers.escape(cat) + '</span>';
      }).join('');
      grid.innerHTML = rows.map(function(row, index) {
        const processRow = Math.floor(index / count) + 1;
        const position = index % count;
        const processColumn = processRow % 2 === 1 ? position + 1 : count - position;
        return '<div class="flow-cell" data-cat="' + helpers.escape(helpers.category(row)) + '" data-idx="' + index + '" style="--process-column:' + processColumn + ';--process-row:' + processRow + '">' + helpers.card(row, index) + '</div>';
      }).join('');
    },

    filter: function(context) {
      context.grid.querySelectorAll('.flow-cell').forEach(function(cell) { cell.classList.remove('hidden'); });
      context.grid.style.gridTemplateRows = 'repeat(' + Math.max(1, Math.ceil(context.rows.length / getColumns())) + ', minmax(56px, auto))';
      return context.rows.length;
    },

    connector: function(a, b, grid) {
      const aCenter = a.left + a.width / 2;
      const bCenter = b.left + b.width / 2;
      if (Math.abs(aCenter - bCenter) < 4) {
        const x = aCenter - grid.left;
        const y1 = a.bottom - grid.top;
        const y2 = b.top - grid.top;
        return 'M' + x + ',' + y1 + ' L' + x + ',' + y2;
      }
      const movesRight = bCenter > aCenter;
      const x1 = (movesRight ? a.right : a.left) - grid.left;
      const y1 = a.top + a.height / 2 - grid.top;
      const x2 = (movesRight ? b.left : b.right) - grid.left;
      const y2 = b.top + b.height / 2 - grid.top;
      const bend = x1 + (x2 - x1) / 2;
      return 'M' + x1 + ',' + y1 + ' C' + bend + ',' + y1 + ' ' + bend + ',' + y2 + ' ' + x2 + ',' + y2;
    }
  };
})();