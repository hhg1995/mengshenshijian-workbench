/* ==== 功能：资料库 START ====
   标题 + 分类 + 正文，搜索框实时过滤标题/分类/正文。
   分类预置：合同 / 供应商 / 物料规格 / 客户 / 其他。 */
const Library = {
  CATS: ['合同', '供应商', '物料规格', '客户', '其他'],
  cat: '全部',

  render(){
    // 分类下拉
    const sel = document.getElementById('libCat');
    if (sel && !sel.options.length)
      sel.innerHTML = this.CATS.map(c => `<option>${c}</option>`).join('');
    // 分类药丸
    const chips = document.getElementById('libChips');
    if (chips) chips.innerHTML =
      ['全部', ...this.CATS].map(c =>
        `<span class="chip ${this.cat === c ? 'on' : ''}" onclick="Library.setCat('${c}')">${c}</span>`).join('');
    this.renderList();
  },

  setCat(c){ this.cat = c; this.renderList(); },

  renderList(){
    const el = document.getElementById('libList');
    if (!el) return;
    const q = (document.getElementById('libSearch').value || '').trim().toLowerCase();
    let list = Store.list('lib', (a,b) => (b.createdAt||0) - (a.createdAt||0));
    if (this.cat !== '全部') list = list.filter(x => x.cat === this.cat);
    if (q) list = list.filter(x =>
      (x.title||'').toLowerCase().includes(q) ||
      (x.cat||'').toLowerCase().includes(q) ||
      (x.body||'').toLowerCase().includes(q));
    el.innerHTML = list.length ? list.map(x => `
      <details class="lib">
        <summary>
          <b>${Util.esc(x.title)}</b>
          <span class="tag">${Util.esc(x.cat)}</span>
          <button class="del" style="margin-left:auto" onclick="event.preventDefault();Library.del('${x.id}')">✕</button>
        </summary>
        <div class="body">${Util.esc(x.body || '（无内容）')}</div>
      </details>`).join('')
      : '<div class="empty">' + (q ? '没搜到，换个词试试' : '还没有资料，点上面的「添加资料」') + '</div>';
  },

  add(){
    const t = document.getElementById('libTitle');
    const b = document.getElementById('libBody');
    const title = t.value.trim();
    if (!title) return UI.toast('起个标题');
    Store.upsert('lib', {
      title,
      cat: document.getElementById('libCat').value,
      body: b.value.trim(),
      createdAt: Date.now()
    });
    t.value = ''; b.value = '';
    UI.toast('已存入资料库');
    this.renderList();
  },

  del(id){
    if (!confirm('删除这条资料？')) return;
    Store.softDelete('lib', id);
    this.renderList();
  }
};
/* ==== 功能：资料库 END ==== */
