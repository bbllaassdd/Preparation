import assert from 'node:assert/strict';
import {lessons,modules} from '../dist/content.js';
import {challenges} from '../dist/challenges.js';
import {tutorialFor,hasWalkthrough,walkthroughFor,renderWalkthrough} from '../dist/lesson-reading.js';
import {walkthroughs,spiWalkthrough} from '../dist/walkthroughs.js';
import {beginnerPath} from '../dist/beginner-lessons.js';

assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
assert.deepEqual(lessons.slice(0,beginnerPath.length).map(l=>l.id),beginnerPath);
assert.equal(lessons.find(l=>l.id==='c-sizeof').quiz[0].answer,1);
assert.equal(walkthroughFor(lessons.find(l=>l.id==='c-dereference')).frames.at(-1).watch[0][1],'7');
assert.equal(new Set(lessons.flatMap(l=>l.quiz.map(q=>q.id))).size,lessons.length*3);
for(const l of lessons){
  const t=tutorialFor(l);assert.ok(t&&t.steps.length===3,`${l.id}: complete reasoning`);
  assert.ok(t.worked.prompt&&t.worked.answer&&t.trap);
  for(const q of l.quiz){assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);assert.ok(q.explain);}
  if(hasWalkthrough(l))for(let i=0;i<walkthroughFor(l).frames.length;i++)assert.ok(renderWalkthrough(l,i).includes(`data-step="${i}"`));
}
assert.deepEqual(walkthroughs['ds-list'].frames[0].links,[[0,1],[1,2]]);
assert.deepEqual(walkthroughs['ds-list'].frames.at(-1).links,[[1,0],[2,1]]);
assert.ok(walkthroughs['ds-list'].frames.some(f=>f.code==='next = cur->next;'));
assert.equal(walkthroughs['ds-tree'].frames.at(-1).output,'A → B → D → E → C');
assert.deepEqual(walkthroughs['ds-sort'].frames.at(-1).cells.map(c=>Number(c.value)),[1,2,3,4,5]);
const ranges=walkthroughs['ds-binary'].frames.map(f=>Object.fromEntries(f.watch));
for(const f of ranges){assert.ok(Number(f.lo)<=3&&Number(f.hi)>=3,'binary keeps target');}
for(let mode=0;mode<4;mode++){
  const frames=spiWalkthrough(mode).frames;
  assert.equal(frames.filter(f=>f.title.includes('：采样')).length,4);
  assert.equal(frames.at(-1).output,'1011');
  for(const f of frames.slice(1)){const sample=f.title.includes('：采样');assert.equal(sample,f.edge%2===(mode&1));}
}

const page={innerHTML:''},app={innerHTML:''};
const docHandlers={},winHandlers={},memory=new Map(),webTools=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
globalThis.location={hash:'#/home'};
globalThis.history={replaceState:()=>{}};
globalThis.window={scrollY:0,scrollTo:()=>{},addEventListener:(type,fn)=>winHandlers[type]=fn};
globalThis.document={querySelector:selector=>selector==='#app'?app:selector==='#page-content'?page:null,addEventListener:(type,fn)=>docHandlers[type]=fn,modelContext:{registerTool:tool=>webTools.set(tool.name,tool)}};
await import('../dist/app.js');
assert.match(page.innerHTML,/知识地图/);
assert.match(page.innerHTML,/不认识 sizeof、&(?:amp;)?、\*？/);
assert.ok(page.innerHTML.includes('#/lesson/c-start-variable'));
assert.deepEqual([...webTools.keys()],['list_study_lessons','open_study_lesson','submit_study_answer']);
assert.equal(webTools.get('list_study_lessons').execute({module:'c'}).length,lessons.filter(l=>l.module==='c').length);
assert.throws(()=>webTools.get('list_study_lessons').execute({module:'bad'}));

function navigate(hash,expected){globalThis.location.hash=hash;winHandlers.hashchange();const encoded=expected.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');assert.ok(page.innerHTML.includes(encoded),hash);}
for(const m of modules)navigate(`#/module/${m.id}`,m.name);
for(const l of lessons){navigate(`#/lesson/${l.id}`,l.title);assert.match(page.innerHTML,/查看解析/);assert.match(page.innerHTML,/从问题推到结论/);assert.match(page.innerHTML,/<details class="worked-answer">/);assert.doesNotMatch(page.innerHTML,/<details class="worked-answer" open/);assert.doesNotMatch(page.innerHTML,/正确答案：/);}
navigate('#/lesson/c-dereference','07 · *p：沿地址访问目标');
assert.match(page.innerHTML,/声明 p 是指针/);
assert.match(page.innerHTML,/两个数相乘/);
assert.doesNotMatch(page.innerHTML,/<details class="advanced-reasoning"[^>]*open/);
navigate('#/lesson/c-sizeof','04 · sizeof：询问占多少字节');
assert.match(page.innerHTML,/运算符；不是普通函数/);
assert.match(page.innerHTML,/size_t/);
for(const c of challenges)navigate(`#/challenge/${c.id}`,c.title);
for(const [hash,pattern] of [['#/practice','专题练习'],['#/review','错题复习'],['#/mock','模拟笔试'],['#/challenges','手写与场景题'],['#/sources','资料来源']])navigate(hash,pattern);

navigate('#/lesson/c-types','类型大小与数据模型');
const q=lessons.find(l=>l.id==='c-types').quiz[0];
function click(action,extra={}){const target={dataset:{action,...extra},closest:()=>target};docHandlers.click({target});}
// 步进不回绕，上一帧与重置恢复初始状态。
navigate('#/lesson/ds-list','单链表与快慢指针');
click('walk-next',{id:'ds-list'});assert.match(page.innerHTML,/data-step="1"/);
click('walk-prev',{id:'ds-list'});assert.match(page.innerHTML,/data-step="0"/);
for(let i=0;i<30;i++)click('walk-next',{id:'ds-list'});
assert.match(page.innerHTML,new RegExp(`data-step="${walkthroughs['ds-list'].frames.length-1}"`));
click('walk-reset',{id:'ds-list'});assert.match(page.innerHTML,/data-step="0"/);
navigate('#/lesson/c-types','类型大小与数据模型');
click('reveal',{id:q.id});
assert.match(page.innerHTML,/正确答案：/);
assert.match(page.innerHTML,/判断依据：/);
navigate('#/review','全部错题 1');
click('review-reset',{id:q.id});
navigate('#/lesson/c-types','类型大小与数据模型');
assert.doesNotMatch(page.innerHTML,/正确答案：/);
click('choose',{id:q.id,choice:String(q.answer)});
click('submit-answer',{id:q.id});
assert.match(page.innerHTML,/回答正确/);
const toolQuestion=lessons.find(l=>l.id==='c-types').quiz[1];
assert.throws(()=>webTools.get('submit_study_answer').execute({questionId:toolQuestion.id,choice:9}));
const toolResult=webTools.get('submit_study_answer').execute({questionId:toolQuestion.id,choice:toolQuestion.answer});
assert.equal(toolResult.correct,true);
assert.match(page.innerHTML,/正确答案：/);

console.log(`PASS: ${modules.length} modules, ${lessons.length} lesson routes, ${lessons.length*3} questions, ${challenges.length} challenges, answer reveal/review, 3 WebMCP tools.`);
