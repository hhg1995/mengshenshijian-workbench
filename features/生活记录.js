/* ==== 功能：生活记录 START ====（私密：不上云、不同步，key 前缀 life）
   碎碎念 + 照片。照片必须过 Util.compressImage，否则几张原图就撑爆存储。 */
const Life = {
  _pending: [],

  render(){ this.renderList(); },

  async pick(input){
    for (const f of input.files){
      try { this._pending.push(await Util.compressImage(f, 800, .72)); }
      catch(e){ UI.toast('有一张图读不了，跳过了'); }
    }
    input.value = '';
    if (this._pending.length) UI.toast('已选 ' + this._pending.length + ' 张，写点字一起保存');
  },

  add(){
    const t = document.getElementById('lifeText');
    const text = t.value.trim();
    if (!text && !this._pending.length) return UI.toast('写点什么，或加张照片');
    Store.upsert('life', { date: Util.today(), text, imgs: this._pending.slice() });
    t.value = '';
    this._pending = [];
    UI.toast('已记下');
    this.renderList();
  },

  renderList(){
    const el = document.getElementById('lifeList');
    if (!el) return;
    const list = Store.list('life', (a,b) =>
      (b.date||'').localeCompare(a.date||'') || (b._u||0)-(a._u||0));
    el.innerHTML = list.length ? list.map(x => `
      <div class="item" style="flex-wrap:wrap">
        <span class="time" style="width:auto">${Util.esc(x.date)}</span>
        <span class="grow">${Util.esc(x.text || '')}</span>
        <button class="del" onclick="Life.del('${x.id}')">✕</button>
        ${x.imgs && x.imgs.length ? `<div class="pic" style="flex:1 0 100%">${
          x.imgs.map(src => `<img src="${src}" alt="">`).join('')}</div>` : ''}
      </div>`).join('')
      : '<div class="empty">还没有记录</div>';
  },

  del(id){
    if (!confirm('删除这条记录？')) return;
    Store.softDelete('life', id);
    this.renderList();
  }
};
/* ==== 功能：生活记录 END ==== */
