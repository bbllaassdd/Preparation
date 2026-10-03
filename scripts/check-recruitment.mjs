import assert from 'node:assert/strict';
import fs from 'node:fs';
import {companies} from '../dist/companies.js';
import {createDailyPlan,cleanDays,cleanRecords,localDate} from '../dist/recruitment.js';
assert.equal(companies.length,300);
assert.equal(new Set(companies.map(c=>c.id)).size,300);
assert.equal(new Set(companies.map(c=>c.name.toLowerCase())).size,300);
for(const c of companies){
 assert.ok(c.degree&&c.note&&c.fit&&c.sector&&c.role&&c.size,c.name);
 assert.ok(c.sources.length,c.name);
 for(const u of [c.url,...c.sources.map(s=>s.url)])assert.ok(['https:','http:'].includes(new URL(u).protocol),c.name);
 if(c.eligible)assert.ok(c.sources.some(s=>/学历|岗位/.test(s.title))||c.sources[0].url===c.url,c.name);
 if(c.large)assert.ok(!c.size.includes('未核'),c.name);
}
const day='2026-10-03',plan=createDailyPlan(companies,{},day);
assert.equal(plan.length,15);
assert.ok(plan.every(id=>{const c=companies.find(c=>c.id===id);return c.eligible&&!c.needsConfirm;}));
assert.deepEqual(createDailyPlan(companies,{},day,plan),plan,'stable refresh');
const records={[plan[0]]:{status:'已投递',appliedDate:day},[plan[1]]:{status:'暂不合适'}};
const filled=createDailyPlan(companies,records,day,plan);
assert.ok(filled.includes(plan[0]),'today applied remains visible');
assert.ok(!filled.includes(plan[1]),'skipped company removed');
const tomorrow=createDailyPlan(companies,records,'2026-10-04');
assert.ok(!tomorrow.includes(plan[0]),'no repeat application tomorrow');
assert.ok(!tomorrow.includes(plan[1]));
const pending=companies.find(c=>!c.eligible);
const exhausted=Object.fromEntries(companies.filter(c=>c.eligible&&!c.needsConfirm).map(c=>[c.id,{status:'已投递',appliedDate:day}]));
assert.deepEqual(createDailyPlan(companies,exhausted,'2026-10-04'),[],'does not pad with unverified entries');
assert.deepEqual(createDailyPlan(companies,{...exhausted,[pending.id]:{status:'待投递',confirmed:true}},'2026-10-04'),[pending.id]);
assert.throws(()=>cleanRecords({[plan[0]]:{status:'fake'}}));
assert.deepEqual(cleanRecords({unknown:{status:'fake'}}),{});
const safe=cleanRecords({[plan[0]]:{status:'待投递',confirmed:'true',note:'x'.repeat(1600),appliedDate:'bad'}})[plan[0]];
assert.equal(safe.confirmed,false);assert.equal(safe.note.length,1500);assert.equal(safe.appliedDate,'');
assert.deepEqual(cleanDays({[day]:[...plan,plan[0],'unknown'],bad:plan}),{[day]:plan});
assert.equal(localDate(new Date('2026-10-02T16:01:00Z')),day,'China midnight');
// Optional private exclusion source is read only; never bundled into the site.
if(process.argv[2]){
 const excluded=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const names=new Set(excluded.map(s=>String(s).trim().toLowerCase()));
 assert.ok(companies.every(c=>!names.has(c.name.toLowerCase())),'exclude provided application names');
}
console.log(`PASS recruitment: ${companies.length} unique companies; ${companies.filter(c=>c.eligible).length} degree evidence; stable 15, no repeats, candidate opt-in, backup validation.`);
