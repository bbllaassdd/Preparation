// Original beginner problems. Each language has a separately compilable main.
const raw=String.raw;
const tasks=[];
function add(id,title,lesson,cppLesson,prompt,input,output,cBody,cppBody,tests,steps,complexity){tasks.push({id,title,lesson,cppLesson,prompt,input,output,cBody,cppBody,tests,steps,complexity});}
add('sum','两数求和','c-start-variable','cpp-reference','读取两个整数并输出它们的和。每个整数在 -1000000 到 1000000 之间。','一行两个整数 a、b。','一行一个整数 a+b。',raw`int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 0;
    printf("%d\n", a + b);`,raw`int a, b;
    if (!(cin >> a >> b)) return 0;
    cout << a + b << '\n';`,[{input:'3 5\n',output:'8\n'},{input:'-4 4\n',output:'0\n'}],['a、b 是保存输入值的变量，声明并不等于已经读取数据。','C 的 scanf 要通过地址写入变量，因此用 &a、&b；printf 输出值时写 a+b，不加 &。','C++ 用 cin >> a >> b 读取，再用 cout << 表达式输出；>> 和 << 在这里是流操作。','%d 对应 int；两个输入在给定范围内，和不会超出普通 32 位 int 范围。'],'时间 O(1)，额外空间 O(1)。');
add('eof','读到 EOF 的多组求和','c-function-start','cpp-reference','每次读取两个整数并求和，直到输入结束。每个数在 -1000000 到 1000000 之间。','若干行，每行两个整数；没有组数 T。','每组输出一行和。',raw`int a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        printf("%d\n", a + b);
    }`,raw`int a, b;
    while (cin >> a >> b) {
        cout << a + b << '\n';
    }`,[{input:'1 2\n3 4\n-2 2\n',output:'3\n7\n0\n'},{input:'',output:''}],['这里没有 T，不能把第一项误读为组数。','scanf 返回成功赋值的数量；只有读到两个数才进入循环，不用 while(!feof(stdin))。','cin 的读取表达式在失败或输入结束后变为假；不会再处理上一组旧值。','每组在循环内输出，换行后继续读下一组。'],'共 k 组时，时间 O(k)，额外空间 O(1)。');
add('cases','先读 T 的多组求和','c-start-expression','cpp-reference','先读取组数 T，再处理恰好 T 组两数求和。0≤T≤1000，每个数在 -1000000 到 1000000 之间。','第一行 T，随后 T 行，每行 a、b。','每组一行和。',raw`int t;
    if (scanf("%d", &t) != 1 || t < 0 || t > 1000) return 0;
    for (int i = 0; i < t; ++i) {
        int a, b;
        if (scanf("%d %d", &a, &b) != 2) return 0;
        printf("%d\n", a + b);
    }`,raw`int t;
    if (!(cin >> t) || t < 0 || t > 1000) return 0;
    for (int i = 0; i < t; ++i) {
        int a, b;
        if (!(cin >> a >> b)) return 0;
        cout << a + b << '\n';
    }`,[{input:'3\n1 2\n-3 5\n0 0\n',output:'3\n2\n0\n'},{input:'0\n',output:''}],['T 是题目规定的组数，不参与求和。','i 从 0 开始，条件 i<t 恰好执行 T 次；i<=t 会多读一组。','每组在循环内声明 a、b 并读取，避免把同一组重复计算。'],'时间 O(T)，额外空间 O(1)。');
add('sentinel','遇到 0 0 结束','c-start-expression','cpp-reference','依次读取 a、b，遇到两个数都为 0 时结束，不输出这一组。其他数在 -1000000 到 1000000 之间。','多组两个整数，最后一组为 0 0。','结束标记之前每组输出一行和。',raw`int a, b;
    while (scanf("%d %d", &a, &b) == 2) {
        if (a == 0 && b == 0) break;
        printf("%d\n", a + b);
    }`,raw`int a, b;
    while (cin >> a >> b) {
        if (a == 0 && b == 0) break;
        cout << a + b << '\n';
    }`,[{input:'0 5\n-3 3\n0 0\n',output:'5\n0\n'},{input:'0 0\n',output:''}],['&& 表示两个条件都成立；用 || 会错误地把 0 5 当成结束。','判断结束标记必须放在输出之前，不能多输出一个 0。','-3 3 的和虽然是 0，但输入不是 0 0，仍需输出。'],'处理 k 组，时间 O(k)，额外空间 O(1)。');
