// 从题库读取实际代码，核对复述题的数值与非法选项；不运行未定义行为。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {phoneChoices,phoneWritten} from '../dist/phone-exam.js';
const bank=Object.fromEntries([...phoneChoices,...phoneWritten].map(q=>[q.id,q]));
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const dir=path.resolve('.sites-runtime','phone-exam-qa');fs.mkdirSync(dir,{recursive:true});
function build(name,code,isCpp=false,valid=true){
 const compiler=isCpp?(process.env.CXX||path.join(bin,'g++.exe')):(process.env.CC||path.join(bin,'gcc.exe'));
 const env={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
 const source=path.join(dir,name+(isCpp?'.cpp':'.c')),exe=path.join(dir,name+'.exe');fs.writeFileSync(source,code);
 const r=spawnSync(compiler,['-std='+(isCpp?'c++17':'c11'),'-pedantic-errors',source,'-o',exe],{encoding:'utf8',windowsHide:true,env,timeout:20000});
 if(r.error)throw r.error;
 if(!valid){assert.notEqual(r.status,0,name+' must fail compilation');return;}
 assert.equal(r.status,0,name+'\n'+r.stderr);
 const run=spawnSync(exe,[],{encoding:'utf8',windowsHide:true,env,timeout:5000});
 if(run.error)throw run.error;assert.equal(run.status,0,name+' runtime assertions\n'+run.stderr);
}
const cases=[
 ['phone-macro-expanded','assert(a==1);'],
 ['phone-cast','assert(r1==1.5 && r2==1.0);'],
 ['phone-offset','assert(p[7]==13 && p[0]==6);'],
 ['phone-clear-bit','flag &= ~4u; assert(flag==0xABu); flag &= ~4u; assert(flag==0xABu);'],
 ['phone-enum','assert(RED==0 && GREEN==1 && BLUE==2);'],
 ['phone-pointer-array','assert(sizeof(files)==4*sizeof(char*));'],
 ['phone-padding','assert(sizeof(int)==4 && _Alignof(int)==4); assert(sizeof(struct S)==12 && offsetof(struct S,i)==4 && offsetof(struct S,c2)==8);'],
 ['phone-meter',"assert(sizeof(a)==6 && strlen(a)==5 && a[5]=='\\0');"]
];
build('numeric', '#include <assert.h>\n#include <stddef.h>\n#include <string.h>\n'+cases.map(([id,check],i)=>`static void test${i}(void){\n${bank[id].code}\n${check}\n}`).join('\n')+'\nint main(void){'+cases.map((_,i)=>`test${i}();`).join('')+'return 0;}');
for(const [i,option] of bank['phone-array-inc'].options.entries())build('array-'+i,'int main(void){\n'+bank['phone-array-inc'].code+'\n'+option+'; return 0;}\n',false,i!==bank['phone-array-inc'].answer);
for(const [i,option] of bank['phone-overload'].options.entries()){
 // 顶层 const 与参数改名是重复声明，编译可通过，但并非重载；这里只验证返回类型冲突与合法重载。
 if(i!==0 && i!==bank['phone-overload'].answer)continue;
 build('overload-'+i,option+'\nint main(){return 0;}\n',true,i===bank['phone-overload'].answer);
}
build('public',bank['phone-public'].code+'\nint main(){Base b;Derived d;b.value=1;d.value=2;return d.value!=2;}\n',true);
build('pure-virtual','struct Base{'+bank['phone-pure-virtual'].options[bank['phone-pure-virtual'].answer]+'}; struct Derived:Base{void func() override{}}; int main(){Derived d;Base &b=d;b.func();}\n',true);
console.log('PASS phone exam: 8 numeric snippets, 4 array expressions, return-type conflict, legal overload, public inheritance and pure virtual override.');
