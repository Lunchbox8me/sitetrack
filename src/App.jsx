import React, { useState, useEffect, useRef } from 'react'

// ── Storage (localStorage) ────────────────────────────────────────────────────
const db = {
  get(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
  }
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED = [
  {
    id: 'ITEM-001', name: 'Milwaukee M18 Drill/Driver', category: 'Power Tools',
    description: 'M18 FUEL 1/2" Brushless Drill/Driver. POWERSTATE motor, 60Nm torque, 2-speed gearbox.',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format',
    reorderUrl: 'https://www.milwaukeetool.com/Products/Power-Tools/Drilling/Drill-Drivers',
    qrCode: 'ITEM-001', quantity: 3, unit: 'units', sku: '2803-20',
    notes: 'Keep charged between jobs. Stored in Tool Crib A.'
  },
  {
    id: 'ITEM-002', name: '3/4" PEX Tubing 300ft', category: 'Plumbing',
    description: 'Viega PureFlow PEX-B tubing, 3/4" diameter. For hot and cold water distribution.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format',
    reorderUrl: 'https://www.supplyhouse.com',
    qrCode: 'ITEM-002', quantity: 2, unit: 'coils', sku: 'VPEX-75-300',
    notes: 'Store in shade. Check for kinks before use.'
  },
  {
    id: 'ITEM-003', name: '2×4×8 Framing Studs', category: 'Lumber',
    description: 'Kiln-dried SPF #2 framing studs, 2×4×96". Graded for structural use.',
    imageUrl: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&auto=format',
    reorderUrl: 'https://www.homedepot.com/b/Lumber-Composites-Dimensional-Lumber/N-5yc1vZbqmf',
    qrCode: 'ITEM-003', quantity: 48, unit: 'pieces', sku: '2X4-8-KD',
    notes: 'Keep off ground and covered.'
  }
]

const CATS = ['All','Power Tools','Hand Tools','Plumbing','Electrical','Lumber','Fasteners','Safety','Concrete','HVAC','Other']

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const ICONS = {
  back:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  plus:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  scan:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M9 9h6M9 12h6M9 15h4"/></svg>,
  link:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  box:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  qr:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>,
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  list:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  download:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  share:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}
const Ic = ({ n, s = 18 }) => (
  <span style={{ width: s, height: s, display: 'inline-flex', flexShrink: 0 }}>
    {React.cloneElement(ICONS[n], { width: s, height: s })}
  </span>
)

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&family=Barlow:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0f14;--surf:#171a22;--card:#1e2130;--card2:#252840;
  --bdr:#2a2f42;--acc:#f59e0b;--accG:rgba(245,158,11,.15);
  --dan:#ef4444;--ok:#10b981;
  --txt:#e2e8f0;--mut:#94a3b8;--dim:#475569;
  --mono:'IBM Plex Mono',monospace;
  --sans:'Barlow',sans-serif;
  --disp:'Oswald',sans-serif;
  --safe-top:env(safe-area-inset-top,0px);
  --safe-bot:env(safe-area-inset-bottom,0px);
}
html,body,#root{height:100%}
body{background:var(--bg);color:var(--txt);font-family:var(--sans);overflow-x:hidden;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:2px}
.app{max-width:480px;margin:0 auto;min-height:100dvh;background:var(--bg);position:relative;display:flex;flex-direction:column}

/* HEADER */
.hdr{background:var(--surf);border-bottom:2px solid var(--acc);padding:0 16px;padding-top:var(--safe-top);height:calc(54px + var(--safe-top));display:flex;align-items:flex-end;padding-bottom:0;justify-content:space-between;position:sticky;top:0;z-index:100}
.hdr-inner{display:flex;align-items:center;justify-content:space-between;width:100%;height:54px}
.logo{font-family:var(--disp);font-size:22px;font-weight:700;letter-spacing:3px;text-transform:uppercase;display:flex;align-items:center;gap:8px}
.logo em{color:var(--acc);font-style:normal}
.logo-sub{font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:1px}

