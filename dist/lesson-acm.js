// Complete executable versions of the existing 22 original lesson exercises.
const raw=String.raw;
const drivers={};
const arrayC=raw`size_t n;
    if (scanf("%zu", &n) != 1 || n > 1000) return 0;
    int a[1000];
    for (size_t i = 0; i < n; ++i)
        if (scanf("%d", &a[i]) != 1) return 0;
`;
const arrayCpp=raw`size_t n;
    if (!(cin >> n) || n > 1000) return 0;
    vector<int> a(n);
    for (int &x : a) if (!(cin >> x)) return 0;
`;
const outputC=raw`for (size_t i = 0; i < used; ++i) {
        if (i) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");`;
function D(id,input,output,body,tests,extra=[],helper=''){drivers[id]={input,output,body,tests,extra,helper};}
D('swap','两个 int 整数 a、b。','交换后的两个整数，中间一个空格。',raw`int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 0;
    if (!swap_int(&a, &b)) return 0;
    printf("%d %d\n", a, b);`,[{input:'3 8\n',output:'8 3\n'},{input:'-5 -5\n',output:'-5 -5\n'}]);
D('reverse','0≤n≤1000，随后 n 个 int 整数。','反转后的数组，空数组输出空行。',arrayC+raw`    if (!reverse_ints(a, n)) return 0;
    size_t used = n;
    `+outputC,[{input:'4\n2 4 6 8\n',output:'8 6 4 2\n'},{input:'0\n',output:'\n'}]);
D('dedup','0≤n≤1000，随后 n 个非递减的 int 整数。','第一行新长度，第二行保留元素；零长度第二行为空行。',arrayC+raw`    size_t used = unique_sorted(a, n);
    printf("%zu\n", used);
    `+outputC,[{input:'6\n1 1 2 2 2 5\n',output:'3\n1 2 5\n'},{input:'0\n',output:'0\n\n'}]);
D('copy-string','容量 cap（0..1024）与一个不含空白、长度≤1000 的非空字符串。目标初始内容为 KEEP。空字符串等接口边界见原函数题。','成功输出 OK 加复制后的文本；失败输出 FAIL KEEP，证明目标没有改变。',raw`size_t cap;
    char source[1001], destination[1024] = "KEEP";
    if (scanf("%zu %1000s", &cap, source) != 2 || cap > sizeof destination) return 0;
    int ok = copy_text(destination, cap, source);
    printf("%s %s\n", ok ? "OK" : "FAIL", destination);`,[{input:'4 MCU\n',output:'OK MCU\n'},{input:'3 MCU\n',output:'FAIL KEEP\n'},{input:'0 MCU\n',output:'FAIL KEEP\n'}]);
D('substring','两个不含空白的非空字符串 text、pattern，各长≤1000。空模式串的接口边界保留在原函数题中。','第一次匹配的 0 起始下标，找不到输出 -1。',raw`char text[1001], pattern[1001];
    if (scanf("%1000s %1000s", text, pattern) != 2) return 0;
    const char *position = find_text(text, pattern);
    if (position) printf("%td\n", position - text);
    else printf("-1\n");`,[{input:'ababc abc\n',output:'2\n'},{input:'ab abc\n',output:'-1\n'}]);
D('transpose','按行输入 2×3 矩阵的六个 int 元素。','三行，每行两个整数，表示转置后的 3×2 矩阵。',raw`int source[2][3], target[3][2];
    for (int row = 0; row < 2; ++row)
        for (int col = 0; col < 3; ++col)
            if (scanf("%d", &source[row][col]) != 1) return 0;
    transpose23((const int (*)[3])source, target);
    for (int row = 0; row < 3; ++row)
        printf("%d %d\n", target[row][0], target[row][1]);`,[{input:'1 2 3\n4 5 6\n',output:'1 4\n2 5\n3 6\n'}]);
