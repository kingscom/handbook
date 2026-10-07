(function registerBasicView() {
  'use strict';

  function parallelGroups(rows) {
    const groups = new Map();
    rows.forEach(function(row, index) {
      const rawStep = row.순번;
      if (rawStep === null || rawStep === undefined || String(rawStep).trim() === '') return;
      const step = Number(rawStep);
      if (!Number.isFinite(step)) return;
      if (!groups.has(step)) groups.set(step, []);
      groups.get(step).push({ row: row, index: index });
    });
    const groupedCount = Array.from(groups.values()).reduce(function(total, items) { return total + items.length; }, 0);
    if (groupedCount !== rows.length || !Array.from(groups.values()).some(function(items) { return items.length > 1; })) return null;
    return Array.from(groups.entries()).sort(function(a, b) { return a[0] - b[0]; }).map(function(entry) {
      return { step: entry[0], items: entry[1] };
    });
  }

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.a = {
    label: '기본 보기',
    source: '(' + registerBasicView.toString() + ')();',
    styles: `
      .process-legend { display: none; }
      .page:not(.layout-process):not(.layout-cards) .node-details { display: none; }
      .node-card.is-muted { cursor: default; filter: grayscale(1); opacity: .38; pointer-events: none; }
      .node-card.is-filter-match { border-color: var(--cat-color, var(--accent)); box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color, var(--accent)) 18%, transparent); }
      .flow-header.is-parallel { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important; }
      .flow-grid.parallel-flow { max-width: 780px; margin: 0 auto; padding: 18px 0 30px; grid-template-columns: repeat(var(--parallel-columns), minmax(0, 1fr)) !important; }
      .flow-grid.parallel-flow .flow-cell { grid-column: var(--parallel-column) !important; grid-row: var(--parallel-row) !important; }
      .flow-grid.is-filter-active { grid-template-rows: repeat(var(--filter-row-count), auto) !important; gap: 12px; }
      .flow-grid.is-filter-active .flow-cell { grid-column: var(--filter-column) !important; grid-row: var(--filter-row) !important; }
      .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid.is-filter-active .flow-cell { height: 64px; }
      .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid.is-filter-active .node-card { display: flex; align-items: center; height: 64px; min-height: 64px; }
      .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid.is-filter-active .node-name { display: -webkit-box; overflow: hidden; line-clamp: 2; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      .flow-grid.is-filter-active .flow-cell.is-filter-match .node-card { border-color: var(--cat-color, var(--accent)); box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color, var(--accent)) 18%, transparent); }
      .flow-grid.is-filter-active .flow-connectors { display: none; }
      @media (max-width: 860px) { .flow-grid.is-filter-active .flow-cell { grid-column: 1 !important; grid-row: var(--filter-mobile-row) !important; } }
      @media (max-width: 640px) {
        .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid { gap: 10px; row-gap: 10px; }
        .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .node-card { min-height: 64px; }
        .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid.parallel-flow { grid-template-columns: 1fr !important; }
        .page:not(.layout-process):not(.layout-cards):not(.layout-procedure) .flow-grid.parallel-flow .flow-cell { grid-column: 1 !important; grid-row: auto !important; }
      }
    `,

    render: function(context) {
      const { rows, columns, colIndex, grid, header, legend, helpers } = context;
      const groups = parallelGroups(rows);
      const template = 'repeat(' + columns.length + ', minmax(0, 1fr))';
      header.classList.toggle('is-parallel', !!groups);
      header.style.gridTemplateColumns = groups ? '' : template;
      header.innerHTML = columns.map(function(cat, index) {
        const count = rows.filter(function(row) { return helpers.category(row) === cat; }).length;
        return helpers.headerCell(cat, count, index);
      }).join('');
      legend.innerHTML = '';
      grid.classList.toggle('parallel-flow', !!groups);
      if (groups) {
        const maxBranches = Math.max.apply(null, groups.map(function(group) { return group.items.length; }));
        grid.dataset.parallelColumns = String(maxBranches);
        grid.style.setProperty('--parallel-columns', maxBranches);
        grid.style.gridTemplateColumns = '';
        grid.style.gridTemplateRows = 'repeat(' + groups.length + ', auto)';
      } else {
        delete grid.dataset.parallelColumns;
        grid.style.removeProperty('--parallel-columns');
        grid.style.gridTemplateColumns = template;
        grid.style.gridTemplateRows = 'repeat(' + rows.length + ', auto)';
      }
      const groupedRows = groups ? groups.reduce(function(result, group, rowIndex) {
        const startColumn = Math.floor((Number(grid.dataset.parallelColumns) - group.items.length) / 2) + 1;
        group.items.forEach(function(item, branchIndex) {
          result[item.index] = { step: group.step, column: startColumn + branchIndex, row: rowIndex + 1 };
        });
        return result;
      }, {}) : null;
      grid.innerHTML = rows.map(function(row, index) {
        const cat = helpers.category(row);
        const col = colIndex[cat];
        const parallel = groupedRows && groupedRows[index];
        const stepAttribute = parallel ? ' data-step="' + parallel.step + '"' : '';
        const placement = parallel ? ' style="--parallel-column:' + parallel.column + ';--parallel-row:' + parallel.row + ';grid-column:' + parallel.column + ';grid-row:' + parallel.row + '"' : ' style="grid-column:' + col + ';grid-row:' + (index + 1) + '"';
        return '<div class="flow-cell" data-cat="' + helpers.escape(cat) + '" data-col="' + col + '" data-idx="' + index + '"' + stepAttribute + placement + '>' + helpers.card(row, index, parallel ? 'STEP ' + parallel.step : '') + '</div>';
      }).join('');
    },

    filter: function(context, activeCategory) {
      const toggle = document.getElementById('flowMenuToggle');
      toggle.textContent = activeCategory || '분류 필터';
      toggle.classList.toggle('is-filtered', !!activeCategory);
      const isParallel = context.grid.classList.contains('parallel-flow');
      const categoryRows = {};
      let maxFilterRows = 0;
      let count = 0;
      context.grid.querySelectorAll('.flow-cell').forEach(function(cell) {
        const matches = !activeCategory || cell.dataset.cat === activeCategory;
        const card = cell.querySelector('.node-card');
        const row = (categoryRows[cell.dataset.cat] || 0) + 1;
        categoryRows[cell.dataset.cat] = row;
        maxFilterRows = Math.max(maxFilterRows, row);
        cell.classList.remove('hidden');
        cell.classList.toggle('is-filter-match', !!activeCategory && matches);
        if (card) {
          card.classList.toggle('is-muted', !!activeCategory && !matches);
          card.classList.toggle('is-filter-match', !!activeCategory && matches);
        }
        if (matches) count++;
        if (activeCategory && !isParallel) {
          cell.style.setProperty('--filter-column', cell.dataset.col);
          cell.style.setProperty('--filter-row', String(row));
          cell.style.setProperty('--filter-mobile-row', String(Number(cell.dataset.idx) + 1));
        } else {
          cell.style.removeProperty('--filter-column');
          cell.style.removeProperty('--filter-row');
          cell.style.removeProperty('--filter-mobile-row');
        }
      });
      context.grid.classList.toggle('is-filter-active', !!activeCategory && !isParallel);
      if (activeCategory && !isParallel) {
        context.grid.style.setProperty('--filter-row-count', String(maxFilterRows));
      } else {
        context.grid.style.removeProperty('--filter-row-count');
        const groups = isParallel ? parallelGroups(context.rows) : null;
        context.grid.style.gridTemplateRows = 'repeat(' + (groups ? groups.length : context.rows.length) + ', auto)';
      }
      return count;
    },

    connections: function(context, visibleCells) {
      if (!context.grid.classList.contains('parallel-flow')) return null;
      const steps = new Map();
      visibleCells.forEach(function(cell) {
        const step = Number(cell.dataset.step);
        if (!steps.has(step)) steps.set(step, []);
        steps.get(step).push(cell);
      });
      const groups = Array.from(steps.entries()).sort(function(a, b) { return a[0] - b[0]; });
      const connections = [];
      groups.forEach(function(group, index) {
        const next = groups[index + 1];
        if (!next) return;
        group[1].forEach(function(from) {
          next[1].forEach(function(to) { connections.push([from, to]); });
        });
      });
      return connections;
    },

    connector: function(a, b, grid) {
      const x1 = a.left + a.width / 2 - grid.left;
      const y1 = a.bottom - grid.top;
      const x2 = b.left + b.width / 2 - grid.left;
      const y2 = b.top - grid.top;
      const midY = (y1 + y2) / 2;
      return Math.abs(x1 - x2) < 4
        ? 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2
        : 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + midY + ' ' + x2 + ',' + midY + ' ' + x2 + ',' + y2;
    }
  };
})();