(function registerBasicView() {
  'use strict';

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.a = {
    label: '기본 보기',
    source: '(' + registerBasicView.toString() + ')();',
    styles: '.process-legend { display: none; }',

    render: function(context) {
      const { rows, columns, colIndex, grid, header, legend, helpers } = context;
      const template = 'repeat(' + columns.length + ', minmax(0, 1fr))';
      header.style.gridTemplateColumns = template;
      grid.style.gridTemplateColumns = template;
      grid.style.gridTemplateRows = 'repeat(' + rows.length + ', auto)';
      header.innerHTML = columns.map(function(cat, index) {
        const count = rows.filter(function(row) { return helpers.category(row) === cat; }).length;
        return helpers.headerCell(cat, count, index);
      }).join('');
      legend.innerHTML = '';
      grid.innerHTML = rows.map(function(row, index) {
        const cat = helpers.category(row);
        const col = colIndex[cat];
        return '<div class="flow-cell" data-cat="' + helpers.escape(cat) + '" data-col="' + col + '" data-idx="' + index + '" style="grid-column:' + col + ';grid-row:' + (index + 1) + '">' + helpers.card(row, index) + '</div>';
      }).join('');
    },

    filter: function(context, activeCategory) {
      const toggle = document.getElementById('flowMenuToggle');
      toggle.textContent = activeCategory || '분류 필터';
      toggle.classList.toggle('is-filtered', !!activeCategory);
      let count = 0;
      context.grid.querySelectorAll('.flow-cell').forEach(function(cell) {
        const visible = !activeCategory || cell.dataset.cat === activeCategory;
        cell.classList.toggle('hidden', !visible);
        if (!visible) return;
        count++;
        cell.style.gridRow = activeCategory ? count : Number(cell.dataset.idx) + 1;
        cell.style.gridColumn = cell.dataset.col;
      });
      context.grid.style.gridTemplateRows = 'repeat(' + (activeCategory ? count : context.rows.length) + ', auto)';
      return count;
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