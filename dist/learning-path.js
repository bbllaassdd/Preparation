// Dependencies are editorial learning order, not a restriction on opening a lesson.
export const pathGroups={
 c:[['变量、表达式与类型',['c-start-variable','c-start-bytes','c-start-expression','c-sizeof','c-types','c-conversion','c-float']],['地址与指针基础',['c-address','c-pointer-declare','c-dereference','c-pointer-change']],['数组、字符串与函数',['c-array-start','c-function-start','c-array','c-string','c-function']],['指针进阶',['c-pointer','c-array-pointer','c-pointerconst','c-doubleptr','c-funcptr']],['结构体、内存与宏',['c-struct-start','c-struct','c-union','c-heap','c-memcpy','c-keywords','c-bits','c-macro','c-ub']]],
 cpp:[['引用与对象生命周期',['cpp-reference','cpp-ctor','cpp-copy','cpp-new']],['多态与类型转换',['cpp-virtual','cpp-slicing','cpp-cast']],['容器与泛型',['cpp-container','cpp-template']]],
 rtos:[['先理解任务与调度',['r-task','r-priority-basics','r-delay']],['任务通信与同步',['r-queue','r-notify','r-mutex','r-priority-inversion','r-critical','r-eventloss']],['中断、时间与内存',['r-isr','r-nvic-priority','r-timer','r-tickless','r-memory','r-heap']]],
 stm32:[['时钟与基本外设',['stm32-clock','stm32-gpio','stm32-timer','stm32-capture']],['数据采集与接收',['stm32-adc','stm32-dma','stm32-uartdma']],['可靠性与低功耗',['stm32-watchdog','stm32-rtc','stm32-lowpower']]],
 protocol:[['串行通信与时序',['p-uart','p-spi','p-i2c']],['总线与组帧',['p-can','p-canfd','p-rs485','p-packet']],['校验与性能',['p-crc','p-throughput']]],
 ds:[['复杂度与线性结构',['ds-complexity','ds-array','ds-list','ds-queue','ds-hash']],['查找与排序',['ds-sort','ds-binary','ds-lowerbound','ds-prefix']],['树、图与递归',['ds-tree','ds-heap','ds-recursion','ds-graph','ds-dp']],['笔试应用：波谷',['ds-valley','ds-valley-longest']]],
 linux:[['命令与进程基础',['linux-start','linux-shell','linux-fork','linux-exec','linux-wait']],['文件与进程通信',['linux-fd','linux-ipc','linux-io']],['设备树、驱动与网络',['linux-devicetree','linux-driver','n-linux']]],
 memory:[['从源码到运行',['mem-sections','mem-startup','mem-map']],['存储与访问',['mem-endian','mem-stack','mem-flash','mem-cache']]],
 arm:[['寄存器与指令',['arm-register','arm-assembly']],['中断与异常',['arm-interrupt','arm-exception']]],
 os:[['调度与同步',['os-schedule','os-sync','os-deadlock']],['I/O 与地址空间',['os-io','os-virtual']]],
 engineering:[['定位问题与管理代码',['e-debug','e-git']],['控制与状态管理',['e-pid','e-fsm']]],
 network:[['传输与应用协议',['n-tcpudp','n-mqtt','n-video']]],
 project:[['用真实项目练习表达',['pr-watch','pr-sorter','pr-robot']]]
};
export function chaptersFor(module,lessons){const items=lessons.filter(l=>l.module===module);const seen=new Set();const result=(pathGroups[module]||[]).map(([title,ids])=>({title,lessons:ids.map(id=>items.find(l=>l.id===id)).filter(l=>l&&!seen.has(l.id)&&seen.add(l.id))})).filter(g=>g.lessons.length);const rest=items.filter(l=>!seen.has(l.id));if(rest.length)result.push({title:'继续深入',lessons:rest});return result;}
export const orderedLessons=lessons=>[...new Set(lessons.map(l=>l.module))].flatMap(m=>chaptersFor(m,lessons).flatMap(g=>g.lessons));
export const cleanTitle=title=>title.replace(/^\d+\s*[·.、]\s*/, '');
export const prerequisiteIds={
 'c-start-bytes':['c-start-variable'],'c-start-expression':['c-start-variable'],'c-sizeof':['c-start-bytes'],'c-types':['c-sizeof'],
 'c-address':['c-start-variable','c-start-bytes'],'c-pointer-declare':['c-address'],'c-dereference':['c-pointer-declare'],'c-pointer-change':['c-dereference'],
 'c-array-start':['c-start-variable','c-sizeof'],'c-function-start':['c-start-expression','c-dereference'],'c-pointer':['c-array-start','c-pointer-change'],
 'c-array-pointer':['c-array','c-pointer'],'c-doubleptr':['c-pointer-change'],'c-funcptr':['c-function-start','c-pointer-declare'],
 'c-struct-start':['c-start-variable'],'c-struct':['c-struct-start','c-sizeof'],'r-task':['os-schedule'],'r-priority-basics':['r-task'],
 'r-priority-inversion':['r-mutex','r-priority-basics'],'r-nvic-priority':['arm-interrupt','r-priority-basics'],
 'stm32-uartdma':['p-uart','stm32-dma'],'p-spi':['stm32-gpio'],'linux-exec':['linux-fork'],'ds-valley-longest':['ds-valley','ds-array']
};
export const moduleTiers=[['优先掌握',['c','stm32','rtos','protocol']],['重点补齐',['ds','os','memory','engineering']],['按岗位扩展',['cpp','arm','linux','network','project']]];
