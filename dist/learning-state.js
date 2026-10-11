const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
export function normalizeStudyState(saved={}){
 const answers=Object.fromEntries(Object.entries(object(saved.answers)).map(([id,a])=>{
  // Older releases marked a reveal-only event as wrong. Preserve the review entry.
  if(a.submitted===false&&a.revealed)return [id,{...a,wrong:false,reviewReason:a.reviewReason||'help'}];
  return [id,{...a,reviewReason:a.reviewReason||(a.needsReview?(a.wrong&&a.submitted!==false?'wrong':'help'):null)}];
 }));
 return {...saved,completed:object(saved.completed),answers,drafts:object(saved.drafts),weakMastered:object(saved.weakMastered),lastLesson:saved.lastLesson||null,notes:object(saved.notes),mastery:object(saved.mastery),markedWeak:object(saved.markedWeak),animationRecords:object(saved.animationRecords),dailyPlans:object(saved.dailyPlans),activity:Array.isArray(saved.activity)?saved.activity:[]};
}
export const dayKey=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function answerRecord(old,q,revealOnly=false,now=Date.now()){
 if(!revealOnly&&old.choice===undefined)throw new Error('请先选择答案');
 const wrong=!revealOnly&&old.choice!==q.answer,assisted=!!old.assisted||revealOnly;
 const streak=wrong||revealOnly||assisted?0:(old.streak||0)+1;
 const days=streak?[1,3,7,14][Math.min(streak-1,3)]:0;
 const needsReview=revealOnly||wrong||assisted||!!old.needsReview&&streak<4;
 return {...old,revealed:true,submitted:!revealOnly,wrong,assisted,independentCorrect:!revealOnly&&!wrong&&!assisted,needsReview,reviewReason:wrong?'wrong':assisted?'help':needsReview?(old.reviewReason||'wrong'):null,due:now+days*86400000,streak,lastAttemptAt:now,errorRun:revealOnly?(old.errorRun||0):wrong?(old.errorRun||0)+1:0};
}
