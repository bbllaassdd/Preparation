// Keep canonical answer indices unchanged, so saved answers and wrong-question records remain valid.
export function createOptionLayouts(questions){
 const map=new Map();
 questions.forEach((q,index)=>{
   let hash=2166136261;
   for(const c of q.id) hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
   const wrong=q.options.map((_,i)=>i).filter(i=>i!==q.answer);
   for(let i=wrong.length-1;i>0;i--){
     hash=(Math.imul(hash,1664525)+1013904223)>>>0;
     const j=hash%(i+1); [wrong[i],wrong[j]]=[wrong[j],wrong[i]];
   }
   const position=index%q.options.length;
   wrong.splice(position,0,q.answer);
   map.set(q.id,wrong);
 });
 return map;
}
export function optionLetter(order,canonicalIndex){return 'ABCD'[order.indexOf(canonicalIndex)]||'?';}
