(function(root){
const deployment=root.USTP_DEPLOYMENT||{},embedded=Boolean(root.google&&google.script&&google.script.run),gateway=!embedded&&deployment.mode==='gateway',KEY='pkg-hub-preview-v1';
let token='',actor='',memory=null;
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||null;}catch{return memory;}};
const persist=data=>{memory=data;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}};
function demoStore(){let data=load();if(!data){data=PKGFixtures();persist(data);}return {list:t=>structuredClone(data[t]),get:(t,id)=>structuredClone(data[t].find(r=>r.id===id)||null),put:(t,id,r)=>{const i=data[t].findIndex(x=>x.id===id);if(i<0)data[t].push(structuredClone(r));else data[t][i]=structuredClone(r);persist(data);},lock:fn=>fn()};}
// Demo data is fictional and lives only in this browser; production hashing is server-side SHA-256.
const demoHash=s=>'preview:'+Array.from(String(s)).reduce((n,c)=>(Math.imul(n^c.charCodeAt(0),16777619)>>>0),2166136261).toString(16);
const pending=new Map();
function requestId(action,payload){const k=PKGDomain.stable({action,payload});if(!pending.has(k))pending.set(k,crypto.randomUUID());return {key:k,id:pending.get(k)};}
async function call(action,payload={}){
 const req=requestId(action,payload);let result;
 if(gateway){if(action!=='public.catalog')throw Error('Buka ruang selamat untuk meneruskan.');result=await publicCatalog();}
 else if(embedded){result=await new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(Error(e.message||'Sambungan terputus. Cuba semula.'))).pmApi({action,payload,token,requestId:req.id}));}
 else{await new Promise(r=>setTimeout(r,120));try{if(action==='admin.login'){actor='Pentadbir demo';token='DEMO-ONLY';result={ok:true,data:{actor,token}};}else{const service=PKGDomain.createService({store:demoStore(),hash:demoHash,secret:()=>crypto.randomUUID()+crypto.randomUUID(),id:()=>crypto.randomUUID().replaceAll('-','').slice(0,14).toUpperCase(),now:()=>new Date().toISOString()});result={ok:true,data:service.call(action,payload,{role:token?'admin':'public',actor,requestId:req.id})};}}catch(e){result={ok:false,message:e.message,code:e.code};}}
 if(!result||!result.ok){const error=Error(result?.message||'Respons server tidak lengkap. Cuba semula.');error.code=result?.code;throw error;}
 if(action==='admin.login'){token=result.data.token;actor=result.data.actor;}
 pending.delete(req.key);return result.data;
}
function publicCatalog(){return new Promise((resolve,reject)=>{const callback='USTP_PUBLIC_'+crypto.randomUUID().replaceAll('-',''),script=document.createElement('script');let timer;const cleanup=()=>{clearTimeout(timer);delete root[callback];script.remove();};root[callback]=data=>{cleanup();resolve(data);};script.onerror=()=>{cleanup();location.replace(deployment.backendUrl+(location.hash||'#/'));reject(Error('Membuka Hub selamat…'));};timer=setTimeout(()=>{cleanup();location.replace(deployment.backendUrl+(location.hash||'#/'));reject(Error('Membuka Hub selamat…'));},8000);const url=new URL(deployment.backendUrl);url.searchParams.set('public','catalog');url.searchParams.set('callback',callback);script.src=url.toString();script.referrerPolicy='no-referrer';document.head.append(script);});}
root.HubApi={call,embedded,isGateway:gateway,backendUrl:deployment.backendUrl||'',publicUrl:gateway?deployment.publicUrl:location.href.split('#')[0],isLive:gateway,isDemo:!embedded&&!gateway,get actor(){return actor;},get isAdmin(){return Boolean(token);},logout(){token='';actor='';},resetDemo(){if(embedded)throw Error('Data sebenar tidak boleh dipadam di sini.');persist(PKGFixtures());pending.clear();token='';actor='';}};
})(window);