/* BOTTOM NAV */
.bnav{background:var(--surf);border-top:1px solid var(--bdr);display:flex;height:calc(58px + var(--safe-bot));padding-bottom:var(--safe-bot);position:sticky;bottom:0;z-index:100;flex-shrink:0}
.ntab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:none;color:var(--dim);cursor:pointer;font-family:var(--sans);font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;transition:color .15s}
.ntab.on{color:var(--acc)}
.ntab:hover:not(.on){color:var(--mut)}
.scan-hub{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:none;border:none;cursor:pointer;padding-bottom:0}
.scan-orb{width:50px;height:50px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center;color:var(--bg);margin-top:-18px;box-shadow:0 0 24px rgba(245,158,11,.45);transition:transform .15s,box-shadow .15s}
.scan-orb:hover{transform:scale(1.07);box-shadow:0 0 32px rgba(245,158,11,.65)}
.scan-lbl{font-family:var(--sans);font-size:10px;font-weight:700;color:var(--acc);text-transform:uppercase;letter-spacing:.8px}

/* SCROLLABLE CONTENT */
.scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}

/* PAGE PADDING */
.pg{padding:16px}

/* SEARCH */
.srch{position:relative;margin-bottom:10px}
.srch-input{width:100%;background:var(--card);border:1px solid var(--bdr);border-radius:6px;padding:10px 12px 10px 38px;color:var(--txt);font-family:var(--sans);font-size:14px;outline:none;transition:border-color .15s}
.srch-input:focus{border-color:var(--acc)}
.srch-input::placeholder{color:var(--dim)}
.srch-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--dim)}

