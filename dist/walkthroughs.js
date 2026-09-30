// 每一帧是执行后的状态；图、监视值和解释使用同一份状态数据。
export const walkthroughs={};
const F=(title,code,why,watch,cells,links=[],focus=[],output='')=>({title,code,why,watch,cells,links,focus,output});
const cell=(label,value,detail='')=>({label,value,detail});
walkthroughs['c-types']={assumption:'示例 ABI；CHAR_BIT=8。这些是常见实现，不是所有平台的语言保证。',frames:[
 F('32 位 Arm 常见 ILP32','sizeof(int), sizeof(long), sizeof(void*)','int、long、指针为 32 位，换成 8 位字节各为 4；char 始终一个 C 字节。',[['字节位数','8'],['环境','ILP32']],[cell('char','1 B'),cell('short','2 B'),cell('int','4 B'),cell('long','4 B'),cell('指针','4 B')]),
 F('64 位常见 LP64','// Linux 64 位的常见数据模型','机器和地址位数增加，int 仍 4 字节，long 与指针改为 8。',[['字节位数','8'],['环境','LP64']],[cell('char','1 B'),cell('short','2 B'),cell('int','4 B'),cell('long','8 B'),cell('指针','8 B')],[],[3,4]),
 F('64 位常见 LLP64','// Windows 64 位的常见数据模型','同样 64 位，long 仍 4 字节；所以只给系统位数不能唯一推出 long 大小。',[['字节位数','8'],['环境','LLP64']],[cell('char','1 B'),cell('short','2 B'),cell('int','4 B'),cell('long','4 B'),cell('指针','8 B')],[],[3,4])
]};
walkthroughs['stm32-clock']={assumption:'F407 示例：HSE=8 MHz，PLLM=8、PLLN=336、PLLP=2，AHB /1、APB1 /4。',frames:[
 F('确认外部时钟','HSE = 8 MHz;','先确认板上晶振与配置一致；后面每个频率都从这里推导。',[['HSE','8 MHz']],[cell('HSE','8 MHz'),cell('PLL 输入','待算'),cell('SYSCLK','待算')],[[0,1],[1,2]],[0]),
 F('计算 PLL','8 / 8 * 336 / 2 = 168 MHz','先除 M 得 1 MHz，再倍 N 得 336 MHz，再除 P 得系统 168 MHz。还要满足手册各级频率限制。',[['PLL 输入','1 MHz'],['VCO','336 MHz'],['SYSCLK','168 MHz']],[cell('HSE','8 MHz'),cell('PLL','168 MHz','M8/N336/P2'),cell('AHB','168 MHz','/1')],[[0,1],[1,2]],[1]),
 F('计算 APB1','PCLK1 = 168 / 4 = 42 MHz','总线分频使 APB1 低于 AHB；不能直接用 168 MHz 当 UART 或 TIM 输入。',[['HCLK','168 MHz'],['PCLK1','42 MHz']],[cell('AHB','168 MHz'),cell('APB1','42 MHz','/4'),cell('TIM','待算')],[[0,1],[1,2]],[1]),
 F('确认定时器倍频','TIM_APB1 = 2 * PCLK1 = 84 MHz','F407 此配置 APB 预分频不为 1，因此对应定时器使用 2 倍 PCLK1。',[['PCLK1','42 MHz'],['TIM 输入','84 MHz']],[cell('AHB','168 MHz'),cell('APB1','42 MHz'),cell('TIM','84 MHz','×2')],[[0,1],[1,2]],[2])
]};
walkthroughs['stm32-dma']={assumption:'软件双缓冲，单个 SPI DMA 传输；发送中的块不可由 UI 改写。',frames:[
 F('UI 绘制 A','draw(A);','A 由 UI 独占；B 空闲。',[['A','DRAWING'],['B','FREE']],[cell('UI','写 A'),cell('A','绘制中'),cell('B','空闲'),cell('DMA','空闲')],[[0,1]],[1]),
 F('A 交给 DMA','start_dma(A);','画面完整后将 A 交出，UI 不再写 A，开始使用 B。',[['A','SENDING'],['B','DRAWING']],[cell('UI','写 B'),cell('A','发送中'),cell('B','绘制中'),cell('DMA','读 A')],[[0,2],[1,3]],[1,2]),
 F('B 绘完，等待 DMA','B.state = READY;','B 虽准备好，但 DMA 仍读 A；不能提前把 A 当空闲块。',[['A','SENDING'],['B','READY']],[cell('UI','等可写块'),cell('A','发送中'),cell('B','已就绪'),cell('DMA','读 A')],[[1,3]],[2]),
 F('完成事件释放 A','on_dma_complete(A);','确认 DMA 不再读 A 后，归还 A。结束片选另需满足 SPI 线路完成条件。',[['A','FREE'],['B','READY']],[cell('UI','可取得 A'),cell('A','已释放'),cell('B','已就绪'),cell('DMA','待启动')],[],[1]),
 F('交换角色','start_dma(B); draw(A);','现在 DMA 独占 B，UI 独占 A，两个阶段可以重叠。',[['A','DRAWING'],['B','SENDING']],[cell('UI','写 A'),cell('A','绘制中'),cell('B','发送中'),cell('DMA','读 B')],[[0,1],[2,3]],[1,2])
]};
walkthroughs['stm32-lowpower']={assumption:'L476 STOP1 流程示意；具体时钟、唤醒源与保留内容以 RM0351 和板级配置为准。',frames:[
 F('业务请求息屏','state = PREPARE_SLEEP;','先停止产生新显示与存储请求，避免检查空闲后又出现新的在途操作。',[['CPU','运行'],['DMA/Flash','可能繁忙']],[cell('任务','停止新请求'),cell('外设','待检查'),cell('时钟','高频运行')]),
 F('结束在途操作','wait_for_dma_and_flash();','需要完成事件或明确安全停止，不能把“开始发送”当作“发送结束”。',[['DMA/Flash','确认空闲']],[cell('任务','等待完成'),cell('外设','空闲'),cell('时钟','高频运行')],[],[1]),
 F('配置唤醒并进入','configure_wakeup(); enter_STOP1();','保证唤醒通路有效，再按芯片流程睡眠；部分保留域继续工作。',[['CPU','停止'],['唤醒源','RTC/配置的外部源']],[cell('CPU','停止'),cell('SRAM','按模式保留'),cell('RTC','低速计时')],[],[0]),
 F('唤醒后恢复时钟','restore_system_clock();','不能假设 PLL 和旧时钟树已自动恢复；先恢复，再使用依赖时钟的外设。',[['CPU','已唤醒'],['时钟','重新配置']],[cell('CPU','运行'),cell('时钟','恢复中'),cell('UART/TIM','待核对')],[[1,2]],[1]),
 F('恢复时基与业务','restore_time_and_peripherals();','确认计时、波特率和 DMA 状态后恢复请求；再验证唤醒原因与功耗。',[['业务','恢复'],['测量','标注整板/电压/外设']],[cell('时钟','已确认'),cell('外设','已确认'),cell('任务','恢复业务')],[[0,1],[1,2]],[2])
]};
walkthroughs['r-delay']={assumption:'理想示意：工作 3 Tick、期望周期 10 Tick；暂不计抢占和 Tick 相位误差。',frames:[
 F('两任务在 0 开始','lastWake=0; period=10;','比较相对延时与基于计划时刻的延时。',[['当前时间','0'],['工作耗时','3']],[cell('相对 delay','工作','开始 0'),cell('DelayUntil','工作','开始 0')]),
 F('工作结束','now=3;','两种方式都用掉 3 Tick，但下一唤醒参考点不同。',[['当前时间','3']],[cell('相对 delay','算 3+10','到期 13'),cell('DelayUntil','算 0+10','到期 10')],[],[0,1]),
 F('固定计划先到期','DelayUntil(&lastWake,10);','到期 10 时解除阻塞，lastWake 更新为 10；实际是否立刻运行取决于调度。',[['当前时间','10'],['Until 下一计划','20']],[cell('相对 delay','仍阻塞','到期 13'),cell('DelayUntil','第二轮工作','计划 10')],[],[1]),
 F('相对延时到期','vTaskDelay(10);','13 开始第二轮，工作到 16，再加 10 到 26；工作耗时进入周期。',[['相对开始','0、13、26'],['Until 计划','0、10、20']],[cell('相对 delay','第二轮','开始 13'),cell('DelayUntil','等待下一期','计划 20')],[],[0]),
 F('理解限制','// 检测截止时间是否错过','DelayUntil 减少累计漂移，不消除高优先级抢占；工作超过 10 时要处理超期。',[['周期保证','计划时刻规则'],['实际执行','受就绪与抢占影响']],[cell('相对延时','工作+延时'),cell('周期延时','固定计划')])
]};
walkthroughs['p-can']={assumption:'两个标准数据帧同时仲裁：ID=0x100 与 0x200。只演示标识符前 3 位。',frames:[
 F('准备 11 位 ID','0x100 = 00100000000; 0x200 = 01000000000;','从高位开始比较，显性 0 覆盖隐性 1。',[['显性','0'],['隐性','1']],[cell('节点 A','0x100','001…'),cell('总线','待发送'),cell('节点 B','0x200','010…')]),
 F('第一位都发 0','A=0; B=0; bus=0;','双方发送与读回一致，都继续仲裁。',[['A','发送0/读0'],['B','发送0/读0']],[cell('节点 A','0'),cell('总线','0'),cell('节点 B','0')],[[0,1],[2,1]],[1]),
 F('第二位发生分歧','A=0; B=1; bus=0;','A 的显性拉低覆盖 B 的隐性释放，B 发1读0发现输了。',[['A','发送0/读0'],['B','发送1/读0']],[cell('节点 A','0'),cell('总线','0'),cell('节点 B','1')],[[0,1],[2,1]],[2]),
 F('B 退出，A 继续','B.stop_transmitting();','B 停止发送，不会破坏获胜帧；A 在下一位继续发1。',[['获胜者','A=0x100'],['B','等待下次机会']],[cell('节点 A','继续发1'),cell('总线','1'),cell('节点 B','已退出')],[[0,1]],[0])
]};
walkthroughs['ds-queue']={assumption:'环形队列容量 4，保留一个槽位，head 为读位置，tail 为写位置。',frames:[
 F('空队列','head=tail=0;','相同索引表示空，此时三个槽位可用。',[['head','0'],['tail','0'],['数量','0']],[cell('槽0','空'),cell('槽1','空'),cell('槽2','空'),cell('槽3','空')]),
 F('入队 A、B、C','tail=(tail+1)%4;','依次写入 0、1、2，tail 到 3。next(tail)=0 等于 head，队列满。',[['head','0'],['tail','3'],['数量','3 / 3']],[cell('槽0','A','head'),cell('槽1','B'),cell('槽2','C'),cell('槽3','空','tail')],[],[3]),
 F('取出 A','head=(head+1)%4;','读取槽0后 head 到1，槽0旧值可以留着，但已不属于有效数据。',[['head','1'],['tail','3'],['数量','2']],[cell('槽0','旧 A','已出队'),cell('槽1','B','head'),cell('槽2','C'),cell('槽3','空','tail')],[],[0,1]),
 F('入队 D 并绕回','buf[tail]=D; tail=(3+1)%4;','写槽3后 tail 回0。有效数据逻辑顺序为 B、C、D，跨越数组末尾。',[['head','1'],['tail','0'],['数量','3 / 3']],[cell('槽0','旧 A','tail'),cell('槽1','B','head'),cell('槽2','C'),cell('槽3','D')],[],[3,0]),
 F('下一次入队被拒绝','if ((tail+1)%4 == head) return FULL;','next(0)=1==head，若继续写会破坏空满区分，应先出队或采用约定满队列策略。',[['队列','满'],['顺序','B、C、D']],[cell('槽0','不可写','保留槽'),cell('槽1','B','head'),cell('槽2','C'),cell('槽3','D')],[],[0])
]};
walkthroughs['c-pointer']={assumption:'示意地址；int 为 4 字节。a 是含 2 个 int 的数组。',frames:[
  F('创建数组','int a[2] = {10, 20};','先有两个整数对象，指针还未创建。地址按 4 字节连续增长。',[['p','尚未声明']], [cell('a[0]','10','0x1000'),cell('a[1]','20','0x1004')]),
  F('把地址存入 p','int *p = &a[0];','p 是另一个对象，内容为 a[0] 的地址；它没有复制整数 10。',[['p','0x1000'],['&p','0x2000（示意）'],['*p','10']], [cell('p','0x1000','0x2000'),cell('a[0]','10','0x1000'),cell('a[1]','20','0x1004')],[[0,1]], [0,1]),
  F('通过指针写目标','*p = 7;','沿 p 保存的地址写入 a[0]。改变的是目标值，p 的地址内容不变。',[['p','0x1000'],['a[0]','7'],['a[1]','20']], [cell('p','0x1000','0x2000'),cell('a[0]','7','0x1000'),cell('a[1]','20','0x1004')],[[0,1]],[1]),
  F('指针前进一个元素','p++;','p 指向 int，故加 1 跨过 sizeof(int)=4 字节。没有移动数组里的数字。',[['p','0x1004'],['*p','20']], [cell('p','0x1004','0x2000'),cell('a[0]','7','0x1000'),cell('a[1]','20','0x1004')],[[0,2]],[0,2]),
  F('增加目标值','(*p)++;','括号内先解引用，随后增加 a[1]。地址仍指向第二个元素。',[['p','0x1004'],['*p','21']], [cell('p','0x1004','0x2000'),cell('a[0]','7','0x1000'),cell('a[1]','21','0x1004')],[[0,2]],[2]),
  F('到达尾后一位','p++; // 不可继续 *p','尾后指针可用于范围比较，但该处没有数组元素，不能解引用。',[['p','0x1008（尾后）'],['*p','不可访问']], [cell('p','0x1008','0x2000'),cell('a[0]','7','0x1000'),cell('a[1]','21','0x1004'),cell('尾后','无对象','0x1008')],[[0,3]],[3])
]};
walkthroughs['c-array-pointer']={assumption:'int m[2][4]={{1,2,3,4},{5,6,7,8}}；int=4 字节。',frames:[
  F('p 指向一整行','int (*p)[4] = m;','p 所指类型是 int[4]，一行大小 16 字节。',[['p','0x1000'],['sizeof(*p)','16']], [cell('第 0 行','1  2  3  4','0x1000～0x100F'),cell('第 1 行','5  6  7  8','0x1010～0x101F')],[],[0]),
  F('按行加 1','p + 1','先按所指类型跨过 16 字节，所以到第二行，而非第二个 int。',[['p+1','0x1010'],['步长','4×4=16']], [cell('第 0 行','1  2  3  4','0x1000'),cell('第 1 行','5  6  7  8','0x1010')],[],[1]),
  F('解引用取得该行','*(p + 1)','表达式是 int[4] 这一行；继续参与加法时，它转换为首元素指针 int*。',[['类型','行数组 → int*'],['首元素地址','0x1010']], [cell('m[1][0]','5','0x1010'),cell('m[1][1]','6','0x1014'),cell('m[1][2]','7','0x1018'),cell('m[1][3]','8','0x101C')],[],[0]),
  F('按 int 再加 2','*(p + 1) + 2','这里指针所指类型已经是 int；再移动 2×4=8 字节。',[['地址','0x1010+8=0x1018']], [cell('m[1][0]','5','0x1010'),cell('m[1][1]','6','0x1014'),cell('m[1][2]','7','0x1018'),cell('m[1][3]','8','0x101C')],[],[2]),
  F('第二次解引用','*(*(p + 1) + 2) // p[1][2]','两次定位完成：先按行，再按列。此时读取对应 int 得到 7。',[['结果','7'],['等价下标','p[1][2]']], [cell('m[1][0]','5','0x1010'),cell('m[1][1]','6','0x1014'),cell('m[1][2]','7','0x1018'),cell('m[1][3]','8','0x101C')],[],[2])
]};
walkthroughs['c-struct']={assumption:'struct S {char a; int b; char c;}; char 对齐 1、int 对齐 4。',frames:[
  F('放入第一个成员','offset(a)=0','char 只需要 1 字节对齐，可从偏移 0 开始。',[['下一空位','1']], [cell('a','1 B','偏移 0')],[],[0]),
  F('为 int 寻找对齐地址','align_up(1, 4) = 4','偏移 1 不满足 4 字节对齐，向上取整到 4；中间 3 字节是填充。',[['填充','1～3'],['b 起点','4']], [cell('a','1 B','0'),cell('填充','3 B','1～3'),cell('b','待放入','4')],[],[1]),
  F('放入 int','offset(b)=4; next=4+4;','int 占偏移 4、5、6、7，下一空位是 8。',[['下一空位','8']], [cell('a','1 B','0'),cell('填充','3 B','1～3'),cell('b','4 B','4～7')],[],[2]),
  F('放入末尾 char','offset(c)=8; next=9;','c 的对齐要求是 1，因此不必在它前面补空位。',[['成员末尾','9']], [cell('a','1 B','0'),cell('填充','3 B','1～3'),cell('b','4 B','4～7'),cell('c','1 B','8')],[],[3]),
  F('补足整体对齐','sizeof(S)=align_up(9,4)=12;','结构体数组中每个元素都要让 b 正确对齐，因此整体步长也补到 4 的倍数。',[['尾部填充','9～11'],['sizeof(S)','12']], [cell('a','1 B','0'),cell('前填充','3 B','1～3'),cell('b','4 B','4～7'),cell('c','1 B','8'),cell('尾填充','3 B','9～11')],[],[4])
]};

