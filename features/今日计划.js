/* ==== 功能：今日计划 START ====
   固定行程模板长期存，勾选状态和临时事项按天存。
   第二天打开：行程自动回未勾选，临时事项自动清空。 */
const Plan = {
  render(){
    const d = new Date();
    document.getElementById('planDate').textContent =
      Util.today() + ' · 星期' + '日一二三四五六'[d.getDay()];
    this.renderCd();
    this.renderList();
  },

  /* ── 倒计时 ── */
  daysLeft(date){
    return Math.ceil((new Date(date + 'T23:59:59') - new Date()) / 864e5);
  },

  renderCd(){
    const el = document.getElementById('cdList');
    if (!el) return;
    const list = Store.list('countdown', (a,b) => a.date < b.date ? -1 : 1)
      .filter(x => this.daysLeft(x.date) >= 0);
    el.innerHTML = list.length ? list.map(x => `
      <div class="cell">
        <div class="d">${this.daysLeft(x.date)}</div>
        <div class="l">${Util.esc(x.title)}</div>
        <button class="del" onclick="Plan.delCd('${x.id}')">✕</button>
      </div>`).join('')
      : '<div class="empty">还没有倒计时，加一个回款或合同节点吧</div>';
  },

  addCd(){
    const t = document.getElementById('cdTitle');
    const d = document.getElementById('cdDate');
    if (!t.value.trim() || !d.value) return UI.toast('事项和日期都要填');
    Store.upsert('countdown', { title: t.value.trim(), date: d.value });
    t.value = '';
    this.renderCd();
  },

  delCd(id){ Store.softDelete('countdown', id); this.renderCd(); },

  /* ── 今日行程 ── */
  renderList(){
    const el = document.getElementById('planList');
    if (!el) return;
    const tpl  = Store.list('plan_template', (a,b) => a.time < b.time ? -1 : 1);
    const done = Store.getDaily('plan_done', {});
    const temp = Store.listDaily('plan_temp');

    const html =
      tpl.map(x => `
        <div class="item ${done[x.id] ? 'done' : ''}">
          <button class="box" onclick="Plan.toggle('${x.id}')">${done[x.id] ? '✓' : ''}</button>
          <span class="time">${Util.esc(x.time)}</span>
          <span class="grow">${Util.esc(x.text)}</span>
          <button class="del" onclick="Plan.delTpl('${x.id}')">✕</button>
        </div>`).join('') +
      temp.map(x => `
        <div class="item ${done[x.id] ? 'done' : ''}">
          <button class="box" onclick="Plan.toggle('${x.id}')">${done[x.id] ? '✓' : ''}</button>
          <span class="grow">${Util.esc(x.text)}</span>
          <button class="del" onclick="Plan.delTemp('${x.id}')">✕</button>
        </div>`).join('');

    el.innerHTML = html || '<div class="empty">今天还没有安排</div>';
  },

  toggle(id){
    const done = Store.getDaily('plan_done', {});
    if (done[id]) { delete done[id]; Store.decr('recap_done:' + Util.today()); }
    else          { done[id] = 1;    Store.incr('recap_done:' + Util.today()); }
    Store.setDaily('plan_done', done);
    this.renderList();
  },

  addTpl(){
    const time = document.getElementById('planTime').value;
    const t = document.getElementById('planText');
    if (!t.value.trim()) return UI.toast('写一下行程内容');
    Store.upsert('plan_template', { time: time || '', text: t.value.trim() });
    t.value = '';
    this.renderList();
  },

  delTpl(id){ Store.softDelete('plan_template', id); this.renderList(); },

  addTemp(){
    const t = document.getElementById('planTemp');
    if (!t.value.trim()) return UI.toast('写一下要做的事');
    Store.upsertDaily('plan_temp', { text: t.value.trim() });
    t.value = '';
    this.renderList();
  },

  delTemp(id){
    Store.softDelete('plan_temp:' + Util.today(), id);
    this.renderList();
  }
};
/* ==== 功能：今日计划 END ==== */
