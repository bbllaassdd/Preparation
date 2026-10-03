export const expansionCoding=[];
function C(id,lesson,language,level,title,prompt,starter,cases,hint,solution,steps,checks,relatedLessons=[]){
 expansionCoding.push({id,lesson,language,level,title,prompt,starter,cases,hint,solution,steps,checks,relatedLessons,kind:language+' 编程',analysis:steps.join('\n'),source:'原创专题编程 · 定义见题干',links:[]});
}
C('valley-count-c','ds-valley','C11','入门','C：统计严格内部波谷',
 '实现size_t count_valleys(const int *a,size_t n)。仅统计1<=i<n-1且a[i]严格小于两侧邻居的下标；端点不算，相等不算。n=0允许a=NULL；n>0要求a指向至少n个有效int。时间O(n)，额外空间O(1)。',
 '#include <stddef.h>\nsize_t count_valleys(const int *a, size_t n) {\n    // TODO：先处理n<3，再检查左右邻居\n}',
 ['[5,2,6,1,4] → 2（下标1和3）','[5,2,2,6] → 0','[]、[1]、[2,1] → 0','[2147483647,-2147483648,0] → 1（32位int环境）'],
 '不要用相减判断大小。先确认n>=3，再遍历i=1至n-2。',
 '#include <stddef.h>\nsize_t count_valleys(const int *a,size_t n){\n    if(n<3) return 0;\n    size_t count=0;\n    for(size_t i=1;i<n-1;++i){\n        if(a[i]<a[i-1] && a[i]<a[i+1]) ++count;\n    }\n    return count;\n}',
 ['n<3没有同时拥有左右邻居的位置，先返回；这样n-1不会在空数组时无符号回绕。','每个内部下标比较两次，成立才计数，局部最小不必是全局最小。','最多扫描n-2次，时间O(n)、空间O(1)；直接比较避免极端整数相减溢出。'],
 ['端点不统计','相等邻居不算','INT_MIN/INT_MAX直接比较','n>0时调用者保证指针有效'],['c-array']);
C('valley-plateau-cpp','ds-valley','C++17','进阶','C++：把连续平底只算一个波谷',
 '实现count_plateau_valleys。每个最大的连续相等段[l,r]视为一个平台；仅当两侧都存在且严格高于平台时计1。首尾平台不算。返回数量，不能对同一平台重复计数。',
 '#include <vector>\n#include <cstddef>\nstd::size_t count_plateau_valleys(const std::vector<int>& a) {\n    // TODO：找到相等段右端，再比较外侧\n}',
 ['[5,2,2,6,1,4] → 2','[3,3,3] → 0','[2,2,5,1,1] → 0','[9,4,4,4,8] → 1'],
 '每轮令r从l出发扩展到相等段末尾，然后l=r+1。单元素也是平台。',
 '#include <vector>\n#include <cstddef>\nstd::size_t count_plateau_valleys(const std::vector<int>& a){\n    const std::size_t n=a.size();\n    std::size_t count=0,l=0;\n    while(l<n){\n        std::size_t r=l;\n        while(r+1<n && a[r+1]==a[l]) ++r;\n        if(l>0 && r+1<n && a[l-1]>a[l] && a[r+1]>a[r]) ++count;\n        l=r+1;\n    }\n    return count;\n}',
 ['内层只吞掉等于a[l]的连续元素，因此得到最大的相等段，而非所有同值元素。','左右外邻居必须都存在且严格更高；平台接触数组端点就不计数。','l每次跳过整个平台，各元素最多扫描常数次；双层while仍是总时间O(n)，额外空间O(1)。'],
 ['全相等','平台接触首尾','多个平台','严格单点仍能计数'],['cpp-container']);
C('valley-longest-cpp','ds-valley-longest','C++17','进阶','C++：最长严格谷，先写易验证的动态规划',
 '实现longest_valley。返回最长连续子数组长度：先严格下降至少一步，再严格上升至少一步。相等会打断，两侧都必须存在；不存在返回0。要求O(n)时间，允许O(n)空间。',
 '#include <vector>\n#include <cstddef>\nstd::size_t longest_valley(const std::vector<int>& a) {\n    // TODO：down表示以i结束的下降长度，up表示从i开始的上升长度\n}',
 ['[9,7,4,6,8,3,5] → 5','[1,2,3] → 0','[5,2,2,4] → 0','[8,5,1,3,6] → 5'],
 '谷底i的两侧长度都包含i，所以合并时减1；要求down[i]>1且up[i]>1。',
 '#include <vector>\n#include <cstddef>\n#include <algorithm>\nstd::size_t longest_valley(const std::vector<int>& a){\n    const std::size_t n=a.size();\n    if(n<3) return 0;\n    std::vector<std::size_t> down(n,1),up(n,1);\n    for(std::size_t i=1;i<n;++i)\n        if(a[i]<a[i-1]) down[i]=down[i-1]+1;\n    for(std::size_t i=n-1;i>0;--i)\n        if(a[i-1]<a[i]) up[i-1]=up[i]+1;\n    std::size_t best=0;\n    for(std::size_t i=1;i<n-1;++i)\n        if(down[i]>1 && up[i]>1)\n            best=std::max(best,down[i]+up[i]-1);\n    return best;\n}',
 ['down初始为1，代表单个元素。只在严格下降时接上前一个下降段；否则保留1。up反向同理。','两边都超过1才有完整谷。合并减去重复谷底，枚举所有谷底取最大。','三遍线性扫描为O(n)，两个长度数组为O(n)额外空间。反向循环用i>0再访问i-1，避免size_t减到负数。'],
 ['纯上升/纯下降必须为0','相等打断','n<3','与暴力枚举连续区间结果对拍'],['cpp-container']);
