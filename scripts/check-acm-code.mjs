import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {acmBasics} from '../dist/acm-basics.js';
import {lessonCoding} from '../dist/lesson-coding.js';
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const dir=path.resolve('.sites-runtime','acm-code-qa');fs.mkdirSync(dir,{recursive:true});
const programs=[...acmBasics.map(c=>({...c,program:c})),...lessonCoding.map(c=>({...c,program:c.acm}))];
assert.equal(acmBasics.length,48);assert.equal(programs.length,70);
let cases=0;
for(const [index,c] of programs.entries()){
 const isC=c.language==='C11',compiler=isC?(process.env.CC||path.join(bin,'gcc.exe')):(process.env.CXX||path.join(bin,'g++.exe'));
 const source=path.join(dir,c.id+(isC?'.c':'.cpp')),exe=path.join(dir,c.id+'.exe');
 fs.writeFileSync(source,c.program.solution);
 const env={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
 const build=spawnSync(compiler,['-std='+(isC?'c11':'c++17'),'-Wall','-Wextra','-Werror','-pedantic',source,'-o',exe],{encoding:'utf8',windowsHide:true,env});
 if(build.error)throw build.error;
 assert.equal(build.status,0,c.id+'\n'+build.stderr);
 const tests=[...c.program.tests];
 if(c.id==='lab-first-unique')tests.push({input:'a\0a\n',output:'1\n'});
 if(c.id.endsWith('-eof'))tests.push({input:'1 2\n3',output:'3\n'});
 if(c.id.endsWith('-prime'))tests.push({input:'121\n',output:'NO\n'},{input:'1000000000\n',output:'NO\n'});
 if(c.id.endsWith('-bubble')){
  const a=Array.from({length:200},(_,i)=>199-i);
  tests.push({input:'200\n'+a.join(' ')+'\n',output:[...a].sort((a,b)=>a-b).join(' ')+'\n'});
 }
 if(c.id.endsWith('-array-sum'))tests.push({input:'1000\n'+Array(1000).fill(-1000000).join(' ')+'\n',output:'-1000000000\n'});
 if(c.id.endsWith('-palindrome'))tests.push({input:'a'.repeat(1000)+'\n',output:'YES\n'});
 if(c.id.endsWith('-line-stats'))tests.push({input:'a'.repeat(500)+'7'.repeat(500)+'\n',output:'500 500\n'});
 if(c.id==='lab-template-ring')tests.push({input:'8\nP 8\nO\nO\nP -3\nS\nO\nS\nO\n',output:'OK\n8\nEMPTY\nOK\n1\n-3\n0\nEMPTY\n'});
 for(const t of tests){
  const run=spawnSync(exe,[],{input:t.input,encoding:'utf8',windowsHide:true,env,timeout:5000});
  if(run.error)throw run.error;
  assert.equal(run.status,0,c.id+' exit '+run.stderr);
  assert.equal(run.stdout.replace(/\r\n/g,'\n'),t.output,c.id+' input '+JSON.stringify(t.input));
  cases++;
 }
 if((index+1)%10===0)console.log('Compiled and ran',index+1,'/',programs.length);
}
console.log('PASS ACM:',programs.length,'standalone C11/C++17 programs,',cases,'input/output cases; warnings treated as errors.');
