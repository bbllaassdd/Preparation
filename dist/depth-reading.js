import {lessonDepth} from './learning-depth.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function depthOpening(l){const d=lessonDepth[l.id];return `<section class="depth-opening" id="understand"><div class="section-index">01 <span>UNDERSTAND</span></div><div><span class="eyebrow">这一课解决的问题</span><h2>${E(d.question)}</h2><p>本课的判断方法：${E(d.method)}</p></div></section>`;}
export function depthReasoning(l){const d=lessonDepth[l.id];return `<section class="depth-reasoning"><div class="depth-section-head"><span class="eyebrow">REASONING / 把原因连起来</span><h2>从发生的过程理解结论</h2></div><ol class="depth-chain">${d.steps.map((s,i)=>`<li><span class="depth-number">${String(i+1).padStart(2,'0')}</span><p>${E(s)}</p></li>`).join('')}</ol></section>`;}
export function depthCheckpoint(l){const d=lessonDepth[l.id];return `<section class="depth-boundary"><span class="eyebrow">BOUNDARY / 规则到哪里为止</span><p>${E(d.boundary)}</p></section><section class="depth-check" id="check-understanding"><header><span class="eyebrow">CHECK / 换一个例子检验理解</span><span class="check-not-scored">不计入做题成绩</span></header><h3>${E(d.check)}</h3><p class="check-instruction">先在纸上写出原因，或者用自己的话说一遍。</p><details class="depth-check-answer"><summary>不会？查看推导与答案</summary><p>${E(d.answer)}</p><p class="check-method"><strong>下次这样想：</strong>${E(d.method)}</p></details></section>`;}
export function lessonOutline(l,hasDiagram){return `<nav class="reading-outline" aria-label="本课阅读顺序"><span class="eyebrow">本课主线</span><a href="#understand" data-reading-anchor="understand">01 理解原理</a>${hasDiagram?'<a href="#diagram" data-reading-anchor="diagram">02 图解推演</a>':'<a href="#check-understanding" data-reading-anchor="check-understanding">02 理解检查</a>'}<a href="#exercises" data-reading-anchor="exercises">03 随堂练习</a><a href="#personal-reflection" data-reading-anchor="personal-reflection">04 我的理解</a><span class="reading-progress" aria-hidden="true"><i></i></span></nav>`;}
export const referenceByModule={
 c:[['C11 草案 · 表达式、对象与存储期','https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf']],
 cpp:[['C++ 草案 · 初始化与对象规则','https://eel.is/c++draft/class.base.init']],
 linux:[['Linux 手册 · fork','https://man7.org/linux/man-pages/man2/fork.2.html'],['Linux 内核 · 设备树模型','https://docs.kernel.org/devicetree/usage-model.html']],
 rtos:[['FreeRTOS · 调度与 API 文档','https://www.freertos.org/Documentation/00-Overview'],['FreeRTOS · Mutex 与继承限制','https://www.freertos.org/Documentation/02-Kernel/02-Kernel-features/02-Queues-mutexes-and-semaphores/04-Mutexes']],
 stm32:[['STM32F407 · 官方型号文档入口','https://www.st.com/en/microcontrollers-microprocessors/stm32f407-417/documentation.html']],
 protocol:[['ST SPI · AN5543','https://www.st.com/resource/en/application_note/an5543-enhanced-methods-to-handle-spi-communication-on-stm32-devices-stmicroelectronics.pdf']],
 arm:[['Arm · AAPCS32 调用约定','https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst']],
 memory:[['Arm · AAPCS32 数据布局','https://github.com/ARM-software/abi-aa/blob/main/aapcs32/aapcs32.rst']],
 os:[['FreeRTOS · 内核与并发文档','https://www.freertos.org/Documentation/00-Overview']],
 engineering:[['Git · 官方参考','https://git-scm.com/docs']],
 network:[['IETF · TCP RFC 9293','https://www.rfc-editor.org/rfc/rfc9293.html'],['OASIS · MQTT 5.0','https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html']]
};
