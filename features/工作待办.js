/* ==== 功能：工作待办 START ====
   分组：合同 / 回款 / 项目 / 其他。
   完成的自动沉底；删除走软删除，同步不会复活。 */
const Todo = {
  CATS: ['全部', '合同', '回款', '项目', '其他'],
  cat: '全部',

  render(){
    this.renderChips();
    this.renderList();
  },

  renderChips(){
    const el = document.getElementById('todoChips');
    if (!el) return;
    el.innerHTML = this.CATS.map(c =>
      `<span class="chip ${this.cat === c ? 'on' : ''}" onclick="Todo.setCat('${c}')">${c}</span>`).join('');
  },

  setCat(c){ this.cat = c; this.render(); },

  renderList(){
    const el = document.getElementById('todoList');
    if (!el) return;
    let list = Store.list('todo', (a,b) =>
      (a.done - b.done) || ((b.createdAt||0) - (a.createdAt||0)));
    if (this.cat !== '全部') list = list.filter(x => x.group === this.cat);
    el.innerHTML = list.length ? list.map(x => `
      <div class="item ${x.done ? 'done' : ''}">
        <button class="box" onclick="Todo.toggle('${x.id}')">${x.done ? '✓' : ''}</button>
        <span class="grow">${Util.esc(x.text)}</span>
        <span class="tag">${Util.esc(x.group || '其他')}</span>
        <button class="del" onclick="Todo.del('${x.id}')">✕</button>
      </div>`).join('')
      : '<div class="empty">这一类暂时没有待办</div>';
  },

  add(){
    const el = document.getElementById('todoText');
    const text = el.value.trim();
    if (!text) return UI.toast('先写要跟进的事');
    const group = document.getElementById('todoGroup').value;
    Store.upsert('todo', { text, group, done: false, createdAt: Date.now() });
    el.value = '';
    this.cat = group;          // 加完自动切到对应分组，看得到刚加的那条
    this.render();
  },

  toggle(id){
    const it = Store.list('todo').find(x => x.id === id);
    if (!it) return;
    it.done = !it.done;
    Store.upsert('todo', it);
    if (it.done) Store.incr('recap_done:' + Util.today());
    else Store.decr('recap_done:' + Util.today());
    this.renderList();
  },

  del(id){ Store.softDelete('todo', id); this.renderList(); }
};
/* ==== 功能：工作待办 END ==== */
