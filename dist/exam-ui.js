const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function writtenCard(q,index,draft=''){
 return '<section class="quiz-card written-card" id="'+q.id+'">'+
 '<div class="quiz-head"><span class="quiz-num">'+(index+1)+'</span><span class="quiz-type">'+E(q.kind)+' · '+E(q.difficulty)+' · '+E(q.source)+'</span></div>'+
 '<h3>'+E(q.title)+'</h3><p class="quiz-prompt">'+E(q.prompt)+'</p>'+
 (q.code?'<pre class="codeblock"><code>'+E(q.code)+'</code></pre>':'')+
 '<label class="written-label" for="draft-'+q.id+'">我的答案与推导</label>'+
 '<textarea id="draft-'+q.id+'" class="editor written-editor" data-draft="'+q.id+'" aria-label="'+E(q.title)+' 的答案草稿" placeholder="先写结果、理由或修改方案；草稿保存在当前浏览器。">'+E(draft)+'</textarea>'+
 '<details class="written-answer"><summary>查看答案、详细解析与评分点</summary><div class="quiz-answer"><strong>参考答案</strong><p>'+E(q.answer)+'</p><h4>逐步分析</h4><ol>'+q.steps.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol><h4>评分点 · 用于自查</h4><ul>'+q.rubric.map(x=>'<li>'+E(x)+'</li>').join('')+'</ul><p class="source-note">本题按过程自查；保存草稿不会自动判分，也不会自动加入选择题错题记录。</p></div></details></section>';
}
export function difficulty(q){return q.difficulty||(!q.level||q.level==='入门'?'基础':q.level==='挑战'?'挑战':'进阶');}