D('delete-nodes','先读 n（0..1000）和要删除的值，然后 n 个 int 节点值。','第一行删除数量，第二行剩余节点；空链表输出空行。',raw`size_t n;
    int value;
    if (scanf("%zu %d", &n, &value) != 2 || n > 1000) return 0;
    struct CNode *head = NULL;
    struct CNode **tail = &head;
    for (size_t i = 0; i < n; ++i) {
        int x;
        if (scanf("%d", &x) != 1) { clear_nodes(head); return 0; }
        struct CNode *node = malloc(sizeof *node);
        if (!node) { clear_nodes(head); return 1; }
        node->value = x;
        node->next = NULL;
        *tail = node;
        tail = &node->next;
    }
    printf("%zu\n", remove_value(&head, value));
    int first = 1;
    for (struct CNode *node = head; node; node = node->next) {
        if (!first) printf(" ");
        printf("%d", node->value);
        first = 0;
    }
    printf("\n");
    clear_nodes(head);`,[{input:'4 2\n2 2 3 2\n',output:'3\n3\n'},{input:'2 1\n1 1\n',output:'2\n\n'},{input:'0 7\n',output:'0\n\n'}],[],raw`static void clear_nodes(struct CNode *head) {
    while (head) {
        struct CNode *next = head->next;
        free(head);
        head = next;
    }
}
`);
D('alloc-array','n（0..1000）和 n 个 int 整数。','成功第一行输出长度，第二行输出复制数组；分配失败输出 FAIL。',arrayC+raw`    int *copy = NULL;
    if (!clone_ints(a, n, &copy)) { printf("FAIL\n"); return 0; }
    printf("%zu\n", n);
    for (size_t i = 0; i < n; ++i) {
        if (i) printf(" ");
        printf("%d", copy[i]);
    }
    printf("\n");
    free(copy);`,[{input:'3\n2 4 6\n',output:'3\n2 4 6\n'},{input:'0\n',output:'0\n\n'}]);
D('student-sort','n（0..1000），随后 n 行 id score（均为 int）。','按原题规则排序，每行 id score。空数组不输出记录。',raw`size_t n;
    struct Student students[1000];
    if (scanf("%zu", &n) != 1 || n > 1000) return 0;
    for (size_t i = 0; i < n; ++i)
        if (scanf("%d %d", &students[i].id, &students[i].score) != 2) return 0;
    sort_students(students, n);
    for (size_t i = 0; i < n; ++i)
        printf("%d %d\n", students[i].id, students[i].score);`,[{input:'3\n3 90\n1 90\n2 95\n',output:'2 95\n1 90\n3 90\n'},{input:'0\n',output:''}]);
D('callback-filter','n（0..1000）和 n 个 int 整数。本完整程序使用“保留正数”回调。','第一行保留数量，第二行按原顺序输出正数。',arrayC+raw`    size_t used = filter_ints(a, n, positive);
    printf("%zu\n", used);
    `+outputC,[{input:'4\n1 -2 3 0\n',output:'2\n1 3\n'},{input:'0\n',output:'0\n\n'}],[],raw`static int positive(int x) { return x > 0; }
`);
D('buffer-move','先读 dst、src、n 三个非负偏移/长度，再读一个长度≤1000 的非空 ASCII 单词。cap 为原单词字节数，不含终止零。','成功输出 OK 与搬移后的文本；非法范围输出 FAIL 与原文本。',raw`size_t dst, src, n;
    unsigned char buffer[1001];
    if (scanf("%zu %zu %zu %1000s", &dst, &src, &n, (char *)buffer) != 4) return 0;
    size_t cap = strlen((const char *)buffer);
    int ok = move_region(buffer, cap, dst, src, n);
    printf("%s %s\n", ok ? "OK" : "FAIL", (char *)buffer);`,[{input:'1 0 4 ABCDE\n',output:'OK AABCD\n'},{input:'0 1 4 ABCDE\n',output:'OK BCDEE\n'},{input:'4 0 2 ABCDE\n',output:'FAIL ABCDE\n'}],['string.h']);
D('minmax','n（0..1000）和 n 个 int 整数。','非空数组输出 OK 最小值 最大值；空数组输出 FAIL。',arrayC+raw`    int lo, hi;
    if (minmax_ints(a, n, &lo, &hi)) printf("OK %d %d\n", lo, hi);
    else printf("FAIL\n");`,[{input:'4\n5 -2 8 0\n',output:'OK -2 8\n'},{input:'0\n',output:'FAIL\n'}]);
D('ref-swap','两个 int 整数。','交换后的两个整数。',raw`int a, b;
    if (!(cin >> a >> b)) return 0;
    swap_refs(a, b);
    cout << a << ' ' << b << '\n';`,[{input:'2 9\n',output:'9 2\n'}]);
