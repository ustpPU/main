(function(root){'use strict';
const timestamp=(p,key)=>Date.parse(p.date+'T'+(p[key]||(key==='start'?'00:00':'23:59'))+':00+08:00');
function phase(p,at=Date.now()){const start=timestamp(p,'start'),end=timestamp(p,'end');if(at>=end)return 'finished';if(at>=start)return 'ongoing';return 'upcoming';}
function label(p,at=Date.now()){const state=phase(p,at);return state==='ongoing'?'Sedang berlangsung':state==='upcoming'?'Akan datang':at-timestamp(p,'end')<=7*86400000?'Baru selesai':'Selesai';}
function ordered(programs,at=Date.now()){const visible=programs.filter(p=>p.status!=='draft'),ongoing=visible.filter(p=>phase(p,at)==='ongoing').sort((a,b)=>timestamp(a,'end')-timestamp(b,'end')),finished=visible.filter(p=>phase(p,at)==='finished').sort((a,b)=>timestamp(b,'end')-timestamp(a,'end')),upcoming=visible.filter(p=>phase(p,at)==='upcoming').sort((a,b)=>timestamp(a,'start')-timestamp(b,'start'));const recent=finished.filter(p=>at-timestamp(p,'end')<=14*86400000),older=finished.filter(p=>at-timestamp(p,'end')>14*86400000);return [...ongoing,...recent,...upcoming,...older];}
const api={phase,label,ordered};root.USTPEvents=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
