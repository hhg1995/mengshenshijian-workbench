/* ==== 功能：物料跟踪 START ====
   每条物料：需求量 / 已到料 / 已发货。
   到料和发货用 +/- 按钮，手机上好点；顶部自动汇总。 */
const Material = {
  render(){
    this.renderSummary();
    this.renderList();
  },

  renderSummary(){
    const el = document.getElementById('matSummary');
    if (!el) return;
    const list = Store.list('mat');
    const sum = k => list.reduce((s,x) => s + (x[k]||0), 0);
    const need = sum('need'), arrived = sum('arrived'), shipped = sum('shipped');
    const pct = need ? Math.round(arrived / need * 100) : 0;
    el.innerHTML = `
      <div class="hero num">${pct}<span class="unit">% 已到料</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="stat"><span>需求 ${need}</span><span>已到料 ${arrived}</span><span>已发货 ${shipped}</span></div>`;
  },

  renderList(){
    const el = document.getElementById('matList');
    if (!el) return;
    const list = Store.list('mat', (a,b) => (b.createdAt||0) - (a.createdAt||0));
    el.innerHTML = list.length ? list.map(x => {
      const pct = x.need ? Math.min(100, Math.round((x.arrived||0) / x.need * 100)) : 0;
      return `
      <div class="item" style="flex-wrap:wrap">
        <span class="grow"><b>${Util.esc(x.name)}</b>
          <span class="hint" style="margin:0 0 0 8px;display:inline">需求 ${x.need||0} · 到料 ${x.arrived||0} · 发货 ${x.shipped||0}</span>
        </span>
        <button class="btn ghost" style="padding:6px 12px;font-size:13px" onclick="Material.bump('${x.id}','arrived',1)">到料 +</button>
        <button class="btn ghost" style="padding:6px 12px;font-size:13px" onclick="Material.bump('${x.id}','shipped',1)">发货 +</button>
        <button class="del" onclick="Material.del('${x.id}')">✕</button>
        <div style="flex:1 0 100%"><div class="bar" style="margin-bottom:0"><i style="width:${pct}%"></i></div></div>
      </div>`;
    }).join('') : '<div class="empty">还没有物料，先添加一种</div>';
  },

  add(){
    const n = document.getElementById('matName');
    const q = document.getElementById('matNeed');
    const name = n.value.trim();
    const need = parseInt(q.value, 10);
    if (!name) return UI.toast('填一下物料名称');
    Store.upsert('mat', { name, need: need > 0 ? need : 0, arrived: 0, shipped: 0, createdAt: Date.now() });
    n.value = ''; q.value = '';
    this.render();
  },

  bump(id, field, n){
    const it = Store.list('mat').find(x => x.id === id);
    if (!it) return;
    it[field] = Math.max(0, (it[field]||0) + n);
    Store.upsert('mat', it);
    this.render();
  },

  del(id){
    if (!confirm('删除这种物料？')) return;
    Store.softDelete('mat', id);
    this.render();
  }
};
/* ==== 功能：物料跟踪 END ==== */
