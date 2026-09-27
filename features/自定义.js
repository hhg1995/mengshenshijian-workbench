/* ==== 功能：自定义 START ====
   AI 造工具：对 AI 说需求 → 生成小工具（自包含 HTML）→ 一键装进来。
   小工具渲染在沙箱 iframe（sandbox="allow-scripts"）：能运行脚本，
   但拿不到工作台的数据和登录态，出问题也只影响它自己的框。 */
const Custom = {
  render(){
    const el = document.getElementById('widgetList');
    if (!el) return;
    const list = Store.list('widget', (a,b) => (b.createdAt||0) - (a.createdAt||0));
    if (!list.length){
      el.innerHTML = '<div class="card wide"><div class="empty">还没有自定义功能。对 AI 说一句需求，让它给你造一个。</div></div>';
      return;
    }
    el.innerHTML = '<div class="wgrid">' + list.map(x => `
      <div class="card wcell">
        <h2>${Util.esc(x.icon || '🧩')} ${Util.esc(x.name)}</h2>
        <iframe class="wframe" sandbox="allow-scripts" loading="lazy"></iframe>
        <div class="row" style="margin-top:10px">
          <button class="btn ghost" style="flex:1" onclick="Custom.reload(this)">🔄 重载</button>
          <button class="btn danger" style="flex:1" onclick="Custom.del('${x.id}')">删除</button>
        </div>
      </div>`).join('') + '</div>';
    // srcdoc 走属性赋值，免去引号转义问题
    const frames = el.querySelectorAll('.wframe');
    list.forEach((x, i) => { frames[i].srcdoc = x.html || ''; });
  },

  reload(btn){
    const cell = btn.closest('.wcell');
    const f = cell.querySelector('iframe');
    const src = f.srcdoc;
    f.srcdoc = '';
    setTimeout(() => { f.srcdoc = src; }, 50);
  },

  async del(id){
    if (!confirm('删除这个自定义功能？')) return;
    Store.softDelete('widget', id);
    Store.set('_lastWrite', Date.now());
    UI.toast('已删除');
    this.render();
    if (typeof Sync !== 'undefined') Sync.schedule();
  }
};
/* ==== 功能：自定义 END ==== */
