(function registerFabricView() {
  'use strict';

  let focusedIndex = -1;

  function layoutPoint(index, total) {
    const columns = Math.max(4, Math.min(7, Math.ceil(Math.sqrt(total * 1.5))));
    const row = Math.floor(index / columns);
    const rows = Math.max(1, Math.ceil(total / columns));
    const position = index % columns;
    const reversed = row % 2 === 1;
    const column = reversed ? columns - position - 1 : position;
    const x = 8 + column * (84 / Math.max(1, columns - 1));
    const y = 14 + row * (72 / Math.max(1, rows - 1)) + ((index % 3 === 1) ? 3 : (index % 3 === 2 ? -2 : 0));
    return { x: x, y: y };
  }

  function curve(from, to) {
    const spread = Math.abs(to.x - from.x) * 0.42;
    const direction = to.x >= from.x ? 1 : -1;
    return 'M' + from.x + ',' + from.y + ' C' + (from.x + spread * direction) + ',' + from.y + ' ' + (to.x - spread * direction) + ',' + to.y + ' ' + to.x + ',' + to.y;
  }

  function updateFocus(index) {
    focusedIndex = index;
    const canvas = document.querySelector('.fabric-canvas');
    if (!canvas) return;
    canvas.classList.toggle('is-focused', index >= 0);
    canvas.querySelectorAll('.fabric-node').forEach(function(node) {
      const nodeIndex = Number(node.dataset.index);
      node.classList.toggle('is-focus', nodeIndex === index);
      node.classList.toggle('is-neighbor', nodeIndex === index - 1 || nodeIndex === index + 1);
      node.classList.toggle('is-previous', nodeIndex === index - 1);
      node.classList.toggle('is-next', nodeIndex === index + 1);
    });
    canvas.querySelectorAll('.fabric-thread').forEach(function(thread) {
      const from = Number(thread.dataset.from);
      const to = Number(thread.dataset.to);
      thread.classList.toggle('is-active', from === index || to === index);
      thread.classList.toggle('is-neighbor', from === index - 1 || to === index + 1);
    });
  }

  window.fabricFocus = updateFocus;
  window.fabricBlur = function() { updateFocus(-1); };

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.d = {
    label: '프로세스 패브릭',
    source: '(' + registerFabricView.toString() + ')();',
    rerenderOnResize: true,
    styles: `
      .layout-fabric .flow-header, .layout-fabric .flow-menu-toggle, .layout-fabric .process-legend { display: none !important; }
      .layout-fabric .board-body { padding: 32px 40px 44px; }
      .layout-fabric .flow-board { max-width: 1440px; min-height: 550px; margin: 0 auto; }
      .layout-fabric .flow-grid { display: block; min-height: 550px; }
      .layout-fabric .flow-connectors { display: none; }
      .fabric-canvas { position: relative; min-height: 550px; isolation: isolate; }
      .fabric-threads { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
      .fabric-thread { fill: none; stroke: var(--thread-color); stroke-width: .28; stroke-linecap: round; opacity: .64; transition: opacity .22s ease, stroke-width .22s ease; }
      .fabric-thread.is-secondary { opacity: .26; }
      .fabric-node { position: absolute; z-index: 1; display: flex; align-items: baseline; gap: 7px; max-width: min(180px, 22vw); padding: 4px 5px; border: 0; background: transparent; color: var(--text-secondary); text-align: left; cursor: pointer; transform: translate(-50%, -50%); transition: color .22s ease, transform .25s ease, opacity .22s ease; }
      .fabric-node::before { width: 7px; height: 7px; flex: 0 0 7px; border-radius: 50%; background: var(--node-color); content: ''; }
      .fabric-node-number { color: var(--text-quaternary); font: 600 .62rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .04em; }
      .fabric-node-name { overflow: hidden; font-size: .78rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
      .fabric-node:hover, .fabric-node:focus-visible { color: var(--text-primary); outline: 0; transform: translate(-50%, -50%) scale(1.04); }
      .fabric-node:focus-visible { box-shadow: 0 0 0 3px rgba(0,113,227,.15); border-radius: 5px; }
      .fabric-canvas.is-focused .fabric-node { opacity: .2; }
      .fabric-canvas.is-focused .fabric-node.is-focus { z-index: 3; color: var(--text-primary); opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
      .fabric-canvas.is-focused .fabric-node.is-neighbor { z-index: 2; color: var(--text-primary); opacity: .9; transform: translate(-50%, -50%) scale(1.07); }
      .fabric-canvas.is-focused .fabric-node.is-previous { transform: translate(calc(-50% - 10px), calc(-50% + 8px)) scale(1.07); }
      .fabric-canvas.is-focused .fabric-node.is-next { transform: translate(calc(-50% + 10px), calc(-50% - 8px)) scale(1.07); }
      .fabric-canvas.is-focused .fabric-thread { opacity: .08; }
      .fabric-canvas.is-focused .fabric-thread.is-active { stroke-width: .5; opacity: 1; }
      .fabric-canvas.is-focused .fabric-thread.is-neighbor { stroke-width: .38; opacity: .72; }
      .layout-fabric .detail-screen { padding-top: 8px; }
      @media (max-width: 860px) { .layout-fabric .board-body { padding: 24px 16px 32px; } .layout-fabric .flow-board, .layout-fabric .flow-grid, .fabric-canvas { min-height: 620px; } .fabric-node { max-width: 36vw; } }
      @media (prefers-reduced-motion: reduce) { .fabric-thread, .fabric-node { transition: none; } }
    `,
    render: function(context) {
      const { rows, grid, header, legend, helpers } = context;
      focusedIndex = -1;
      header.innerHTML = '';
      legend.innerHTML = '';
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      const points = rows.map(function(_, index) { return layoutPoint(index, rows.length); });
      const threads = rows.slice(0, -1).map(function(row, index) {
        const stage = helpers.category(row);
        return '<path class="fabric-thread' + (index % 3 === 2 ? ' is-secondary' : '') + '" data-from="' + index + '" data-to="' + (index + 1) + '" style="--thread-color:' + helpers.color(stage) + '" d="' + curve(points[index], points[index + 1]) + '"/>';
      }).join('');
      const nodes = rows.map(function(row, index) {
        const point = points[index];
        const stage = helpers.category(row);
        const label = helpers.escape((index + 1) + '번 ' + (row.항목명 || '항목명 없음') + ' 상세 보기');
        return '<button class="fabric-node" type="button" data-index="' + index + '" style="left:' + point.x + '%;top:' + point.y + '%;--node-color:' + helpers.color(stage) + '" onmouseenter="fabricFocus(' + index + ')" onmouseleave="fabricBlur()" onfocus="fabricFocus(' + index + ')" onblur="fabricBlur()" onclick="openDetail(' + index + ')" aria-label="' + label + '"><span class="fabric-node-number">' + String(index + 1).padStart(2, '0') + '</span><span class="fabric-node-name">' + helpers.escape(row.항목명 || '(항목명 없음)') + '</span></button>';
      }).join('');
      grid.innerHTML = '<div class="fabric-canvas"><svg class="fabric-threads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + threads + '</svg>' + nodes + '</div>';
    },
    filter: function(context) { return context.rows.length; },
    connector: function() { return ''; }
  };
})();