const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function codingWorkbench(c,draft){
 const code=draft??c.starter??'';
 return `<div class="coding-workbench" data-problem="${c.id}">
 <section class="problem-pane panel" aria-label="编程题目">
   <div class="pane-heading"><span>题目说明</span><span class="problem-level">${E(c.level)} · ${E(c.language||c.kind)}</span></div>
   <div class="problem-body"><p class="problem-origin">${E(c.source||'手写与场景练习')}</p><h2>${E(c.title)}</h2><p class="problem-prompt">${E(c.prompt)}</p>
   <h3>样例与边界</h3>${c.cases.map((x,i)=>`<div class="sample-case"><span>样例 ${i+1}</span><p>${E(x)}</p></div>`).join('')}
   ${c.starter?`<details class="starter-detail"><summary>查看函数接口与代码框架</summary><pre class="codeblock"><code>${E(c.starter)}</code></pre></details>`:''}
   <div class="problem-actions"><button class="btn ghost" data-action="hint" data-id="${c.id}" aria-controls="challenge-hint" aria-expanded="false">看提示</button><button class="btn soft" data-action="solution" data-id="${c.id}" aria-controls="challenge-solution" aria-expanded="false">查看参考解与分析</button></div>
   <div id="challenge-hint" hidden class="quiz-answer">${E(c.hint)}</div>
   <section id="challenge-solution" hidden class="challenge-solution"><h3>参考实现</h3><pre class="codeblock"><code>${E(c.solution)}</code></pre><div class="quiz-answer"><h3>逐步分析与复杂度</h3>${c.steps?`<ol>${c.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol>`:`<p>${E(c.analysis)}</p>`}${c.checks?`<h3>提交前检查</h3><ul>${c.checks.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:''}</div></section>
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