D('lifetime-counter','一个复制数量 n，0≤n≤1000。先创建一个对象，再在内层作用域复制 n 个。','一行输出四个计数：原对象创建后、内层复制后、内层结束后、全部结束后。',raw`size_t n;
    if (!(cin >> n) || n > 1000) return 0;
    {
        LiveCounter original;
        cout << LiveCounter::alive() << ' ';
        {
            vector<LiveCounter> copies(n, original);
            cout << LiveCounter::alive() << ' ';
        }
        cout << LiveCounter::alive() << ' ';
    }
    cout << LiveCounter::alive() << '\n';`,[{input:'2\n',output:'1 3 1 0\n'},{input:'0\n',output:'1 1 1 0\n'}],['vector']);
D('deep-text','一个非空 ASCII 单词（长度≤1000）和一个替换首字符，不含空白。','第一行原字符串，第二行修改后的深拷贝，第三行移动后源长度与目标字符串。',raw`string text;
    char replacement;
    if (!(cin >> text >> replacement) || text.empty() || text.size() > 1000) return 0;
    TinyText original(text.c_str());
    TinyText copy = original;
    copy.at(0) = replacement;
    cout << original.c_str() << '\n' << copy.c_str() << '\n';
    TinyText moved(std::move(original));
    cout << original.size() << ' ' << moved.c_str() << '\n';`,[{input:'MCU X\n',output:'MCU\nXCU\n0 MCU\n'}],['string']);
D('virtual-sensor','基础值 value 和偏移 offset，均在 -1000000 到 1000000 之间。','一行输出固定值、偏移后读数、两个传感器读数之和。',raw`int value, offset;
    if (!(cin >> value >> offset)) return 0;
    if (value < -1000000 || value > 1000000 || offset < -1000000 || offset > 1000000) return 0;
    FixedSensor source(value);
    vector<unique_ptr<Sensor>> sensors;
    sensors.push_back(make_unique<FixedSensor>(value));
    sensors.push_back(make_unique<OffsetSensor>(source, offset));
    cout << sensors[0]->read() << ' ' << sensors[1]->read() << ' '
         << sum_readings(sensors) << '\n';`,[{input:'10 3\n',output:'10 13 23\n'},{input:'-5 2\n',output:'-5 -3 -8\n'}]);
D('erase-vector','n（0..1000）和 n 个 int 整数。','第一行剩余数量，第二行所有奇数，保持原顺序。',arrayCpp+raw`    erase_even(a);
    cout << a.size() << '\n';
    for (size_t i = 0; i < a.size(); ++i) {
        if (i) cout << ' ';
        cout << a[i];
    }
    cout << '\n';`,[{input:'6\n2 1 4 3 6 5\n',output:'3\n1 3 5\n'},{input:'0\n',output:'0\n\n'}]);
D('first-unique','一整行字节文本，长度≤1000。空行允许，按字节下标计数。','第一个不重复字节的下标，没有则 -1。',raw`string text;
    if (!getline(cin, text) || text.size() > 1000) return 0;
    auto position = first_unique(text);
    if (position) cout << *position << '\n';
    else cout << -1 << '\n';`,[{input:'swiss\n',output:'1\n'},{input:'aabb\n',output:'-1\n'},{input:'\n',output:'-1\n'}]);
D('raii-batch','n（0..1000）和 n 个 int id；负 id 导致构造抛异常。','成功：第一行对象数量与 alive，第二行销毁后的 alive。失败：输出 ERROR 与清理后的 alive。',arrayCpp+raw`    try {
        {
            auto objects = make_items(a);
            cout << objects.size() << ' ' << Item::alive << '\n';
        }
        cout << Item::alive << '\n';
    } catch (const std::invalid_argument &) {
        cout << "ERROR " << Item::alive << '\n';
    }`,[{input:'3\n1 2 3\n',output:'3 3\n0\n'},{input:'3\n1 -1 2\n',output:'ERROR 0\n'},{input:'0\n',output:'0 0\n0\n'}]);
