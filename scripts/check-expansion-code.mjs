import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {expansionCoding} from '../dist/expansion-coding.js';
const dir=path.resolve('.sites-runtime/expansion-code-qa');
fs.mkdirSync(dir,{recursive:true});
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const cc=process.env.CC||(process.platform==='win32'?path.join(bin,'gcc.exe'):'cc');
const cxx=process.env.CXX||(process.platform==='win32'?path.join(bin,'g++.exe'):'c++');
const env={...process.env,PATH:path.dirname(cc)+path.delimiter+process.env.PATH};
function run(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',windowsHide:true,env,timeout:60000});if(r.error)throw r.error;if(r.status!==0)throw Error(r.stderr||r.stdout||'exit '+r.status);if(r.stdout)process.stdout.write(r.stdout);}
const find=id=>expansionCoding.find(c=>c.id===id).solution;
const cFile=path.join(dir,'valley.c'),obj=path.join(dir,'valley.o');
fs.writeFileSync(cFile,find('valley-count-c')+'\n'+find('valley-longest-c'));
run(cc,['-std=c11','-Wall','-Wextra','-Werror','-pedantic','-c',cFile,'-o',obj]);
const tests=String.raw`
#include <cassert>
#include <climits>
#include <iostream>
extern "C" {
std::size_t count_valleys(const int*,std::size_t);
std::size_t longest_valley_constant(const int*,std::size_t);
}
std::size_t brute_longest(const std::vector<int>& a){
    std::size_t best=0;
    for(std::size_t l=0;l<a.size();++l)
      for(std::size_t r=l+2;r<a.size();++r)
        for(std::size_t bottom=l+1;bottom<r;++bottom){
          bool ok=true;
          for(std::size_t i=l+1;i<=bottom;++i) if(a[i]>=a[i-1])ok=false;
          for(std::size_t i=bottom+1;i<=r;++i) if(a[i]<=a[i-1])ok=false;
          if(ok)best=std::max(best,r-l+1);
        }
    return best;
}
void check(const std::vector<int>& a){
    std::size_t strict=0,flat=0;
    for(std::size_t i=1;i+1<a.size();++i)
      strict+=(a[i-1]>a[i] && a[i+1]>a[i]);
    // Independent oracle: compress equal neighbors, then count local minima.
    std::vector<int> compressed;
    for(int x:a)if(compressed.empty()||compressed.back()!=x)compressed.push_back(x);
    for(std::size_t i=1;i+1<compressed.size();++i)
      flat+=(compressed[i-1]>compressed[i] && compressed[i+1]>compressed[i]);
    assert(count_valleys(a.data(),a.size())==strict);
    assert(count_plateau_valleys(a)==flat);
    const auto expected=brute_longest(a);
    assert(longest_valley(a)==expected);
    assert(longest_valley_constant(a.data(),a.size())==expected);
}
int main(){
    std::size_t count=0;
    for(std::size_t n=0;n<=8;++n){
      std::size_t combos=1;for(std::size_t i=0;i<n;++i)combos*=3;
      for(std::size_t mask=0;mask<combos;++mask){
        std::size_t v=mask;std::vector<int>a(n);
        for(auto& x:a){x=static_cast<int>(v%3)-1;v/=3;}
        check(a);++count;
      }
    }
    for(const std::vector<int>& a:std::vector<std::vector<int>>{
      {INT_MAX,INT_MIN,INT_MAX},{INT_MIN,0,INT_MAX},
      {INT_MAX,INT_MIN,INT_MIN,INT_MAX},{9,7,4,6,8,3,5},
      {6,3,5,2,4,7},{5,2,2,6,1,4}})check(a);
    assert(count_valleys(nullptr,0)==0);
    assert(longest_valley_constant(nullptr,0)==0);
    std::cout<<"PASS: 4 published C11/C++17 valley solutions; "<<count
             <<" exhaustive arrays plus integer extremes and published examples.\n";
}
`;
const cpp=path.join(dir,'valley.cpp'),exe=path.join(dir,process.platform==='win32'?'valley.exe':'valley');
fs.writeFileSync(cpp,find('valley-plateau-cpp')+'\n'+find('valley-longest-cpp')+'\n'+tests);
run(cxx,['-std=c++17','-Wall','-Wextra','-Werror','-pedantic',cpp,obj,'-o',exe]);run(exe,[]);
const linux=path.join(dir,'linux-launch.c');
fs.writeFileSync(linux,find('linux-launch-c')+String.raw`
#include <assert.h>
#include <stdio.h>
int main(void){
    int status=-1;
    char *yes[]={"true",NULL},*no[]={"false",NULL};
    assert(run_program("/bin/true",yes,&status)==0);
    assert(WIFEXITED(status)&&WEXITSTATUS(status)==0);
    assert(run_program("/bin/false",no,&status)==0);
    assert(WIFEXITED(status)&&WEXITSTATUS(status)!=0);
    assert(run_program("/__study_nonexistent_program__",yes,&status)==0);
    assert(WIFEXITED(status)&&WEXITSTATUS(status)==127);
    char *end[]={"sh","-c","exit 127",NULL};
    assert(run_program("/bin/sh",end,&status)==0);
    assert(WIFEXITED(status)&&WEXITSTATUS(status)==127);
    char *sig[]={"sh","-c","kill -TERM $$",NULL};
    assert(run_program("/bin/sh",sig,&status)==0 && WIFSIGNALED(status));
    status=-1;
    assert(run_program(NULL,yes,&status)==-1&&errno==EINVAL&&status==-1);
    puts("PASS: Linux fork/exec/wait success, failure, exit-127 ambiguity and signal status.");
}
`);
if(process.platform==='linux'){
  const linuxExe=path.join(dir,'linux-launch');
  run(cc,['-std=c11','-Wall','-Wextra','-Werror','-pedantic',linux,'-o',linuxExe]);run(linuxExe,[]);
}else console.log('SKIP Linux process runtime test on Windows. Generated Linux harness: '+linux);