add('parity','判断奇偶','c-start-expression','cpp-reference','判断整数 n 是奇数还是偶数。-1000000≤n≤1000000。','一个整数 n。','偶数输出 EVEN，奇数输出 ODD。',raw`int n;
    if (scanf("%d", &n) != 1) return 0;
    if (n % 2 == 0) printf("EVEN\n");
    else printf("ODD\n");`,raw`int n;
    if (!(cin >> n)) return 0;
    if (n % 2 == 0) cout << "EVEN\n";
    else cout << "ODD\n";`,[{input:'0\n',output:'EVEN\n'},{input:'-3\n',output:'ODD\n'}],['% 是整数余数运算，n%2==0 表示可被 2 整除。','奇数应判断余数不为 0；负奇数余数可能是 -1，不应只判断 ==1。','0 可以被 2 整除，是偶数。'],'时间 O(1)，额外空间 O(1)。');
add('max3','三个整数的最大值','c-start-variable','cpp-reference','读取三个整数，输出最大值。每个数在 -1000000 到 1000000 之间。','三个整数 a、b、c。','一个最大值。',raw`int a, b, c;
    if (scanf("%d %d %d", &a, &b, &c) != 3) return 0;
    int best = a;
    if (b > best) best = b;
    if (c > best) best = c;
    printf("%d\n", best);`,raw`int a, b, c;
    if (!(cin >> a >> b >> c)) return 0;
    int best = a;
    if (b > best) best = b;
    if (c > best) best = c;
    cout << best << '\n';`,[{input:'-8 -2 -5\n',output:'-2\n'},{input:'4 4 4\n',output:'4\n'}],['先用真实输入 a 初始化 best，不用 0，否则全负数会出错。','比较 b 后，best 是前两个数的最大值；再比较 c 得到整体最大值。','两个 if 都要执行，不应把第二次比较写成 else if。'],'时间 O(1)，额外空间 O(1)。');
add('sum-n','循环求 1 到 n 的和','c-start-expression','cpp-reference','用循环计算 1+2+…+n；0≤n≤1000000。','一个整数 n。','输出和，n=0 时输出 0。',raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 1000000) return 0;
    long long total = 0;
    for (int i = 1; i <= n; ++i) total += i;
    printf("%lld\n", total);`,raw`int n;
    if (!(cin >> n) || n < 0 || n > 1000000) return 0;
    long long total = 0;
    for (int i = 1; i <= n; ++i) total += i;
    cout << total << '\n';`,[{input:'5\n',output:'15\n'},{input:'0\n',output:'0\n'},{input:'1000000\n',output:'500000500000\n'}],['累加初值是 0；每轮 total+=i 把当前整数加入已经得到的和。','i<=n 包含 n 本身，写 i<n 会漏掉最后一项。','大输入的结果超过 32 位 int，因此用 long long；C 的输出格式也要改成 %lld。'],'本题要求循环：时间 O(n)，空间 O(1)。公式法可优化到 O(1)，但要先考虑中间乘法的类型。');
add('factorial','计算阶乘','c-start-expression','cpp-reference','计算 n!；0≤n≤20，定义 0!=1。','一个整数 n。','输出 n!。',raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 20) return 0;
    long long result = 1;
    for (int i = 2; i <= n; ++i) result *= i;
    printf("%lld\n", result);`,raw`int n;
    if (!(cin >> n) || n < 0 || n > 20) return 0;
    long long result = 1;
    for (int i = 2; i <= n; ++i) result *= i;
    cout << result << '\n';`,[{input:'0\n',output:'1\n'},{input:'5\n',output:'120\n'},{input:'20\n',output:'2432902008176640000\n'}],['连乘的初值是 1；如果写成 0，后续所有乘法仍是 0。','n 为 0 或 1 时不进入循环，保留 result=1。','20! 在 long long 的保证范围内；21! 已超出常见有符号 64 位范围，不能无限扩大约束。'],'时间 O(n)，额外空间 O(1)。');
