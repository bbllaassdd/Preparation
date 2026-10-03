import {beginnerLessons,beginnerPath} from './beginner-lessons.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notes={
 'c-types':{goal:'先认识 sizeof，再讨论不同环境的类型大小。',sections:[
 {title:'sizeof 是什么？',paragraphs:['sizeof 是 C 的运算符，用来询问“存下这一种数据，需要多少字节”。例如 sizeof(int) 问一个 int 的大小。它不是读取整数的当前值。','本例假设 int 占 4 字节。变量 x 存的是 10，但 sizeof(x) 为 4；修改 x 的值，不会改变普通 int 的大小。'],code:'int x = 10;\n// x：10（当前内容）\n// sizeof(x)：4（占用字节，本例 int 为 4）'},
 {title:'先会这三种写法',paragraphs:['一种是对类型求大小，一种是对变量求大小，还有一种是对完整数组求总大小。先算清具体例子，再看后面的平台区别。'],table:{heads:['写法','意思','示例结果'],rows:[['sizeof(int)','一个 int 要多少字节？','本例为 4。'],['sizeof(x)','x 这种类型要多少字节？','本例为 4。'],['sizeof(char)','一个 char 要多少 C 字节？','C 保证为 1。']]}}
 ]},
 'c-pointer':{goal:'先分清 p、&x、*p、&p，再学习边界与生命周期。',sections:[
 {title:'这三行分别做了什么？',paragraphs:['第一行保存整数。第二行保存地址。第三行沿地址修改整数。你不需要先掌握复杂声明，就能逐行读懂这个例子。'],code:'int x = 10;\nint *p = &x;\n*p = 7;',read:[['int x=10;','创建整数 x，内容为 10。'],['int *p=&x;','创建指针 p，里面保存 x 的地址。声明里的 * 表示 p 是指针。'],['*p=7;','这里的 * 用于访问目标：沿 p 找到 x，把 x 改为 7。p 的地址值未改变。']]},
 {title:'四种写法，不要混成一种',paragraphs:['假设 x 位于 0x1000，p 自己位于 0x2000。执行上面三行后，下表分别描述内容和位置。地址数字均为示意。'],table:{heads:['表达式','这时得到什么','怎样读'],rows:[['x','7','x 的内容。'],['&x','0x1000','取 x 的地址。'],['p','0x1000','p 保存的地址。'],['*p','7','按 p 保存的地址访问目标。'],['&p','0x2000','取 p 自己的地址。']]}}
 ]},
 'c-array':{goal:'先会访问 a[0]，再学习数组在表达式中的转换。',sections:[
 {title:'数组是什么？',paragraphs:['数组是连续保存多个同类型元素的一组位置。int a[3]={10,20,30} 有三个整数，下标从 0 开始。','a[0] 是第一项 10，a[1] 是第二项 20，a[2] 是第三项 30。a[3] 已超出这个数组的有效元素范围。'],code:'int a[3] = {10, 20, 30};\na[1] = 7; // 现在为 {10, 7, 30}'},
 {title:'sizeof 和 strlen 在问不同问题',paragraphs:['sizeof 问占用多少字节。strlen 是字符串库函数，数终止零前面的字符数，使用时包含 <string.h>。字符串是末尾用零字符标记结束的字符序列。','char s[]="abc" 包含 a、b、c 和一个末尾零字符，数组占 4 个 char；strlen(s) 只数前三个可见字符，结果为 3。'],code:'char s[] = "abc";\n// sizeof(s)：4\n// strlen(s)：3'}
 ]},
 'c-array-pointer':{goal:'先辨别“一个地址”与“多个地址”，再看括号和步长。',sections:[
 {title:'先比较结构，再读语法',paragraphs:['int *a[4] 中 a 是一个数组，有 4 个位置，每个位置保存一个 int 的地址。它常叫“指针数组”。','int (*p)[4] 中 p 是一个指针，只有一个地址值。它指向一整行，这一行有 4 个 int。它常叫“数组指针”。'],table:{heads:['写法','变量是什么','保存什么'],rows:[['int *a[4]','4 元素数组','4 个 int 指针。'],['int (*p)[4]','一个指针','一整行数组的地址。']]}},
 {title:'括号不是装饰',paragraphs:['[] 与变量名先结合时，先认出数组；括号把 *p 放在一起时，先认出指针。','如果还没掌握 int *p=&x，先回入门第 6～9 课，再来学本课。'],code:'int *a[4];   // a 是数组\nint (*p)[4]; // p 是指针'}
 ]},
 'c-struct':{goal:'先知道 struct 把几个成员组成一份记录，再算各成员如何摆放。',sections:[
 {title:'struct、成员和变量分别是什么？',paragraphs:['struct 声明结构体类型。一份结构体可以同时记录编号、温度等相关字段；这些字段叫成员。','struct Item x 创建具体变量 x；x.id 用点号访问这份记录的 id 成员。类型定义本身不等于已经创建了所有变量。'],code:'struct Item {\n    char tag;\n    int id;\n};\nstruct Item x;\nx.tag = \'A\';\nx.id = 1;'},
 {title:'对齐和填充先这样理解',paragraphs:['有的类型要求放在特定的地址边界，例如本例 int 要从 4 的倍数位置开始。这个要求叫对齐。','前一个 char 用了 1 字节，下一位置不是 int 需要的边界，就留出一些空位再放 int。空位叫填充，也计入 sizeof。后面的图会逐步摆放。']}
 ]},
 'c-pointerconst':{goal:'先弄懂 p 是地址、*p 是目标，再看 const 限制谁。',sections:[
 {title:'const 先读作“不能通过这里修改”',paragraphs:['const int *p 限制通过 p 修改目标整数，但 p 自己仍可换地址。int *const p 限制 p 这个指针换地址，但目标整数可修改。','比较允许哪条赋值时，先看左边是 p 还是 *p：左边 p 是改地址，左边 *p 是改内容。'],code:'const int *p = &x; // p 可换目标，不能通过 *p 写值\nint *const q = &x; // q 不可换目标，可通过 *q 写值'}
 ]},
 'c-doubleptr':{goal:'二级指针先理解为：保存一个指针变量的地址。',sections:[
 {title:'多一级 *，多一层位置',paragraphs:['int x=10; int *p=&x; 中 p 指向 x。再写 int **pp=&p，让 pp 指向指针变量 p。','pp 的目标是 p；*pp 得到 p 这一个指针；**pp 再沿 p 去访问整数 x。逐层走，不要跳到最后直接猜。'],code:'int x = 10;\nint *p = &x;\nint **pp = &p;\n// *pp：p 保存的地址\n// **pp：x 的值 10'}
 ]},
 'c-keywords':{goal:'先知道什么叫关键字，再分别学习这些词的作用。',sections:[
 {title:'关键字是语言规定用途的词',paragraphs:['int、if、return、const 等词有语言规定的含义，不能随便拿来当变量名。const 常涉及修改限制；static 常涉及变量活多久或名字可见范围。','extern 常用于声明别处定义的变量；volatile 用于需要特殊访问语义的数据，例如硬件寄存器。本课后面的规则回答不同问题，不需要一次记成一个概念。']}
 ]}
};
const prerequisites={
 'c-types':['c-start-bytes','c-sizeof'],'c-pointer':['c-address','c-pointer-declare','c-dereference','c-pointer-change'],
 'c-array':['c-sizeof','c-array-start'],'c-array-pointer':['c-pointer-declare','c-array-start'],
 'c-string':['c-array-start','c-array'],'c-struct':['c-struct-start','c-sizeof'],
 'c-pointerconst':['c-pointer-change'],'c-doubleptr':['c-pointer-declare','c-dereference'],
 'c-function':['c-function-start'],'c-funcptr':['c-function-start','c-pointer-declare'],
 'c-keywords':['c-start-variable','c-pointer-change'],'c-bits':['c-start-bytes','c-address'],
 'c-conversion':['c-start-variable','c-start-bytes'],'c-heap':['c-address','c-dereference'],
 'c-union':['c-struct-start'],'c-macro':['c-function-start'],'c-memcpy':['c-array-start']
};
export const hasBeginnerNotes=l=>!!notes[l.id];
const name=id=>beginnerLessons.find(l=>l.id===id)?.title||id;
const link=id=>`<a href="#/lesson/${id}">${E(name(id))}</a>`;
export function beginnerGuide({compact=false}={}){return `<section class="beginner-guide panel"><div><span class="badge">从零开始</span><h2>不认识 sizeof、&、*？从这条顺序学。</h2><p>先读懂一行代码，再学地址和指针。每课只处理一个主要问题，难题规则可以稍后展开。</p></div>${compact?'':`<ol class="beginner-path">${beginnerPath.map(id=>`<li>${link(id)}</li>`).join('')}</ol>`}<a class="btn primary" href="#/lesson/c-start-variable">从“变量是什么”开始</a><a class="btn ghost" href="#/lesson/c-sizeof">直接看 sizeof</a>${compact?'<a class="btn ghost" href="#/lesson/c-address">看 & 取地址</a><a class="btn ghost" href="#/lesson/c-dereference">看 *p 访问目标</a>':''}</section>`;}