/* CHIPS */
.chips{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chip{flex-shrink:0;padding:4px 11px;border-radius:4px;border:1px solid var(--bdr);background:var(--card);color:var(--mut);font-family:var(--sans);font-size:11px;font-weight:600;cursor:pointer;text-transform:uppercase;letter-spacing:.5px;transition:all .15s;white-space:nowrap}
.chip.on{background:var(--acc);color:var(--bg);border-color:var(--acc)}

/* GRID / LIST */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.icard{background:var(--card);border:1px solid var(--bdr);border-radius:8px;overflow:hidden;cursor:pointer;transition:all .15s}
.icard:active{transform:scale(.98)}
.icard-img{width:100%;height:96px;object-fit:cover;background:var(--surf);display:block}
.icard-ph{width:100%;height:96px;background:var(--surf);display:flex;align-items:center;justify-content:center;color:var(--bdr)}
.icard-body{padding:9px 10px 10px}
.icard-name{font-family:var(--disp);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.icard-cat{font-size:10px;color:var(--acc);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:5px}
.icard-qty{font-family:var(--mono);font-size:11px;color:var(--mut)}
.icard-qty b{color:var(--txt)}

/* SECTION HEADER */
.sec{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.sec-ttl{font-family:var(--disp);font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:2px}
.badge{background:var(--acc);color:var(--bg);font-family:var(--mono);font-size:11px;padding:2px 8px;border-radius:4px}

/* FAB */
.fab{position:sticky;bottom:calc(70px + var(--safe-bot));align-self:flex-end;margin-right:16px;width:46px;height:46px;border-radius:50%;background:var(--acc);color:var(--bg);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(245,158,11,.4);transition:all .15s;z-index:90;flex-shrink:0}
.fab:hover{transform:scale(1.1)}

/* DETAIL */
.dhdr{padding:12px 16px;background:var(--surf);border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:10px}
.bbtn{background:none;border:1px solid var(--bdr);color:var(--txt);cursor:pointer;padding:5px 9px;border-radius:6px;display:flex;align-items:center;transition:border-color .15s}
.bbtn:hover{border-color:var(--acc)}
.dhdr-ttl{font-family:var(--disp);font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:1px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dimg{width:100%;max-height:220px;object-fit:cover;display:block}
.dph{width:100%;height:160px;background:var(--surf);display:flex;align-items:center;justify-content:center;color:var(--bdr)}
.dbody{padding:16px}
.dcat{display:inline-flex;align-items:center;font-size:11px;color:var(--acc);text-transform:uppercase;letter-spacing:1.5px;font-weight:700;background:var(--accG);padding:3px 10px;border-radius:4px;border:1px solid rgba(245,158,11,.3);margin-bottom:12px}
.ddesc{font-size:13px;color:var(--mut);line-height:1.65;margin-bottom:14px}
.dgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
.dfield{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:9px 11px}
.dlbl{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:3px}
.dval{font-family:var(--mono);font-size:13px;color:var(--txt);font-weight:500}
.qr-row{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:11px;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.qr-box{width:46px;height:46px;background:var(--card);border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--acc);flex-shrink:0}
.qr-val{font-family:var(--mono);font-size:16px;color:var(--acc);font-weight:500;letter-spacing:2px}
.reorder{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;background:var(--acc);color:var(--bg);border:none;border-radius:8px;font-family:var(--disp);font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:2px;cursor:pointer;text-decoration:none;margin-bottom:10px;transition:opacity .15s}
.reorder:hover{opacity:.9}
.acts{display:flex;gap:9px;margin-bottom:16px}
.abt{flex:1;padding:11px;background:var(--card);color:var(--txt);border:1px solid var(--bdr);border-radius:8px;font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:border-color .15s}
.abt:hover{border-color:var(--acc)}
.abt.d{color:var(--dan)}.abt.d:hover{border-color:var(--dan)}
.nbox{background:var(--surf);border:1px solid var(--bdr);border-radius:6px;padding:11px;margin-bottom:14px}
.ntxt{font-size:13px;color:var(--mut);line-height:1.55}

/* SCANNER */
.scnr-wrap{flex:1;display:flex;flex-direction:column;background:#000;position:relative;overflow:hidden}
.svid{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.sovl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.sfrm{width:200px;height:200px;position:relative}
.sc{position:absolute;width:28px;height:28px;border-color:var(--acc);border-style:solid}
.sc.tl{top:0;left:0;border-width:3px 0 0 3px}
.sc.tr{top:0;right:0;border-width:3px 3px 0 0}
.sc.bl{bottom:0;left:0;border-width:0 0 3px 3px}
.sc.br{bottom:0;right:0;border-width:0 3px 3px 0}
.sln{position:absolute;left:8%;right:8%;height:2px;background:var(--acc);animation:sl 2s ease-in-out infinite;box-shadow:0 0 10px rgba(245,158,11,.8)}
@keyframes sl{0%,100%{top:8%}50%{top:92%}}
.slbl{margin-top:20px;font-family:var(--disp);font-size:13px;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,.65)}
.scan-fb{position:absolute;bottom:100px;left:50%;transform:translateX(-50%);padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap;animation:fbIn .2s ease}
.scan-fb.err{background:rgba(239,68,68,.92);color:#fff}
.scan-fb.ok{background:rgba(16,185,129,.92);color:#fff}
@keyframes fbIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
.smanual{position:absolute;bottom:0;left:0;right:0;display:flex;gap:8px;padding:12px 16px;padding-bottom:calc(12px + var(--safe-bot));background:rgba(0,0,0,.75);backdrop-filter:blur(8px)}
.sinput{flex:1;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:10px 12px;color:#fff;font-family:var(--mono);font-size:13px;outline:none;transition:border-color .15s}
.sinput:focus{border-color:var(--acc)}
.sinput::placeholder{color:rgba(255,255,255,.35)}
.sbtn{padding:10px 14px;background:var(--acc);color:var(--bg);border:none;border-radius:6px;font-family:var(--disp);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;white-space:nowrap}
.cam-err{text-align:center;padding:40px 24px;color:var(--mut);position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cam-err svg{opacity:.4;margin-bottom:14px}
.cam-err h3{font-family:var(--disp);font-size:18px;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;color:var(--mut)}
.cam-err p{font-size:13px;color:var(--dim);line-height:1.6}

/* FORM */
.fwrap{padding:16px}
.fttl{font-family:var(--disp);font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:18px}
.ff{margin-bottom:13px}
.flbl{display:block;font-size:10px;font-weight:700;color:var(--dim);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:5px}
.finp,.fsel,.ftxt{width:100%;background:var(--card);border:1px solid var(--bdr);border-radius:6px;padding:9px 12px;color:var(--txt);font-family:var(--sans);font-size:14px;outline:none;transition:border-color .15s;-webkit-appearance:none}
.finp:focus,.fsel:focus,.ftxt:focus{border-color:var(--acc)}
.ftxt{min-height:76px;resize:vertical;line-height:1.5}
.fhnt{font-size:11px;color:var(--dim);margin-top:3px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fsub{width:100%;padding:13px;background:var(--acc);color:var(--bg);border:none;border-radius:8px;font-family:var(--disp);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:2px;cursor:pointer;margin-top:6px;transition:opacity .15s}
.fsub:hover{opacity:.9}
.fcancel{width:100%;padding:10px;background:transparent;color:var(--mut);border:1px solid var(--bdr);border-radius:8px;font-family:var(--sans);font-size:13px;cursor:pointer;margin-top:8px;transition:border-color .15s}
.fcancel:hover{border-color:var(--acc)}

/* TOAST */
.toast{position:fixed;bottom:calc(70px + var(--safe-bot));left:50%;transform:translateX(-50%);padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:200;pointer-events:none;white-space:nowrap;animation:fbIn .2s ease}
.toast.ok{background:var(--ok);color:#fff}
.toast.err{background:var(--dan);color:#fff}

/* INSTALL BANNER */
.install-banner{margin:12px 16px 0;background:var(--surf);border:1px solid var(--bdr);border-radius:8px;padding:12px 14px;display:flex;align-items:center;gap:12px}
.install-txt{flex:1;font-size:12px;color:var(--mut);line-height:1.4}
.install-txt b{color:var(--txt);display:block;font-size:13px;margin-bottom:2px}
.install-btn{padding:7px 13px;background:var(--acc);color:var(--bg);border:none;border-radius:6px;font-family:var(--disp);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer;flex-shrink:0}
.install-x{background:none;border:none;color:var(--dim);cursor:pointer;padding:2px;display:flex}

/* EMPTY */
.empty{text-align:center;padding:56px 20px;color:var(--dim)}
.empty-ic{margin-bottom:12px;opacity:.4}
.empty-ttl{font-family:var(--disp);font-size:17px;text-transform:uppercase;letter-spacing:2px;color:var(--mut);margin-bottom:6px}
.empty-sub{font-size:13px;line-height:1.5}
`

// ── QR Scanner ────────────────────────────────────────────────────────────────
function Scanner({ onScan }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const doneRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [camErr, setCamErr] = useState(null)
  const [fb, setFb] = useState(null)
  const [manual, setManual] = useState('')

  useEffect(() => {
    let mounted = true
    doneRef.current = false

    const loadJsQR = () => new Promise((res, rej) => {
      if (window.jsQR) return res()
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'
      s.onload = res; s.onerror = rej
      document.head.appendChild(s)
    })

    const tick = () => {
      if (doneRef.current || !mounted) return
      const v = videoRef.current, c = canvasRef.current
      if (!v || !c || !v.videoWidth) { rafRef.current = requestAnimationFrame(tick); return }
      c.width = v.videoWidth; c.height = v.videoHeight
      const ctx = c.getContext('2d')
      ctx.drawImage(v, 0, 0)
      const img = ctx.getImageData(0, 0, c.width, c.height)
      const code = window.jsQR(img.data, img.width, img.height)
      if (code?.data) {
        doneRef.current = true
        onScan(code.data)
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    const init = async () => {
      try {
        await loadJsQR()
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          if (mounted) { setReady(true); tick() }
        }
      } catch (e) {
        if (mounted) setCamErr(e.name === 'NotAllowedError' ? 'Camera permission denied. Please allow camera access in your browser settings.' : 'Camera unavailable on this device or browser.')
      }
    }

    init()
    return () => {
      mounted = false
      doneRef.current = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [onScan])

  const handleManual = () => {
    const v = manual.trim()
    if (!v) return
    onScan(v)
    setManual('')
  }

  return (
    <div className="scnr-wrap">
      <video ref={videoRef} className="svid" muted playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {camErr && (
        <div className="cam-err">
          <Ic n="warning" s={48} />
          <h3>Camera Unavailable</h3>
          <p>{camErr}<br /><br />Use manual entry below.</p>
        </div>
      )}

      {!camErr && (
        <div className="sovl">
          <div className="sfrm">
            <div className="sc tl" /><div className="sc tr" />
            <div className="sc bl" /><div className="sc br" />
            {ready && <div className="sln" />}
          </div>
          <div className="slbl">{ready ? 'Align QR Code' : 'Starting Camera…'}</div>
        </div>
      )}

      {fb && <div className={`scan-fb ${fb.t}`}>{fb.m}</div>}

      <div className="smanual">
        <input
          className="sinput"
          value={manual}
          onChange={e => setManual(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleManual()}
          placeholder="Or type Item ID manually…"
        />
        <button className="sbtn" onClick={handleManual}>GO</button>
      </div>
    </div>
  )
}

// ── Detail View ───────────────────────────────────────────────────────────────
function DetailView({ item, onEdit, onDelete, onBack }) {
  const [confirmDel, setConfirmDel] = useState(false)
  const [imgErr, setImgErr] = useState(false)

  return (
    <div>
      <div className="dhdr">
        <button className="bbtn" onClick={onBack}><Ic n="back" s={16} /></button>
        <div className="dhdr-ttl">{item.name}</div>
        <button className="abt" style={{ flex: 'none', padding: '5px 9px' }} onClick={onEdit}><Ic n="edit" s={15} /></button>
      </div>

      <div className="scroll">
        {item.imageUrl && !imgErr
          ? <img className="dimg" src={item.imageUrl} alt={item.name} onError={() => setImgErr(true)} />
          : <div className="dph"><Ic n="box" s={48} /></div>
        }

        <div className="dbody">
          <div className="dcat">{item.category}</div>
          {item.description && <p className="ddesc">{item.description}</p>}

          <div className="dgrid">
            <div className="dfield">
              <div className="dlbl">Quantity</div>
              <div className="dval">{item.quantity} <span style={{ color: 'var(--mut)', fontSize: 11 }}>{item.unit}</span></div>
            </div>
            {item.sku && (
              <div className="dfield">
                <div className="dlbl">SKU / Part #</div>
                <div className="dval">{item.sku}</div>
              </div>
            )}
          </div>

          <div className="qr-row">
            <div className="qr-box"><Ic n="qr" s={24} /></div>
            <div>
              <div className="dlbl" style={{ marginBottom: 4 }}>QR Code ID</div>
              <div className="qr-val">{item.qrCode || item.id}</div>
            </div>
          </div>

          {item.notes && (
            <div className="nbox">
              <div className="dlbl" style={{ marginBottom: 6 }}>Field Notes</div>
              <div className="ntxt">{item.notes}</div>
            </div>
          )}

          {item.reorderUrl && (
            <a className="reorder" href={item.reorderUrl} target="_blank" rel="noopener noreferrer">
              <Ic n="link" s={18} /> Reorder Now
            </a>
          )}

          <div className="acts">
            <button className="abt" onClick={onEdit}><Ic n="edit" s={15} /> Edit</button>
            {confirmDel
              ? <button className="abt d" onClick={onDelete}><Ic n="trash" s={15} /> Confirm Delete</button>
              : <button className="abt d" onClick={() => setConfirmDel(true)}><Ic n="trash" s={15} /> Delete</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Item Form ─────────────────────────────────────────────────────────────────
function ItemForm({ item, onSave, onCancel }) {
  const blank = { name: '', category: 'Power Tools', qrCode: '', sku: '', quantity: 1, unit: 'units', description: '', imageUrl: '', reorderUrl: '', notes: '' }
  const [form, setForm] = useState(item ? { ...item } : blank)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('Item name is required.')
    if (!form.qrCode.trim()) return alert('QR Code ID is required — this is what gets encoded in your QR label.')
    onSave({ ...form, id: form.id || `ITEM-${Date.now()}`, quantity: Number(form.quantity) || 0 })
  }

  return (
    <div className="scroll">
      <div className="fwrap">
        <div className="fttl">{item ? 'Edit Item' : 'Add New Item'}</div>

        <div className="ff">
          <label className="flbl">Item Name *</label>
          <input className="finp" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Milwaukee M18 Drill" />
        </div>

        <div className="frow">
          <div className="ff">
            <label className="flbl">Category</label>
            <select className="fsel" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="ff">
            <label className="flbl">QR Code ID *</label>
            <input className="finp" value={form.qrCode} onChange={e => set('qrCode', e.target.value)} placeholder="e.g. DRILL-001" />
            <div className="fhnt">Encode this text in your QR label</div>
          </div>
        </div>

        <div className="frow">
          <div className="ff">
            <label className="flbl">Quantity</label>
            <input className="finp" type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
          </div>
          <div className="ff">
            <label className="flbl">Unit</label>
            <input className="finp" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="units, lbs, ft…" />
          </div>
        </div>

        <div className="ff">
          <label className="flbl">SKU / Part Number</label>
          <input className="finp" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="Manufacturer part #" />
        </div>

        <div className="ff">
          <label className="flbl">Description</label>
          <textarea className="ftxt" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Specs, dimensions, usage notes…" />
        </div>

        <div className="ff">
          <label className="flbl">Image URL</label>
          <input className="finp" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://…" />
          <div className="fhnt">Paste a link to a product photo</div>
        </div>

        <div className="ff">
          <label className="flbl">Reorder URL</label>
          <input className="finp" value={form.reorderUrl} onChange={e => set('reorderUrl', e.target.value)} placeholder="https://supplier.com/product" />
        </div>

        <div className="ff">
          <label className="flbl">Field Notes</label>
          <textarea className="ftxt" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Storage location, usage tips, job site info…" style={{ minHeight: 60 }} />
        </div>

        <button className="fsub" onClick={handleSubmit}>{item ? 'Save Changes' : 'Add to Inventory'}</button>
        <button className="fcancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ items, search, setSearch, cat, setCat, onSelect, onAdd }) {
  const [gridView, setGridView] = useState(true)

  return (
    <>
      <div className="scroll">
        <div className="pg">
          <div className="sec">
            <div className="sec-ttl">Inventory</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge">{items.length}</span>
              <button
                onClick={() => setGridView(g => !g)}
                style={{ background: 'none', border: '1px solid var(--bdr)', borderRadius: 4, padding: '4px 7px', color: 'var(--mut)', cursor: 'pointer', display: 'flex' }}
              >
                <Ic n={gridView ? 'list' : 'grid'} s={15} />
              </button>
            </div>
          </div>

          <div className="srch">
            <span className="srch-ico"><Ic n="search" s={16} /></span>
            <input className="srch-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, SKU, QR code…" />
          </div>

          <div className="chips">
            {CATS.map(c => (
              <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="empty">
              <div className="empty-ic"><Ic n="box" s={48} /></div>
              <div className="empty-ttl">No Items Found</div>
              <div className="empty-sub">Add items to your inventory<br />or adjust your search filters.</div>
            </div>
          ) : gridView ? (
            <div className="grid">
              {items.map(item => (
                <div key={item.id} className="icard" onClick={() => onSelect(item)}>
                  <ItemThumb item={item} />
                  <div className="icard-body">
                    <div className="icard-name">{item.name}</div>
                    <div className="icard-cat">{item.category}</div>
                    <div className="icard-qty"><b>{item.quantity}</b> {item.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => (
                <div key={item.id} className="icard" style={{ display: 'flex', flexDirection: 'row' }} onClick={() => onSelect(item)}>
                  <ItemThumbRow item={item} />
                  <div className="icard-body" style={{ flex: 1 }}>
                    <div className="icard-name">{item.name}</div>
                    <div className="icard-cat">{item.category}</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="icard-qty"><b>{item.quantity}</b> {item.unit}</div>
                      {item.sku && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dim)' }}>{item.sku}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="fab" onClick={onAdd} title="Add Item"><Ic n="plus" s={20} /></button>
    </>
  )
}

function ItemThumb({ item }) {
  const [err, setErr] = useState(false)
  if (item.imageUrl && !err) return <img className="icard-img" src={item.imageUrl} alt={item.name} onError={() => setErr(true)} />
  return <div className="icard-ph"><Ic n="box" s={32} /></div>
}
function ItemThumbRow({ item }) {
  const [err, setErr] = useState(false)
  const style = { width: 72, height: 72, flexShrink: 0 }
  if (item.imageUrl && !err) return <img src={item.imageUrl} alt={item.name} style={{ ...style, objectFit: 'cover' }} onError={() => setErr(true)} />
  return <div style={{ ...style, background: 'var(--surf)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bdr)' }}><Ic n="box" s={24} /></div>
}

// ── Install Banner ────────────────────────────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = e => { e.preventDefault(); setPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null
  return (
    <div className="install-banner">
      <div style={{ color: 'var(--acc)', flexShrink: 0 }}><Ic n="download" s={20} /></div>
      <div className="install-txt">
        <b>Install SiteTrack</b>
        Add to your home screen for offline access
      </div>
      <button className="install-btn" onClick={async () => {
        if (prompt) { prompt.prompt(); const { outcome } = await prompt.userChoice; if (outcome === 'accepted') setShow(false) }
      }}>Install</button>
      <button className="install-x" onClick={() => setShow(false)}><Ic n="back" s={14} /></button>
    </div>
  )
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('dash')   // dash | scan | detail | form
  const [items, setItems] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [toast, setToast] = useState(null)
  const scanCbRef = useRef(null)

  // Load from localStorage
  useEffect(() => {
    const stored = db.get('inv:items')
    setItems(stored?.length ? stored : SEED)
    if (!stored?.length) db.set('inv:items', SEED)
  }, [])

  const save = (updated) => { setItems(updated); db.set('inv:items', updated) }
  const pop = (msg, t = 'ok') => { setToast({ msg, t }); setTimeout(() => setToast(null), 3000) }

  const handleScan = (code) => {
    const found = items.find(i => i.qrCode === code || i.id === code)
    if (found) { setSelected(found); setView('detail') }
    else pop(`No item found: "${code}"`, 'err')
  }

  // Stable ref so Scanner's useEffect doesn't re-run
  useEffect(() => { scanCbRef.current = handleScan }, [items])
  const stableScan = useRef((...args) => scanCbRef.current(...args)).current

  const onSave = (item) => {
    const updated = editing
      ? items.map(i => i.id === item.id ? item : i)
      : [...items, item]
    save(updated)
    pop(editing ? 'Item updated!' : 'Item added to inventory!')
    setEditing(null)
    setView('dash')
  }

  const onDelete = (id) => {
    save(items.filter(i => i.id !== id))
    pop('Item deleted.', 'err')
    setSelected(null)
    setView('dash')
  }

  const goAdd = () => { setEditing(null); setView('form') }
  const goBack = () => { setView('dash'); setSelected(null); setEditing(null) }

  if (!items) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', fontFamily: 'var(--mono)', color: 'var(--dim)', letterSpacing: 3, fontSize: 12 }}>LOADING…</div>

  const filtered = items.filter(i => {
    const q = search.toLowerCase()
    return (!q || i.name.toLowerCase().includes(q) || (i.qrCode || '').toLowerCase().includes(q) || (i.sku || '').toLowerCase().includes(q))
      && (cat === 'All' || i.category === cat)
  })

  const isNav = view === 'dash' || view === 'scan'

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-inner">
            {view === 'detail' || view === 'form' ? (
              <>
                <button className="bbtn" onClick={goBack}><Ic n="back" s={16} /></button>
                <div style={{ fontFamily: 'var(--disp)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                  {view === 'detail' ? 'Item Detail' : editing ? 'Edit Item' : 'New Item'}
                </div>
                <div style={{ width: 36 }} />
              </>
            ) : (
              <>
                <div className="logo"><Ic n="box" s={18} /> SITE<em>TRACK</em></div>
                <div className="logo-sub">{items.length} ITEMS</div>
              </>
            )}
          </div>
        </header>

        {/* INSTALL BANNER (dash only) */}
        {view === 'dash' && <InstallBanner />}

        {/* VIEWS */}
        {view === 'dash' && (
          <Dashboard
            items={filtered} search={search} setSearch={setSearch}
            cat={cat} setCat={setCat}
            onSelect={i => { setSelected(i); setView('detail') }}
            onAdd={goAdd}
          />
        )}
        {view === 'scan' && <Scanner onScan={stableScan} />}
        {view === 'detail' && selected && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <DetailView
              item={selected}
              onEdit={() => { setEditing(selected); setView('form') }}
              onDelete={() => onDelete(selected.id)}
              onBack={goBack}
            />
          </div>
        )}
        {view === 'form' && (
          <ItemForm item={editing} onSave={onSave} onCancel={goBack} />
        )}

        {/* BOTTOM NAV */}
        {isNav && (
          <nav className="bnav">
            <button className={`ntab ${view === 'dash' ? 'on' : ''}`} onClick={() => setView('dash')}>
              <Ic n="box" s={20} /> Inventory
            </button>
            <button className="scan-hub" onClick={() => setView('scan')}>
              <div className="scan-orb"><Ic n="scan" s={22} /></div>
              <span className="scan-lbl">Scan QR</span>
            </button>
            <button className="ntab" onClick={goAdd}>
              <Ic n="plus" s={20} /> Add Item
            </button>
          </nav>
        )}

        {/* TOAST */}
        {toast && <div className={`toast ${toast.t}`}>{toast.msg}</div>}
      </div>
    </>
  )
}
