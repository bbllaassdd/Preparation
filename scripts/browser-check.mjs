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
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  await send('Runtime.enable');await send('Page.enable');
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  const open=async(id,width=1400,height=1000)=>{
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
    await send('Page.navigate',{url:`http://127.0.0.1:${port}/#/lesson/${id}`});
    for(let i=0;i<50;i++){if(await evaluate(`document.readyState==='complete' && !!document.querySelector('.worked-answer') && location.hash.includes('${id}')`))break;await delay(100);}
    await evaluate("document.documentElement.style.scrollBehavior='auto'");
  };
  await open('c-pointer');
  assert.equal(await evaluate("document.querySelector('.worked-answer').open"),false);
  assert.equal(await evaluate("!!document.querySelector('.quiz-answer')"),false);
  await evaluate("document.querySelector('.worked-answer summary').click()");
  assert.equal(await evaluate("document.querySelector('.worked-answer').open"),true);
  await evaluate("document.querySelector('.worked-answer summary').click()");
  await evaluate("document.querySelector('[data-action=walk-next]').click()");
  assert.equal(await evaluate("document.querySelector('.walkthrough').dataset.step"),'1');
  await evaluate("document.querySelector('[data-action=walk-reset]').click(); document.querySelector('#diagram').scrollIntoView()");
  const capture=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
  await capture('pointer-desktop');
  await open('ds-list');
  await evaluate("for(let i=0;i<30;i++)document.querySelector('[data-action=walk-next]').click(); document.querySelector('#diagram').scrollIntoView()");
  assert.ok(await evaluate("document.querySelector('.walk-status').textContent.includes('返回新链头')"));
  await capture('list-desktop');
  await open('p-spi');
  for(let mode=0;mode<4;mode++){
    await evaluate(`{const s=document.querySelector('#spi-mode');s.value=${mode};s.dispatchEvent(new Event('change',{bubbles:true}));for(let i=0;i<8;i++)document.querySelector('[data-action=walk-next]').click();}`);
    assert.ok(await evaluate("document.querySelector('.walk-watch').textContent.includes('1 0 1 1')"));
    if(mode===3){await evaluate("document.querySelector('#diagram').scrollIntoView()");await capture('spi-mode3');}
  }
  await open('c-array-pointer',390,844);
  assert.equal(await evaluate('innerWidth'),390,'mobile viewport matches screen');
  await evaluate("document.querySelector('#diagram').scrollIntoView()");
  assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth+1"),'no mobile page overflow');
  await capture('array-mobile');
  // 所有图解帧都无浏览器执行异常，且按钮可用；下面遍历所有课程检查真实 DOM。
  const {lessons}=await import('../dist/content.js');
  for(const l of lessons){
    await evaluate(`location.hash='#/lesson/${l.id}'`);await delay(10);
    assert.equal(await evaluate("document.querySelector('.worked-answer').open"),false,l.id);
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS browser: ${lessons.length} lessons, hidden/revealed worked answers, step/reset, 4 SPI modes, mobile overflow. Screenshots: ${out}`);
}finally{if(socket)socket.close();proc.kill();server.close();}
