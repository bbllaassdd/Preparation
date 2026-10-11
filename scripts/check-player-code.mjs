// Execute real C independently of the renderer to check the teaching snapshots.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stepModels} from '../dist/step-player.js';
const compiler=process.env.CC||'D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin/gcc.exe';
const dir=path.resolve('.sites-runtime','player-code-qa');fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'trace.c'),exe=path.join(dir,'trace.exe');
const code=`#include <stdio.h>
void set_value(int n) { n = 7; (void)n; }
void set_target(int *p) { *p = 7; }
int main(void) {
 _Static_assert(sizeof(int)==4, "examples require a 4-byte int");
 {int a=10,b=20;int *p=&a;p=&b;*p=9;printf("normal %d %d %d\\n",a,b,p==&b);}
 {int a=10,b=20;int *p=&a;*p=9;p=&b;printf("reverse %d %d %d\\n",a,b,p==&b);}
 {int x=10;int *p=&x;printf("declare %d %d %d\\n",x,*p,p==&x);}
 {int x=10;int *p=&x;int y=*p;*p=7;printf("dereference %d %d\\n",x,y);}
 {int a[3]={10,20,30};a[1]=7;int *p=&a[0];*p=5;printf("array %d %d %d\\n",a[0],a[1],a[2]);}
 {int x=10;set_value(x);printf("value %d\\n",x);set_target(&x);printf("address %d\\n",x);}
 {int a[2]={10,20};int *p=&a[0];*p=7;p++;(*p)++;p++;printf("arithmetic %d %d %d\\n",a[0],a[1],p==a+2);}
 {int x=50;int a[3]={10,20,30};printf("sizeof %d %zu %zu %zu\\n",x,sizeof(x),sizeof(a),sizeof(a)/sizeof(a[0]));}
 {int left=4,right=12;int *cursor=&left;cursor=&right;*cursor=6;printf("help %d %d %d\\n",left,right,cursor==&right);}
 return 0;
}`;
fs.writeFileSync(file,code);const env={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
const compiled=spawnSync(compiler,['-std=c11','-Wall','-Wextra','-pedantic',file,'-o',exe],{encoding:'utf8',windowsHide:true,timeout:20000,env});assert.equal(compiled.status,0,compiled.stderr);
const result=spawnSync(exe,[],{encoding:'utf8',windowsHide:true,timeout:5000,env});assert.equal(result.status,0,result.stderr);
const output=Object.fromEntries(result.stdout.trim().split(/\r?\n/).map(line=>{const [name,...values]=line.split(' ');return [name,values];}));
const final=id=>stepModels[id].frames.at(-1);const values=id=>final(id).cells.filter(c=>!c.hidden&&!c.pointer&&c.id!=='end').map(c=>c.value);
assert.deepEqual(output.normal.slice(0,2),values('c-pointer-change'));assert.deepEqual(output.reverse.slice(0,2),values('c-pointer-change-alt'));
assert.deepEqual(output.dereference,values('c-dereference'));assert.deepEqual(output.array,values('c-array-start'));
assert.deepEqual(output.arithmetic.slice(0,2),values('c-pointer'));assert.deepEqual(output.help.slice(0,2),values('help-pointer'));
assert.equal(output.value[0],stepModels['c-function-start'].frames[3].cells[0].value);assert.equal(output.address[0],values('c-function-start')[0]);
assert.deepEqual(output.sizeof,['50','4','12','3']);assert.deepEqual(output.declare,['10','10','1']);
for(const name of ['normal','reverse','arithmetic','help'])assert.equal(output[name].at(-1),'1');
console.log('PASS player C: compiled and executed pointer order, declaration, copy/write, array, function calls, arithmetic, sizeof and independent drawer example.');
