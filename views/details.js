(function registerDetailsView() {
  'use strict';

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.e = {
    label: '자세히 보기',
    source: '(' + registerDetailsView.toString() + ')();',
    styles: `
      .layout-details .process-legend { display: none; }
      .layout-details .flow-grid { display: block; width: 100%; max-width: none; margin: 0; padding: 0 22px 28px; overflow-x: auto; }
      .layout-details .flow-grid::before, .layout-details .flow-connectors { display: none; }
      .details-table-head, .details-row { display: grid; grid-template-columns: 58px minmax(100px, .7fr) minmax(180px, 1.4fr) minmax(130px, 1fr) minmax(105px, .75fr) minmax(180px, 1.4fr) minmax(220px, 1.7fr); align-items: center; gap: 14px; min-width: 1100px; }
      .details-table-head { position: sticky; top: 0; z-index: 2; min-height: 38px; padding: 0 14px; border-bottom: 1px solid #d9e0e6; background: #f3f6f8; color: #64727e; font-size: .72rem; font-weight: 750; }
      .details-row { width: 100%; min-height: 54px; padding: 8px 14px; border: 0; border-bottom: 1px solid #e8edf0; background: rgba(255,255,255,.78); color: var(--text-primary); font: inherit; text-align: left; cursor: pointer; transition: background .14s ease, box-shadow .14s ease; }
      .details-row:hover, .details-row:focus-visible { position: relative; z-index: 1; background: #edf5fb; box-shadow: inset 3px 0 var(--cat-color, var(--accent)); outline: 0; }
      .details-row.is-muted { cursor: default; filter: grayscale(1); opacity: .4; pointer-events: none; }
      .details-row.is-filter-match { background: color-mix(in srgb, var(--cat-color, var(--accent)) 7%, white); }
      .details-index { color: #778590; font: 600 .8rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .details-category { overflow: hidden; color: var(--cat-color, var(--accent)); font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }
      .details-name { overflow: hidden; font-size: .86rem; font-weight: 650; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
      .details-owner { overflow: hidden; color: #687782; font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }
      .details-date, .details-doc-name, .details-links { color: #53616c; font-size: .76rem; line-height: 1.4; overflow-wrap: anywhere; }
      .details-doc-name, .details-links { white-space: normal; }
      .details-document-link { color: #1264a3; text-decoration: underline; text-underline-offset: 2px; }
      .details-document-link:hover { color: #084b82; }
      @media (max-width: 640px) {
        .layout-details .flow-grid { padding: 0 10px 20px; }
        .details-table-head { min-height: 34px; font-size: .66rem; }
        .details-row { min-height: 50px; }
        .details-table-head, .details-row { gap: 10px; padding-right: 10px; padding-left: 10px; }
      }
    `,

    render: function(context) {
      const { rows, columns, grid, header, legend, helpers } = context;
      header.classList.remove('is-parallel');
      header.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
      header.innerHTML = columns.map(function(category, index) {
        const count = rows.filter(function(row) { return helpers.category(row) === category; }).length;
        return helpers.headerCell(category, count, index);
      }).join('');
      legend.innerHTML = '';
      grid.classList.remove('parallel-flow', 'is-filter-active');
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      grid.innerHTML = '<div class="details-table-head" aria-hidden="true"><span>순서</span><span>분류</span><span>항목명</span><span>주관팀</span><span>개정일자</span><span>문서명</span><span>문서 링크</span></div>' + rows.map(function(row, index) {
        const category = helpers.category(row);
        const name = row.항목명 || '(항목명 없음)';
        const revised = row.개정일자 || '-';
        const documentName = row.문서명 || '-';
        const documentLinks = String(row.문서링크 || '').split('\\').map(function(link) { return link.trim(); }).filter(Boolean);
        const linkText = documentLinks.length ? documentLinks.join(', ') : '-';
        const owner = row.주관팀 || '-';
        const label = (index + 1) + '번, ' + category + ', ' + name + ', 개정일자 ' + revised + ', 문서명 ' + documentName + ', 문서 링크 ' + linkText + ', 주관팀 ' + owner + ', 상세 보기';
        const renderedLinks = documentLinks.length ? documentLinks.map(function(link) {
          const escapedLink = helpers.escape(link);
          return /^https?:\/\//i.test(link)
            ? '<a class="details-document-link" href="' + escapedLink + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">' + escapedLink + '</a>'
            : escapedLink;
        }).join('<br>') : '-';
        return '<div class="details-row" role="group" tabindex="0" data-cat="' + helpers.escape(category) + '" data-idx="' + index + '" style="--cat-color:' + helpers.color(category) + '" onclick="if (!event.target.closest(\'a\')) openDetail(' + index + ')" onkeydown="if (event.target === this && (event.key === \'Enter\' || event.key === \' \')) { event.preventDefault(); openDetail(' + index + '); }" aria-label="' + helpers.escape(label) + '">' +
          '<span class="details-index">' + (index + 1) + '</span>' +
          '<span class="details-category">' + helpers.escape(category) + '</span>' +
          '<span class="details-name">' + helpers.escape(name) + '</span>' +
          '<span class="details-owner">' + helpers.escape(owner) + '</span>' +
          '<span class="details-date">' + helpers.escape(revised) + '</span>' +
          '<span class="details-doc-name">' + helpers.escape(documentName) + '</span>' +
          '<span class="details-links" title="' + helpers.escape(linkText) + '">' + renderedLinks + '</span>' +
        '</div>';
      }).join('');
    },

    filter: function(context, activeCategory) {
      const toggle = document.getElementById('flowMenuToggle');
      if (toggle) {
        toggle.textContent = activeCategory || '분류 필터';
        toggle.classList.toggle('is-filtered', !!activeCategory);
      }
      let visibleCount = 0;
      context.grid.querySelectorAll('.details-row').forEach(function(row) {
        const matches = !activeCategory || row.dataset.cat === activeCategory;
        row.classList.toggle('is-muted', !!activeCategory && !matches);
        row.classList.toggle('is-filter-match', !!activeCategory && matches);
        if (matches) visibleCount++;
      });
      return visibleCount;
    },

    connector: function() { return ''; }
  };
})();