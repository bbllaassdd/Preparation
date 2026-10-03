import {tutorials} from './tutorials.js';
import {walkthroughs,spiWalkthrough} from './walkthroughs.js';
import {beginnerWalkthroughs} from './beginner-walkthroughs.js';
import {beginnerExplanation,hasBeginnerNotes} from './beginner-reading.js';
import {expansionWalkthroughs} from './expansion-walkthroughs.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const tutorialFor=l=>l.tutorial||tutorials[l.id];
export const walkthroughFor=(l,mode=0)=>l.id==='p-spi'?spiWalkthrough(mode):expansionWalkthroughs[l.id]||beginnerWalkthroughs[l.id]||walkthroughs[l.id];
export const hasWalkthrough=l=>!!walkthroughFor(l);
function foundation(l){return l.foundation?`<section class="topic-foundation" id="basics"><h2>先把基础讲清楚</h2>${l.foundation.map(s=>`<section><h3>${E(s.title)}</h3>${s.paragraphs.map(p=>`<p>${E(p)}</p>`).join('')}${s.table?`<div class="topic-table-scroll" tabindex="0" role="region" aria-label="${E(s.title)}"><table><thead><tr>${s.table.heads.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}</section>`).join('')}</section>`:'';}
export function explanation(l){
  const t=tutorialFor(l);if(!t)return beginnerExplanation(l);
  const steps=`<ol class="reason-steps">${t.steps.map((s,i)=>`<li><span class="reason-index">${i+1}</span><p>${E(s)}</p></li>`).join('')}</ol><div class="pitfall"><strong>容易混淆的地方</strong><p>${E(t.trap)}</p></div>`;
  if(l.beginner||hasBeginnerNotes(l))return `${beginnerExplanation(l)}<details class="advanced-reasoning" id="why"><summary>从问题推到结论 · 学会例子后再看</summary><h3 class="reason-question">${E(t.question)}</h3>${steps}</details>`;
  return `${foundation(l)}${beginnerExplanation(l)}<section class="reasoning" id="why"><h2>01 · 从问题推到结论</h2><h3 class="reason-question">${E(t.question)}</h3>${steps}</section>`;
}
export function workedExample(l){const t=tutorialFor(l);if(!t)return '';return `<section id="worked"><h2>推导例题 · 先自己想一遍</h2><div class="worked-example"><p class="worked-prompt">${E(t.worked.prompt)}</p><details class="worked-answer"><summary>查看解析与答案</summary><div><h3>逐步解析</h3><p>${E(t.worked.answer)}</p></div></details></div></section>`;}
export function relatedReasoning(l){const t=tutorialFor(l);return t?`<details class="quiz-reason"><summary>展开本课原理，重新推导</summary><ol>${t.steps.map(s=>`<li>${E(s)}</li>`).join('')}</ol><p><strong>注意：</strong>${E(t.trap)}</p></details>`:'';}
function svg(w,f){
  if(w.kind==='flow')return `<div class="topic-flow" role="group" aria-label="${E(f.title)}">${f.cells.map((c,i)=>`<div class="topic-flow-card ${f.focus.includes(i)?'active':''}"><span>${E(c.label)}</span><strong>${E(c.value)}</strong><p>${E(c.detail)}</p></div>`).join('')}</div>`;
  if(w.kind==='valley'){
    const values=w.values,min=Math.min(...values),max=Math.max(...values);
    const x=i=>45+i*470/(values.length-1),y=v=>180-(v-min)*125/Math.max(1,max-min);
    return `<svg viewBox="0 0 560 245" role="img" aria-label="${E(f.title)}；数组${values.join(',')}；高亮下标${f.highlight.join(',')}"><path d="M35 205 H535" stroke="#8a9ab1" fill="none"/><polyline points="${values.map((v,i)=>x(i)+','+y(v)).join(' ')}" stroke="#3275c8" fill="none" stroke-width="3"/>${values.map((v,i)=>`<g><circle cx="${x(i)}" cy="${y(v)}" r="${f.highlight.includes(i)?9:5}" fill="${f.highlight.includes(i)?'#b76612':'#3275c8'}"/><text x="${x(i)}" y="${y(v)-17}" text-anchor="middle" fill="#263f60" font-size="16">${v}</text><text x="${x(i)}" y="227" text-anchor="middle" fill="#52647d" font-size="13">i=${i}</text></g>`).join('')}</svg>`;
  }
  const text=(x,y,s,size=15,fill='#314f76')=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${fill}">${E(s)}</text>`;
  if(w.kind==='spi'){
    const pol=w.mode>>1,pha=w.mode&1,bits=[1,0,1,1],edge=f.edge??-1,high=67,low=102;
    let clock=`M65 ${pol?high:low} H110`,data=`M65 ${pha?167:bits[0]?143:167}`;
    for(let e=0;e<8;e++){const x=110+e*48,level=e%2===0?1-pol:pol;clock+=` H${x} V${level?high:low} H${x+48}`;}
    // CPHA=0 首位提前放置，后续位在第二边沿切换；CPHA=1 在每周期第一边沿推出。
    if(pha)data+=' H110';else data+=' H158';
    for(let i=pha?0:1;i<bits.length;i++){const x=pha?110+i*96:158+(i-1)*96;data+=` H${x} V${bits[i]?143:167} H${x+96}`;}data+=' H510';
    let lines='';for(let e=0;e<8;e++){const x=110+e*48,sample=e%2===pha;lines+=`<line x1="${x}" x2="${x}" y1="46" y2="186" stroke="${e===edge?'#d47c1b':sample?'#a6c1e7':'#dbe3ee'}" stroke-width="${e===edge?3:1}" stroke-dasharray="4 4"/>`+text(x,207,String(e+1),12)+text(x,227,sample?'采样':'改变',11,sample?'#275db5':'#64748b');}
    return `<svg viewBox="0 0 560 250" role="img" aria-label="SPI 模式 ${w.mode}，第 ${edge+1} 个边沿，${E(f.title)}">${text(28,35,'CS',12)}${text(28,91,'SCK',12)}${text(28,161,'MOSI',12)}<path d="M65 22 H85 V38 H510" fill="none" stroke="#c28135" stroke-width="2"/><path d="${clock}" fill="none" stroke="#326ac5" stroke-width="3"/><path d="${data}" fill="none" stroke="#268d73" stroke-width="3"/>${lines}${text(530,146,'高',11)}${text(530,172,'低',11)}</svg>`;
  }
  const positions=w.kind==='tree'?[[280,44],[150,130],[410,130],[90,220],[215,220]]:f.cells.map((_,i)=>[55+i*(450/Math.max(1,f.cells.length-1)),110]);
  // 5 个节点采用宽 560 的画布，曲线在两端正确落到框边，反向链路不会保留旧箭头。
  const boxWidth=w.kind==='tree'?74:Math.min(106,480/Math.max(1,f.cells.length)-10);
  let lines=f.links.map(([a,b])=>{const [x1,y1]=positions[a],[x2,y2]=positions[b];if(w.kind==='tree')return `<path d="M${x1} ${y1+32} L${x2} ${y2-32}" class="walk-edge" marker-end="url(#walk-arrow)"/>`;const dir=x2>x1?1:-1,from=x1+dir*boxWidth/2,to=x2-dir*(boxWidth/2+4);return `<path d="M${from} ${y1+8} Q${(from+to)/2} ${dir>0?25:208} ${to} ${y2+8}" class="walk-edge" marker-end="url(#walk-arrow)"/>`;}).join('');
  const boxes=f.cells.map((c,i)=>{const [x,y]=positions[i],focus=f.focus.includes(i);return `<g class="walk-cell ${focus?'active':''}"><rect x="${x-boxWidth/2}" y="${y-34}" width="${boxWidth}" height="80" rx="7" fill="${focus?'#dfeeff':'#fff'}" stroke="${focus?'#3878ce':'#cad8ea'}"/>${text(x,y-13,c.label,12)}${text(x,y+12,c.value,c.value.length>11?10:c.value.length>7?12:16,focus?'#1d58a7':'#345276')}${text(x,y+34,c.detail,10,'#637894')}</g>`;}).join('');
  return `<svg viewBox="0 0 560 ${w.kind==='tree'?285:240}" role="img" aria-label="${E(f.title)}。${E(f.cells.map(c=>`${c.label}：${c.value}`).join('；'))}"><defs><marker id="walk-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#4e7cba" stroke-width="1.5"/></marker></defs>${lines}${boxes}</svg>`;
}
export function renderWalkthrough(l,requested=0,mode=0){const w=walkthroughFor(l,mode);if(!w)return '';const i=Math.min(Math.max(requested,0),w.frames.length-1),f=w.frames[i];
  return `<div class="walkthrough" data-step="${i}" data-total="${w.frames.length}"><div class="walk-heading"><strong>逐步执行 · ${E(l.title)}</strong>${l.id==='p-spi'?`<label>SPI 模式 <select id="spi-mode">${[0,1,2,3].map(m=>`<option value="${m}" ${m===mode?'selected':''}>${m}</option>`).join('')}</select></label>`:''}</div><p class="walk-assumption">${E(w.assumption)}</p><div class="walk-status" aria-live="polite"><span class="badge">${i+1} / ${w.frames.length}</span><h3>${E(f.title)}</h3></div><pre class="codeblock walk-code"><code>${E(f.code)}</code></pre><div class="walk-canvas">${svg(w,f)}</div><div class="walk-pan-hint">图示可横向滑动查看</div><div class="walk-watch"><h4>执行后的状态</h4><dl>${f.watch.map(([key,val])=>`<div><dt>${E(key)}</dt><dd>${E(val)}</dd></div>`).join('')}</dl></div><div class="walk-why"><strong>这一步为什么这样做？</strong><p>${E(f.why)}</p></div><div class="walk-buttons"><button class="btn ghost small" data-action="walk-prev" data-id="${l.id}" ${i===0?'disabled':''}>上一步</button><button class="btn primary small" data-action="walk-next" data-id="${l.id}" ${i===w.frames.length-1?'disabled':''}>下一步</button><button class="btn ghost small" data-action="walk-reset" data-id="${l.id}">重新开始</button></div></div>`;
}
