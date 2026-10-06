(function registerCollectedView() {
	'use strict';

	function getRouteColumns() {
		const board = document.getElementById('boardBody');
		const width = board && board.clientWidth ? board.clientWidth : window.innerWidth;
		return width <= 640 ? 1 : (width <= 900 ? 2 : 7);
	}

	window.HandbookViews = window.HandbookViews || {};
	window.HandbookViews.c = {
		label: '모아 보기',
		source: '(' + registerCollectedView.toString() + ')();',
		rerenderOnResize: true,
		styles: `
			.layout-process .flow-menu-toggle { display: none !important; }
			.layout-process .flow-header, .layout-process .flow-header.is-open {
				display: block; padding: 24px 0 0; border-top: 1px solid var(--page-border);
				background: rgba(255,255,255,.88);
			}
			.layout-process .board-body { padding-top: 12px; }
			.journey-filters {
				display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
				align-items: stretch; gap: 10px; width: 100%; max-width: 1480px; margin: 0 auto; padding: 0 20px;
			}
			.journey-filters .flow-header-cell { width: 100%; }
			.layout-process .flow-grid {
				display: grid; grid-template-columns: repeat(var(--route-columns), minmax(0,1fr)) !important;
				gap: 12px; width: 100%; max-width: 1480px; margin: 0 auto; padding: 12px 20px 28px;
			}
			.layout-process .flow-grid::before, .layout-process .journey-dot { display: none; }
			.layout-process .flow-connectors { display: block; z-index: 1; }
			.layout-process .flow-cell {
				display: block; grid-column: var(--route-column) !important; grid-row: var(--route-row) !important;
				min-height: 80px; z-index: 2;
			}
			.layout-process .node-card {
				display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start;
				width: 100%; max-width: none; height: 80px; min-height: 80px; padding: 9px 14px 7px 17px;
				overflow: hidden; border: 1px solid rgba(15,23,42,.1); border-radius: 7px;
				background: rgba(255,255,255,.95); color: var(--text-primary); text-align: left; font: inherit;
				box-shadow: 0 3px 10px rgba(22,35,52,.08); cursor: pointer;
			}
			.layout-process .node-card::before { width: 4px; background: var(--cat-color, var(--accent)); }
			.layout-process .node-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(22,35,52,.14); }
			.layout-process .node-head { display: block; width: 100%; text-align: left; }
			.layout-process .node-index { display: block; margin-bottom: 5px; color: var(--cat-color, var(--accent)); font-size: .72rem; font-weight: 800; line-height: 1.1; }
			.layout-process .node-name {
				display: -webkit-box; overflow: hidden; font-size: .94rem; line-height: 1.35;
				line-clamp: 2; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
			}
			.layout-process .node-details { display: none; }
			.layout-process .node-card.is-muted { cursor: default; filter: grayscale(1); opacity: .38; pointer-events: none; }
			.layout-process .node-card.is-filter-match {
				border-color: var(--cat-color, var(--accent));
				box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color, var(--accent)) 18%, transparent);
			}
			@media (max-width: 900px) {
				.layout-process .flow-grid { gap: 10px; padding: 20px 20px 30px; }
				.layout-process .node-card { padding: 10px 12px 8px 15px; }
			}
			@media (max-width: 640px) {
				.layout-process .flow-menu-toggle { display: inline-flex !important; flex: 1 1 auto; width: auto; min-width: 0; min-height: 42px; margin: 0; padding: 8px 12px; }
				.layout-process .flow-header { padding: 12px 0 0; }
				.layout-process .flow-header:not(.is-open) { display: none; }
				.layout-process .flow-header.is-open { display: block; }
				.layout-process .journey-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; padding: 0; }
				.layout-process .journey-filters .flow-header-cell { min-height: 52px; padding: 8px 10px; }
				.layout-process .flow-grid { padding: 16px 12px 24px; gap: 8px; }
				.layout-process .flow-cell { min-height: 88px; }
				.layout-process .node-card { height: 88px; min-height: 88px; padding: 10px 12px 8px 15px; }
				.layout-process .node-name { font-size: .92rem; }
			}
		`,

		render: function(context) {
			const { rows, columns, grid, header, legend, helpers } = context;
			const routeColumns = getRouteColumns();
			grid.style.setProperty('--route-columns', routeColumns);
			grid.style.gridTemplateColumns = '';
			grid.style.gridTemplateRows = '';
			header.style.gridTemplateColumns = '';
			legend.innerHTML = '';
			const filters = columns.map(function(category, index) {
				const count = rows.filter(function(row) { return helpers.category(row) === category; }).length;
				return helpers.headerCell(category, count, index);
			}).join('');
			header.innerHTML = '<div class="journey-filters">' + filters + '</div>';
			grid.innerHTML = rows.map(function(row, index) {
				const category = helpers.category(row);
				const routeRow = Math.floor(index / routeColumns) + 1;
				const routePosition = index % routeColumns;
				const routeColumn = routeRow % 2 === 1 ? routePosition + 1 : routeColumns - routePosition;
				const name = row.항목명 || '(항목명 없음)';
				return '<div class="flow-cell" data-cat="' + helpers.escape(category) + '" data-col="' + routeColumn + '" data-idx="' + index + '" style="--cat-color:' + helpers.color(category) + ';--route-column:' + routeColumn + ';--route-row:' + routeRow + '">' +
					'<button class="node-card is-entering" type="button" onclick="openDetail(' + index + ')" aria-label="' + helpers.escape((index + 1) + '번 ' + name + ' 상세 보기') + '">' +
					'<span class="node-head"><span class="node-index">' + String(index + 1).padStart(2, '0') + '</span><span class="node-name">' + helpers.escape(name) + '</span></span></button></div>';
			}).join('');
		},

		filter: function(context, activeCategory) {
			const toggle = document.getElementById('flowMenuToggle');
			if (toggle) {
				toggle.textContent = activeCategory || '분류 필터';
				toggle.classList.toggle('is-filtered', !!activeCategory);
			}
			let matchedCount = 0;
			context.grid.querySelectorAll('.flow-cell').forEach(function(cell) {
				const matches = !activeCategory || cell.dataset.cat === activeCategory;
				const card = cell.querySelector('.node-card');
				cell.classList.remove('hidden');
				if (card) {
					card.classList.toggle('is-muted', !!activeCategory && !matches);
					card.classList.toggle('is-filter-match', !!activeCategory && matches);
				}
				if (matches) matchedCount++;
			});
			return matchedCount;
		},

		connector: function(a, b, grid) {
			const sameRow = Math.abs(a.top - b.top) < 4;
			if (sameRow) {
				const movesRight = b.left > a.left;
				const x1 = (movesRight ? a.right : a.left) - grid.left;
				const x2 = (movesRight ? b.left : b.right) - grid.left;
				const y = a.top + a.height / 2 - grid.top;
				return 'M' + x1 + ',' + y + ' L' + x2 + ',' + y;
			}
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
