const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function codingWorkbench(c,draft,{inline=false}={}){
 const hintId=inline?'challenge-hint-'+c.id:'challenge-hint',solutionId=inline?'challenge-solution-'+c.id:'challenge-solution';
 const code=draft??c.starter??'';
 const program=c.acm||c;
 const complete=c.format==='acm'||!!c.acm;
 const sample=(x,i)=>`<div class="sample-case"><span>样例 ${i+1}</span><h4>输入</h4><pre>${E(x.input||'(空输入)')}</pre><h4>输出</h4><pre>${E(x.output||'(无输出)')}</pre></div>`;
 return `<div class="coding-workbench" data-problem="${c.id}">
 <section class="problem-pane panel" aria-label="编程题目">
   <div class="pane-heading"><span>题目说明</span><button class="btn link" data-action="knowledge" data-id="${c.id}">相关知识点</button><span class="problem-level">${E(c.level)} · ${E(c.language||c.kind)}</span></div>
   <div class="problem-body"><p class="problem-origin">${E(c.source||'手写与场景练习')}</p><h2>${E(c.title)}</h2><p class="problem-prompt">${E(c.prompt)}</p>
   ${complete?`<div class="acm-format"><h3>${c.acm?'完整程序的输入输出格式':'输入输出格式'}</h3><h4>输入</h4><p>${E(program.input)}</p><h4>输出</h4><p>${E(program.output)}</p></div><h3>完整程序样例</h3>${program.tests.map(sample).join('')}${c.acm?`<details class="starter-detail"><summary>原函数题的接口边界样例</summary>${c.cases.map(x=>`<p>${E(x)}</p>`).join('')}</details>`:''}`:`<h3>样例与边界</h3>${c.cases.map((x,i)=>`<div class="sample-case"><span>样例 ${i+1}</span><p>${E(x)}</p></div>`).join('')}`}
   ${c.starter?`<details class="starter-detail"><summary>查看代码框架（不含答案）</summary><pre class="codeblock"><code>${E(c.starter)}</code></pre></details>`:''}
   <div class="problem-actions"><button class="btn ghost" data-action="hint" data-id="${c.id}" aria-controls="${hintId}" aria-expanded="false">看提示</button><button class="btn soft" data-action="solution" data-id="${c.id}" aria-controls="${solutionId}" aria-expanded="false">查看答案与详细解析</button></div>
   <div id="${hintId}" hidden class="quiz-answer">${E(c.hint)}</div>
   <section id="${solutionId}" hidden class="challenge-solution"><h3>${complete?'完整程序答案 · '+(c.language==='C11'?'stdio.h':'iostream'):'参考答案'}</h3><pre class="codeblock"><code>${E(program.solution)}</code></pre><div class="answer-actions"><button class="btn ghost small" data-action="copy-answer" data-id="${c.id}">复制答案</button><button class="btn ghost small" data-action="download-answer" data-id="${c.id}">下载答案</button></div>${c.acm?`<details class="starter-detail"><summary>单独查看原函数／类的答案</summary><pre class="codeblock"><code>${E(c.solution)}</code></pre></details>`:''}<div class="quiz-answer">${complete?`<h3>头文件与输入输出怎么读</h3><p>${E(program.headerNotes)}</p>${c.acm?`<ol>${c.acm.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol>`:''}`:''}<h3>逐步分析与复杂度</h3>${c.steps?`<ol>${c.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol>`:`<p>${E(c.analysis)}</p>`}${c.track==='basics'?`<p><b>复杂度：</b>${E(c.analysis)}</p>`:''}${c.checks?`<h3>提交前检查</h3><ul>${c.checks.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:''}</div></section>
   ${c.links.length?`<h3>原题平台</h3><div class="external-links">${c.links.map(([name,url])=>`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(name)} ↗</a>`).join('')}</div>`:''}
   </div>
 </section>
 <section class="editor-pane panel" aria-label="代码编辑区">
   <div class="pane-heading"><label for="coding-editor-${c.id}">我的代码</label><span data-draft-status="${c.id}" role="status">${draft!==undefined?'已恢复本机草稿':'从代码框架开始'}</span></div>
   <textarea id="coding-editor-${c.id}" class="editor workbench-editor" data-draft="${c.id}" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${E(c.title)} 的代码草稿" placeholder="在这里写代码或方案；输入后自动保存到当前浏览器。">${E(code)}</textarea>
   <div class="editor-actions"><button class="btn primary" data-action="copy-code" data-id="${c.id}">复制代码</button><button class="btn ghost" data-action="download-code" data-id="${c.id}">下载代码</button><span>${E(c.language||'C / C++')}</span></div>
   <p class="editor-footnote">草稿自动保存在当前浏览器。下载后可在本地编译；本站暂不提供在线运行与自动判题。</p>
 </section>
 </div>`;
}
