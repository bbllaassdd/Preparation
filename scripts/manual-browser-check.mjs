// 本地 Chromium 检查；使用独立用户目录，不连接用户正在使用的浏览器。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const out=path.resolve(root,'../tmp/reading-qa');fs.mkdirSync(out,{recursive:true});
const userData=path.join(root,'.sites-runtime',`reading-qa-${Date.now()}`);fs.mkdirSync(userData,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const p=path.resolve(root,'dist','.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
  if(!p.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403);return res.end();}
  try{res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(fs.readFileSync(p));}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port,chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const proc=spawn(chrome,['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${userData}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
const errors=[];let socket;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
try{
  let debugPort;
  for(let i=0;i<100;i++){try{debugPort=Number(fs.readFileSync(path.join(userData,'DevToolsActivePort'),'utf8').split('\n')[0]);if(debugPort)break;}catch{}await delay(100);}
  assert.ok(debugPort,'Chrome debug port');
  const targets=await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let serial=0;const pending=new Map();
  socket.onmessage=ev=>{const v=JSON.parse(ev.data);if(v.id){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(Error(v.error.message)):p.resolve(v.result);}else if(v.method==='Runtime.exceptionThrown')errors.push(v.params.exceptionDetails.text);};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;const timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},20000);pending.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value);},reject:error=>{clearTimeout(timeout);reject(error);}});socket.send(JSON.stringify({id,method,params}));});
  await send('Runtime.enable');await send('Page.enable');
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const open=async(id,width=1400,height=1000)=>{
    if(id==='c-pointer'||id==='p-spi'||id==='c-sizeof')console.log('Browser check:',id,width);
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await send('Page.navigate',{url:`http://127.0.0.1:${port}/#/lesson/${id}`});
    for(let i=0;i<50;i++){if(await evaluate(`document.readyState==='complete' && !!document.querySelector('.worked-answer') && location.hash.includes('${id}')`))break;await delay(100);}
    await evaluate("document.documentElement.style.scrollBehavior='auto'");
  };

  const capture=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
  const navigate=async(route,width=1440,height=1000)=>{await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await send('Page.navigate',{url:`http://127.0.0.1:${port}/#/${route}`});for(let i=0;i<60;i++){if(await evaluate("!!document.querySelector('#page-content h1')"))break;await delay(50);}await delay(150);};
  await navigate('home');
  const legacy={completed:{'c-sizeof':true},answers:{'c-types-q1':{choice:0,revealed:true,submitted:false,wrong:true,needsReview:true},'c-types-q2':{choice:0,revealed:true,submitted:true,wrong:true,needsReview:true}},drafts:{'weak-code-relative':'// preserved C++ draft'},weakMastered:{list:true},lastLesson:'c-pointer-change',customField:{keep:true}};
  await evaluate(`localStorage.setItem('embedded-study-v1',JSON.stringify(${JSON.stringify(legacy)}))`);
  await send('Page.reload');await delay(300);
  await navigate('home');
  assert.equal(await evaluate("document.querySelectorAll('.today-task').length"),3);
  assert.ok(await evaluate("document.querySelector('.resume-card h2').textContent.includes('p= 与 *p=')"));
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).answers['c-types-q1'].wrong"),false);
  assert.ok(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).customField.keep"));
  const planned=await evaluate("Object.values(JSON.parse(localStorage.getItem('embedded-study-v1')).dailyPlans)[0].lesson");
  await capture('manual-home-desktop');
  await navigate('module/c');
  assert.equal(await evaluate("document.querySelectorAll('.path-chapter').length"),5);
  assert.equal(await evaluate("document.querySelectorAll('.course-card').length"),30);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.course-list')).display"),'flex');
  assert.ok(await evaluate("[...document.querySelectorAll('.course-body strong')].every(el=>!/^\\d+\\s*·/.test(el.textContent))"));
  await capture('manual-path-desktop');
  await evaluate("document.querySelector('[data-action=course-filter][data-value=unfinished]').click()");
  assert.equal(await evaluate("document.querySelectorAll('.course-card').length"),29);
  await navigate('lesson/c-pointer-change');
  const player="document.querySelector('[data-player-key=lesson-c-pointer-change]')";
  assert.equal(await evaluate(player+'.dataset.step'),'0');
  assert.equal(await evaluate(player+".querySelectorAll('.executing').length"),0);
  await delay(600);assert.equal(await evaluate(player+'.dataset.step'),'0','does not autoplay');
  await evaluate(player+".focus()");await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});
  assert.equal(await evaluate(player+'.dataset.step'),'1');
  assert.ok(await evaluate(player+".querySelector('.executing code').textContent.includes('int *p = &a')"));
  const beforeArrow=await evaluate(player+".querySelector('.player-arrow').style.d");
  await evaluate(player+".querySelector('[data-player-action=next]').click()");
  assert.equal(await evaluate(player+'.dataset.step'),'1','prediction precedes state change');
  assert.equal(await evaluate(player+".querySelector('.player-prediction').hidden"),false);
  await evaluate(player+".querySelector('[data-player-answer=\"0\"]').click()");
  assert.equal(await evaluate(player+'.dataset.step'),'2');
  assert.notEqual(await evaluate(player+".querySelector('.player-arrow').style.d"),beforeArrow,'same arrow moves to new target');
  assert.equal(await evaluate(player+".querySelector('[data-cell=b] .memory-value').textContent"),'值 20');
  await evaluate(player+".querySelector('[data-player-action=next]').click();"+player+".querySelector('[data-player-answer=\"0\"]').click()");
  assert.equal(await evaluate(player+'.dataset.step'),'3');
  assert.equal(await evaluate(player+".querySelector('[data-cell=b] .memory-value').textContent"),'值 9');
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).mastery['c-pointer-change']||null"),null,'watching does not master lesson');
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).animationRecords['lesson-c-pointer-change'].predictions[3].correct"),false);
  await evaluate(player+".scrollIntoView({block:'start',behavior:'instant'})");await delay(450);await capture('manual-pointer-desktop');
  await evaluate(player+".querySelector('[data-player-action=prev]').click()");assert.equal(await evaluate(player+".querySelector('[data-cell=b] .memory-value').textContent"),'值 20');
  await evaluate(player+".querySelector('[data-player-action=reset]').click()");assert.equal(await evaluate(player+'.dataset.step'),'0');
  await evaluate(`{const s=${player}.querySelector('[data-player-variant]');s.value='c-pointer-change-alt';s.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<3;i++)${player}.querySelector('[data-player-action=next]').click();}`);
  assert.equal(await evaluate(player+".querySelector('[data-cell=a] .memory-value').textContent"),'值 9');
  assert.equal(await evaluate(player+".querySelector('[data-cell=b] .memory-value').textContent"),'值 20');
  console.log('PASS browser: synchronized steps, prediction, experiment and additive old state.');

  const qid='c-pointer-change-q1',quiz=`document.querySelector('#quiz-${qid}')`;
  await evaluate(quiz+".querySelector('[data-action=choose][data-choice=\"1\"]').click()");
  await evaluate(quiz+".querySelector('[data-action=knowledge]').click()");
  assert.equal(await evaluate("document.querySelector('.knowledge-drawer').getAttribute('role')"),'dialog');
  assert.ok(await evaluate("document.querySelector('.shell').hasAttribute('inert')"));
  assert.equal(await evaluate("document.querySelector('#knowledge-overlay .step-player').dataset.step"),'0');
  assert.ok(await evaluate("document.querySelector('#knowledge-overlay .player-code').textContent.includes('left = 4')"));
  assert.equal(await evaluate(quiz+".querySelectorAll('.quiz-answer').length"),0,'drawer does not reveal current answer');
  await delay(450);await capture('manual-drawer-desktop');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',modifiers:8});
  assert.ok(await evaluate("!!document.activeElement.closest('#knowledge-overlay')"),'focus stays in drawer');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  assert.equal(await evaluate("document.querySelector('#knowledge-overlay')"),null);
  assert.ok(await evaluate(quiz+".querySelector('[data-choice=\"1\"]').classList.contains('selected')"));
  assert.equal(await evaluate("document.activeElement.dataset.action"),'knowledge');
  await evaluate(quiz+".querySelector('[data-action=question-help][data-level=\"2\"]').click()");
  assert.equal(await evaluate(quiz+".querySelectorAll('.quiz-answer').length"),0,'thinking does not reveal answer');
  await evaluate(quiz+".querySelector('[data-action=choose][data-choice=\"0\"]').click();"+quiz+".querySelector('[data-action=submit-answer]').click()");
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).answers['c-pointer-change-q1'].independentCorrect"),false);
  assert.ok(await evaluate(quiz+".querySelector('.quiz-feedback').textContent.includes('借助帮助后答对')"));
  await evaluate(quiz+".querySelector('[data-action=review-reset]').click()");await delay(100);
  assert.equal(await evaluate(quiz+".querySelectorAll('.quiz-answer').length"),0);
  await evaluate(quiz+".querySelector('[data-action=choose][data-choice=\"1\"]').click();"+quiz+".querySelector('[data-action=submit-answer]').click()");
  assert.equal(await evaluate(quiz+".querySelector('.answer-player .step-player').dataset.step"),'2','incorrect answer starts at relevant example step');
  await evaluate(quiz+".querySelector('.answer-player').open=true;"+quiz+".scrollIntoView({behavior:'instant'})");await capture('manual-answer-desktop');
  await evaluate(quiz+".querySelector('[data-action=review-reset]').click()");await delay(100);
  assert.equal(await evaluate(quiz+".querySelectorAll('.quiz-answer').length"),0,'same hash reset works');
  await evaluate(quiz+".focus()");await send('Input.dispatchKeyEvent',{type:'keyDown',key:'1',code:'Digit1'});
  assert.equal(await evaluate(quiz+".querySelectorAll('.option.selected').length"),1,'keyboard selection works');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab'});
  // Native buttons remain operable with Enter; send an actual focused-submit keystroke.
  await evaluate(quiz+".querySelector('[data-action=submit-answer]').focus()");
  assert.equal(await evaluate("document.activeElement.dataset.action"),'submit-answer');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await delay(50);
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).answers['c-pointer-change-q1'].submitted"),true);
  await evaluate("{const n=document.querySelector('[data-note=c-pointer-change]');n.value='<script>window.noteExecuted=1</script>';n.dispatchEvent(new Event('input',{bubbles:true}));}");
  await navigate('lesson/c-pointer-change');
  assert.equal(await evaluate("document.querySelector('[data-note=c-pointer-change]').value"),'<script>window.noteExecuted=1</script>');assert.equal(await evaluate('window.noteExecuted||0'),0);
  await evaluate("document.querySelector('[data-action=complete]').click()");await navigate('home');
  assert.equal(await evaluate("Object.values(JSON.parse(localStorage.getItem('embedded-study-v1')).dailyPlans)[0].lesson"),planned,'daily plan remains stable');
  assert.ok(await evaluate("document.querySelector('.today-task').classList.contains('task-done')"));
  await navigate('review');await evaluate("document.querySelector('[data-action=review-filter][data-value=help]').click()");assert.ok(await evaluate("document.querySelector('#page-content').textContent.includes('借助帮助 / 查看解析')"));

  // Export the real Blob and restore through the same file input used by a student.
  await navigate('sources');
  const exported=await evaluate(`(async()=>{const originalURL=URL.createObjectURL,originalClick=HTMLAnchorElement.prototype.click;let blob,filename;URL.createObjectURL=value=>{blob=value;return originalURL.call(URL,value);};HTMLAnchorElement.prototype.click=function(){filename=this.download;};document.querySelector('[data-action=export]').click();const payload=JSON.parse(await blob.text());URL.createObjectURL=originalURL;HTMLAnchorElement.prototype.click=originalClick;return {filename,payload};})()`);
  assert.match(exported.filename,/嵌入式学习记录-\d{4}-\d{2}-\d{2}\.json/);
  assert.ok(exported.payload.data.weakMastered.list);assert.ok(exported.payload.data.customField.keep);
  assert.equal(exported.payload.data.notes['c-pointer-change'],'<script>window.noteExecuted=1</script>');
  assert.ok(exported.payload.data.animationRecords['lesson-c-pointer-change'].viewed);
  const beforeInvalid=await evaluate("localStorage.getItem('embedded-study-v1')");
  await evaluate(`{const dt=new DataTransfer();dt.items.add(new File([JSON.stringify({version:1,data:{completed:null,answers:{},drafts:{}}})],'invalid.json',{type:'application/json'}));const input=document.querySelector('#import-file');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
  assert.equal(await evaluate("localStorage.getItem('embedded-study-v1')"),beforeInvalid,'malformed backup cannot erase records');
  await evaluate(`{window.confirm=()=>true;const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(${JSON.stringify(exported.payload)})],'restore.json',{type:'application/json'}));const input=document.querySelector('#import-file');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));}`);await delay(100);
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).notes['c-pointer-change']"),'<script>window.noteExecuted=1</script>');
  assert.ok(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).customField.keep"));

  await navigate('lesson/c-pointer-change',390,844);
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await evaluate(player+".scrollIntoView({behavior:'instant'})");await capture('manual-pointer-mobile');
  await evaluate(quiz+".querySelector('[data-action=knowledge]').click()");
  assert.ok(await evaluate("document.querySelector('.knowledge-drawer').getBoundingClientRect().width<=390"));
  assert.ok(await evaluate("[...document.querySelectorAll('#knowledge-overlay button')].filter(e=>e.checkVisibility()).every(e=>e.getBoundingClientRect().height>=44)"),'drawer targets at least 44px');
  await delay(450);await capture('manual-drawer-mobile');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await navigate('home',390,844);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await capture('manual-home-mobile');
  await navigate('module/c',390,844);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));await capture('manual-path-mobile');
  await navigate('lesson/c-dereference',390,844);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.player-arrow')).transitionDuration"),'0s');
  await navigate('mock');await evaluate("document.querySelector('[data-action=mock-start]').click()");assert.equal(await evaluate("document.querySelectorAll('[data-action=knowledge],[data-action=question-help],.quiz-answer').length"),0,'exam blocks assistance and answers until submission');
  assert.deepEqual(errors,[]);
  console.log('PASS browser manual: drawer and focus, no answer leakage, helped vs independent answers, error step, reset, keyboard, notes, daily tasks, 390px screens and reduced motion.');

}finally{if(socket)socket.close();proc.kill();server.close();}
