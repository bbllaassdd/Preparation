import {weakGroups} from './weak-focus.js';
const raw=String.raw;
const groups=Object.fromEntries(weakGroups.map((g,i)=>[g.id,{...g,index:i}]));
export const weakCoding=[];
function C(group,id,title,language,prompt,input,output,body,tests,steps,analysis,helper='',extra=''){
 const g=groups[group],isC=language==='C11',headers=isC?'#include <stdio.h>':'#include <iostream>\n'+extra+'using namespace std;';
 weakCoding.push({id:'weak-code-'+id,lesson:g.lesson,batch:'weak',focusGroup:group,focusOrder:g.index*4+3,original:false,
 title,language,level:'入门',difficulty:'基础',kind:language+' ACM 编程',format:'acm',track:'basics',order:25+weakCoding.length,
 source:'原创变式 · '+g.title,prompt,input,output,tests,steps,analysis,links:[],
 cases:tests.map(t=>'输入：\n'+t.input+'输出：\n'+t.output),hint:'先按照输入说明读取，再把操作拆成独立步骤。不会时再展开答案。',
 starter:headers+'\n\n'+(isC?'int main(void)':'int main()')+' {\n    // TODO：读取输入\n    // TODO：检查题目规定的边界并处理\n    // TODO：输出结果\n    return 0;\n}\n',
 solution:headers+'\n\n'+helper+(isC?'int main(void)':'int main()')+' {\n'+body+'\n    return 0;\n}\n',
 headerNotes:isC?'stdio.h 提供 scanf 和 printf。Node、数组和指针是 C 语言语法；本题用固定存储，不需要动态分配。':'iostream 提供 cin 和 cout。'+(extra?'iomanip 提供 fixed、setprecision，用于指定小数显示位数。':'本题用固定数组与指针，不需要额外容器。'),
 checks:['按约定输出，不加输入提示语。','先判断位置或除数是否有效，再访问或计算。','代码草稿与答案独立保存。']});
}
C('list','insert','在第 k 个位置插入链表节点（C）','C11','给出 n 个整数构成的单链表，在已有 k 个节点之后插入值 v。0≤n≤1000，0≤k≤n，值在 -1000000～1000000。k=0 表示插到头部，k=n 表示插到尾部。必须建立节点与 next 连接，再通过链表遍历输出。',
 '第一行 n；接下来 n 个整数；最后一行 k v。n=0 时直接读取 k v。','一行输出插入后的链表，元素间一个空格，无多余提示。',raw`    int n, k, v;
    if (scanf("%d", &n)!=1 || n<0 || n>1000) return 0;
    Node nodes[1001];
    for (int i=0;i<n;++i) {
        if (scanf("%d", &nodes[i].value)!=1) return 0;
        nodes[i].next=(i+1<n)?&nodes[i+1]:NULL;
    }
    if (scanf("%d %d", &k, &v)!=2 || k<0 || k>n) return 0;
    Node dummy={0,n?&nodes[0]:NULL};
    Node *p=&dummy;
    for (int i=0;i<k;++i) p=p->next;
    Node *s=&nodes[n];
    s->value=v;
    s->next=p->next;
    p->next=s;
    int first=1;
    for (Node *cur=dummy.next;cur!=NULL;cur=cur->next) {
        if (!first) printf(" ");
        printf("%d",cur->value);
        first=0;
    }
    printf("\n");`,[
 {input:'3\n10 20 30\n1 99\n',output:'10 99 20 30\n'},
 {input:'0\n0 7\n',output:'7\n'},
 {input:'2\n1 2\n2 3\n',output:'1 2 3\n'}
],['建立 nodes 中的节点，dummy.next 保存链表头；dummy 不是要输出的数据节点。固定数组对象在 main 结束前都有效。','从 dummy 走 k 次后，p 就在插入位置之前。k=0 时不走，统一处理头插；k=n 时走到尾节点。','先 s->next=p->next 保存原后继，再 p->next=s 接入。沿 next 遍历输出，空链、头部、尾部都使用同一套插入逻辑。'],'建立与输出时间 O(n)，找位置 O(k)，总时间 O(n)；固定上限存储 1001 个节点，所需有效节点空间 O(n)。',raw`typedef struct Node {
    int value;
    struct Node *next;
} Node;

`);
C('offset','relative','读取指针的相对下标（C++）','C++17','读取 n 个整数，将 p 指向 a[k]，再读取 p[t]。1≤n≤1000、0≤k<n、-1000≤t≤1000。若 k+t 不在数组范围内，输出 INVALID，不能先读取越界元素。',
 '第一行 n；接下来 n 个整数；最后一行 k t。','有效时输出目标整数，否则输出 INVALID。',raw`    int n, k, t;
    if (!(cin>>n) || n<1 || n>1000) return 0;
    int a[1000];
    for (int i=0;i<n;++i) if (!(cin>>a[i])) return 0;
    if (!(cin>>k>>t) || k<0 || k>=n || t<-1000 || t>1000) return 0;
    int target=k+t;
    if (target<0 || target>=n) {
        cout<<"INVALID\n";
    } else {
        int *p=&a[k];
        cout<<p[t]<<'\n';
    }`,[
 {input:'5\n10 20 30 40 50\n3 -2\n',output:'20\n'},
 {input:'3\n1 2 3\n2 1\n',output:'INVALID\n'},
 {input:'1\n-7\n0 0\n',output:'-7\n'}
],['p[t] 的目标下标为 k+t，先用整数下标计算这个位置。题设范围使 k+t 不会溢出。','target<0 或 target>=n 时输出 INVALID，此时不要形成越界指针或读取 p[t]。','范围有效才令 p=&a[k] 并读取 p[t]。负 t 可以有效，例如从 a[3] 向前两个位置来到 a[1]。'],'读入 O(n)、查询 O(1)，数组存储 O(n)，本实现固定上限 1000。');
C('bits','bit','对同一整数置位、清位、翻转（C）','C11','给出 0～65535 的普通无符号整数 x 和位号 b（0～15，最低位为 0）。分别从原始 x 计算把第 b 位置 1、置 0、翻转后的结果。三种操作彼此独立。',
 '一行两个整数 x b。','一行按十进制输出置位、清位、翻转的三个结果，用空格分隔。',raw`    unsigned int x;
    int b;
    if (scanf("%u %d", &x, &b)!=2 || x>65535u || b<0 || b>15) return 0;
    unsigned int mask=1u<<b;
    unsigned int set=x|mask;
    unsigned int clear=x&~mask;
    unsigned int flip=x^mask;
    printf("%u %u %u\n",set,clear,flip);`,[
 {input:'10 2\n',output:'14 10 14\n'},
 {input:'15 2\n',output:'15 11 11\n'},
 {input:'0 15\n',output:'32768 0 32768\n'}
],['1u<<b 构造只有目标位是 1 的掩码；先检查位号，避免非法移位。题设 b≤15，符合至少 16 位 unsigned int 的范围。','x|mask 把目标位置 1；x&~mask 把目标位置 0；x^mask 翻转。三个结果都读取原始 x，不把前一种操作结果当下一种的输入。','%u 读取和输出 unsigned int；按题目顺序打印。分别测试目标位原为 0、原为 1，以及最低和最高允许位。'],'时间 O(1)、额外空间 O(1)。');
C('cast','average','输出带两位小数的平均值（C++）','C++17','读取 n 个整数，输出平均值，保留两位小数。0≤n≤1000，每个值在 -1000000～1000000。n=0 时输出 EMPTY。必须保留整数除法会丢掉的小数部分。',
 '第一行 n；接下来 n 个整数，n=0 时没有这些整数。','平均值以两位小数显示；n=0 输出 EMPTY。',raw`    int n;
    if (!(cin>>n) || n<0 || n>1000) return 0;
    long long sum=0;
    for (int i=0;i<n;++i) {
        int x;
        if (!(cin>>x)) return 0;
        sum+=x;
    }
    if (n==0) cout<<"EMPTY\n";
    else {
        double average=static_cast<double>(sum)/n;
        cout<<fixed<<setprecision(2)<<average<<'\n';
    }`,[
 {input:'2\n3 4\n',output:'3.50\n'},
 {input:'3\n-2 -3 -4\n',output:'-3.00\n'},
 {input:'0\n',output:'EMPTY\n'}
],['sum 保存整数总和；题设最多 1000 个、每个绝对值不超 1000000，long long 足够保存总和。','n=0 单独处理，不能除以零；n>0 时先把 sum 转为 double，再除以 n。static_cast<double>(sum) 是 C++ 明确的数值转换写法。','不要写 static_cast<double>(sum/n)，那会先做整数除法。fixed 与 setprecision(2) 只控制显示两位小数，不会修复已经发生的整数截断。'],'时间 O(n)，额外空间 O(1)。','', '#include <iomanip>\n');
