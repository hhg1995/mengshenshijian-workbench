/* ==== 功能：记账本 START ====
   收/支切换 + 分类药丸 + 金额。
   顶部本月汇总：收入、支出、结余；下面是分类占比。 */
const Money = {
  OUT: ['餐饮', '交通', '购物', '居住', '物料', '办公', '其他'],
  IN:  ['工资', '报销', '理财', '其他'],
  type: 'out',
  cat: '餐饮',

  render(){
    this.renderType();
    this.renderCats();
    this.renderSummary();
    this.renderList();
  },

  renderType(){
    const el = document.getElementById('moneyType');
    if (!el) return;
    el.innerHTML = `
      <span class="chip ${this.type==='out'?'on':''}" onclick="Money.setType('out')">支出</span>
      <span class="chip ${this.type==='in'?'on':''}" onclick="Money.setType('in')">收入</span>`;
  },

  setType(t){ this.type = t; this.cat = t==='out' ? this.OUT[0] : this.IN[0]; this.render(); },

  renderCats(){
    const el = document.getElementById('moneyCats');
    const cats = this.type === 'out' ? this.OUT : this.IN;
    if (!el) return;
    if (!cats.includes(this.cat)) this.cat = cats[0];
    el.innerHTML = cats.map(c =>
      `<span class="chip ${this.cat===c?'on':''}" onclick="Money.cat='${c}';Money.renderCats()">${c}</span>`).join('');
  },

  renderSummary(){
    const el = document.getElementById('moneySummary');
    if (!el) return;
    const month = Util.today().slice(0, 7);
    const list = Store.list('money').filter(x => (x.date||'').startsWith(month));
    const out = list.filter(x => x.type==='out').reduce((s,x) => s + (+x.amount||0), 0);
    const inc = list.filter(x => x.type==='in').reduce((s,x) => s + (+x.amount||0), 0);
    // 分类占比（支出）
    const byCat = {};
    list.filter(x => x.type==='out').forEach(x => {
      byCat[x.cat||'其他'] = (byCat[x.cat||'其他']||0) + (+x.amount||0);
    });
    const top = Object.entries(byCat).sort((a,b) => b[1]-a[1]).slice(0, 4);
    el.innerHTML = `
      <div class="hero num">¥${out.toFixed(2)}<span class="unit">本月支出</span></div>
      <p class="hint" style="margin-top:2px">收入 ¥${inc.toFixed(2)} · 结余 ¥${(inc-out).toFixed(2)}</p>
      ${top.map(([c,v]) => `
        <div class="bar"><i style="width:${out?Math.round(v/out*100):0}%"></i></div>
        <div class="stat"><span>${Util.esc(c)}</span><span>¥${v.toFixed(2)}</span></div>`).join('')}`;
  },

  renderList(){
    const el = document.getElementById('moneyList');
    if (!el) return;
    const list = Store.list('money', (a,b) => (b.date||'').localeCompare(a.date||'') || (b._u||0)-(a._u||0))
      .slice(0, 20);
    el.innerHTML = list.length ? list.map(x => `
      <div class="item">
        <span class="time" style="width:auto">${Util.esc(x.date.slice(5))}</span>
        <span class="grow">${Util.esc(x.cat)}${x.note ? ' · ' + Util.esc(x.note) : ''}</span>
        <b class="num" style="color:${x.type==='in' ? '#4caf7d' : 'inherit'};flex-shrink:0">
          ${x.type==='in' ? '+' : '−'}${(+x.amount||0).toFixed(2)}
        </b>
        <button class="del" onclick="Money.del('${x.id}')">✕</button>
      </div>`).join('')
      : '<div class="empty">还没有账目，记一笔吧</div>';
  },

  add(){
    const a = document.getElementById('moneyAmount');
    const n = document.getElementById('moneyNote');
    const amount = parseFloat(a.value);
    if (!(amount > 0)) return UI.toast('填一下金额');
    Store.upsert('money', {
      date: Util.today(), amount, type: this.type, cat: this.cat, note: n.value.trim()
    });
    a.value = ''; n.value = '';
    this.render();
  },

  del(id){ Store.softDelete('money', id); this.render(); }
};
/* ==== 功能：记账本 END ==== */