add('fibonacci','斐波那契数','c-start-expression','cpp-reference','F(0)=0，F(1)=1，F(n)=F(n-1)+F(n-2)。计算 0≤n≤40 的 F(n)。','一个整数 n。','输出 F(n)。',raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 40) return 0;
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        long long next = a + b;
        a = b;
        b = next;
    }
    printf("%lld\n", a);`,raw`int n;
    if (!(cin >> n) || n < 0 || n > 40) return 0;
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        long long next = a + b;
        a = b;
        b = next;
    }
    cout << a << '\n';`,[{input:'0\n',output:'0\n'},{input:'6\n',output:'8\n'},{input:'40\n',output:'102334155\n'}],['每轮开始时 a=F(i)、b=F(i+1)，初始正好对应 i=0。','先把 a+b 保存到 next，再改 a 和 b，避免旧值被覆盖。','完成 n 轮后 a=F(n)，不必保存全部历史项，也不用指数级递归。'],'时间 O(n)，额外空间 O(1)。');
add('digit-sum','各位数字求和','c-start-expression','cpp-reference','计算非负整数 n 各位数字之和。0≤n≤1000000000。','一个整数 n。','输出各位数字之和。',raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 1000000000) return 0;
    int total = 0;
    while (n > 0) {
        total += n % 10;
        n /= 10;
    }
    printf("%d\n", total);`,raw`int n;
    if (!(cin >> n) || n < 0 || n > 1000000000) return 0;
    int total = 0;
    while (n > 0) {
        total += n % 10;
        n /= 10;
    }
    cout << total << '\n';`,[{input:'5072\n',output:'14\n'},{input:'0\n',output:'0\n'}],['n%10 取最后一位，例如 5072%10=2。','整数 n/=10 删除最后一位，例如 5072/10=507；忘记这一步会死循环。','n=0 时结果就是 0，本题无需把零再计成非零贡献。'],'d 位数字，时间 O(d)，额外空间 O(1)。');
add('gcd','最大公约数','c-function-start','cpp-reference','求两个非负整数的最大公约数。0≤a,b≤1000000000，本题约定 gcd(0,0)=0。','两个整数 a、b。','输出最大公约数。',raw`int a, b;
    if (scanf("%d %d", &a, &b) != 2 || a < 0 || b < 0) return 0;
    while (b != 0) {
        int remainder = a % b;
        a = b;
        b = remainder;
    }
    printf("%d\n", a);`,raw`int a, b;
    if (!(cin >> a >> b) || a < 0 || b < 0) return 0;
    while (b != 0) {
        int remainder = a % b;
        a = b;
        b = remainder;
    }
    cout << a << '\n';`,[{input:'18 24\n',output:'6\n'},{input:'0 7\n',output:'7\n'},{input:'0 0\n',output:'0\n'}],['a 与 b 的公共约数也能整除 a%b，因此 gcd(a,b)=gcd(b,a%b)。','先保存余数，再更新两个变量，不要用更新后的 a 重新计算余数。','循环条件 b!=0 保证不会对 0 取余；结束时 a 就是答案。'],'非全零输入时间 O(log(max(a,b)))，空间 O(1)；全零 O(1)。');
