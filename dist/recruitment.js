import {companies,checkedAt} from './companies.js';
const KEY='embedded-applications-v1';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(companies.map(c=>[c.id,c]));
export const statuses=['待投递','已投递','笔试','面试','Offer','未通过','暂不合适'];
export const localDate=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function cleanDays(data={}){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('每日计划格式不正确');
 return Object.fromEntries(Object.entries(data).filter(([d,ids])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&Array.isArray(ids)).map(([d,ids])=>[d,[...new Set(ids.filter(id=>byId.has(id)))].slice(0,15)]));
}
export function cleanRecords(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('记录格式不正确');
 const records={};
 for(const [id,row] of Object.entries(data)){
  if(!byId.has(id)||!row||typeof row!=='object')continue;
  if(!statuses.includes(row.status))throw Error('存在无效状态');
  records[id]={status:row.status,confirmed:row.confirmed===true,appliedDate:/^\d{4}-\d{2}-\d{2}$/.test(row.appliedDate||'')?row.appliedDate:'',note:typeof row.note==='string'?row.note.slice(0,1500):''};
 }
 return records;
}
export function createDailyPlan(list,records,day,previous=[],target=15){
 const allowed=c=>(c.eligible&&!c.needsConfirm)||records[c.id]?.confirmed;
 const kept=[...new Set(previous)].filter(id=>{const c=list.find(c=>c.id===id),r=records[id];return c&&r?.status!=='暂不合适'&&(r?.appliedDate===day||((!r||r.status==='待投递')&&allowed(c)));}).slice(0,target);
 const remaining=list.filter(c=>!kept.includes(c.id)&&(!records[c.id]||records[c.id].status==='待投递')&&allowed(c));
 return [...kept,...remaining.slice(0,Math.max(0,target-kept.length)).map(c=>c.id)];
}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {records:cleanRecords(x.records||{}),days:cleanDays(x.days||{})};}catch{return{records:{},days:{}};}}
let state=load(),mode='today',query='',sector='全部方向',level='all',status='all',page=1,selected='',message='';
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{message='浏览器未能保存记录，请立即导出备份。';return false;}}
const sourceLink=(url,label)=>url?`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(label)} ↗</a>`:'';
const currentStatus=id=>state.records[id]?.status||'待投递';
export function recruitmentPage(){return '<div id="recruitment-root"></div>';}
export function mountRecruitment(){
 const root=document.querySelector('#recruitment-root');if(!root)return;
 const day=localDate();
 if(!state.days[day]){state.days[day]=createDailyPlan(companies,state.records,day);save();}
 function render(){
  const plan=state.days[day]||[];
  const todayDone=companies.filter(c=>state.records[c.id]?.appliedDate===day).length;
  const totalDone=companies.filter(c=>state.records[c.id]?.appliedDate).length;
  let pool=mode==='today'?plan.map(id=>byId.get(id)).filter(Boolean):companies;
  pool=pool.filter(c=>(sector==='全部方向'||c.sector===sector)&&(level==='all'||(level==='eligible'?c.eligible:level==='large'?c.large:!c.eligible))&&(status==='all'||currentStatus(c.id)===status)&&(!query||[c.name,c.sector,c.role,c.locations,c.note].join(' ').toLowerCase().includes(query.toLowerCase())));
  const pages=Math.max(1,Math.ceil(pool.length/15));page=Math.max(1,Math.min(page,pages));
  const visible=pool.slice((page-1)*15,page*15);
  if(!visible.some(c=>c.id===selected))selected=visible[0]?.id||'';
  const chosen=byId.get(selected),row=state.records[selected]||{};
  root.innerHTML=`<header class="apply-heading"><div><div class="eyebrow">2027 届 · 中国大陆 · 嵌入式软件</div><h1>秋招投递工作台</h1><p>每天约 15 家，把岗位要求看清，再去官网投递。</p></div><div class="apply-backup"><button class="btn ghost small" data-rec="export">导出投递记录</button><button class="btn ghost small" data-rec="import">导入记录</button><input type="file" id="application-import" accept=".json,application/json" hidden></div></header>
  <div class="apply-stats"><div><strong>${todayDone}<small> / 15</small></strong><span>今天已投</span></div><div><strong>${totalDone}</strong><span>本站累计已投</span></div><div><strong>${companies.filter(c=>c.eligible).length}</strong><span>本科相关岗位有依据</span></div><div><strong>${companies.length}</strong><span>候选公司；${companies.filter(c=>!c.eligible).length} 家岗位待核对</span></div></div>
  <div class="apply-method"><strong>核对日期：${checkedAt} · 招聘信息快照</strong><p>优先匹配 MCU／RTOS。学历按具体岗位核对；“本科可投”不代表承诺通过学校筛选。标有“待核对”的公司尚未确认符合全部条件，不会自动进入每日计划。人数区分招聘主体与集团；实际岗位、地点和截止时间以官网为准。</p><p>已排除提供表格中的公司及已识别别名。原表和个人备注未公开；新增投递记录只保存在当前浏览器，建议定期导出。毕业届次暂按 2027 届。</p></div>
  <div class="apply-controls"><div class="apply-tabs" role="group" aria-label="公司列表"><button class="${mode==='today'?'active':''}" data-rec="mode" data-value="today">今日计划 · ${plan.length}</button><button class="${mode==='all'?'active':''}" data-rec="mode" data-value="all">全部公司 · ${companies.length}</button></div><button class="btn soft small" data-rec="fill">补充今日计划</button><span class="apply-date">北京时间 ${day}</span></div>
  ${plan.length<15&&mode==='today'?`<div class="apply-notice">今天可安排 ${plan.length} 家，距 15 家还差 ${15-plan.length} 家。可到全部公司查看待核对岗位；确认满足学历、届次和地点后，再加入计划。</div>`:''}
  <form id="application-search" class="apply-filters"><label class="apply-search">查找公司 / 城市 / 岗位<input name="query" type="search" value="${E(query)}" placeholder="例如：深圳、嵌入式、电源"></label><button class="btn ghost small" type="submit">搜索</button><label>方向<select data-rec-filter="sector">${['全部方向',...new Set(companies.map(c=>c.sector))].map(s=>`<option ${sector===s?'selected':''}>${E(s)}</option>`).join('')}</select></label><label>筛选依据<select data-rec-filter="level">${[['all','全部'],['eligible','本科岗位有依据'],['large','规模已有千人依据'],['pending','岗位条件待核对']].map(([v,t])=>`<option value="${v}" ${level===v?'selected':''}>${t}</option>`).join('')}</select></label><label>投递状态<select data-rec-filter="status">${['all',...statuses].map(s=>`<option value="${s}" ${status===s?'selected':''}>${s==='all'?'全部状态':s}</option>`).join('')}</select></label></form>
  <p class="apply-message" role="status">${E(message)}</p>
  <div class="apply-workspace"><section class="apply-list" aria-label="推荐公司"><div class="apply-list-heading"><strong>${pool.length} 家符合当前筛选</strong><span>${page} / ${pages} 页</span></div>
  ${visible.map(c=>`<button class="apply-company ${selected===c.id?'selected':''}" data-rec="select" data-id="${c.id}" aria-pressed="${selected===c.id}"><div><strong>${E(c.name)}</strong><span class="apply-state">${E(currentStatus(c.id))}</span></div><p>${E(c.role)}</p><div class="apply-tags"><span>${E(c.fit)}</span><span class="${c.eligible?'verified':'pending'}">${c.eligible?'本科岗位有依据':'岗位待核对'}</span></div><small>${E(c.locations||'大陆岗位地点待核对')}</small></button>`).join('')||'<div class="empty">暂无公司符合筛选。可切换“全部公司”或清除筛选。</div>'}
  <div class="apply-pagination"><button class="btn ghost small" data-rec="prev" ${page===1?'disabled':''}>上一页</button><button class="btn ghost small" data-rec="next" ${page===pages?'disabled':''}>下一页</button></div></section>
  <section class="apply-detail panel" aria-label="公司与岗位详情">${chosen?`<div class="eyebrow">${E(chosen.sector)}</div><h2>${E(chosen.name)}</h2><p class="apply-role">${E(chosen.role)}</p><div class="apply-tags"><span class="${chosen.eligible?'verified':'pending'}">${chosen.eligible?'本科岗位有依据':'投递前需核对'}</span><span>${E(chosen.fit||'嵌入式方向备选')}</span></div>
  <dl class="apply-facts"><div><dt>学历与届次</dt><dd>${E(chosen.degree)}</dd></div><div><dt>大陆工作地</dt><dd>${E(chosen.locations||'进入岗位详情选择中国大陆；具体城市待核对')}</dd></div><div><dt>公司规模</dt><dd>${E(chosen.size||'未核到可靠人数，不能认定为 1000 人以上')}</dd></div><div><dt>匹配说明</dt><dd>${E(chosen.note)}</dd></div></dl>
  <a class="btn primary apply-official" href="${E(chosen.url)}" target="_blank" rel="noopener noreferrer">${chosen.direct?'打开官方校招入口':'打开官网招聘页'} ↗</a><p class="source-note">跳转不会自动标记已投。进入官网后选择校园招聘，搜索“嵌入式 / MCU / 固件 / 软件”，查看具体岗位要求。</p>
  <details class="apply-evidence"><summary>查看筛选依据与来源</summary><ul>${chosen.sources.map(s=>`<li>${sourceLink(s.url,s.title)}</li>`).join('')}</ul><p>未发现公开学校限制，并不等于企业没有内部筛选标准。旧届次资料只作入口线索；当前岗位未核实时已明确标注。</p></details>
  ${!chosen.eligible||chosen.needsConfirm?`<label class="apply-confirm"><input type="checkbox" data-rec-confirm="${chosen.id}" ${row.confirmed?'checked':''}>我已查看本届具体岗位，确认本科、专业和中国大陆地点符合，可以加入每日计划。</label>`:''}
  <button class="btn soft small" data-rec="add-today" data-id="${chosen.id}" ${plan.includes(chosen.id)?'disabled':''}>${plan.includes(chosen.id)?'已在今日计划':'加入今日计划'}</button>
  <div class="apply-status-edit"><label>我的进度<select data-rec-status="${chosen.id}">${statuses.map(s=>`<option ${currentStatus(chosen.id)===s?'selected':''}>${s}</option>`).join('')}</select></label><span>${row.appliedDate?'投递日期：'+E(row.appliedDate):'尚未记录投递日期'}</span></div>
  <label class="apply-note-label">我的备注（仅本机）<textarea data-rec-note="${chosen.id}" maxlength="1500" placeholder="记录岗位名称、笔试时间、面试准备事项…">${E(row.note||'')}</textarea></label><button class="btn ghost small" data-rec="save-note" data-id="${chosen.id}">保存备注</button> ${row.appliedDate?`<button class="btn ghost small" data-rec="undo-applied" data-id="${chosen.id}">撤销误标投递</button>`:''}
  <div class="apply-study"><strong>投递前准备</strong><a href="#/lesson/c-pointer/coding">C 指针与编程练习 →</a><a href="#/lesson/r-priority-basics">FreeRTOS 优先级 →</a><a href="#/module/linux">Linux 笔试专题 →</a></div>`:'<div class="empty">选择左侧公司查看详情与投递入口。</div>'}</section></div>`;
 }
 const updateRow=(id,changes)=>{state.records[id]={status:'待投递',confirmed:false,appliedDate:'',note:'',...state.records[id],...changes};save();};
 root.onclick=event=>{
  const button=event.target.closest('[data-rec]');if(!button)return;
  const action=button.dataset.rec;message='';
  if(action==='mode'){mode=button.dataset.value;page=1;}
  if(action==='select')selected=button.dataset.id;
  if(action==='prev')page--;
  if(action==='next')page++;
  if(action==='fill'){state.days[day]=createDailyPlan(companies,state.records,day,state.days[day]);save();message='今日计划已补充；已安排的公司保留，刷新页面不会随机换一批。';}
  if(action==='add-today'){
   const id=button.dataset.id,c=byId.get(id),r=state.records[id];
   if(!((c.eligible&&!c.needsConfirm)||r?.confirmed))message='请先查看本届岗位要求，勾选符合条件后加入。';
   else if(r&&r.status!=='待投递')message='该公司已投递或标为暂不合适，无需再次加入。';
   else if(state.days[day].length>=15)message='今天已安排 15 家。可将不适合的公司标为“暂不合适”，点击补充后再安排。';
   else{state.days[day].push(id);save();message='已加入今日计划。';}
  }
  if(action==='undo-applied'){updateRow(button.dataset.id,{status:'待投递',appliedDate:''});message='已撤销投递标记，备注保留。';}
  if(action==='save-note'){const id=button.dataset.id;updateRow(id,{note:root.querySelector('[data-rec-note]').value.slice(0,1500)});message='备注已保存到当前浏览器。';}
  if(action==='export'){
   const blob=new Blob([JSON.stringify({type:'embedded-applications',version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='秋招投递记录-'+day+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(action==='import'){root.querySelector('#application-import').click();return;}
  render();
  [...root.querySelectorAll('[data-rec]')].find(el=>el.dataset.rec===action&&el.dataset.id===button.dataset.id&&el.dataset.value===button.dataset.value)?.focus({preventScroll:true});
 };
 root.onsubmit=event=>{if(event.target.id!=='application-search')return;event.preventDefault();query=new FormData(event.target).get('query').trim();page=1;render();};
 root.onchange=async event=>{
  const el=event.target;message='';
  if(el.dataset.recFilter){if(el.dataset.recFilter==='sector')sector=el.value;if(el.dataset.recFilter==='level')level=el.value;if(el.dataset.recFilter==='status')status=el.value;page=1;}
  if(el.dataset.recStatus){const id=el.dataset.recStatus,newStatus=el.value;updateRow(id,{status:newStatus,appliedDate:['已投递','笔试','面试','Offer','未通过'].includes(newStatus)?state.records[id]?.appliedDate||day:state.records[id]?.appliedDate||''});}
  if(el.dataset.recConfirm)updateRow(el.dataset.recConfirm,{confirmed:el.checked});
  if(el.id==='application-import'){
   const file=el.files?.[0];if(!file)return;
   try{
    if(file.size>2_000_000)throw Error('文件超过 2MB');
    const data=JSON.parse(await file.text());
    if(data.type!=='embedded-applications'||data.version!==1)throw Error('请选择本站导出的投递记录');
    const incoming=cleanRecords(data.records),incomingDays=cleanDays(data.days||{});
    if(!confirm('将合并导入记录；同一公司的记录以导入文件为准。是否继续？'))return;
    state.records={...state.records,...incoming};state.days={...state.days,...incomingDays};
    state.days[day]=createDailyPlan(companies,state.records,day,state.days[day]);save();message='投递记录和每日计划已恢复；可点击补充。';
   }catch(err){message='导入失败：'+err.message;}
  }
  render();
  if(el.dataset.recFilter)root.querySelector(`[data-rec-filter="${el.dataset.recFilter}"]`)?.focus({preventScroll:true});
  if(el.dataset.recStatus)root.querySelector('[data-rec-status]')?.focus({preventScroll:true});
  if(el.dataset.recConfirm)root.querySelector('[data-rec-confirm]')?.focus({preventScroll:true});
 };
 // Notes autosave on blur/change so switching company does not discard a draft.
 root.addEventListener('input',event=>{const id=event.target.dataset.recNote;if(id)updateRow(id,{note:event.target.value.slice(0,1500)});});
 render();
}

