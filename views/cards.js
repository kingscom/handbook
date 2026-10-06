(function registerCardsView() {
  'use strict';

  function cardHtml(row, index, helpers) {
    const stage = helpers.category(row);
    return '<button class="process-card" type="button" data-card-index="' + index + '" onclick="openDetail(' + index + ')" aria-label="' + helpers.escape((index + 1) + '번 ' + (row.항목명 || '항목명 없음') + ' 상세 보기') + '">' +
      '<span class="process-card-top"><span class="process-card-index">' + String(index + 1).padStart(2, '0') + '</span><span class="process-card-stage"><i style="--stage-color:' + helpers.color(stage) + '"></i>' + helpers.escape(stage) + '</span></span>' +
      '<strong class="process-card-name">' + helpers.escape(row.항목명 || '(항목명 없음)') + '</strong>' +
    '</button>';
  }

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookViews.b = {
    label: '카드로 보기',
    source: '(' + registerCardsView.toString() + ')();',
    styles: `
      .layout-cards .flow-header, .layout-cards .flow-menu-toggle, .layout-cards .process-legend { display: none !important; }
      .layout-cards .board-body { padding: 32px 34px 42px; }
      .layout-cards .flow-board { max-width: 1320px; margin: 0 auto; }
      .layout-cards .flow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important; gap: 18px 28px; }
      .layout-cards .flow-cell { grid-column: auto !important; grid-row: auto !important; }
      .process-card { position: relative; display: flex; flex-direction: column; align-items: stretch; width: 100%; min-height: 102px; padding: 13px 12px 12px; border: 1px solid var(--page-border-strong); border-radius: 8px; background: rgba(255,255,255,.78); color: var(--text-primary); text-align: left; box-shadow: 0 2px 6px rgba(15,23,42,.05); cursor: pointer; transition: background .2s ease, border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
      .process-card::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--accent); content: ''; opacity: 0; transform: scaleX(.35); transform-origin: left; transition: opacity .2s ease, transform .2s ease; }
      .process-card:hover, .process-card:focus-visible { transform: translateY(-3px); border-color: rgba(0,113,227,.42); background: linear-gradient(145deg, rgba(234,243,255,.94), rgba(244,249,255,.8)); box-shadow: 0 10px 20px rgba(0,113,227,.1), inset 0 1px 0 rgba(255,255,255,.9); outline: 0; }
      .process-card:hover::after, .process-card:focus-visible::after { opacity: 1; transform: scaleX(1); }
      .process-card-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .process-card-index { color: var(--text-quaternary); font: 600 .7rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .06em; }
      .process-card-stage { display: inline-flex; align-items: center; gap: 6px; color: var(--text-tertiary); font-size: .72rem; }
      .process-card-stage i { width: 7px; height: 7px; border-radius: 50%; background: var(--stage-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--stage-color) 14%, transparent); }
      .process-card-name { margin-top: 14px; font-size: 1rem; font-weight: 650; line-height: 1.42; letter-spacing: -.025em; word-break: keep-all; }
      .layout-cards .flow-connectors { display: none; }
      .layout-cards .detail-screen { padding-top: 8px; }
      @media (max-width: 860px) { .layout-cards .board-body { padding: 24px 18px 32px; } .layout-cards .flow-grid { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)) !important; gap: 14px 22px; } }
      @media (max-width: 640px) {
        .layout-cards .board-body { padding: 16px 12px 24px; }
        .layout-cards .flow-grid { grid-template-columns: 1fr !important; gap: 10px; }
        .process-card { min-height: 92px; padding: 12px; }
        .process-card-name { margin-top: 10px; font-size: .96rem; line-height: 1.4; }
      }
    `,

    render: function(context) {
      const { rows, grid, header, legend, helpers } = context;
      header.innerHTML = '';
      legend.innerHTML = '';
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      grid.innerHTML = rows.map(function(row, index) { return '<div class="flow-cell">' + cardHtml(row, index, helpers) + '</div>'; }).join('');
    },

    filter: function(context) { return context.rows.length; },
    connector: function() { return ''; }
  };
})();