import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeStudyState,answerRecord,dayKey} from '../dist/learning-state.js';
import {chaptersFor,prerequisiteIds} from '../dist/learning-path.js';
import {lessons,modules} from '../dist/content.js';
import {stepModels} from '../dist/step-player.js';
const legacy={completed:{'c-sizeof':true},answers:{revealed:{revealed:true,submitted:false,wrong:true,needsReview:true,due:42},wrong:{submitted:true,choice:2,wrong:true,needsReview:true}},drafts:{lab:'my code'},weakMastered:{list:true},lastLesson:'c-pointer-change',customField:{keep:true}};
const migrated=normalizeStudyState(legacy);
for(const key of ['completed','drafts','weakMastered','lastLesson','customField'])assert.deepEqual(migrated[key],legacy[key]);
assert.equal(migrated.answers.revealed.wrong,false);assert.equal(migrated.answers.revealed.needsReview,true);assert.equal(migrated.answers.revealed.due,42);assert.equal(migrated.answers.wrong.reviewReason,'wrong');
assert.deepEqual(normalizeStudyState(migrated),migrated,'migration is idempotent');assert.equal(legacy.answers.revealed.wrong,true,'input is untouched');
const q={answer:1};const independently=answerRecord({choice:1},q,false,1000);assert.equal(independently.independentCorrect,true);assert.equal(independently.streak,1);assert.equal(independently.due,1000+86400000);
const assisted=answerRecord({choice:1,assisted:true,streak:2},q,false,1000);assert.equal(assisted.independentCorrect,false);assert.equal(assisted.streak,0);assert.equal(assisted.reviewReason,'help');
const incorrect=answerRecord({choice:0},q,false,1000);assert.equal(incorrect.wrong,true);assert.equal(incorrect.reviewReason,'wrong');
const reveal=answerRecord({},q,true,1000);assert.equal(reveal.wrong,false);assert.equal(reveal.submitted,false);assert.equal(reveal.needsReview,true);assert.equal(reveal.independentCorrect,false);
assert.equal(dayKey(new Date('2026-10-10T16:00:00Z')),'2026-10-11','Beijing date boundary');
for(const m of modules){const ids=chaptersFor(m.id,lessons).flatMap(g=>g.lessons.map(l=>l.id));assert.equal(new Set(ids).size,ids.length);assert.deepEqual([...ids].sort(),lessons.filter(l=>l.module===m.id).map(l=>l.id).sort());}
for(const [id,ids] of Object.entries(prerequisiteIds)){assert.ok(lessons.some(l=>l.id===id));for(const prerequisite of ids)assert.ok(lessons.some(l=>l.id===prerequisite));}
for(const [id,m] of Object.entries(stepModels)){for(const f of m.frames){assert.ok(f.line===-1||f.line>=0&&f.line<m.code.length,id);assert.ok(f.why.length>10);const visible=new Set(f.cells.filter(c=>!c.hidden).map(c=>c.id));for(const [a,b] of f.links){assert.ok(visible.has(a)&&visible.has(b),id+' arrow only connects existing objects');}if(f.prediction)assert.ok(f.prediction.answer>=0&&f.prediction.answer<f.prediction.options.length);}}
const ordinary=stepModels['c-pointer-change'].frames,reverse=stepModels['c-pointer-change-alt'].frames;
assert.equal(ordinary[2].cells[0].value,'10');assert.equal(ordinary[2].cells[1].value,'20');assert.deepEqual(ordinary[2].links,[['p','b']]);assert.equal(ordinary[3].cells[1].value,'9');assert.equal(reverse.at(-1).cells[0].value,'9');assert.equal(reverse.at(-1).cells[1].value,'20');
assert.equal(stepModels['c-pointer'].frames.at(-1).cells.find(c=>c.id==='p').value,'0x2008');
for(const name of ['styles.css','workspace.css','recruitment.css'])assert.doesNotMatch(fs.readFileSync(new URL('../dist/'+name,import.meta.url),'utf8'),/#[0-9a-f]{3,8}\b/i,'shared palette in '+name);
console.log('PASS manual: old backups, additive fields, answer classification, Beijing date, all chapter coverage and animation state/arrow integrity.');
