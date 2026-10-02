import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {examChallenges} from '../dist/exam-challenges.js';
const compiler=process.env.CXX||'D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin/g++.exe';
const dir=path.resolve('.sites-runtime','exam-code-qa');
fs.mkdirSync(dir,{recursive:true});
const header=[
 '#include <algorithm>','#include <array>','#include <cassert>','#include <climits>',
 '#include <cstdint>','#include <cstddef>','#include <functional>','#include <memory>',
 '#include <optional>','#include <queue>','#include <stdexcept>','#include <string>',
 '#include <utility>','#include <vector>','#include <iostream>',
 'struct Node { int val=0; Node *next=nullptr,*left=nullptr,*right=nullptr; };'
].join('\n');
const main=String.raw`
int main(){
  assert(longest("")==0 && longest("abba")==2 && longest("abcaef")==5);
  for(unsigned n=0;n<7;++n){
    unsigned total=1;for(unsigned i=0;i<n;++i)total*=3;
    for(unsigned mask=0;mask<total;++mask){
      unsigned x=mask;std::string s;
      for(unsigned i=0;i<n;++i){s+=char('a'+x%3);x/=3;}
      size_t expected=0;
      for(size_t i=0;i<s.size();++i){
        std::array<bool,256> seen{};
        for(size_t j=i;j<s.size();++j){
          unsigned char c=s[j];if(seen[c])break;seen[c]=true;
          expected=std::max(expected,j-i+1);
        }
      }
      assert(longest(s)==expected);
    }
  }
  std::string bytes;bytes+=char(0xFF);bytes+=char(0x80);bytes+=char(0xFF);
  assert(longest(bytes)==2);
  for(int n=0;n<25;++n)for(int rot=0;rot<std::max(1,n);++rot){
    std::vector<int>a;for(int i=0;i<n;++i)a.push_back(i*3);
    if(n)std::rotate(a.begin(),a.begin()+rot,a.end());
    for(int x=-1;x<=n*3;++x){
      auto it=std::find(a.begin(),a.end(),x);
      int expected=it==a.end()?-1:int(it-a.begin());
      assert(rotated(a,x)==expected);
    }
  }
  for(int n=0;n<12;++n)for(int target=-1;target<n;++target){
    std::vector<Node>nodes(n);
    for(int i=0;i<n;++i)nodes[i].next=i+1<n?&nodes[i+1]:nullptr;
    if(n&&target>=0)nodes.back().next=&nodes[target];
    assert(entry(n?&nodes[0]:nullptr)==(target>=0?&nodes[target]:nullptr));
  }
  for(unsigned mask=0;mask<729;++mask){
    unsigned x=mask;std::vector<int>t;
    for(int i=0;i<6;++i){t.push_back(20+x%3);x/=3;}
    auto actual=waits(t);
    for(size_t i=0;i<t.size();++i){
      int expected=0;
      for(size_t j=i+1;j<t.size();++j)if(t[j]>t[i]){expected=int(j-i);break;}
      assert(actual[i]==expected);
    }
  }
  assert(waits({}).empty());
  Node root,left,right,wrong;
  root.val=10;left.val=5;right.val=15;wrong.val=12;
  root.left=&left;root.right=&right;left.right=&wrong;
  assert(!valid(&root));left.right=nullptr;assert(valid(&root));
  left.val=10;assert(!valid(&root));left.val=INT_MIN;right.val=INT_MAX;assert(valid(&root));
  assert(valid(nullptr));
  assert(coins_min({1,3,4},6)==2 && coins_min({2,4},7)==-1);
  assert(coins_min({},0)==0 && coins_min({},5)==-1 && coins_min({2},0)==0);
  int32_t out=77;
  assert(parse_i32("2147483647",&out)&&out==INT32_MAX);
  assert(parse_i32("-2147483648",&out)&&out==INT32_MIN);
  for(const char*s:{"2147483648","-2147483649","","-","+","1a"," 1"}){
    out=77;assert(!parse_i32(s,&out)&&out==77);
  }
  assert(parse_i32("00012",&out)&&out==12);
  assert(parse_i32("-0",&out)&&out==0);
  assert(!parse_i32(nullptr,&out)&&!parse_i32("1",nullptr));
  for(unsigned pos=0;pos<32;++pos)for(unsigned width=1;width<=32-pos;++width){
    uint64_t low=(uint64_t(1)<<width)-1;
    uint32_t value=uint32_t(low/2),got=0;
    uint64_t mask=low<<pos,old=UINT32_C(0xABCD1234);
    uint32_t expected=uint32_t((old&~mask)|(uint64_t(value)<<pos));
    assert(replace_bits(uint32_t(old),pos,width,value,&got)&&got==expected);
  }
  uint32_t got=123;
  assert(!replace_bits(0,31,2,0,&got)&&got==123);
  assert(!replace_bits(0,0,0,0,&got)&&got==123);
  assert(!replace_bits(0,0,4,16,&got)&&got==123);
  assert(expired(0x10,0xFFFFFFF0,32)&&!expired(0x10,0xFFFFFFF0,33));
  assert(expired(12,12,0)&&!expired(12,12,1));
  const uint8_t frame[]={1,0,2,0xAA,0xBB};
  const uint8_t *payload=nullptr;size_t len=88;
  assert(decode(frame,5,512,&payload,&len)&&payload==frame+3&&len==2);
  for(size_t n=0;n<5;++n){payload=nullptr;len=88;assert(!decode(frame,n,512,&payload,&len)&&!payload&&len==88);}
  assert(!decode(frame,5,1,&payload,&len));
  const uint8_t empty[]={1,0,0};assert(decode(empty,3,0,&payload,&len)&&len==0);
  Buffer a(16);a.data()[0]=42;auto original=a.data();
  Buffer b(std::move(a));assert(!a.data()&&a.size()==0&&b.data()==original&&b.size()==16);
  Buffer c(8);c=std::move(b);assert(!b.data()&&b.size()==0&&c.data()==original&&c.data()[0]==42);
  Buffer *self=&c;c=std::move(*self);assert(c.data()==original&&c.size()==16);
  Buffer zero(0);assert(!zero.data()&&zero.size()==0);
  for(size_t k=1;k<=8;++k){
    Kth stream(k);std::vector<int>all;
    for(int x:{5,1,5,2,-3,9,0,9,8,7}){
      all.push_back(x);std::sort(all.begin(),all.end(),std::greater<int>());
      auto answer=stream.add(x);
      if(all.size()<k)assert(!answer);else assert(answer&&*answer==all[k-1]);
    }
  }
  std::cout<<"PASS: all 12 published reference solutions compiled; exhaustive short strings, rotated arrays, cycle entries, monotonic stack, field bounds and ownership tests.\n";
}`;
const file=path.join(dir,'reference.cpp'),exe=path.join(dir,'reference.exe');
fs.writeFileSync(file,header+'\n'+examChallenges.map(c=>c.solution).join('\n')+'\n'+main);
const compilerEnv={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
const build=spawnSync(compiler,['-std=c++17','-Wall','-Wextra','-Werror','-pedantic',file,'-o',exe],{encoding:'utf8',windowsHide:true,env:compilerEnv});
if(build.error)throw build.error;
if(build.status!==0){process.stderr.write(build.stderr||build.stdout);process.exit(build.status||1);}
const run=spawnSync(exe,[],{encoding:'utf8',windowsHide:true,env:compilerEnv});
if(run.error)throw run.error;
process.stdout.write(run.stdout);process.stderr.write(run.stderr);
process.exit(run.status===0?0:run.status||1);
