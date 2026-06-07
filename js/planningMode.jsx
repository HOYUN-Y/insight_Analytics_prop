/* insight Analytics Prop — Planning Studio */
(function () {
  const { useStore, actions, conv } = window.Store;
  const Icon = window.Icon;

  /* ── NAV items ───────────────────────────────────────────── */
  const NAV = [
    { s: '워크스페이스' },
    { ic: 'dashboard', t: 'Planning 대시보드', page: 'dashboard' },
    { ic: 'doc',       t: 'Project Brief',     page: 'brief' },
    { ic: 'grid',      t: 'Business Canvas',   page: 'canvas' },
    { ic: 'target',    t: '연구 질문',           page: 'rq',       cnt: s => (s.researchQuestions||[]).length },
    { ic: 'flag',      t: '가설 관리',           page: 'hyp',      cnt: s => (s.hypotheses||[]).length },
    { ic: 'swot',      t: 'SWOT',               page: 'swot' },
    { ic: 'node',      t: 'Mind Map',           page: 'mindmap' },
    { s: '기록' },
    { ic: 'bulb',      t: '인사이트',            page: 'insight',  cnt: s => (s.insights||[]).length },
    { ic: 'doc',       t: '의사결정 로그',        page: 'decision', cnt: s => (s.decisions||[]).length },
    { ic: 'search',    t: '출처 · 레퍼런스',     page: 'refs' },
    { s: '산출물' },
    { ic: 'report',    t: 'Report Builder',    page: 'report' },
  ];

  /* ── Left nav ────────────────────────────────────────────── */
  function PlanNav({ proj, page, onPage }) {
    return (
      <div className="plan-nav">
        <div className="plan-nav-head">
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tx-faint)' }}>
            프로젝트 구조
          </span>
          <button className="plan-nv" style={{ width: 'auto', height: 22, padding: '0 6px', fontSize: 12 }}
            onClick={() => actions.setMode('project')}>
            <Icon name="plus" size={13} />
          </button>
        </div>
        <div className="plan-nav-items">
          {NAV.map((r, i) => r.s
            ? <div key={i} className="plan-nsec">{r.s}</div>
            : (
              <button key={i} className={'plan-nv' + (r.page === page ? ' on' : '')}
                onClick={() => onPage(r.page)}>
                <Icon name={r.ic} size={15} />
                <span>{r.t}</span>
                <span style={{ flex: 1 }} />
                {r.cnt && proj && (() => { const n = r.cnt(proj); return n > 0 ? <span className="plan-nv-n">{n}</span> : null; })()}
              </button>
            )
          )}
          <div style={{ flex: 1 }} />
          <button className="plan-nv" onClick={() => {}}>
            <Icon name="plus" size={15} /><span>새 페이지</span>
          </button>
        </div>
      </div>
    );
  }

  /* ── Right insights panel ────────────────────────────────── */
  function InsightPanel({ proj, onPage }) {
    const insights = (proj && proj.insights) || [];
    function add() {
      const text = prompt('인사이트를 입력하세요:');
      if (!text) return;
      actions.updateProject({ id: proj.id, insights: [...insights, { id: 'ins_' + Date.now(), text, tag: '', star: 3, createdAt: new Date().toISOString().slice(0,10) }] });
    }
    return (
      <div className="plan-right">
        <div className="plan-right-head">
          <span className="plan-right-title">연결 인사이트</span>
          <span className="plan-right-count">{insights.length}</span>
        </div>
        <div className="insp">
          {insights.slice(-3).reverse().map(ins => (
            <div key={ins.id} className="icard" onClick={() => onPage('insight')}>
              <div className="it">{ins.text.slice(0,55)}{ins.text.length > 55 ? '…' : ''}</div>
              <div className="if">
                {ins.tag && <span className="htag">#{ins.tag}</span>}
                <span style={{ flex: 1 }} />
                <span className="star">
                  {'★'.repeat(ins.star||3)}<span style={{ color: 'var(--tx-faint)' }}>{'★'.repeat(5-(ins.star||3))}</span>
                </span>
              </div>
            </div>
          ))}
          {insights.length === 0 && <div className="plan-empty">아직 인사이트가 없습니다.</div>}
          <button className="addrow" style={{ marginTop: 2 }} onClick={add}>
            <Icon name="plus" size={14} /> 인사이트 추가
          </button>
        </div>
      </div>
    );
  }

  /* ── PageDoc wrapper ─────────────────────────────────────── */
  function PageDoc({ iconName, title, crumb, children }) {
    return (
      <div className="plan-doc">
        <div className="plan-crumb">{crumb}</div>
        <div className="plan-h1">
          <div className="plan-h1-icon"><Icon name={iconName} size={20} /></div>
          <span>{title}</span>
        </div>
        {children}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Dashboard
  ══════════════════════════════════════════════════════════ */
  function DashboardPage({ proj, onPage }) {
    const qs  = proj.researchQuestions || [];
    const hyp = proj.hypotheses || [];
    const ins = proj.insights || [];
    const swot = proj.swot || {};
    const swotN = ['S','W','O','T'].reduce((s,k) => s + (swot[k] ? swot[k].split('\n').filter(Boolean).length : 0), 0);
    const qDone  = qs.filter(q => q.status === 'done').length;
    const hAdopt = hyp.filter(h => h.status === 'accepted').length;

    const KPI = [
      { k: '연구 질문', v: qs.length,  sub: '완료 ' + qDone,  hl: true,  page: 'rq' },
      { k: '가설',     v: hyp.length, sub: '채택 ' + hAdopt, hl: true,  page: 'hyp' },
      { k: 'SWOT 항목',v: swotN,      sub: 'S/W/O/T',       hl: false, page: 'swot' },
      { k: '인사이트', v: ins.length, sub: '★3↑ ' + ins.filter(i => (i.star||3) >= 3).length, hl: false, page: 'insight' },
    ];

    const STAGES = [
      { ic: 'planning', l: 'Planning', pct: 45, cur: true },
      { ic: 'data',     l: 'Data',     pct: 70, done: true },
      { ic: 'analysis', l: 'Analysis', pct: 35 },
      { ic: 'bolt',     l: 'Insight',  pct: 20 },
      { ic: 'report',   l: 'Report',   pct: 5 },
    ];

    return (
      <PageDoc iconName="dashboard" title="Planning 대시보드" crumb={(proj.name||'') + ' / Planning Studio / Planning 대시보드'}>
        {/* Pipeline */}
        <div className="pipe">
          {STAGES.map((st, i, a) => (
            <React.Fragment key={i}>
              <div className={'st' + (st.cur ? ' cur' : '') + (st.done ? ' done' : '')}>
                <div className="lbl">
                  <span className="i"><Icon name={st.ic} size={11} /></span>{st.l}
                </div>
                <div className="bar"><i style={{ width: st.pct + '%' }} /></div>
                <div className="pct">{st.pct}%</div>
              </div>
              {i < a.length - 1 && <div className="arr"><Icon name="chevR" size={16} style={{ color: 'var(--tx-faint)' }} /></div>}
            </React.Fragment>
          ))}
        </div>

        {/* KPIs */}
        <div className="dashkpis">
          {KPI.map((k, i) => (
            <div key={i} className={'kpi' + (k.hl ? ' hl' : '')} onClick={() => onPage(k.page)}>
              <div className="k">{k.k}</div>
              <div className="v">{k.v}</div>
              <div className="s">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="plan-h2">바로가기</div>
        {[
          { ic: 'search',   label: '연구 질문 빌더', page: 'rq' },
          { ic: 'layers',   label: '가설 매니저',    page: 'hyp' },
          { ic: 'analysis', label: 'SWOT 분석',      page: 'swot' },
        ].map(r => (
          <div key={r.page} className="qline" style={{ cursor: 'pointer' }} onClick={() => onPage(r.page)}>
            <span style={{ color: 'var(--accent-hi)' }}><Icon name={r.ic} size={15} /></span>
            <span style={{ flex: 1 }}>{r.label}</span>
            <span className="htag">열기 →</span>
          </div>
        ))}
      </PageDoc>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Brief
  ══════════════════════════════════════════════════════════ */
  const PROP_TYPES = ['아파트','오피스텔','상가','지식산업센터','생활숙박시설','기타'];
  const OBJECTIVES = ['시장조사','분양가 검토','경쟁단지 분석','입지 분석','마케팅 전략 수립','제안서 작성','수요 예측','청약 전략'];

  function BriefPage({ proj }) {
    const b = proj.brief || {};
    const upd  = (f, v) => actions.updateProject({ id: proj.id, [f]: v });
    const updB = (f, v) => actions.updateProject({ id: proj.id, brief: { ...b, [f]: v } });
    const objs = b.objectives || [];
    const filled = [proj.name, proj.siteName, b.developer, b.constructor, b.saleQuarter, proj.totalUnits].filter(Boolean).length;
    const pct = Math.round(filled / 6 * 100);

    return (
      <PageDoc iconName="doc" title="Project Brief" crumb={(proj.name||'') + ' / Planning Studio / Project Brief'}>
        {/* Section 1: 기본정보 */}
        <div className="bfsec">
          <div className="bfsh">
            <span className="num">1</span>
            <span className="bt">기본 정보</span>
            <span className="bd">이 브리프로 프로젝트 카드와 보고서 표지가 채워집니다</span>
            <span style={{ marginLeft: 'auto' }} className="chip-sm chip-green">작성 {pct}%</span>
          </div>
          <div className="bfgrid">
            <div className="bff">
              <div className="bfl">프로젝트명 <span style={{ color: 'var(--neg)' }}>*</span></div>
              <input className="pf-input" value={proj.name||''} onChange={e => upd('name', e.target.value)} placeholder="예: 래미안 송도 더퍼스트" />
            </div>
            <div className="bff">
              <div className="bfl">사업지명</div>
              <input className="pf-input" value={proj.siteName||''} onChange={e => upd('siteName', e.target.value)} placeholder="예: 인천 연수구 송도동" />
            </div>
            <div className="bff">
              <div className="bfl">시행사</div>
              <input className="pf-input" value={b.developer||''} onChange={e => updB('developer', e.target.value)} placeholder="예: 송도개발(주)" />
            </div>
            <div className="bff">
              <div className="bfl">시공사</div>
              <input className="pf-input" value={b.constructor||''} onChange={e => updB('constructor', e.target.value)} placeholder="예: 삼성물산" />
            </div>
            <div className="bff">
              <div className="bfl">분양 예정</div>
              <select className="pf-select" value={b.saleQuarter||''} onChange={e => updB('saleQuarter', e.target.value)}>
                <option value="">— 선택 —</option>
                {['2025 Q1','2025 Q2','2025 Q3','2025 Q4','2026 Q1','2026 Q2','2026 Q3','2026 Q4','2027 Q1','2027 Q2'].map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div className="bff">
              <div className="bfl">총 세대수</div>
              <input className="pf-input" type="number" value={proj.totalUnits||''} onChange={e => upd('totalUnits', +e.target.value)} placeholder="예: 1204" />
            </div>
          </div>
        </div>

        {/* Section 2: 사업유형 */}
        <div className="bfsec">
          <div className="bfsh">
            <span className="num">2</span>
            <span className="bt">사업 유형 <span style={{ color: 'var(--neg)' }}>*</span></span>
          </div>
          <div className="bchips">
            {PROP_TYPES.map(t => (
              <button key={t} className={'bchip' + ((b.propertyType||'아파트') === t ? ' on' : '')}
                onClick={() => updB('propertyType', t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* Section 3: 분석목적 */}
        <div className="bfsec">
          <div className="bfsh">
            <span className="num">3</span>
            <span className="bt">분석 목적</span>
            <span className="bd">선택한 목적에 맞는 연구질문이 자동 제안됩니다</span>
          </div>
          <div className="bchips">
            {OBJECTIVES.map(o => {
              const on = objs.includes(o);
              return (
                <button key={o} className={'bchip' + (on ? ' on' : '')}
                  onClick={() => updB('objectives', on ? objs.filter(x=>x!==o) : [...objs, o])}>
                  {on && <Icon name="check" size={11} />} {o}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: 프로젝트 설명 */}
        <div className="bfsec">
          <div className="bfsh">
            <span className="num">4</span>
            <span className="bt">프로젝트 설명</span>
            <span className="bd">선택</span>
          </div>
          <textarea className="pf-textarea" rows={4} value={b.description||''}
            onChange={e => updB('description', e.target.value)}
            placeholder="이 프로젝트의 목표와 주요 전략 방향을 자유롭게 기술하세요." />
        </div>

        {/* Section 5: 평형구성 */}
        <div className="bfsec">
          <div className="bfsh">
            <span className="num">5</span>
            <span className="bt">평형 구성</span>
          </div>
          <UnitTypeTable proj={proj} />
        </div>
      </PageDoc>
    );
  }

  function UnitTypeTable({ proj }) {
    const types = proj.unitTypes || [];
    function addRow() {
      actions.updateProject({ id: proj.id, unitTypes: [...types, { id: 'ut_'+Date.now(), name:'', sqm:'', pyeong:'', units:'', type:'전용', note:'' }] });
    }
    function upd(idx, field, val) {
      const updated = types.map((t, i) => {
        if (i !== idx) return t;
        const next = { ...t, [field]: val };
        if (field === 'sqm' && val) next.pyeong = (val / 3.30579).toFixed(1);
        if (field === 'pyeong' && val) next.sqm = (val * 3.30579).toFixed(2);
        return next;
      });
      actions.updateProject({ id: proj.id, unitTypes: updated });
    }
    function del(idx) { actions.updateProject({ id: proj.id, unitTypes: types.filter((_,i) => i !== idx) }); }
    return (
      <div>
        <div className="unit-type-table-wrap">
          <table className="unit-type-table">
            <thead><tr><th>평형명</th><th>전용(㎡)</th><th>전용(평)</th><th>타입</th><th>세대수</th><th>비고</th><th /></tr></thead>
            <tbody>
              {types.map((t,i) => (
                <tr key={t.id}>
                  <td><input value={t.name} onChange={e => upd(i,'name',e.target.value)} placeholder="84A" /></td>
                  <td><input type="number" value={t.sqm} onChange={e => upd(i,'sqm',e.target.value)} /></td>
                  <td><input type="number" value={t.pyeong} onChange={e => upd(i,'pyeong',e.target.value)} /></td>
                  <td><select value={t.type} onChange={e => upd(i,'type',e.target.value)}>{['전용','공급','계약'].map(v => <option key={v}>{v}</option>)}</select></td>
                  <td><input type="number" value={t.units} onChange={e => upd(i,'units',e.target.value)} /></td>
                  <td><input value={t.note||''} onChange={e => upd(i,'note',e.target.value)} /></td>
                  <td><button className="icon-btn-sm" style={{ opacity: 1 }} onClick={() => del(i)}><Icon name="x" size={11}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="addrow" style={{ marginTop: 8 }} onClick={addRow}>
          <Icon name="plus" size={13} /> 평형 추가
        </button>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Canvas
  ══════════════════════════════════════════════════════════ */
  const CANVAS_SECS = [
    { id: 'goal',     k: '프로젝트 목표' },
    { id: 'core',     k: '핵심 과제' },
    { id: 'target',   k: '타겟 고객' },
    { id: 'comp',     k: '경쟁 사업지' },
    { id: 'strength', k: '예상 강점' },
    { id: 'weakness', k: '예상 약점' },
    { id: 'data',     k: '필요한 데이터' },
    { id: 'outcome',  k: '기대 결과' },
  ];

  function CanvasPage({ proj }) {
    const cards = proj.canvasCards || {};
    const b = proj.brief || {};
    const filled = CANVAS_SECS.filter(s => (cards[s.id]||{items:[]}).items.length > 0).length;

    function addItem(secId, text) {
      const cur = cards[secId] || { items: [] };
      actions.upsertCanvasCard({ projectId: proj.id, sectionId: secId, items: [...cur.items, { id: 'ci_'+Date.now(), text }] });
    }
    function delItem(secId, itemId) {
      const cur = cards[secId] || { items: [] };
      actions.upsertCanvasCard({ projectId: proj.id, sectionId: secId, items: cur.items.filter(i => i.id !== itemId) });
    }

    return (
      <PageDoc iconName="grid" title="비즈니스 캔버스" crumb={(proj.name||'') + ' / Planning Studio / Business Canvas'}>
        {/* Props */}
        <div className="plan-props">
          <div className="pk"><Icon name="layers" size={14} /> 사업 유형</div>
          <div>{b.propertyType||'아파트'} · {proj.totalUnits||'—'}세대</div>
          <div className="pk"><Icon name="map" size={14} /> 위치</div>
          <div>{proj.siteName||'—'}</div>
          <div className="pk"><Icon name="planning" size={14} /> 분양 예정</div>
          <div>{b.saleQuarter||'—'}</div>
          <div className="pk"><Icon name="check" size={14} /> 상태</div>
          <div><span className="chip-sm chip-green">작성 {filled}/8</span></div>
        </div>

        <div className="plan-callout">
          <span className="ci"><Icon name="bolt" size={16} /></span>
          <div><b>분양 사업 분석용 캔버스</b> — 항목을 클릭해 편집하고, <b>+ 항목</b>으로 추가하세요. 채운 내용은 SWOT·Report로 이어집니다.</div>
        </div>

        <div className="plan-h2">캔버스 8 섹션</div>
        <div className="bcanvas">
          {CANVAS_SECS.map(sec => {
            const items = (cards[sec.id]||{items:[]}).items;
            return (
              <CanvasCard key={sec.id} sec={sec} items={items}
                onAdd={text => addItem(sec.id, text)}
                onDel={id   => delItem(sec.id, id)} />
            );
          })}
        </div>

        <div className="canvas-linked-title">연결된 연구 질문</div>
        {(proj.researchQuestions||[]).map(q => (
          <div key={q.id} className="qline">
            <span className={'cb' + (q.status === 'done' ? ' done' : '')}
              style={{ cursor: 'pointer' }}
              onClick={() => actions.updateQuestion({ projectId: proj.id, questionId: q.id, status: q.status === 'done' ? 'todo' : 'done' })}>
              {q.status === 'done' && <Icon name="check" size={11} style={{ color: 'var(--on-accent)' }} />}
            </span>
            <span style={{ flex: 1, textDecoration: q.status === 'done' ? 'line-through' : 'none', color: q.status === 'done' ? 'var(--tx-faint)' : 'var(--tx-hi)', fontSize: 13 }}>
              {q.text}
            </span>
            <span className="htag" style={{ cursor: 'pointer' }}>→ Research Q</span>
          </div>
        ))}
        {(proj.researchQuestions||[]).length === 0 && <div className="plan-empty">연결된 연구 질문이 없습니다.</div>}
      </PageDoc>
    );
  }

  function CanvasCard({ sec, items, onAdd, onDel }) {
    const [input, setInput] = React.useState('');
    function submit() { if (!input.trim()) return; onAdd(input.trim()); setInput(''); }
    return (
      <div className="bc">
        <div className="bk">{sec.k}</div>
        <div className="bl">
          {items.map(it => (
            <div key={it.id} className="li">
              <span>{it.text}</span>
              <button className="icon-btn-sm" onClick={() => onDel(it.id)}><Icon name="x" size={10} /></button>
            </div>
          ))}
        </div>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="+ 항목" className="canvas-add-input"
          style={{ display: 'block', marginTop: 6 }}
          onBlur={() => input.trim() && submit()} />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Research Questions
  ══════════════════════════════════════════════════════════ */
  const Q_STATUS_LABEL = { todo: '미착수', wip: '조사중', doing: '조사중', done: '완료' };
  const Q_STATUS_NEXT  = { todo: 'wip', wip: 'done', doing: 'done', done: 'todo' };
  const Q_PRI_NEXT     = { High: 'Med', Med: 'Low', Low: 'High' };

  function RQPage({ proj }) {
    const qs   = proj.researchQuestions || [];
    const done = qs.filter(q => q.status === 'done').length;
    const wip  = qs.filter(q => ['wip','doing'].includes(q.status)).length;
    const [input, setInput] = React.useState('');
    const [pri, setPri] = React.useState('High');

    function add() {
      if (!input.trim()) return;
      actions.addResearchQuestion({ projectId: proj.id, text: input.trim(), priority: pri, category: '기타' });
      setInput('');
    }

    return (
      <PageDoc iconName="target" title="연구 질문 빌더" crumb={(proj.name||'') + ' / Planning Studio / 연구 질문'}>
        <div className="plan-statline">
          <span className="plan-stat"><b>{qs.length}</b> 질문</span>
          <span className="plan-stat"><b style={{ color: 'var(--accent-hi)' }}>{done}</b> 완료</span>
          <span className="plan-stat"><b style={{ color: 'var(--swot-t)' }}>{wip}</b> 조사중</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--tx-faint)' }}>상태·우선순위 칩을 클릭해 변경</span>
        </div>
        <div className="qbuild">
          {qs.map((q, i) => {
            const priClass = { High: 'p1', Med: 'p2', Low: 'p3' }[q.priority] || 'p3';
            const st = Q_STATUS_LABEL[q.status] || '미착수';
            const stCls = { todo: 'todo', wip: 'doing', doing: 'doing', done: 'done' }[q.status] || 'todo';
            return (
              <div key={q.id} className="qb">
                <span className="qbn">Q{i+1}</span>
                <span className={'pri ' + priClass} title="우선순위 변경"
                  onClick={() => actions.updateQuestion({ projectId: proj.id, questionId: q.id, priority: Q_PRI_NEXT[q.priority]||'Med' })}>
                  {q.priority ? q.priority[0] : 'M'}
                </span>
                <div className="qbmain">
                  <div className="qbt">{q.text}</div>
                  {q.category && q.category !== '기타' && <div className="qbm">{q.category}</div>}
                </div>
                <span className={'st-pill ' + stCls}
                  onClick={() => actions.updateQuestion({ projectId: proj.id, questionId: q.id, status: Q_STATUS_NEXT[q.status||'todo'] })}>
                  {st}
                </span>
                <button className="icon-btn-sm" onClick={() => actions.deleteQuestion({ projectId: proj.id, questionId: q.id })}>
                  <Icon name="x" size={11} />
                </button>
              </div>
            );
          })}
        </div>
        {/* Add row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <select className="pf-select" style={{ width: 70 }} value={pri} onChange={e => setPri(e.target.value)}>
            <option value="High">High</option>
            <option value="Med">Med</option>
            <option value="Low">Low</option>
          </select>
          <input className="pf-input" style={{ flex: 1 }} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="+ 연구 질문 추가 (Enter)" />
        </div>
      </PageDoc>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Hypotheses
  ══════════════════════════════════════════════════════════ */
  const H_LABEL = { todo: '미검증', wip: '검증중', accepted: '채택', rejected: '기각' };
  const H_NEXT  = { todo: 'wip', wip: 'accepted', accepted: 'rejected', rejected: 'todo' };
  const H_CLASS = { todo: 'todo', wip: 'doing', accepted: 'adopt', rejected: 'reject' };

  function HypPage({ proj }) {
    const hyp  = proj.hypotheses || [];
    const adopt   = hyp.filter(h => h.status === 'accepted').length;
    const testing = hyp.filter(h => h.status === 'wip').length;
    const [input, setInput] = React.useState('');

    return (
      <PageDoc iconName="flag" title="가설 매니저" crumb={(proj.name||'') + ' / Planning Studio / 가설 관리'}>
        <div className="plan-statline">
          <span className="plan-stat"><b>{hyp.length}</b> 가설</span>
          <span className="plan-stat"><b style={{ color: 'var(--pos)' }}>{adopt}</b> 채택</span>
          <span className="plan-stat"><b style={{ color: 'var(--swot-t)' }}>{testing}</b> 검증중</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--tx-faint)' }}>분석 결과를 연결하고 상태를 검증</span>
        </div>
        <div className="qbuild">
          {hyp.map(h => (
            <div key={h.id} className="qb">
              <span style={{ color: 'var(--tx-faint)', display: 'flex' }}><Icon name="layers" size={16} /></span>
              <div className="qbmain">
                <div className="qbt">{h.text}</div>
                {h.basis && <div className="qbm">{h.basis}</div>}
              </div>
              <span className={'st-pill ' + (H_CLASS[h.status]||'todo')}
                onClick={() => actions.updateHypothesis({ projectId: proj.id, hypId: h.id, status: H_NEXT[h.status||'todo'] })}>
                {H_LABEL[h.status||'todo']}
              </span>
              <button className="icon-btn-sm" onClick={() => actions.deleteHypothesis({ projectId: proj.id, hypId: h.id })}>
                <Icon name="x" size={11} />
              </button>
            </div>
          ))}
        </div>
        <button className="addrow" onClick={() => { const t = prompt('가설 입력:'); if (t) actions.addHypothesis({ projectId: proj.id, text: t }); }}>
          <Icon name="plus" size={15} /> 가설 추가
        </button>
      </PageDoc>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: SWOT — flat row style matching reference
  ══════════════════════════════════════════════════════════ */
  const SWOT_QUADS = [
    { k: 'S', l: '강점 · Strength',    c: 'var(--swot-s)', tx: 'oklch(0.24 0.03 150)', cls: '' },
    { k: 'W', l: '약점 · Weakness',    c: 'var(--swot-w)', tx: '#fff',                  cls: 'sq-W' },
    { k: 'O', l: '기회 · Opportunity', c: 'var(--swot-o)', tx: 'oklch(0.24 0.03 235)', cls: '' },
    { k: 'T', l: '위협 · Threat',      c: 'var(--swot-t)', tx: 'oklch(0.24 0.03 75)',  cls: '' },
  ];

  function SwotPage({ proj }) {
    const swot = proj.swot || {};

    function getItems(k) { return (swot[k]||'') ? (swot[k]||'').split('\n').filter(Boolean) : []; }
    function save(k, arr) { actions.updateProject({ id: proj.id, swot: { ...swot, [k]: arr.join('\n') } }); }
    function addItem(k)   { const t = prompt('항목 추가:'); if (t) save(k, [...getItems(k), t.trim()]); }
    function delItem(k,i) { save(k, getItems(k).filter((_,j) => j !== i)); }

    return (
      <PageDoc iconName="swot" title="SWOT 분석" crumb={(proj.name||'') + ' / Planning Studio / SWOT'}>
        <div className="plan-callout">
          <span className="ci"><Icon name="bolt" size={16} /></span>
          <div>각 사분면에 항목을 추가·편집하세요. 캔버스·인사이트·차트에서 끌어온 근거를 정리하는 공간입니다.</div>
        </div>
        <div className="swotgrid">
          {SWOT_QUADS.map(qd => {
            const items = getItems(qd.k);
            const borderCol = qd.cls === 'sq-W' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
            return (
              <div key={qd.k} className={'swotq ' + qd.cls} style={{ background: qd.c }}>
                <div className="sqh" style={{ color: qd.tx }}>
                  <b>{qd.k}</b> · {qd.l}
                  <span className="sqn" style={{ color: qd.tx }}>{items.length}</span>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="sqi" style={{ color: qd.tx, borderTopColor: borderCol }}>
                    <span style={{ flex: 1 }}>{item}</span>
                    <button className="icon-btn-sm" style={{ color: qd.tx, opacity: 0 }}
                      onClick={() => delItem(qd.k, i)}>
                      ×
                    </button>
                  </div>
                ))}
                <button className="sqadd" style={{ color: qd.tx, borderTopColor: borderCol }}
                  onClick={() => addItem(qd.k)}>
                  <Icon name="plus" size={13} /> 항목 추가
                </button>
              </div>
            );
          })}
        </div>
      </PageDoc>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Insights
  ══════════════════════════════════════════════════════════ */
  function InsightPage({ proj }) {
    const insights = proj.insights || [];
    const [text, setText] = React.useState('');
    const [tag,  setTag]  = React.useState('');

    function add() {
      if (!text.trim()) return;
      actions.updateProject({ id: proj.id, insights: [...insights, { id: 'ins_'+Date.now(), text, tag, star: 3, createdAt: new Date().toISOString().slice(0,10) }] });
      setText(''); setTag('');
    }
    function del(id) { actions.updateProject({ id: proj.id, insights: insights.filter(i => i.id !== id) }); }
    function setStar(id, star) { actions.updateProject({ id: proj.id, insights: insights.map(i => i.id === id ? {...i,star} : i) }); }

    return (
      <PageDoc iconName="bulb" title="인사이트 저장소" crumb={(proj.name||'') + ' / Planning Studio / 인사이트'}>
        <div className="plan-statline">
          <span className="plan-stat"><b>{insights.length}</b> 인사이트</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--tx-faint)' }}>★ 클릭으로 중요도 조정 · Report Builder에서 재사용</span>
        </div>
        {/* add form */}
        <div className="ins-add-form" style={{ marginBottom: 16 }}>
          <textarea className="pf-textarea" style={{ flex: 1, minHeight: 60 }} value={text}
            onChange={e => setText(e.target.value)} placeholder="인사이트를 기록하세요" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 100 }}>
            <input className="pf-input" value={tag} onChange={e => setTag(e.target.value)} placeholder="#태그" />
            <button className="btn primary sm" onClick={add}><Icon name="plus" size={12} /> 저장</button>
          </div>
        </div>
        <div className="inslist">
          {[...insights].reverse().map(ins => (
            <div key={ins.id} className="insrow">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="it">{ins.text}</div>
                <div style={{ marginTop: 7 }}>
                  {ins.tag && <span className="htag">#{ins.tag}</span>}
                  {ins.createdAt && <span style={{ fontSize: 10, color: 'var(--tx-faint)', marginLeft: 10, fontFamily: 'var(--font-mono)' }}>{ins.createdAt}</span>}
                </div>
              </div>
              <div className="starset">
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ color: n <= (ins.star||3) ? 'var(--accent-hi)' : 'var(--tx-faint)' }}
                    onClick={() => setStar(ins.id, n)}>★</span>
                ))}
              </div>
              <button className="icon-btn-sm" style={{ opacity: 1 }} onClick={() => del(ins.id)}><Icon name="x" size={11} /></button>
            </div>
          ))}
        </div>
      </PageDoc>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE: Decision Log
  ══════════════════════════════════════════════════════════ */
  function DecisionPage({ proj }) {
    const decisions = proj.decisions || [];
    const [form, setForm] = React.useState({ title: '', rationale: '', tag: '' });

    function add() {
      if (!form.title.trim()) return;
      actions.updateProject({ id: proj.id, decisions: [...decisions, { id: 'dec_'+Date.now(), ...form, createdAt: new Date().toISOString().slice(0,10), status: 'active' }] });
      setForm({ title: '', rationale: '', tag: '' });
    }
    function del(id) { actions.updateProject({ id: proj.id, decisions: decisions.filter(d => d.id !== id) }); }

    return (
      <PageDoc iconName="doc" title="의사결정 로그" crumb={(proj.name||'') + ' / Planning Studio / 의사결정 로그'}>
        <div className="plan-statline">
          <span className="plan-stat"><b>{decisions.length}</b> 건</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--tx-faint)' }}>날짜·작성자·결정·근거 — 회고와 보고서에 활용</span>
        </div>
        <div className="declist">
          {[...decisions].reverse().map(d => (
            <div key={d.id} className="decard">
              <div className="dechead">
                <span className="decdate">{d.createdAt}</span>
                {d.tag && <span className="htag">#{d.tag}</span>}
                <span style={{ flex: 1 }} />
                <button className="icon-btn-sm" style={{ opacity: 1 }} onClick={() => del(d.id)}><Icon name="x" size={11} /></button>
              </div>
              <div className="decwhat">{d.title}</div>
              {d.rationale && (
                <div className="decwhy">
                  <span className="decwl">근거</span>{d.rationale}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="dec-add">
          <input className="pf-input" value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder="의사결정 내용 (예: 분양가 평당 2,100만원으로 제안)" />
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="pf-input" style={{ flex: 1 }} value={form.rationale}
              onChange={e => setForm({...form, rationale: e.target.value})} placeholder="근거" />
            <input className="pf-input" style={{ width: 90 }} value={form.tag}
              onChange={e => setForm({...form, tag: e.target.value})} placeholder="#태그" />
            <button className="btn primary sm" onClick={add}><Icon name="plus" size={12} /> 기록</button>
          </div>
        </div>
      </PageDoc>
    );
  }

  /* ── Stubs ───────────────────────────────────────────────── */
  function StubPage({ iconName, title, desc, proj }) {
    return (
      <PageDoc iconName={iconName} title={title} crumb={(proj&&proj.name?proj.name:'') + ' / Planning Studio / ' + title}>
        <div className="stubbox"><Icon name={iconName} size={32} style={{ color: 'var(--tx-faint)' }} /><div>{desc}</div></div>
      </PageDoc>
    );
  }

  /* ── Page router ─────────────────────────────────────────── */
  const PAGES = {
    dashboard: (p, onPage) => <DashboardPage proj={p} onPage={onPage} />,
    brief:     (p)         => <BriefPage     proj={p} />,
    canvas:    (p)         => <CanvasPage    proj={p} />,
    rq:        (p)         => <RQPage        proj={p} />,
    hyp:       (p)         => <HypPage       proj={p} />,
    swot:      (p)         => <SwotPage      proj={p} />,
    insight:   (p)         => <InsightPage   proj={p} />,
    decision:  (p)         => <DecisionPage  proj={p} />,
    mindmap:   (p)         => <StubPage iconName="node"   title="Mind Map"         desc="Phase 3에서 구현 예정" proj={p} />,
    refs:      (p)         => <StubPage iconName="search" title="출처 · 레퍼런스"  desc="출처 관리 기능 추가 예정" proj={p} />,
    report:    (p)         => <StubPage iconName="report" title="Report Builder"   desc="Phase 3에서 구현 예정" proj={p} />,
  };

  /* ── Planning Studio root ────────────────────────────────── */
  function PlanningMode() {
    const activeId = useStore(s => s.activeProjectId);
    const projects = useStore(s => s.projects);
    const planPage = useStore(s => s.planPage || 'dashboard');
    const proj = projects.find(p => p.id === activeId);

    if (!proj) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, color:'var(--tx-mid)' }}>
          <Icon name="project" size={40} style={{ color:'var(--tx-faint)' }} />
          <div style={{ fontSize:15, fontWeight:600 }}>활성 프로젝트가 없습니다</div>
          <button className="btn primary" onClick={() => actions.setMode('project')}>
            <Icon name="plus" size={13} /> 프로젝트 생성
          </button>
        </div>
      );
    }

    const setPage = p => actions.setPlanPage(p);
    const PageComp = PAGES[planPage] || PAGES.dashboard;

    return (
      <div className="plan-root">
        <PlanNav proj={proj} page={planPage} onPage={setPage} />
        <div className="plan-center">
          <div className="plan-page-scroll">
            {PageComp(proj, setPage)}
          </div>
        </div>
        <InsightPanel proj={proj} onPage={setPage} />
      </div>
    );
  }

  window.PlanningMode = PlanningMode;
})();