add('prime','判断素数','c-start-expression','cpp-reference','判断 n 是否为素数。0≤n≤1000000000。素数是大于 1 且只有 1 和自身两个正约数的整数。','一个整数 n。','素数输出 YES，否则输出 NO。',raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 1000000000) return 0;
    int is_prime = n >= 2;
    for (int d = 2; is_prime && d <= n / d; ++d) {
        if (n % d == 0) is_prime = 0;
    }
    printf("%s\n", is_prime ? "YES" : "NO");`,raw`int n;
    if (!(cin >> n) || n < 0 || n > 1000000000) return 0;
    bool is_prime = n >= 2;
    for (int d = 2; is_prime && d <= n / d; ++d) {
        if (n % d == 0) is_prime = false;
    }
    cout << (is_prime ? "YES" : "NO") << '\n';`,[{input:'1\n',output:'NO\n'},{input:'2\n',output:'YES\n'},{input:'49\n',output:'NO\n'},{input:'97\n',output:'YES\n'}],['0 和 1 不是素数，必须先排除。','若 n 能分成两个整数因子，其中至少一个不超过平方根；只需枚举到这个范围。','d<=n/d 避免 d*d 的中间乘法溢出；等号不能省，否则会漏掉 49 的因子 7。'],'时间 O(√n)，额外空间 O(1)。');
const readArrayC=raw`int n;
    if (scanf("%d", &n) != 1 || n < 0 || n > 1000) return 0;
    int a[1000];
    for (int i = 0; i < n; ++i)
        if (scanf("%d", &a[i]) != 1) return 0;`;
const readArrayCpp=raw`int n;
    if (!(cin >> n) || n < 0 || n > 1000) return 0;
    int a[1000];
    for (int i = 0; i < n; ++i)
        if (!(cin >> a[i])) return 0;`;
const printArrayC=raw`for (int i = 0; i < n; ++i) {
        if (i > 0) printf(" ");
        printf("%d", a[i]);
    }
    printf("\n");`;
const printArrayCpp=raw`for (int i = 0; i < n; ++i) {
        if (i > 0) cout << ' ';
        cout << a[i];
    }
    cout << '\n';`;
add('array-sum','数组求和','c-array-start','cpp-container','读取 n 个整数并求和。0≤n≤1000，每个数绝对值≤1000000。','先读 n，再读 n 个整数。','输出和；空数组输出 0。',readArrayC+raw`
    long long total = 0;
    for (int i = 0; i < n; ++i) total += a[i];
    printf("%lld\n", total);`,readArrayCpp+raw`
    long long total = 0;
    for (int i = 0; i < n; ++i) total += a[i];
    cout << total << '\n';`,[{input:'4\n3 -2 5 0\n',output:'6\n'},{input:'0\n',output:'0\n'}],['n 是有效元素数量，a[1000] 是可用容量，二者不能混为一谈。','a 的有效输入下标为 0 到 n-1；条件写 i<n，不能访问 a[n]。','这里先读数组再求和，便于观察下标；只求和时也可以边读边加，不保存数组。'],'时间 O(n)；示例使用固定 1000 槽数组，额外空间 O(1)（上限固定）。推广为随 n 分配时 O(n)。');
add('minmax','数组最小值与最大值','c-array','cpp-container','读取非空数组，输出最小值、最大值。1≤n≤1000，元素绝对值≤1000000。','n 和 n 个整数。','一行输出最小值与最大值，中间一个空格。',readArrayC+raw`
    if (n == 0) return 0;
    int lo = a[0], hi = a[0];
    for (int i = 1; i < n; ++i) {
        if (a[i] < lo) lo = a[i];
        if (a[i] > hi) hi = a[i];
    }
    printf("%d %d\n", lo, hi);`,readArrayCpp+raw`
    if (n == 0) return 0;
    int lo = a[0], hi = a[0];
    for (int i = 1; i < n; ++i) {
        if (a[i] < lo) lo = a[i];
        if (a[i] > hi) hi = a[i];
    }
    cout << lo << ' ' << hi << '\n';`,[{input:'4\n-8 -2 -9 -3\n',output:'-9 -2\n'},{input:'1\n7\n',output:'7 7\n'}],['只有非空数组才可读 a[0]；本题约束 n≥1，程序也防止空输入被误访问。','lo、hi 都以第一个真实元素初始化，不用 0。','扫描每项后，lo、hi 分别代表已扫描区的最小值和最大值。'],'时间 O(n)，固定容量数组 O(1) 空间；推广动态数组时 O(n)。');
add('count','统计目标值次数','c-array-start','cpp-container','统计 x 在数组中出现的次数。0≤n≤1000，整数绝对值≤1000000。','先读 n 和 n 个元素，最后读目标 x。','输出出现次数。',readArrayC+raw`
    int x, count = 0;
    if (scanf("%d", &x) != 1) return 0;
    for (int i = 0; i < n; ++i)
        if (a[i] == x) ++count;
    printf("%d\n", count);`,readArrayCpp+raw`
    int x, count = 0;
    if (!(cin >> x)) return 0;
    for (int i = 0; i < n; ++i)
        if (a[i] == x) ++count;
    cout << count << '\n';`,[{input:'5\n2 1 2 2 3\n2\n',output:'3\n'},{input:'0\n5\n',output:'0\n'}],['次数从 0 开始，每遇到一个相等项加 1。','== 是比较，= 是赋值；在判断条件中误写赋值会改变数组值。','输入 x 在数组之后，不能按自己习惯改变读取顺序。'],'时间 O(n)，固定容量数组 O(1) 空间。');
const reverse=raw`int left = 0, right = n - 1;
    while (left < right) {
        int temp = a[left];
        a[left] = a[right];
        a[right] = temp;
        ++left;
        --right;
    }`;
add('reverse','原地反转数组','c-array','cpp-container','把数组原地反转，再输出。0≤n≤1000，元素绝对值≤1000000。','n 和 n 个整数。','输出反转后元素，用单空格分隔；空数组输出空行。',readArrayC+'\n    '+reverse+'\n    '+printArrayC,readArrayCpp+'\n    '+reverse+'\n    '+printArrayCpp,[{input:'5\n1 2 3 4 5\n',output:'5 4 3 2 1\n'},{input:'0\n',output:'\n'}],['左右下标指向还未处理的两端，把这两个位置交换。','交换需要 temp 保存旧值；交换后左端加 1、右端减 1。','本例下标是 int，空数组 right=-1，left<right 为假；不要机械改成无符号后仍计算 n-1。'],'时间 O(n)，反转本身额外空间 O(1)；输入使用固定容量数组。');
const bubble=raw`for (int end = n - 1; end > 0; --end) {
        for (int j = 0; j < end; ++j) {
            if (a[j] > a[j + 1]) {
                int temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }`;
add('bubble','手写冒泡排序','ds-sort','cpp-container','按升序排列数组，不使用库排序。0≤n≤200，元素绝对值≤1000000。','n 和 n 个整数。','一行输出排序后的元素，单空格分隔；空数组输出空行。',readArrayC+'\n    if (n > 200) return 0;\n    '+bubble+'\n    '+printArrayC,readArrayCpp+'\n    if (n > 200) return 0;\n    '+bubble+'\n    '+printArrayCpp,[{input:'5\n3 -1 3 0 2\n',output:'-1 0 2 3 3\n'},{input:'0\n',output:'\n'}],['比较相邻两项，前项更大时交换；一轮后未排序区的最大值到右端。','end 表示本轮最后参与排序的位置，下一轮不用再处理已确定的右端。','j<end 保证 j+1≤end，不越界；只交换严格大于的项，因此相等项不交换。'],'本实现时间 O(n²)，排序额外空间 O(1)。');
add('linear','顺序查找第一个位置','ds-array','cpp-container','找到 x 第一次出现的下标，下标从 0 开始；不存在返回 -1。0≤n≤1000，整数绝对值≤1000000。','n、n 个数组元素、目标 x。','一个下标或 -1。',readArrayC+raw`
    int x, answer = -1;
    if (scanf("%d", &x) != 1) return 0;
    for (int i = 0; i < n; ++i) {
        if (a[i] == x) { answer = i; break; }
    }
    printf("%d\n", answer);`,readArrayCpp+raw`
    int x, answer = -1;
    if (!(cin >> x)) return 0;
    for (int i = 0; i < n; ++i) {
        if (a[i] == x) { answer = i; break; }
    }
    cout << answer << '\n';`,[{input:'4\n8 3 3 5\n3\n',output:'1\n'},{input:'0\n9\n',output:'-1\n'}],['answer=-1 表示还没有找到，不应随便初始化为 0。','从左到右检查，第一次相等就 break，因此重复值也返回最左位置。','返回的是下标，不是目标值本身。'],'时间 O(n)，固定容量数组 O(1) 空间。');
const binary=raw`int left = 0, right = n - 1, answer = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (a[mid] == x) { answer = mid; break; }
        if (a[mid] < x) left = mid + 1;
        else right = mid - 1;
    }`;
add('binary','有序数组二分查找','ds-binary','cpp-container','数组严格递增，查找 x 的下标。0≤n≤1000，整数绝对值≤1000000；不存在输出 -1。','n、有序数组的 n 个元素、目标 x。','一个下标或 -1。',readArrayC+raw`
    int x;
    if (scanf("%d", &x) != 1) return 0;
    `+binary+raw`
    printf("%d\n", answer);`,readArrayCpp+raw`
    int x;
    if (!(cin >> x)) return 0;
    `+binary+raw`
    cout << answer << '\n';`,[{input:'5\n1 3 5 7 9\n7\n',output:'3\n'},{input:'1\n5\n6\n',output:'-1\n'},{input:'0\n4\n',output:'-1\n'}],['只能在满足顺序条件的数组上按比较结果排除半边。','区间 [left,right] 包含两端，left==right 时仍有一项，条件是 <=。','比较 mid 后排除该项，用 mid+1 或 mid-1，保证区间缩小，不会死循环。'],'查找时间 O(log(n+1))，但读取输入要 O(n)；完整程序总时间 O(n)，固定数组空间 O(1)。');
add('line-stats','读取整行并统计字符','c-string','cpp-container','读取一行 ASCII 文本（至多 1000 个字符，可包含空格），统计英文字母和数字的数量。输入行以 LF 换行或 EOF 结束。','一整行文本，可为空行。','输出字母数、数字数，中间一个空格。',raw`char text[1002];
    if (fgets(text, sizeof text, stdin) == NULL) return 0;
    int letters = 0, digits = 0;
    for (int i = 0; text[i] != '\0' && text[i] != '\n'; ++i) {
        char c = text[i];
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) ++letters;
        else if (c >= '0' && c <= '9') ++digits;
    }
    printf("%d %d\n", letters, digits);`,raw`string text;
    if (!getline(cin, text)) return 0;
    int letters = 0, digits = 0;
    for (char c : text) {
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) ++letters;
        else if (c >= '0' && c <= '9') ++digits;
    }
    cout << letters << ' ' << digits << '\n';`,[{input:'MCU 2027 !\n',output:'3 4\n'},{input:'\n',output:'0 0\n'},{input:'a b9',output:'2 1\n'}],['scanf("%s") 和 cin>>text 读单词，会在空白处停止；本题用 fgets 或 getline 读整行。','C 为至多 1000 个正文字符、换行和终止零预留 1002 个位置；fgets 的容量参数限制写入。','fgets 可能保留换行，循环排除它；getline 不把分隔换行放入 string。','本题只统计 ASCII 字母，不把中文 UTF-8 字节当成英文字母。'],'L 个字符，时间 O(L)；C 固定容量空间 O(1)，C++ string 空间 O(L)。');
add('palindrome','判断回文单词','c-string','cpp-container','一个只含英文字母的非空单词，长度≤1000，大小写敏感。判断从左往右与从右往左是否相同。','一个单词。','回文输出 YES，否则 NO。',raw`char text[1001];
    if (scanf("%1000s", text) != 1) return 0;
    int length = 0;
    while (text[length] != '\0') ++length;
    int left = 0, right = length - 1, ok = 1;
    while (left < right) {
        if (text[left] != text[right]) { ok = 0; break; }
        ++left;
        --right;
    }
    printf("%s\n", ok ? "YES" : "NO");`,raw`string text;
    if (!(cin >> text)) return 0;
    int left = 0, right = static_cast<int>(text.size()) - 1;
    bool ok = true;
    while (left < right) {
        if (text[left] != text[right]) { ok = false; break; }
        ++left;
        --right;
    }
    cout << (ok ? "YES" : "NO") << '\n';`,[{input:'level\n',output:'YES\n'},{input:'Abba\n',output:'NO\n'},{input:'a\n',output:'YES\n'}],['C 用 %1000s 限制最多读入 1000 个字符，数组多留一个位置保存终止零。','text 是字符数组，给 %s 的参数写 text，不写 &text；这与读取单个 int 的 &n 不同。','用左右两个下标比较对称位置，任何一对不同就能确定不是回文。'],'时间 O(L)；C 固定数组空间 O(1)，C++ string 空间 O(L)，比较部分额外 O(1)。');
add('student','结构体保存最高分学生','c-struct-start','cpp-ctor','读取学生学号和成绩，输出最高分学生；同分时选学号更小者。1≤n≤1000，学号 1..1000000，成绩 0..100。','n，随后 n 行，每行 id score。','输出选中学生的 id score。',raw`struct Student { int id; int score; };
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 1000) return 0;
    struct Student best;
    if (scanf("%d %d", &best.id, &best.score) != 2) return 0;
    for (int i = 1; i < n; ++i) {
        struct Student current;
        if (scanf("%d %d", &current.id, &current.score) != 2) return 0;
        if (current.score > best.score ||
            (current.score == best.score && current.id < best.id)) best = current;
    }
    printf("%d %d\n", best.id, best.score);`,raw`struct Student { int id; int score; };
    int n;
    if (!(cin >> n) || n < 1 || n > 1000) return 0;
    Student best;
    if (!(cin >> best.id >> best.score)) return 0;
    for (int i = 1; i < n; ++i) {
        Student current;
        if (!(cin >> current.id >> current.score)) return 0;
        if (current.score > best.score ||
            (current.score == best.score && current.id < best.id)) best = current;
    }
    cout << best.id << ' ' << best.score << '\n';`,[{input:'3\n3 90\n1 90\n2 80\n',output:'1 90\n'},{input:'1\n9 0\n',output:'9 0\n'}],['结构体把 id 与 score 作为同一条记录保存，访问成员用点号。','C 的 scanf 写入成员时也要取地址，例如 &best.score。','成绩优先；只有相同成绩时才比较学号，不能单独总选最小学号。','best=current 复制整条记录，避免只更新成绩、忘记更新学号。'],'时间 O(n)，额外空间 O(1)。');
add('swap','调用函数交换两个整数','c-pointer','cpp-reference','读入两个整数，用函数交换，再输出。整数在 -1000000 到 1000000 之间。C 使用指针，C++ 使用引用。','两个整数 a、b。','输出交换后的 a、b，中间一个空格。',raw`int a, b;
    if (scanf("%d %d", &a, &b) != 2) return 0;
    swap_values(&a, &b);
    printf("%d %d\n", a, b);`,raw`int a, b;
    if (!(cin >> a >> b)) return 0;
    swap_values(a, b);
    cout << a << ' ' << b << '\n';`,[{input:'3 8\n',output:'8 3\n'},{input:'4 4\n',output:'4 4\n'}],['C 的 a、b 是 main 内的变量，把 &a、&b 传给函数才能通过地址修改它们。','函数声明中的 int *a 表示指针参数，语句中的 *a 表示访问目标；调用者提供有效变量地址。','C++ 的 int &a 是引用参数，直接把调用者变量传进去；参数是别名而不是新整数副本。','temp 保存旧值，避免第一次数值覆盖后无法恢复。'],'时间 O(1)，额外空间 O(1)。');
add('prefix','前缀和回答区间求和','ds-array','cpp-container','数组下标从 0 开始，回答 q 个闭区间 [l,r] 的和。1≤n≤1000，0≤q≤1000，元素绝对值≤1000000，0≤l≤r<n。','n、n 个整数、q，随后 q 行 l r。','每个询问输出一行区间和。',readArrayC+raw`
    if (n == 0) return 0;
    long long prefix[1001];
    prefix[0] = 0;
    for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + a[i];
    int q;
    if (scanf("%d", &q) != 1 || q < 0 || q > 1000) return 0;
    for (int i = 0; i < q; ++i) {
        int l, r;
        if (scanf("%d %d", &l, &r) != 2 || l < 0 || r < l || r >= n) return 0;
        printf("%lld\n", prefix[r + 1] - prefix[l]);
    }`,readArrayCpp+raw`
    if (n == 0) return 0;
    long long prefix[1001];
    prefix[0] = 0;
    for (int i = 0; i < n; ++i) prefix[i + 1] = prefix[i] + a[i];
    int q;
    if (!(cin >> q) || q < 0 || q > 1000) return 0;
    for (int i = 0; i < q; ++i) {
        int l, r;
        if (!(cin >> l >> r) || l < 0 || r < l || r >= n) return 0;
        cout << prefix[r + 1] - prefix[l] << '\n';
    }`,[{input:'4\n2 -1 3 5\n3\n0 0\n1 3\n0 3\n',output:'2\n7\n9\n'},{input:'1\n7\n0\n',output:''}],['prefix[k] 保存前 k 项的和，不是包含下标 k 的和；因此 prefix[0]=0。','[l,r] 的和等于前 r+1 项减去前 l 项，即 prefix[r+1]-prefix[l]。','n 项需要 n+1 个前缀位置；构建一次后，每次询问只做两个读取和一次减法。'],'时间 O(n+q)；固定容量程序 O(1) 空间，若容量随 n 分配则 O(n)。');

export const acmBasics=[];
for(const [index,t] of tasks.entries())for(const language of ['C11','C++17']){
 const isC=language==='C11',extra=['line-stats','palindrome'].includes(t.id)&&!isC?'#include <string>\n':'';
 const headers=isC?'#include <stdio.h>\n':'#include <iostream>\n'+extra+'using namespace std;\n';
 const helper=t.id==='swap'?(isC?raw`void swap_values(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
`:raw`void swap_values(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}
`):'';
 acmBasics.push({id:'acm-'+(isC?'c-':'cpp-')+t.id,lesson:isC?t.lesson:t.cppLesson,
  relatedLessons:isC&&t.id==='swap'?['c-address','c-pointer-declare','c-dereference','c-function-start']:[],
  title:String(index+1).padStart(2,'0')+' · '+t.title+'（'+(isC?'C':'C++')+' ACM）',language,level:t.id==='prefix'||t.id==='binary'?'进阶':'入门',kind:language+' ACM 编程',format:'acm',track:'basics',order:index+1,
  source:'原创基础 ACM 编程',prompt:t.prompt,input:t.input,output:t.output,tests:t.tests,
  cases:t.tests.map(x=>'输入：\n'+x.input+'输出：\n'+x.output),hint:t.steps[0],steps:t.steps,
  checks:['严格按输入说明读取；不要输出“请输入”等提示语。','空格、换行、大小写必须遵守输出说明。','检查最小输入、重复值、负数及题目允许的最大值。'],
  starter:headers+'\n'+(isC?'int main(void)':'int main()')+' {\n    // TODO：读取输入\n    // TODO：按题意处理\n    // TODO：输出结果\n    return 0;\n}\n',
  solution:headers+'\n'+helper+(isC?'int main(void)':'int main()')+' {\n    '+(isC?t.cBody:t.cppBody)+'\n    return 0;\n}\n',
  analysis:t.complexity,links:[],headerNotes:isC?'stdio.h 提供 scanf、printf、fgets 等输入输出声明。这份完整答案只需要这个头文件。':'iostream 提供 cin、cout。'+(extra?'string 头文件提供 string 和 getline，读整行或保存字符串时另行包含。':'本题使用变量与固定数组，不需要其他头文件。')
 });
}

export function acmGuide(){return `<details class="acm-guide panel"><summary>ACM 从零开始：C 用 stdio.h，C++ 用 iostream</summary><div><p>头文件提供库功能的声明。<code>stdio.h</code> 和 <code>iostream</code> 用于输入输出；数组、循环、函数是语言本身的语法。字符串、动态内存、容器等功能有各自的头文件，按题目需要再学。</p><p><b>完整程序的顺序：</b>包含头文件 → 编写 main → 读取输入 → 计算 → 输出。函数题只实现接口；ACM 题还需要自己处理输入输出。</p><div class="acm-template-grid"><section><h3>C：stdio.h</h3><pre class="codeblock"><code>#include &lt;stdio.h&gt;
int main(void) {
    int a, b;
    if (scanf("%d %d", &amp;a, &amp;b) != 2) return 0;
    // TODO：按题目计算，再用 printf 输出
    return 0;
}</code></pre><p>scanf 用 <code>&amp;a</code> 提供存储位置；printf 输出 <code>a+b</code> 的值。<code>%d</code> 对应 int，<code>%lld</code> 对应 long long，<code>%lf</code> 在 scanf 中对应 double。</p></section><section><h3>C++：iostream</h3><pre class="codeblock"><code>#include &lt;iostream&gt;
using namespace std;
int main() {
    int a, b;
    if (!(cin &gt;&gt; a &gt;&gt; b)) return 0;
    // TODO：按题目计算，再用 cout 输出
    return 0;
}</code></pre><p>cin 的 <code>&gt;&gt;</code> 表示读取，cout 的 <code>&lt;&lt;</code> 表示输出。<code>using namespace std;</code> 让本例可直接写 cin、cout；也可写 std::cin、std::cout。</p></section></div><h3>先区分四种输入，再写算法</h3><ul><li>单组：读一份数据，输出一次。</li><li>先读 T：先读组数，循环恰好 T 次。</li><li>读到 EOF：C 用 <code>while(scanf(...) == 成功读取数量)</code>，C++ 用 <code>while(cin &gt;&gt; ...)</code>。</li><li>结束标记：读到约定值后先退出，不输出标记。</li></ul><p>读单词用 scanf 的 %s 或 cin &gt;&gt;；包含空格的整行用 fgets 或 getline。先读数字再读整行时，要处理留下的换行，例如 C++ 的 getline(cin &gt;&gt; ws, line) 会跳过前导空白，但不能用于必须保留空行或开头空格的题。</p><p>基础题按序练习：输入输出 → 条件与循环 → 数组 → 字符串与结构体 → 排序、二分、前缀和。每题点“查看答案与详细解析”，即可看到含 main 的完整程序。代码框架与答案均可下载，在本地分别按 C11 或 C++17 编译。</p></div></details>`;}