C('valley-longest-c','ds-valley-longest','C11','挑战','C：把最长谷优化到 O(1) 额外空间',
 '同上一题定义，实现longest_valley_constant，仅保留常数个变量。n=0允许a=NULL；n>0要求有效数组。尤其处理上升转下降时，新谷与旧谷可以共用峰顶。',
 '#include <stddef.h>\nsize_t longest_valley_constant(const int *a, size_t n) {\n    // TODO：记录下降边数、上升边数和最佳长度\n}',
 ['[9,7,4,6,8,3,5] → 5','[6,3,5,2,4,7] → 4（[5,2,4,7]）','[4,2,2,3] → 0','[] → 0'],
 '下降边出现且up>0：旧谷结束，从新下降边计down=1。相等清空；只有down>0才允许构成上升半坡。',
 '#include <stddef.h>\nsize_t longest_valley_constant(const int *a,size_t n){\n    size_t down=0,up=0,best=0;\n    for(size_t i=1;i<n;++i){\n        if(a[i]<a[i-1]){\n            if(up>0) down=0;\n            ++down;\n            up=0;\n        } else if(a[i]>a[i-1]){\n            if(down>0){\n                ++up;\n                size_t length=down+up+1;\n                if(length>best) best=length;\n            }\n        } else {\n            down=0;\n            up=0;\n        }\n    }\n    return best;\n}',
 ['down/up记录的是边数。尚未有下降边时，只上升不能形成谷，不更新答案。','上升后又下降，新的下降边从相邻峰顶开始，所以清旧down后置为1；相等则彻底断开。','每条相邻边恰好处理一次，O(n)时间，O(1)空间；有效候选长为down+up+1。用O(n)数组版或暴力版检查优化是否正确。'],
 ['上升转下降的共用峰顶','相等后重新开始','多个谷长短不同','最小/最大整数'],['c-array']);
C('linux-launch-c','linux-exec','C11','挑战','Linux C：fork、execv、waitpid 串起一次程序运行',
 '在单线程Linux/POSIX程序中实现run_program(path,argv,status)。path为绝对路径，argv以NULL结束且argv[0]非空，status指向有效int。创建子进程执行execv，父等待并把原始等待状态写入*status。返回0表示已收集子状态；父端错误返回-1并设置errno。exec失败时子以约定码127退出。注意：返回0不等于新程序业务成功，也不能凭127唯一辨别exec失败与程序主动退出127。',
 '#include <sys/types.h>\n#include <sys/wait.h>\n#include <unistd.h>\n#include <errno.h>\nint run_program(const char *path, char *const argv[], int *status) {\n    // TODO：fork三分支，子execv失败_exit，父waitpid处理EINTR\n}',
 ['/bin/true及有效argv → 返回0，WIFEXITED为真，退出码0','/bin/false → 返回0，正常退出码非0','不存在的路径 → 返回0，子正常退出码127','参数NULL → 返回-1，errno=EINVAL'],
 '先检查指针参数。子exec成功不会返回；若回来就_exit(127)。父只在waitpid返回-1且errno==EINTR时重试。',
 '#include <sys/types.h>\n#include <sys/wait.h>\n#include <unistd.h>\n#include <errno.h>\nint run_program(const char *path,char *const argv[],int *status){\n    if(!path || !argv || !argv[0] || !status){\n        errno=EINVAL;\n        return -1;\n    }\n    pid_t pid=fork();\n    if(pid<0) return -1;\n    if(pid==0){\n        execv(path,argv);\n        _exit(127);\n    }\n    int local_status;\n    pid_t result;\n    do {\n        result=waitpid(pid,&local_status,0);\n    } while(result<0 && errno==EINTR);\n    if(result<0) return -1;\n    *status=local_status;\n    return 0;\n}',
 ['fork返回负数则没有子进程；返回0进入子分支。execv按给定路径执行，不做Shell重定向解析，失败立即_exit。','父指定pid等待，EINTR重试。先把状态放局部变量，成功收集后才写调用者输出；再由调用者先WIFEXITED后WEXITSTATUS。','函数包含阻塞等待，其耗时由被执行程序决定。限定无其他回收者、正常SIGCHLD回收设定、单线程；若需要精确传exec errno，可另设带close-on-exec的错误管道。'],
 ['在Linux/WSL编译：Windows MinGW不实现fork','不要把*status直接当退出码','参数数组末尾NULL由调用者保证','外部程序不退出，父会继续等待'],['linux-fork','linux-wait']);
