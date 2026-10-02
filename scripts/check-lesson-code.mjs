import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {lessonCoding} from '../dist/lesson-coding.js';
const bin='D:/Program Files/JetBrains/CLion 2026.1.1/bin/mingw/bin';
const dir=path.resolve('.sites-runtime','lesson-code-qa');
fs.mkdirSync(dir,{recursive:true});
const cHeader=String.raw`
#include <assert.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>
#include <stdio.h>
static bool fail_malloc=false;
static void *controlled_malloc(size_t n){return fail_malloc?NULL:malloc(n);}
#define malloc controlled_malloc
`;
const cTests=String.raw`
#undef malloc
static int positive(int x){return x>0;}
static int reject(int x){(void)x;return 0;}
int main(void){
  int x=INT_MIN,y=INT_MAX;
  assert(swap_int(&x,&y)&&x==INT_MAX&&y==INT_MIN);
  assert(swap_int(&x,&x)&&x==INT_MAX);
  assert(!swap_int(&x,NULL)&&x==INT_MAX);
  assert(reverse_ints(NULL,0)&&!reverse_ints(NULL,1));
  for(size_t n=0;n<=13;++n){
    int a[13];for(size_t i=0;i<n;++i)a[i]=(int)i;
    assert(reverse_ints(a,n));
    for(size_t i=0;i<n;++i)assert(a[i]==(int)(n-1-i));
  }
  assert(unique_sorted(NULL,0)==0);
  int dedup[]={-3,-3,0,0,0,2,7,7};int want[]={-3,0,2,7};
  assert(unique_sorted(dedup,8)==4&&memcmp(dedup,want,sizeof want)==0);
  char dst[8]="ZZZZZZZ";
  assert(!copy_text(dst,3,"MCU")&&strcmp(dst,"ZZZZZZZ")==0);
  assert(copy_text(dst,4,"MCU")&&strcmp(dst,"MCU")==0);
  assert(copy_text(dst,1,"")&&dst[0]==0);
  assert(!copy_text(NULL,1,"")&&!copy_text(dst,0,"")&&!copy_text(dst,8,NULL));
  const char *texts[]={"","a","ababc","aaaa","abc"};
  const char *patterns[]={"","a","abc","b","aaaaa"};
  for(size_t i=0;i<5;++i)for(size_t j=0;j<5;++j)
    assert(find_text(texts[i],patterns[j])==strstr(texts[i],patterns[j]));
  assert(!find_text(NULL,"a")&&!find_text("a",NULL));
  const int matrix[2][3]={{1,2,3},{4,5,6}};int trans[3][2];
  transpose23(matrix,trans);
  for(size_t i=0;i<2;++i)for(size_t j=0;j<3;++j)assert(trans[j][i]==matrix[i][j]);
  for(int mask=0;mask<32;++mask){
    struct CNode *head=NULL,**tail=&head;size_t remove=0,keep=0;
    for(int i=0;i<5;++i){
      struct CNode *p=malloc(sizeof *p);assert(p);
      p->value=(mask>>i)&1;p->next=NULL;*tail=p;tail=&p->next;
      if(p->value)++remove;else ++keep;
    }
    assert(remove_value(&head,1)==remove);
    for(struct CNode *p=head;p;p=p->next){assert(p->value==0);--keep;}
    assert(keep==0);
    assert(remove_value(&head,0)==5-remove&&head==NULL);
  }
  assert(remove_value(NULL,1)==0);
  int src[]={2,4,6};int *copy=NULL;
  assert(clone_ints(src,3,&copy)&&copy!=src&&memcmp(copy,src,sizeof src)==0);
  copy[0]=10;assert(src[0]==2);free(copy);copy=NULL;
  assert(clone_ints(NULL,0,&copy)&&!copy);
  fail_malloc=true;assert(!clone_ints(src,3,&copy)&&!copy);fail_malloc=false;
  assert(!clone_ints(src,SIZE_MAX,&copy)&&!copy);
  copy=src;assert(!clone_ints(src,3,&copy)&&copy==src);
  assert(!clone_ints(NULL,1,&copy)&&!clone_ints(src,3,NULL));
  struct Student students[]={{3,90},{1,90},{2,95},{9,INT_MIN},{8,INT_MAX}};
  sort_students(students,5);
  int ids[]={8,2,1,3,9};for(size_t i=0;i<5;++i)assert(students[i].id==ids[i]);
  sort_students(NULL,0);
  int filter[]={1,-2,3,0};
  assert(filter_ints(filter,4,positive)==2&&filter[0]==1&&filter[1]==3);
  assert(filter_ints(filter,2,NULL)==2);
  assert(filter_ints(filter,2,reject)==0);
  for(size_t cap=0;cap<=12;++cap)for(size_t from=0;from<=cap+1;++from)
    for(size_t to=0;to<=cap+1;++to)for(size_t n=0;n<=cap+1;++n){
      unsigned char actual[16],expected[16];
      for(size_t i=0;i<16;++i)actual[i]=expected[i]=(unsigned char)i;
      bool valid=from<=cap&&to<=cap&&n<=cap-from&&n<=cap-to;
      if(valid)memmove(expected+to,expected+from,n);
      assert(move_region(actual,cap,to,from,n)==valid);
      assert(memcmp(actual,expected,16)==0);
    }
  assert(move_region(NULL,0,0,0,0)&&!move_region(NULL,1,0,0,1));
  int a[]={5,-2,8,0},lo=99,hi=99;
  assert(minmax_ints(a,4,&lo,&hi)&&lo==-2&&hi==8);
  assert(minmax_ints(a,4,&a[0],&a[1])&&a[0]==-2&&a[1]==8);
  assert(!minmax_ints(a,4,&lo,&lo)&&lo==-2);
  assert(!minmax_ints(NULL,0,&lo,&hi)&&lo==-2&&hi==8);
  puts("PASS: 12 C11 reference solutions; boundaries, allocation failure, aliasing and exhaustive overlap moves.");
}
`;
const cppHeader=String.raw`
#include <algorithm>
#include <array>
#include <cassert>
#include <climits>
#include <cstddef>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <memory>
#include <new>
#include <optional>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <utility>
#include <vector>
static bool fail_array_allocation=false;
void* operator new[](std::size_t n){
  if(fail_array_allocation) throw std::bad_alloc();
  void *p=std::malloc(n?n:1);if(!p)throw std::bad_alloc();return p;
}
void operator delete[](void *p) noexcept{std::free(p);}
void operator delete[](void *p,std::size_t) noexcept{std::free(p);}
`;
const cppTests=String.raw`
int main(){
  int x=INT_MIN,y=INT_MAX;swap_refs(x,y);assert(x==INT_MAX&&y==INT_MIN);
  swap_refs(x,x);assert(x==INT_MAX);
  assert(LiveCounter::alive()==0);
  {LiveCounter a;assert(LiveCounter::alive()==1);
    {LiveCounter b(a),c;assert(LiveCounter::alive()==3);a=b;assert(LiveCounter::alive()==3);}
    assert(LiveCounter::alive()==1);
  }assert(LiveCounter::alive()==0);
  {
    TinyText a("MCU"),b(a);b.at(0)='X';
    assert(std::strcmp(a.c_str(),"MCU")==0&&std::strcmp(b.c_str(),"XCU")==0);
    const char *old=a.c_str();TinyText c(std::move(a));
    assert(c.c_str()==old&&a.size()==0&&std::strcmp(a.c_str(),"")==0);
    TinyText *self=&c;c=*self;assert(std::strcmp(c.c_str(),"MCU")==0);
    c=std::move(*self);assert(std::strcmp(c.c_str(),"MCU")==0);
    TinyText empty(a);assert(empty.size()==0);
    bool threw=false;try{(void)c.at(c.size());}catch(const std::out_of_range&){threw=true;}assert(threw);
    fail_array_allocation=true;threw=false;
    try{b=c;}catch(const std::bad_alloc&){threw=true;}
    fail_array_allocation=false;
    assert(threw&&std::strcmp(b.c_str(),"XCU")==0);
  }
  FixedSensor source(10);OffsetSensor borrowed(source,3);
  const Sensor &base=borrowed;assert(base.read()==13);
  std::vector<std::unique_ptr<Sensor>> readings;
  readings.push_back(std::make_unique<FixedSensor>(10));
  readings.push_back(std::make_unique<OffsetSensor>(source,3));readings.push_back(nullptr);
  assert(sum_readings(readings)==23&&sum_readings({})==0);
  static_assert(std::has_virtual_destructor_v<Sensor>);
  std::vector<int>values={2,1,4,3,6,5};erase_even(values);
  assert((values==std::vector<int>{1,3,5}));
  values={0,-2,4};erase_even(values);assert(values.empty());
  assert(first_unique("swiss")==std::optional<std::size_t>(1)&&!first_unique("aabb")&&!first_unique(""));
  std::string bytes;bytes+=char(0xFF);bytes+='\0';bytes+=char(0xFF);
  assert(first_unique(bytes)==std::optional<std::size_t>(1));
  assert(Item::alive==0);
  {auto items=make_items({1,2,3});assert(Item::alive==3&&items[2]->id==3);}
  assert(Item::alive==0);
  bool threw=false;try{auto items=make_items({1,-1,2});}catch(const std::invalid_argument&){threw=true;}
  assert(threw&&Item::alive==0);
  FixedQueue<int,1>single;int out=77;
  assert(!single.pop(out)&&out==77&&single.push(3)&&!single.push(4)&&single.pop(out)&&out==3);
  FixedQueue<int,3>queue;
  for(int round=0;round<20;++round){
    assert(queue.push(1)&&queue.push(2)&&queue.push(3)&&!queue.push(4)&&queue.size()==3);
    for(int n=1;n<=3;++n){assert(queue.pop(out)&&out==n);}
    out=77;assert(!queue.pop(out)&&out==77&&queue.size()==0);
  }
  FixedQueue<int,3>wrap;
  assert(wrap.push(1)&&wrap.push(2)&&wrap.pop(out)&&out==1&&wrap.push(3)&&wrap.push(4));
  for(int n=2;n<=4;++n)assert(wrap.pop(out)&&out==n);
  TempDevice temp(23.5);MotorDevice motor;double t=77;
  assert(read_temperature(&temp,t)&&t==23.5);
  assert(!read_temperature(&motor,t)&&t==23.5&&!read_temperature(nullptr,t)&&t==23.5);
  std::vector<std::unique_ptr<Config>>original;
  original.push_back(std::make_unique<IntConfig>(7));original.push_back(nullptr);
  auto copied=copy_configs(original);
  auto *ptr=dynamic_cast<IntConfig*>(copied[0].get());
  assert(ptr&&copied[0].get()!=original[0].get()&&!copied[1]);
  ptr->number=9;assert(original[0]->value()==7&&copied[0]->value()==9);
  std::cout<<"PASS: 10 C++17 reference solutions; copy/move/self-assignment, allocation failure, RAII, RTTI and queue wrap.\n";
}
`;
for(const [language,compiler,extension,header,tests,standard] of [
 ['C11',process.env.CC||path.join(bin,'gcc.exe'),'c',cHeader,cTests,'c11'],
 ['C++17',process.env.CXX||path.join(bin,'g++.exe'),'cpp',cppHeader,cppTests,'c++17']
]){
 const file=path.join(dir,'reference.'+extension),exe=path.join(dir,extension+'.exe');
 fs.writeFileSync(file,header+'\n'+lessonCoding.filter(c=>c.language===language).map(c=>c.solution).join('\n')+'\n'+tests);
 const env={...process.env,PATH:path.dirname(compiler)+path.delimiter+process.env.PATH};
 const build=spawnSync(compiler,['-std='+standard,'-Wall','-Wextra','-Werror','-pedantic',file,'-o',exe],{encoding:'utf8',windowsHide:true,env});
 if(build.error)throw build.error;
 if(build.status!==0){process.stderr.write(build.stderr||build.stdout);process.exit(build.status||1);}
 const run=spawnSync(exe,[],{encoding:'utf8',windowsHide:true,env});
 if(run.error)throw run.error;
 process.stdout.write(run.stdout);process.stderr.write(run.stderr);
 if(run.status!==0)process.exit(run.status||1);
}