// 实际执行单链表反转，记录每条语句，不把箭头变化写死成颜色变化。
{
  const next=[1,2,null],frames=[];let prev=null,cur=0,saved=null;
  const name=v=>v===null?'NULL':String(v+1);
  const snap=(title,code,why,focus=[])=>frames.push(F(title,code,why,[['prev',name(prev)],['cur',name(cur)],['next',name(saved)]],next.map((v,i)=>cell(`节点 ${i+1}`,`next=${name(v)}`,`数据 ${i+1}`)),next.flatMap((v,i)=>v===null?[]:[[i,v]]),focus));
  snap('建立两个区域','prev = NULL; cur = head;','prev 是已反转部分的头，cur 是待处理部分的头。');
  while(cur!==null){
    saved=next[cur];snap(`保存节点 ${cur+1} 的后继`,'next = cur->next;','下一句会覆盖 cur->next；先保存原后继才能找回未处理部分。',[cur]);
    next[cur]=prev;snap(`反转节点 ${cur+1} 的链接`,'cur->next = prev;','只有这一句改变链的连接。图中的箭头现在指向已反转部分。',[cur]);
    prev=cur;snap('更新已反转链头','prev = cur;','prev 现在覆盖刚处理的节点，已反转区域增加一个。',[prev]);
    cur=saved;snap('推进未处理区域','cur = next;','沿此前保存的后继前进，没有丢掉任何节点。',cur===null?[]:[cur]);
  }
  snap('返回新链头','return prev;','cur 为 NULL 表示未处理部分为空；新链头为 3，连接是 3→2→1→NULL。',[prev]);
  walkthroughs['ds-list']={assumption:'非循环单链表 1→2→3→NULL；图示每个节点的实际 next。',frames};
}
{
  const a=[1,3,5,7,9],frames=[];let lo=0,hi=4;
  const snap=(title,code,why,mid=null)=>frames.push(F(title,code,why,[['lo',String(lo)],['hi',String(hi)],['mid',mid===null?'—':String(mid)],['target','7']],a.map((v,i)=>cell(`a[${i}]`,String(v),i>=lo&&i<=hi?'候选区间':'已排除')),[],mid===null?[]:[mid]));
  snap('定义闭区间','lo=0; hi=n-1;','若目标存在，它的下标在 [lo,hi] 中。');
  while(lo<=hi){const mid=lo+Math.floor((hi-lo)/2);snap('查看中点','mid=lo+(hi-lo)/2;','中点把候选区间分成两边。',mid);if(a[mid]===7){snap('命中目标','return mid;','a[3]=7，返回下标 3。',mid);break;}if(a[mid]<7){lo=mid+1;snap('排除左侧和中点','lo=mid+1;','数组有序，中点及其左边都小于目标，安全排除。');}else{hi=mid-1;snap('排除右侧和中点','hi=mid-1;','中点及其右边都大于目标，安全排除。');}}
  walkthroughs['ds-binary']={assumption:'升序数组；闭区间 [lo,hi] 查找 target=7。',frames};
}
{
  const a=[5,1,4,2,3],frames=[];
  const snap=(title,code,why,i,j,focus=[])=>frames.push(F(title,code,why,[['轮次',String(i+1)],['比较位置',j===null?'—':`${j}, ${j+1}`]],a.map((v,k)=>cell(`a[${k}]`,String(v),k>=a.length-i?'已确定':'待排序')),[],focus));
  snap('初始数组','for (i=0; i<n-1; ++i)','每轮让未排序范围中的最大值走到右端。',0,null);
  for(let i=0;i<a.length-1;i++){let changed=false;for(let j=0;j<a.length-1-i;j++){snap('比较相邻元素',`if (a[${j}] > a[${j+1}])`,`比较 ${a[j]} 与 ${a[j+1]}；相等时不交换以保留原次序。`,i,j,[j,j+1]);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];changed=true;snap('交换逆序对',`swap(a[${j}], a[${j+1}]);`,'较大元素移动到右边，继续参加后面的比较。',i,j,[j,j+1]);}}snap('本轮完成',`// a[${a.length-1-i}] 已确定`,'本轮最大值已经到右端，下一轮的比较范围减少一个元素。',i+1,null);if(!changed)break;}
  snap('排序完成','// 若一整轮未交换，可提前结束','未交换说明所有相邻元素已非递减，无须继续剩余轮次。',a.length,null);
  walkthroughs['ds-sort']={assumption:'演示稳定冒泡排序；仅在左值严格大于右值时交换。',frames};
}
{
  const nodes=['A','B','C','D','E'],children=[[1,2],[3,4],[],[],[]],frames=[],stack=[],out=[];
  function snap(title,code,why,focus=[]){frames.push(F(title,code,why,[['调用栈',stack.map(i=>nodes[i]).join(' / ')||'空'],['输出',out.join(' ')||'空']],nodes.map((n,i)=>cell(n,out.includes(n)?'已访问':'未访问',stack.includes(i)?'调用中':'')),[[0,1],[0,2],[1,3],[1,4]],focus,out.join(' → ')));}
  function visit(i){stack.push(i);snap(`进入 ${nodes[i]}`,`preorder(${nodes[i]});`,'先序在进入节点后先访问根，再递归左右。',[i]);out.push(nodes[i]);snap(`访问 ${nodes[i]}`,`output(${nodes[i]});`,'写入输出序列后，再处理这个节点的子树。',[i]);for(const c of children[i])visit(c);stack.pop();snap(`返回 ${nodes[i]} 的调用者`,'return;','该子树处理完毕，恢复上一层继续处理剩余子树。',[i]);}
  visit(0);walkthroughs['ds-tree']={assumption:'A 的左右为 B、C；B 的左右为 D、E。图上连线表示树的父子关系。',kind:'tree',frames};
}
export function spiWalkthrough(mode){
  const pol=mode>>1,pha=mode&1,bits=[1,0,1,1],frames=[];let sampled=[];
  frames.push(F('片选有效，准备首位','CS = 0;',pha?'CPHA=1，首个边沿用于推出第 1 位，第二边沿采样。':'CPHA=0，首位必须在第一个边沿之前稳定，首边沿采样。',[['模式',String(mode)],['CPOL',String(pol)],['CPHA',String(pha)],['空闲 SCK',String(pol)]],[],[],[],''));
  for(let e=0;e<8;e++){
    const first=e%2===0,level=first?1-pol:pol,isSample=pha?!first:first,bit=Math.floor(e/2);
    if(isSample)sampled.push(bits[bit]);
    const frame=F(`第 ${e+1} 个边沿：${isSample?'采样':'推出/切换数据'}`,isSample?`received = (received << 1) | ${bits[bit]};`:'// 发送端在这一边沿更新待发送数据',isSample?'接收端读取已稳定的数据；数据建立与保持时间需满足从设备手册。':'发送端准备数据，接收端等待下一采样边沿；不能在同一瞬间既换数据又假设已稳定。',[['SCK 变化',first?`${pol} → ${level}`:`${1-pol} → ${level}`],['边沿类别',first?'第一边沿':'第二边沿'],['已采样',sampled.join(' ')||'无']],[],[],[],sampled.join(''));
    frame.edge=e;frames.push(frame);
  }
  return {kind:'spi',mode,assumption:'演示 MSB 先传的 4 位数据 1011；实际帧长度由双方配置。波形为理想示意。',frames};
}
walkthroughs['r-mutex']={assumption:'单核抢占调度，H=3、M=2、L=1；示意单把 Mutex 的基础优先级继承。',frames:[
  F('L 拿到锁','L: xSemaphoreTake(mutex,...);','H、M 尚未就绪，L 运行并进入临界区。',[['锁持有者','L'],['CPU','L']], [cell('H','阻塞','优先级 3'),cell('M','阻塞','优先级 2'),cell('L','运行/持锁','有效优先级 1')],[],[2]),
  F('H 就绪并抢占','H: 请求同一把锁','H 优先级最高先运行，但锁被 L 持有，H 不能完成申请。',[['锁持有者','L'],['CPU','H']], [cell('H','申请锁','3'),cell('M','就绪','2'),cell('L','就绪/持锁','1')],[],[0]),
  F('H 阻塞，L 继承优先级','// H 等锁，L 临时提升到 3','若没有继承，M=2 会抢占 L=1，延长 H 等待。继承让持锁者尽快完成。',[['H','阻塞等锁'],['L 有效优先级','3'],['CPU','L']], [cell('H','阻塞','等 L'),cell('M','就绪','2'),cell('L','运行/持锁','有效 3')],[],[2]),
  F('L 完成并释放','L: xSemaphoreGive(mutex);','共享资源操作完成，H 可以解除锁等待；在这个单锁例子中 L 恢复原优先级。',[['L 基础优先级','1'],['H','就绪']], [cell('H','就绪','3'),cell('M','就绪','2'),cell('L','就绪/无锁','1')],[],[0]),
  F('H 获得 CPU 与锁','H: 继续临界区','H 成为最高优先级就绪任务。继承只缩短持锁者受抢占时间，不能消除 H 等待临界区本身。',[['锁持有者','H'],['CPU','H']], [cell('H','运行/持锁','3'),cell('M','就绪','2'),cell('L','就绪','1')],[],[0])
]};
walkthroughs['os-sync']=walkthroughs['r-mutex'];
walkthroughs['r-queue']={assumption:'队列元素大小 sizeof(char*)，发送 char *p 指向可复用缓冲区 buf。',frames:[
  F('准备消息','strcpy(buf,"ABC"); p=buf;','缓冲区有数据，p 保存它的地址。',[['buf 地址','0x3000']], [cell('p','0x3000'),cell('队列','空'),cell('buf','ABC','0x3000')],[[0,2]],[2]),
  F('队列复制指针','xQueueSend(q, &p, 0);','队列按创建时大小拷贝 p 的地址值，没有复制 ABC。',[['item size','sizeof(char*)']], [cell('p','0x3000'),cell('队列项','0x3000'),cell('buf','ABC','0x3000')],[[0,2],[1,2]],[1]),
  F('生产者提前复用缓冲区','strcpy(buf,"XYZ");','地址没有变，地址指向的内容已被改写；队列并不是数据快照。',[['队列项','仍是 0x3000']], [cell('p','0x3000'),cell('队列项','0x3000'),cell('buf','XYZ','0x3000')],[[0,2],[1,2]],[2]),
  F('消费者读取新内容','xQueueReceive(q,&received,0);','消费者取到相同地址，读取的是现在的 XYZ，不是发送时的 ABC。',[['received','0x3000'],['实际消息','XYZ']], [cell('消费者指针','0x3000'),cell('队列','空'),cell('buf','XYZ','0x3000')],[[0,2]],[0,2]),
  F('建立正确交接规则','// 方案：值拷贝，或缓冲池所有权转移','小消息可直接按结构体大小拷贝；大消息用池，消费者归还前生产者不得复用该块。',[['归还条件','消费者处理完']], [cell('生产者','等待空闲块'),cell('消费者','独占当前块'),cell('buf','处理后归还')],[[1,2]],[1])
]};
