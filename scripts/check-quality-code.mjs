import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {qualityQuestions} from '../dist/quality-questions.js';
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const dir=path.resolve('.sites-runtime/quality-code');fs.mkdirSync(dir,{recursive:true});
const env={...process.env,PATH:bin+path.delimiter+process.env.PATH};
function run(name,code,cpp,expected){const file=path.join(dir,name+(cpp?'.cpp':'.c')),exe=path.join(dir,name+'.exe');fs.writeFileSync(file,code);const result=spawnSync(path.join(bin,cpp?'g++.exe':'gcc.exe'),[cpp?'-std=c++17':'-std=c11','-Wall','-Wextra','-pedantic',file,'-o',exe],{encoding:'utf8',windowsHide:true,timeout:20000,env});assert.equal(result.status,0,result.stderr);const executed=spawnSync(exe,[],{encoding:'utf8',windowsHide:true,timeout:5000,env});assert.equal(executed.status,0,executed.stderr);assert.equal(executed.stdout.replace(/\r\n/g,'\n').trim(),expected,name);}
for(const [id,cpp,output] of [['quality-pointer-order',false,'6 10'],['quality-ctor-order',true,'12'],['quality-move-meaning',true,'copy']])run(id,qualityQuestions.find(q=>q.id===id).code,cpp,output);
run('c-checkpoints',`#include <stdio.h>
#include <string.h>
#include <stdint.h>
int main(void){
 int x=3;size_t size=sizeof(x++);printf("%d %d\\n",x,(int)(size==sizeof(int)));
 int a=3,b=2;printf("%.1f %.1f\\n",(double)(a/b),(double)a/b);
 int grid[2][3];int (*p)[3]=grid;printf("%zu\\n",sizeof(*p)/sizeof(int));
 unsigned char bytes[2]={1,2};printf("%u\\n",((unsigned)bytes[0]<<8)|bytes[1]);
 int nums[5]={1,2,3,4,5};memmove(nums+1,nums,4*sizeof nums[0]);for(int i=0;i<5;i++)printf("%d",nums[i]);puts("");
 uint32_t flag=0;flag^=4u;printf("%u\\n",(unsigned)flag);flag&=~4u;printf("%u\\n",(unsigned)flag);
 return 0;
}`,false,'3 1\n1.0 1.5\n3\n258\n11234\n4\n0');
run('cpp-reference-checkpoint',`#include <iostream>
int main(){int n=1;auto x=n;auto &r=n;n=4;std::cout<<x<<" "<<r;}`,true,'1 4');
const strict=a=>a.reduce((n,v,i)=>n+(i>0&&i<a.length-1&&v<a[i-1]&&v<a[i+1]?1:0),0);
assert.equal(strict([5,2,2,4,1,3]),1);assert.equal(strict([3,1,1,4]),0);
function longest(a){const n=a.length,down=Array(n).fill(1),up=Array(n).fill(1);for(let i=1;i<n;i++)if(a[i]<a[i-1])down[i]=down[i-1]+1;for(let i=n-2;i>=0;i--)if(a[i]<a[i+1])up[i]=up[i+1]+1;return Math.max(0,...a.map((_,i)=>down[i]>1&&up[i]>1?down[i]+up[i]-1:0));}
function oracle(a){let best=0;for(let l=0;l<a.length;l++)for(let r=l+2;r<a.length;r++)for(let k=l+1;k<r;k++){let valid=true;for(let i=l;i<k;i++)valid&&=a[i]>a[i+1];for(let i=k;i<r;i++)valid&&=a[i]<a[i+1];if(valid)best=Math.max(best,r-l+1);}return best;}
let cases=0;for(let n=0;n<=7;n++)for(let encoded=0;encoded<3**n;encoded++){let value=encoded;const a=Array.from({length:n},()=>{const v=value%3;value=Math.floor(value/3);return v;});assert.equal(longest(a),oracle(a),JSON.stringify(a));cases++;}
assert.equal([0,2,5,10][3]-[0,2,5,10][1],8);
assert.equal(2304*10/115200,.2);assert.equal(1e6/(9+1)/(999+1),100);assert.equal(1e6/2000,500);
console.log('PASS quality code: 5 real C/C++ programs, six C rules, '+cases+' exhaustive valley cases, prefix and hardware/throughput arithmetic.');