D('template-ring','操作数量 q（0..1000）。之后每行 P x（入队）、O（出队）、S（查询数量）。本完整程序容量为 4，x 为 int。','P 输出 OK/FULL，O 输出值或 EMPTY，S 输出当前数量，各占一行。',raw`int q;
    if (!(cin >> q) || q < 0 || q > 1000) return 0;
    FixedQueue<int, 4> queue;
    for (int i = 0; i < q; ++i) {
        char operation;
        if (!(cin >> operation)) return 0;
        if (operation == 'P') {
            int value;
            if (!(cin >> value)) return 0;
            cout << (queue.push(value) ? "OK" : "FULL") << '\n';
        } else if (operation == 'O') {
            int value;
            if (queue.pop(value)) cout << value << '\n';
            else cout << "EMPTY\n";
        } else if (operation == 'S') cout << queue.size() << '\n';
        else return 0;
    }`,[{input:'9\nO\nP 1\nP 2\nP 3\nP 4\nP 5\nO\nP 5\nS\n',output:'EMPTY\nOK\nOK\nOK\nOK\nFULL\n1\nOK\n4\n'}]);
D('checked-cast','一个类型字母 T/M/N 与一个有限浮点数：T 温度设备，M 电机，N 空指针。','类型匹配输出 OK 温度，否则输出 FAIL。',raw`char type;
    double temperature;
    if (!(cin >> type >> temperature)) return 0;
    TempDevice temp(temperature);
    MotorDevice motor;
    const Device *device = nullptr;
    if (type == 'T') device = &temp;
    else if (type == 'M') device = &motor;
    else if (type != 'N') return 0;
    double result = 0;
    if (read_temperature(device, result)) cout << "OK " << result << '\n';
    else cout << "FAIL\n";`,[{input:'T 23.5\n',output:'OK 23.5\n'},{input:'M 20\n',output:'FAIL\n'},{input:'N 20\n',output:'FAIL\n'}]);
D('poly-clone','n（0..1000），随后 n 个标记：NULL 或 -1000000 到 1000000 的整数。本程序复制后将第一个非空对象的值加 1。','两行分别输出原数组与副本，保留 NULL 标记；空数组输出两空行。',raw`size_t n;
    if (!(cin >> n) || n > 1000) return 0;
    vector<unique_ptr<Config>> source;
    for (size_t i = 0; i < n; ++i) {
        string token;
        if (!(cin >> token)) return 0;
        if (token == "NULL") source.push_back(nullptr);
        else source.push_back(make_unique<IntConfig>(stoi(token)));
    }
    auto copy = copy_configs(source);
    for (auto &p : copy) {
        if (p) { dynamic_cast<IntConfig &>(*p).number += 1; break; }
    }
    print_configs(source);
    print_configs(copy);`,[{input:'3\n7 NULL -2\n',output:'7 NULL -2\n8 NULL -2\n'},{input:'0\n',output:'\n\n'}],['string'],raw`static void print_configs(const vector<unique_ptr<Config>> &values) {
    for (size_t i = 0; i < values.size(); ++i) {
        if (i) cout << ' ';
        if (values[i]) cout << values[i]->value();
        else cout << "NULL";
    }
    cout << '\n';
}
`);

export function attachLessonAcm(items){
 for(const c of items){
  const driver=drivers[c.id.slice(4)];
  if(!driver)throw new Error('Missing executable driver: '+c.id);
  const isC=c.language==='C11';
  const extra=[isC?'stdio.h':'iostream',...driver.extra];
  const missing=extra.filter(h=>!c.solution.includes('#include <'+h+'>')).map(h=>'#include <'+h+'>').join('\n');
  c.acm={input:driver.input,output:driver.output,tests:driver.tests,
   solution:missing+'\n'+c.solution+'\n'+(isC?'':'using namespace std;\n')+driver.helper+'\n'+(isC?'int main(void)':'int main()')+' {\n    '+driver.body+'\n    return 0;\n}\n',
   steps:[isC?'main 用 scanf 读入样例数据，用 printf 输出。读取单个变量提供地址；数组长度由输入给出。':'main 用 cin 读取、cout 输出；原函数或类仍负责核心处理，不把输入输出混进类的资源管理逻辑。','先按下面的完整程序输入格式读取，再调用上面的原题接口；输入样例仅是展示，不覆盖所有接口边界。','输出不加提示语，空格和换行按格式规定。main 中申请的资源在使用结束时释放，或由 RAII 自动管理。'],
   headerNotes:isC?'stdio.h 负责 scanf/printf。原题所需的 stdbool.h、stddef.h、stdlib.h 等仍保留：它们分别提供 bool、size_t、内存分配等功能，不是另一种 C 语言。':'iostream 负责 cin/cout。string、vector、memory 等头文件分别提供字符串、容器与智能指针；完整程序按原题功能需要包含，不使用 bits/stdc++.h。'
  };
 }
}
