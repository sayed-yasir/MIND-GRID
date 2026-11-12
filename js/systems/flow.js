// Auto Continue and Auto Resume are two independent settings.
export const nextAction=(set,won)=>won?(set.autoNext?'auto':'manual'):'stay';
export const startupAction=S=>S.settings.autoResume&&S.resume?{w:S.resume.w,l:S.resume.l,res:S.resume}:null;
