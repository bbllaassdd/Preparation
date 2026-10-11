import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lessons} from '../dist/content.js';
import {lessonDepth} from '../dist/learning-depth.js';
import {helpFor} from '../dist/study-guidance.js';
import {qualityQuestions,qualityHelp} from '../dist/quality-questions.js';
import {depthCheckpoint} from '../dist/depth-reading.js';
assert.equal(lessons.length,126);assert.equal(Object.keys(lessonDepth).length,126);
for(const l of lessons){const d=lessonDepth[l.id];assert.ok(d,l.id);assert.equal(d.steps.length,3,l.id);assert.equal(new Set(d.steps).size,3,l.id);for(const p of d.steps)assert.ok(p.length>=35,l.id+' meaningful causal paragraphs');for(const field of ['question','boundary','oral','check','answer','method'])assert.ok(d[field]?.length>=12,l.id+' '+field);assert.ok(d.oral.length<=180,l.id+' concise spoken reference');assert.match(depthCheckpoint(l),/<details class="depth-check-answer">/);assert.doesNotMatch(depthCheckpoint(l),/<details[^>]*\bopen\b/);for(const q of l.quiz){const h=helpFor(q,l);assert.ok(h.hint&&h.thinking,q.id);}}
assert.equal(new Set(qualityQuestions.map(q=>q.id)).size,26);
for(const q of qualityQuestions){assert.ok(lessons.some(l=>l.id===q.lesson));assert.equal(q.steps.length,3);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);const h=qualityHelp[q.id];assert.equal(h.wrong.length,4);for(let i=0;i<4;i++)if(i!==q.answer)assert.ok(h.wrong[i]?.length>=12,q.id+' wrong option '+i);assert.ok(h.hint.length>=12&&h.thinking.length>=20);}
// Digest of the previous deployed source: old IDs, option text and answer indices.
const canonical=lessons.flatMap(l=>l.quiz.filter(q=>!q.id.startsWith('quality-')).map(q=>[q.id,q.options,q.answer]));
assert.equal(canonical.length,483);
const hash=createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
assert.equal(hash,'7f1e368b4d5d1cc3b7386252c9345ec70418766218b1060e583687280f52b31f','all old question IDs/options/answers must stay compatible');
console.log('PASS content: 126 distinct explanations/oral/checks, 509 supported quizzes, 26 transfer questions with complete wrong-option feedback, hidden check answers and canonical old data.');
