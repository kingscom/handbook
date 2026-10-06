(function registerProcedureView() {
  'use strict';

  const categoryIcons = { '분석': '🔍', '설계': '📐', '개발': '💻', '검증': '✅', '운영': '🚀', '계약': '📝', '보안': '🔐' };

  function iconFor(category) {
    return categoryIcons[category] || '◌';
  }

  function fieldHtml(label, value, helpers, isLink) {
    const text = value && String(value).trim();
    let content = text ? helpers.escape(String(value)) : '-';
    if (text && isLink) {
      content = String(value).split('\\').map(function(link) {
        const trimmed = link.trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed)
          ? '<a href="' + helpers.escape(trimmed) + '" target="_blank" rel="noopener noreferrer">문서 열기</a>'
          : helpers.escape(trimmed);
      }).filter(Boolean).join('<br>');
    }
    return '<div class="procedure-side-field"><span>' + label + '</span><div>' + content + '</div></div>';
  }

  function closeDetail() {
    const panel = document.getElementById('procedureDetailContent');
    const detailAside = document.getElementById('procedureSideDetail');
    if (!panel) return;
    document.querySelectorAll('.procedure-card.is-inspected').forEach(function(card) {
      card.classList.remove('is-inspected');
    });
    panel.innerHTML = '<p class="procedure-side-empty">카드를 선택하면 업무 기준과 관련 문서를 이 영역에서 확인할 수 있습니다.</p>';
  }

  function registerDetailActions() {
    window.openProcedureCardDetail = function(index) {
      if (window.matchMedia('(max-width: 640px)').matches) window.openDetail(index);
      else window.openProcedureDetail(index);
    };
    window.openProcedureDetail = function(index) {
      const context = window.HandbookProcedureContext;
      const row = context && context.rows[index];
      const panel = document.getElementById('procedureDetailContent');
      if (!row || !panel) return;
      const helpers = context.helpers;
      const category = helpers.category(row);
      document.querySelectorAll('.procedure-card').forEach(function(card) {
        card.classList.toggle('is-inspected', Number(card.dataset.idx) === index);
      });
      panel.innerHTML = '<button type="button" class="procedure-side-close" onclick="closeProcedureDetail()" aria-label="상세 닫기">&times;</button>' +
        '<div class="procedure-side-kicker">STEP ' + String(index + 1).padStart(2, '0') + ' · ' + helpers.escape(category) + '</div>' +
        '<h3 class="procedure-side-title">' + helpers.escape(row.항목명 || '(항목명 없음)') + '</h3>' +
        '<div class="procedure-side-fields">' +
          fieldHtml('주관팀', row.주관팀, helpers) +
          fieldHtml('개정일자', row.개정일자, helpers) +
          fieldHtml('문서명', row.문서명, helpers) +
          fieldHtml('문서내용', row.문서내용, helpers) +
          fieldHtml('문서링크', row.문서링크, helpers, true) +
        '</div>';
    };
    window.closeProcedureDetail = closeDetail;
  }

  window.HandbookViews = window.HandbookViews || {};
  window.HandbookProcedureContext = null;
  registerDetailActions();
  window.HandbookViews.d = {
    label: '한번에 보기',
    source: '(' + registerProcedureView.toString() + ')();',
    styles: `
      .layout-procedure .board-body { padding: 20px; background: #e8edf1; }
      .layout-procedure .flow-header { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 12px; padding: 0 0 14px; border-top: 0; }
      .layout-procedure .flow-board { display: grid; grid-template-columns: minmax(130px, 2fr) minmax(0, 6fr) minmax(190px, 6fr); align-items: start; gap: 16px; min-height: 100%; }
      .layout-procedure .procedure-aside, .layout-procedure .procedure-side-detail { display: block; min-width: 0; padding: 20px 16px; border: 1px solid #d7dfe5; background: #f8fafb; }
      .layout-procedure .procedure-aside { position: sticky; top: 0; }
      .layout-procedure .procedure-count { display: grid; gap: 3px; padding-bottom: 16px; border-bottom: 1px solid #d7dfe5; }
      .layout-procedure .procedure-count span, .layout-procedure .procedure-count small, .layout-procedure .procedure-status-label { color: #6d7d89; font-size: .66rem; font-weight: 800; }
      .layout-procedure .procedure-count strong { color: #17324d; font: 800 2.1rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .layout-procedure .procedure-status { margin-top: 18px; }
      .layout-procedure .procedure-status p { margin-top: 7px; color: #17324d; font-size: .78rem; font-weight: 700; line-height: 1.45; }
      .layout-procedure .flow-grid { display: block; min-width: 0; width: 100%; max-width: none; margin: 0; padding: 0 16px; border-right: 1px solid #d7dfe5; border-left: 1px solid #d7dfe5; }
      .layout-procedure .flow-connectors { display: none; }
      .layout-procedure .procedure-step { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 10px; min-height: 72px; }
      .layout-procedure .procedure-marker { position: relative; display: flex; justify-content: center; z-index: 1; }
      .layout-procedure .procedure-marker::after { position: absolute; top: 34px; bottom: 0; width: 2px; background: #8ea3af; content: ''; }
      .layout-procedure .procedure-step:last-child .procedure-marker::after { display: none; }
      .layout-procedure .procedure-number { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 2px solid var(--cat-color); border-radius: 50%; background: #fff; color: #17324d; font: 800 .68rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .layout-procedure .procedure-card { position: relative; min-width: 0; margin-bottom: 6px; padding: 11px 12px; border: 1px solid #d7dfe5; border-left: 5px solid var(--cat-color); border-radius: 4px; background: #fff; box-shadow: 0 3px 8px rgba(24,48,70,.06); color: var(--text-primary); cursor: pointer; text-align: left; transition: transform .18s ease, box-shadow .18s ease; }
      .layout-procedure .procedure-card::before { display: none; }
      .layout-procedure .procedure-card:hover { transform: translateX(3px); box-shadow: 0 8px 16px rgba(24,48,70,.12); }
      .layout-procedure .procedure-card.is-inspected { border-color: var(--cat-color); box-shadow: 0 6px 16px color-mix(in srgb, var(--cat-color) 18%, transparent); }
      .layout-procedure .procedure-card.is-muted { cursor: default; filter: grayscale(1); opacity: .38; pointer-events: none; }
      .layout-procedure .procedure-card.is-filter-match { border-color: var(--cat-color); box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color) 18%, transparent); }
      .layout-procedure .procedure-category { color: var(--cat-color); font-size: .68rem; }
      .layout-procedure .procedure-title-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; margin-top: 4px; }
      .layout-procedure .procedure-card .node-name { display: block; min-width: 0; overflow: hidden; margin: 0; font-size: .9rem; line-height: 1.4; text-overflow: ellipsis; white-space: nowrap; }
      .layout-procedure .procedure-detail { flex: 0 0 auto; margin-left: auto; color: #6d7d89; font-size: .68rem; white-space: nowrap; }
      .layout-procedure .procedure-side-detail { position: sticky; top: 0; min-height: 260px; border-top: 4px solid #17324d; }
      .layout-procedure .procedure-detail-content { position: relative; padding-top: 14px; }
      .layout-procedure .procedure-side-empty { color: #6d7d89; font-size: .8rem; line-height: 1.6; }
      .layout-procedure .procedure-side-kicker { color: #6d7d89; font: 800 .66rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .layout-procedure .procedure-side-title { margin: 8px 24px 16px 0; color: #17324d; font-size: 1rem; line-height: 1.4; }
      .layout-procedure .procedure-side-close { position: absolute; top: -4px; right: -4px; width: 28px; height: 28px; border: 0; background: transparent; color: #6d7d89; font-size: 1.25rem; cursor: pointer; }
      .layout-procedure .procedure-side-fields { display: grid; gap: 10px; }
      .layout-procedure .procedure-side-field { display: grid; gap: 4px; padding-top: 10px; border-top: 1px solid #dfe6ea; }
      .layout-procedure .procedure-side-field:first-child { padding-top: 0; border-top: 0; }
      .layout-procedure .procedure-side-field span { color: #6d7d89; font-size: .65rem; font-weight: 800; }
      .layout-procedure .procedure-side-field div { color: #334b5d; font-size: .76rem; line-height: 1.55; overflow-wrap: anywhere; }
      .layout-procedure .procedure-side-field a { color: #1264a3; font-weight: 700; }
      .layout-procedure #processLegend { display: none !important; }
      @media (max-width: 860px) {
        .layout-procedure .flow-header:not(.is-open) { display: none; }
        .layout-procedure .flow-header.is-open { display: grid; }
      }
      @media (max-width: 640px) {
        .layout-procedure .board-body { padding: 12px; overflow-y: auto; }
        .layout-procedure .flow-board { display: flex; flex-direction: column; gap: 12px; }
        .layout-procedure .procedure-aside { position: static; width: 100%; padding: 14px; }
        .layout-procedure .procedure-count { display: flex; align-items: baseline; gap: 8px; padding-bottom: 10px; }
        .layout-procedure .procedure-count strong { font-size: 1.5rem; }
        .layout-procedure .procedure-status { margin-top: 10px; }
        .layout-procedure .procedure-step { grid-template-columns: 34px minmax(0, 1fr); gap: 8px; }
        .layout-procedure .procedure-number { width: 30px; height: 30px; }
        .layout-procedure .procedure-marker::after { top: 30px; }
        .layout-procedure .procedure-card .node-name { white-space: normal; }
        .layout-procedure .procedure-detail { display: none; }
        .layout-procedure .procedure-side-detail { width: 100%; padding: 16px; }
      }
    `,

    render: function(context) {
      const { rows, columns, grid, header, helpers } = context;
      const aside = document.getElementById('procedureAside');
      const detail = document.getElementById('procedureDetailContent');
      const count = document.getElementById('procedureCount');
      const status = document.getElementById('filterStatus');
      const detailAside = document.getElementById('procedureSideDetail');
      window.HandbookProcedureContext = context;
      if (aside) aside.hidden = false;
      if (detailAside) detailAside.hidden = false;
      if (detail) detail.innerHTML = '<p class="procedure-side-empty">카드를 선택하면 업무 기준과 관련 문서를 이 영역에서 확인할 수 있습니다.</p>';
      if (count) count.textContent = String(rows.length).padStart(2, '0');
      if (status) status.textContent = '전체 ' + rows.length + '개 절차 표시 중';
      header.innerHTML = columns.map(function(category, index) {
        const total = rows.filter(function(row) { return helpers.category(row) === category; }).length;
        return helpers.headerCell(category, total, index);
      }).join('');
      header.classList.remove('is-parallel');
      header.style.gridTemplateColumns = 'repeat(' + columns.length + ', minmax(0, 1fr))';
      grid.classList.remove('parallel-flow', 'is-filter-active');
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      grid.innerHTML = rows.map(function(row, index) {
        const category = helpers.category(row);
        const step = String(index + 1).padStart(2, '0');
        const name = row.항목명 || '(항목명 없음)';
        return '<article class="flow-cell procedure-step" data-cat="' + helpers.escape(category) + '" data-idx="' + index + '">' +
          '<div class="procedure-marker"><span class="procedure-number" style="--cat-color:' + helpers.color(category) + '">' + step + '</span></div>' +
          '<button class="node-card procedure-card" type="button" data-idx="' + index + '" style="--cat-color:' + helpers.color(category) + '" onclick="openProcedureCardDetail(' + index + ')" aria-label="' + helpers.escape(step + '번 ' + name + ' 상세 보기') + '">' +
            '<span class="procedure-category">' + iconFor(category) + ' ' + helpers.escape(category) + '</span>' +
            '<span class="procedure-title-row"><span class="node-name">' + helpers.escape(name) + '</span><span class="procedure-detail">상세 보기</span></span>' +
          '</button></article>';
      }).join('');
    },

    filter: function(context, activeCategory) {
      const toggle = document.getElementById('flowMenuToggle');
      if (toggle) {
        toggle.textContent = activeCategory || '분류 필터';
        toggle.classList.toggle('is-filtered', !!activeCategory);
      }
      let visibleCount = 0;
      context.grid.querySelectorAll('.procedure-step').forEach(function(step) {
        const matches = !activeCategory || step.dataset.cat === activeCategory;
        const card = step.querySelector('.procedure-card');
        step.classList.remove('hidden');
        step.classList.toggle('is-filter-match', !!activeCategory && matches);
        if (card) {
          card.classList.toggle('is-muted', !!activeCategory && !matches);
          card.classList.toggle('is-filter-match', !!activeCategory && matches);
        }
        if (matches) visibleCount++;
      });
      const count = document.getElementById('procedureCount');
      const status = document.getElementById('filterStatus');
      if (count) count.textContent = String(visibleCount).padStart(2, '0');
      if (status) status.textContent = activeCategory
        ? activeCategory + ' ' + visibleCount + '개 절차 표시 중'
        : '전체 ' + visibleCount + '개 절차 표시 중';
      return visibleCount;
    },

    connector: function() { return ''; }
  };
})();