const moduleTerms={
 cpp:[['类','描述一类数据和可执行操作的类型，如 Sensor。'],['对象','按某种类型创建的具体一份数据，如某个 Sensor 变量。'],['构造函数','对象开始生命周期时执行，用于建立初始状态。'],['析构函数','对象结束生命周期时执行，常用于释放资源。']],
 memory:[['Flash','断电后仍可保留内容的存储，MCU 固件常放在这里。'],['SRAM','运行时保存工作数据的内存，断电通常丢失内容。'],['栈','保存函数/任务临时数据和返回现场的一类存储组织。'],['堆','可按需要申请和归还存储的区域，由分配器管理。']],
 arm:[['CPU','执行程序指令的处理单元。'],['寄存器','CPU 内部快速保存数据、地址和执行信息的位置。'],['指令','CPU 执行的一步操作，例如读取、加法或跳转。'],['现场','暂停执行后，为继续原任务而需要保存的寄存器等信息。']],
 ds:[['数据结构','组织多份数据的方式，例如数组、链表和树。'],['算法','解决一个问题的明确操作步骤。'],['节点','结构中的一份元素，可包含数据及与其他元素的连接。'],['复杂度','输入规模变大时，工作量或额外空间如何增长。']],
 os:[['进程','程序的一次运行；常拥有独立的虚拟地址空间与资源。'],['线程','进程内的一条执行路径，各有执行现场和栈。'],['调度','选择当前哪个可运行的执行者使用 CPU。'],['同步','约定多个执行者怎样协作，避免共享数据被冲突修改。']],
 stm32:[['MCU','把 CPU、存储和外设集成在一起的微控制器芯片。'],['外设','芯片上的硬件功能模块，如 GPIO、定时器、串口。'],['外设寄存器','可通过规定地址访问的硬件配置或状态位置。'],['中断','硬件事件请求 CPU 暂停当前路径，先执行处理函数。']],
 protocol:[['协议','双方对信号、数据格式和交互步骤的约定。'],['电平','信号线当前高/低的电压状态，用来编码信息。'],['帧','按协议组织的一组位或字节，不同层的帧边界可能不同。'],['采样','在规定时刻读取信号电平，判断正在传送的数据位。']],
 rtos:[['任务','由内核调度的一条执行路径，通常用函数表示，并有自己的栈。'],['就绪','现在可以运行，但还需要等调度器选择。'],['阻塞','等待事件或时间，暂时不参与 CPU 的运行选择。'],['队列','按顺序保存待处理消息，常让发送者与接收者协作。']],
 engineering:[['调试','用执行过程和现场证据找出程序哪里偏离预期。'],['状态','系统现在处于哪个阶段，例如等待、运行或故障。'],['日志','记录事件、数值与时间，帮助重建执行过程。'],['验证','用明确输入和预期结果确认修改是否解决问题。']],
 network:[['客户端/服务端','通信中请求服务的一方与提供服务的一方。'],['数据包','按协议组织发送的数据单元；不一定等于一次业务消息。'],['缓冲区','暂存收到或待发送数据的存储空间。'],['文件描述符','Linux 进程用于引用已打开文件或 socket 等资源的整数编号。']]
};
export function modulePrimer(id){const words=moduleTerms[id];return words?`<section class="module-primer panel"><h2>先认识本模块的几个词</h2><dl class="symbol-list">${words.map(([term,meaning])=>`<div><dt>${E(term)}</dt><dd>${E(meaning)}</dd></div>`).join('')}</dl></section>`:'';}
export function prerequisiteLinks(l){const list=prerequisites[l.id];return list?`<div class="beginner-prerequisite"><strong>符号还不熟，可以先读</strong><div>${list.map(link).join('')}</div></div>`:'';}
function section(s){
 const body=`<h3>${E(s.title)}</h3>${s.paragraphs.map(p=>`<p>${E(p)}</p>`).join('')}${s.code?`<pre class="codeblock"><code>${E(s.code)}</code></pre>`:''}${s.tokens?`<dl class="symbol-list">${s.tokens.map(([token,meaning])=>`<div><dt><code>${E(token)}</code></dt><dd>${E(meaning)}</dd></div>`).join('')}</dl>`:''}${s.read?`<ol class="line-reading">${s.read.map(([code,meaning])=>`<li><code>${E(code)}</code><p>${E(meaning)}</p></li>`).join('')}</ol>`:''}${s.table?`<div class="basic-table-wrap"><table class="basic-table"><thead><tr>${s.table.heads.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row=>`<tr>${row.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}${s.note?`<div class="basic-note">${E(s.note)}</div>`:''}`;
 return s.optional?`<details class="basic-optional"><summary>学会基本写法后，再看：${E(s.title)}</summary>${body}</details>`:`<section class="basic-block">${body}</section>`;
}
export function beginnerExplanation(l){const data=l.basics||notes[l.id];return data?`${prerequisiteLinks(l)}<section id="basics" class="basic-reading"><h2>从最小例子学起</h2><p class="basic-goal">这一课先弄懂：${E(data.goal)}</p>${data.sections.map(section).join('')}</section>`:prerequisiteLinks(l);}
export function beginnerSequence(l){if(!l.beginner)return '';const i=beginnerPath.indexOf(l.id);return `<div class="beginner-sequence"><span>C 入门 · 第 ${i+1} / ${beginnerPath.length} 课</span></div>`;}
