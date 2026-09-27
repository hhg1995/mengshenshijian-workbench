/* ==== 功能：创作本 START ====（私密：不上云、不同步，key 前缀 write）
   写完自动保存（输入停 0.9 秒落盘），不做保存按钮——
   写一半切走是常态，保存动作本身就该消失。 */
const Write = {
  _timer: null,

  render(){
    const id = Store.get('write_draft');
    if (id){
      const it = Store.list('write').find(x => x.id === id);
      if (it){
        document.getElementById('writeTitle').value = it.title || '';
        document.getElementById('writeBody').value  = it.text  || '';
      }
    } else {
      document.getElementById('writeTitle').value = '';
      document.getElementById('writeBody').value  = '';
    }
    this.renderList();
  },

  /** 输入时防抖自动保存 */
  touch(){
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.save(), 900);
  },

  save(){
    const title = document.getElementById('writeTitle').value.trim();
    const text  = document.getElementById('writeBody').value;
    if (!title && !text.trim()) return;            // 空的不存
    let id = Store.get('write_draft');
    const it = Store.upsert('write', {
      id: id || undefined,
      title: title || '无题',
      text,
      date: Util.today()
    });
    if (!id) Store.set('write_draft', it.id);
    const st = document.getElementById('writeState');
    if (st) st.textContent = '已保存 ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
    this.renderList();
  },

  newDraft(){
    clearTimeout(this._timer);
    this.save();                                    // 把上一篇落袋
    Store.remove('write_draft');
    document.getElementById('writeTitle').value = '';
    document.getElementById('writeBody').value  = '';
    document.getElementById('writeState').textContent = '新的一篇，开写吧';
    document.getElementById('writeTitle').focus();
  },

  load(id){
    clearTimeout(this._timer);
    Store.set('write_draft', id);
    this.render();
  },

  renderList(){
    const el = document.getElementById('writeList');
    if (!el) return;
    const cur = Store.get('write_draft');
    const list = Store.list('write', (a,b) =>
      (b.date||'').localeCompare(a.date||'') || (b._u||0)-(a._u||0));
    el.innerHTML = list.length ? list.map(x => `
      <div class="item ${x.id === cur ? 'done' : ''}">
        <span class="grow" style="cursor:pointer" onclick="Write.load('${x.id}')">
          <b>${Util.esc(x.title || '无题')}</b>
          <span class="hint" style="margin:0 0 0 8px;display:inline">${Util.esc(x.date)}</span>
        </span>
        <button class="del" onclick="Write.del('${x.id}')">✕</button>
      </div>`).join('')
      : '<div class="empty">第一篇从今天开始</div>';
  },

  del(id){
    if (!confirm('删除这一篇？不可恢复。')) return;
    Store.softDelete('write', id);
    if (Store.get('write_draft') === id) Store.remove('write_draft');
    this.render();
  }
};
/* ==== 功能：创作本 END ==== */
