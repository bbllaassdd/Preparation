import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {weakChoices,weakWritten} from '../dist/weak-focus.js';
import {weakCoding} from '../dist/weak-coding.js';
const bank=Object.fromEntries([...weakChoices,...weakWritten].map(q=>[q.id,q]));
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const dir=path.resolve('.sites-runtime','weak-code-qa');fs.mkdirSync(dir,{recursive:true});
let checks=0;
function build(id,code,cpp=false){
 const compiler=cpp?(process.env.CXX||path.join(bin,'g++.exe')):(process.env.CC||path.join(bin,'gcc.exe'));
 const env={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
 const file=path.join(dir,id+(cpp?'.cpp':'.c')),exe=path.join(dir,id+'.exe');fs.writeFileSync(file,code);
 const r=spawnSync(compiler,['-std='+(cpp?'c++17':'c11'),'-Wall','-Wextra','-pedantic',file,'-o',exe],{encoding:'utf8',windowsHide:true,env,timeout:20000});
 if(r.error)throw r.error;assert.equal(r.status,0,id+'\n'+r.stderr);
 return input=>{const result=spawnSync(exe,[],{input,encoding:'utf8',windowsHide:true,env,timeout:5000});if(result.error)throw result.error;assert.equal(result.status,0,id+'\n'+result.stderr);checks++;return result.stdout.replace(/\r\n/g,'\n');};
}
for(const c of weakCoding){
 const run=build(c.id,c.solution,c.language==='C++17');const cases=[...c.tests];
 if(c.id==='weak-code-insert'){
  for(const a of [[],[1],[1,2,3],[-4,0,7,7]])for(let k=0;k<=a.length;k++){
   const expected=[...a];expected.splice(k,0,99);
   cases.push({input:a.length+'\n'+a.join(' ')+'\n'+k+' 99\n',output:expected.join(' ')+'\n'});
  }
  const a=Array.from({length:1000},(_,i)=>i-500),expect=[...a];expect.splice(500,0,12345);
  cases.push({input:'1000\n'+a.join(' ')+'\n500 12345\n',output:expect.join(' ')+'\n'});
 }
 if(c.id==='weak-code-relative'){
  const a=[10,20,30,40,50];
  for(let k=0;k<a.length;k++)for(let t=-6;t<=6;t++)cases.push({input:'5\n'+a.join(' ')+'\n'+k+' '+t+'\n',output:((k+t>=0&&k+t<a.length)?a[k+t]:'INVALID')+'\n'});
 }
 if(c.id==='weak-code-bit')for(const x of [0,1,2,32768,65535,43690])for(const b of [0,1,2,7,15]){
  // 用除法提取位和加减构造预期，避免复制 C 答案的按位写法。
  const value=2**b,has=Math.floor(x/value)%2===1;
  cases.push({input:x+' '+b+'\n',output:[has?x:x+value,has?x-value:x,has?x-value:x+value].join(' ')+'\n'});
 }
 if(c.id==='weak-code-average')cases.push({input:'1\n1000000\n',output:'1000000.00\n'},{input:'6\n1 1 1 1 1 2\n',output:'1.17\n'},{input:'1000\n'+Array(1000).fill(-1000000).join(' ')+'\n',output:'-1000000.00\n'});
 for(const t of cases)assert.equal(run(t.input),t.output,c.id+' input '+t.input.slice(0,80));
}
const macro=bank['weak-original-macro'].code;
assert.equal(build('original-macro',macro)(''),'1\n');
assert.equal(build('fixed-macro',macro.replace('#define SQR(X) X*X','#define SQR(X) ((X)*(X))'))(''),'10\n');
const snippets=[
 ['weak-original-offset','assert(b==13);'],
 ['weak-offset-negative','assert(x==20);'],
 ['weak-offset-difference','assert(q-p==4 && (q-p)*(int)sizeof(int)==16);'],
 ['weak-bits-sequence','assert(x==0xA4u);'],
 ['weak-bits-field','x=(x & ~0x70u)|(v<<4); assert(x==0xBDu);'],
 ['weak-cast-timing','assert(x==2.0 && y==2.5 && z==2.5);'],
 ['weak-macro-square','assert(x==5 && y==9);'],
 ['weak-array-post','assert(x==1 && y==2 && p==&a[1]);']
];
const functions=snippets.map(([id,check],i)=>`static void test${i}(void){\n${bank[id].code}\n${check}\n}`).join('\n');
const originalDecl=bank['weak-original-declare'].options[2].split(';')[0]+';';
const types=`${originalDecl}\n_Static_assert(_Generic(f, int*(*)(int):1, default:0), "f returns int pointer");\n_Static_assert(sizeof(int)==4, "numeric tests use the stated 4-byte int ABI");`;
assert.equal(build('snippets','#include <assert.h>\n'+types+'\n'+functions+'\nint main(void){'+snippets.map((_,i)=>`test${i}();`).join('')+'return 0;}')(''),'');
console.log('PASS weak questions:',weakCoding.length,'standalone C/C++ programs,',checks,'runtime checks; original macro vs repaired macro and pointer/mask/cast snippets.');
