export const lessonDepth={};
export function addDepth(id,question,steps,boundary,oral,check,answer,method,related=[]){
 if(lessonDepth[id])throw new Error('Duplicate depth record: '+id);
 lessonDepth[id]={question,steps,boundary,oral,check,answer,method,related};
}
