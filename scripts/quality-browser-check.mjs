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
  const navigate=async(route,width=1440,height=1000)=>{await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});await send('Page.navigate',{url:`http://127.0.0.1:${port}/#/${route}`});for(let i=0;i<100;i++){if(await evaluate(`document.readyState==='complete' && document.querySelector('#page-content')?.dataset.route===${JSON.stringify(route.split('/')[0])} && document.querySelector('#page-content')?.dataset.routeArg===${JSON.stringify(route.split('/')[1]||'')}`))break;await delay(50);}await evaluate('document.fonts.ready.then(()=>true)');await delay(150);};

  await navigate('home');
  await evaluate("localStorage.clear()");await send('Page.reload');await delay(250);
  await capture('quality-01-home-desktop');
  await navigate('lesson/c-pointer-change');
  assert.equal(await evaluate("document.querySelectorAll('.depth-chain>li').length"),3);
  assert.equal(await evaluate("document.querySelector('.depth-check-answer').open"),false);
  assert.ok(await evaluate("document.querySelector('#diagram').compareDocumentPosition(document.querySelector('#exercises')) & Node.DOCUMENT_POSITION_FOLLOWING"),'diagram precedes exercises');
  assert.ok(await evaluate("document.querySelector('#worked').compareDocumentPosition(document.querySelector('#exercises')) & Node.DOCUMENT_POSITION_FOLLOWING"),'worked teaching precedes exercises');
  await capture('quality-02-lesson-desktop');
  const hash=await evaluate('location.hash');
  await evaluate("document.querySelector('[data-reading-anchor=exercises]').click()");await delay(600);
  assert.equal(await evaluate('location.hash'),hash,'same-page outline does not navigate away');
  assert.ok(await evaluate("document.querySelector('#exercises').getBoundingClientRect().top>=document.querySelector('.reading-outline').getBoundingClientRect().bottom-1"),'outline does not hide the destination');
  assert.ok(await evaluate("document.querySelector('[data-reading-anchor=exercises]').classList.contains('reading-active')"));
  assert.equal(await evaluate('document.activeElement.id'),'exercises');
  const answerCount=await evaluate("Object.keys(JSON.parse(localStorage.getItem('embedded-study-v1')).answers).length");
  await evaluate("document.querySelector('.depth-check-answer').open=true");
  assert.equal(await evaluate("Object.keys(JSON.parse(localStorage.getItem('embedded-study-v1')).answers).length"),answerCount,'reading a check does not submit a quiz');
  const qid='quality-pointer-order',quiz=`document.querySelector('#quiz-${qid}')`;
  await evaluate(quiz+".scrollIntoView({behavior:'instant',block:'start'})");
  assert.equal(await evaluate(quiz+".querySelectorAll('.quiz-answer').length"),0);
  assert.equal(await evaluate(quiz+".querySelectorAll('.help-text').length"),0);
  const text=await evaluate(quiz+".querySelector('.codeblock code').textContent");
  assert.ok(text.includes('int *q=p;')&&text.includes('printf("%d %d\\n", x, y);'),'syntax highlighting preserves source text');
  assert.ok(await evaluate(quiz+".querySelectorAll('.syntax-keyword').length>0"));
  await capture('quality-03-problem-desktop');
  await evaluate(quiz+".querySelector('[data-action=choose][data-choice=\"0\"]').click();"+quiz+".querySelector('[data-action=submit-answer]').click()");
  assert.ok(await evaluate(quiz+".querySelector('.answer-wrong').textContent.includes('q')"));
  assert.equal(await evaluate(quiz+".querySelector('.option.selected .letter').textContent"),'A');
  assert.equal(await evaluate("getComputedStyle("+quiz+".querySelector('.option.selected .letter')).backgroundColor"),'rgba(0, 0, 0, 0)');
  assert.ok(await evaluate(quiz+".querySelector('.quiz-answer').textContent.includes('6 10')"));
  assert.ok(await evaluate("JSON.parse(localStorage.getItem('embedded-study-v1')).answers['quality-pointer-order'].wrong"));
  await evaluate(quiz+".querySelector('.quiz-answer').scrollIntoView({behavior:'instant',block:'start'})");await capture('quality-04-feedback-desktop');
  await navigate('lesson/p-spi');
  await evaluate("document.querySelector('.walkthrough').focus()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});
  assert.equal(await evaluate("document.querySelector('.walkthrough').dataset.step"),'1');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft'});
  assert.equal(await evaluate("document.querySelector('.walkthrough').dataset.step"),'0');
  await navigate('lesson/linux-devicetree');
  assert.ok(await evaluate("document.querySelector('.depth-chain').textContent.includes('DTB')"));
  await capture('quality-05-linux-desktop');
  await navigate('module/c');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.course-current')).backgroundColor"),'rgb(231, 237, 227)');
  await capture('quality-06-path-desktop');
  await navigate('lesson/c-pointer-change',390,844);
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
  await capture('quality-07-lesson-mobile');
  await evaluate(quiz+".scrollIntoView({behavior:'instant',block:'start'})");
  assert.ok(await evaluate("[...document.querySelectorAll('.option')].every(b=>b.getBoundingClientRect().height>=44)"));
  await capture('quality-08-problem-mobile');
  await evaluate(quiz+".querySelector('[data-action=review-reset]').click()");await delay(200);
  await evaluate(quiz+".querySelector('[data-action=knowledge]').click()");await delay(450);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.knowledge-body .player-controls')).position"),'static','drawer controls do not cover its code');
  assert.equal(await evaluate("document.querySelector('#knowledge-overlay .step-player').dataset.step"),'0');
  await capture('quality-09-drawer-mobile');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  const topics=['c-sizeof','c-array-pointer','cpp-ctor','mem-sections','arm-exception','ds-valley','os-sync','stm32-uartdma','p-spi','r-priority-inversion','linux-devicetree','e-debug','n-tcpudp','pr-watch'];
  for(const width of [320,390,768,1440])for(const id of topics){await navigate('lesson/'+id,width,900);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),id+' '+width);assert.equal(await evaluate("document.querySelectorAll('.depth-chain>li').length"),3,id);assert.ok(await evaluate("document.querySelector('.oral-block>p').textContent.length<180"));assert.equal(await evaluate("document.querySelector('.depth-check-answer').open"),false);}
  await navigate('lesson/c-pointer-change',390,844);await evaluate("document.querySelector('[data-reading-anchor=exercises]').click()");await delay(600);
  assert.ok(await evaluate("document.querySelector('#exercises').getBoundingClientRect().top>=document.querySelector('.reading-outline').getBoundingClientRect().bottom-1"));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.option')).transitionDuration"),'0s');
  await navigate('lesson/p-spi',390,844);assert.equal(await evaluate("getComputedStyle(document.querySelector('.walk-canvas svg path')).transitionDuration"),'0s');
  assert.deepEqual(errors,[]);
  console.log('PASS quality browser: reading order/anchors/focus, hidden answers, transfer grading, syntax integrity, keyboard SPI, mobile drawer, 56 cross-module layouts at 320/390/768/1440 px, reduced motion.');
}finally{if(socket)socket.close();proc.kill();server.close();}
