import assert from 'node:assert/strict';
import {lessons,modules} from '../dist/content.js';
import {challenges} from '../dist/challenges.js';

const page={innerHTML:''},app={innerHTML:''};
const docHandlers={},winHandlers={},memory=new Map(),webTools=new Map();
globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
globalThis.location={hash:'#/home'};
globalThis.history={replaceState:()=>{}};
globalThis.window={scrollY:0,scrollTo:()=>{},addEventListener:(type,fn)=>winHandlers[type]=fn};
globalThis.document={querySelector:selector=>selector==='#app'?app:selector==='#page-content'?page:null,addEventListener:(type,fn)=>docHandlers[type]=fn,modelContext:{registerTool:tool=>webTools.set(tool.name,tool)}};
await import('../dist/app.js');
assert.match(page.innerHTML,/知识地图/);
assert.deepEqual([...webTools.keys()],['list_study_lessons','open_study_lesson','submit_study_answer']);
assert.equal(webTools.get('list_study_lessons').execute({module:'c'}).length,lessons.filter(l=>l.module==='c').length);
assert.throws(()=>webTools.get('list_study_lessons').execute({module:'bad'}));

function navigate(hash,expected){globalThis.location.hash=hash;winHandlers.hashchange();assert.ok(page.innerHTML.includes(expected),hash);}
for(const m of modules)navigate(`#/module/${m.id}`,m.name);
for(const l of lessons){navigate(`#/lesson/${l.id}`,l.title);assert.match(page.innerHTML,/查看解析/);assert.doesNotMatch(page.innerHTML,/正确答案：/);}
for(const c of challenges)navigate(`#/challenge/${c.id}`,c.title);
for(const [hash,pattern] of [['#/practice','专题练习'],['#/review','错题复习'],['#/mock','模拟笔试'],['#/challenges','手写与场景题'],['#/sources','资料来源']])navigate(hash,pattern);

navigate('#/lesson/c-types','类型大小与数据模型');
const q=lessons[0].quiz[0];
function click(action,extra={}){const target={dataset:{action,...extra},closest:()=>target};docHandlers.click({target});}
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
const toolQuestion=lessons[0].quiz[1];
assert.throws(()=>webTools.get('submit_study_answer').execute({questionId:toolQuestion.id,choice:9}));
const toolResult=webTools.get('submit_study_answer').execute({questionId:toolQuestion.id,choice:toolQuestion.answer});
assert.equal(toolResult.correct,true);
assert.match(page.innerHTML,/正确答案：/);

console.log(`PASS: ${modules.length} modules, ${lessons.length} lesson routes, ${lessons.length*3} questions, ${challenges.length} challenges, answer reveal/review, 3 WebMCP tools.`);
