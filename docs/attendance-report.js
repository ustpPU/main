(function(root){'use strict';
// PDF generated locally on explicit admin request. No participant data leaves the page.
function reportData(d,generatedAt=new Date().toISOString()){
 const cap=v=>String(v||'').normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleUpperCase('ms-MY');
 const participants=d.participants.filter(r=>r.attendance).map(r=>({...r,name:cap(r.name),school:cap(r.school)})).sort((a,b)=>a.school.localeCompare(b.school,'ms')||a.name.localeCompare(b.name,'ms'));
 const schools=d.schools.filter(s=>!s.attended).sort((a,b)=>a.name.localeCompare(b.name,'ms'));
 return {program:d.program,participants,schools,generatedAt,totalSchools:d.schools.length,attendedSchools:d.schools.filter(s=>s.attended>0).length};
}
function pdfBytes(images,width=595.28,height=841.89){
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;const add=v=>{const b=typeof v==='string'?enc.encode(v):v;chunks.push(b);length+=b.length;},object=(n,head,body)=>{offsets[n]=length;add(n+' 0 obj\n'+head);if(body){add('\nstream\n');add(body);add('\nendstream');}add('\nendobj\n');};
 add('%PDF-1.4\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Count '+images.length+' /Kids ['+images.map((_,i)=>(3+i*3)+' 0 R').join(' ')+'] >>');
 images.forEach((img,i)=>{const n=3+i*3,content=enc.encode('q\n'+width+' 0 0 '+height+' 0 0 cm\n/Im0 Do\nQ');object(n,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+width+' '+height+'] /Resources << /XObject << /Im0 '+(n+1)+' 0 R >> >> /Contents '+(n+2)+' 0 R >>');object(n+1,'<< /Type /XObject /Subtype /Image /Width '+img.width+' /Height '+img.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+img.bytes.length+' >>',img.bytes);object(n+2,'<< /Length '+content.length+' >>',content);});
 const xref=length;add('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');for(let i=1;i<offsets.length;i++)add(String(offsets[i]).padStart(10,'0')+' 00000 n \n');add('trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');const bytes=new Uint8Array(length);let at=0;for(const b of chunks){bytes.set(b,at);at+=b.length;}return bytes;
}
async function generate(d){
 if(document.fonts)await document.fonts.ready;const r=reportData(d),W=1240,H=1754,M=76,BOTTOM=H-124,pages=[];let canvas,ctx,y;
 const date=new Intl.DateTimeFormat('ms-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(r.program.date+'T00:00:00Z'));
 const stamp=new Date(r.generatedAt).toLocaleString('ms-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'});
 const font=(size=21,bold=false)=>{ctx.font=(bold?'700 ':'400 ')+size+'px Arial, sans-serif';};
 function lines(value,max){const out=[];for(const para of String(value||'—').split(/\n/)){let line='';for(const word of para.split(/\s+/)){if(ctx.measureText(line+(line?' ':'')+word).width>max&&line){out.push(line);line='';}if(ctx.measureText(word).width>max){for(const char of word){if(ctx.measureText(line+char).width>max){out.push(line);line='';}line+=char;}}else line+=(line?' ':'')+word;}out.push(line);}return out;}
 function text(value,x,max,size=21,bold=false,color='#163e43'){font(size,bold);ctx.fillStyle=color;for(const line of lines(value,max)){ctx.fillText(line,x,y);y+=size*1.4;}}
 function page(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,W,H);ctx.fillStyle='#0e4548';ctx.fillRect(0,0,W,14);y=75;text('USTP PPD PETALING UTAMA',M,W-2*M,18,true,'#117e72');y+=18;text('LAPORAN PENDAFTARAN KEHADIRAN',M,W-2*M,pages.length?24:30,true);y+=14;text(r.program.title,M,W-2*M,pages.length?24:29,true);y+=9;text(date+'  |  '+r.program.start+' - '+r.program.end,M,W-2*M,20);text(r.program.venue,M,W-2*M,20,false,'#5f7476');y+=12;ctx.strokeStyle='#dae4df';ctx.beginPath();ctx.moveTo(M,y);ctx.lineTo(W-M,y);ctx.stroke();y+=34;pages.push(canvas);}
 function section(title){text(title,M,W-2*M,25,true);y+=16;}
 function ensure(height,heading,cols){if(y+height>BOTTOM){page();section(heading+' (sambungan)');header(cols);}}
 function header(cols){ctx.fillStyle='#eaf3ed';ctx.fillRect(M,y-25,W-2*M,49);font(19,true);ctx.fillStyle='#275a51';cols.forEach(c=>ctx.fillText(c.title,M+c.x+12,y+3));y+=47;}
 function row(cells,cols,index,heading,email=''){font(21);const wrapped=cells.map((v,i)=>lines(v,cols[i].width-28));font(16);const emailLines=email?lines(String(email),cols[1].width-28):[],nameHeight=wrapped[1].length*29+emailLines.length*22,height=Math.max(...wrapped.map(a=>a.length*29),nameHeight)+23;ensure(height,heading,cols);if(index%2===0){ctx.fillStyle='#f5f8f5';ctx.fillRect(M,y-21,W-2*M,height);}ctx.fillStyle='#294247';font(21);wrapped.forEach((a,i)=>a.forEach((line,j)=>ctx.fillText(line,M+cols[i].x+12,y+j*29)));if(emailLines.length){font(16);ctx.fillStyle='#6d807b';emailLines.forEach((line,j)=>ctx.fillText(line,M+cols[1].x+12,y+wrapped[1].length*29+j*22));}y+=height;}

 page();const sy=y,cardWidth=(W-2*M-32)/3;
 [[String(r.participants.length),'Peserta mendaftar\nkehadiran'],[r.attendedSchools+' / '+r.totalSchools,'Sekolah mempunyai\nrekod kehadiran'],[String(r.schools.length),'Sekolah tiada rekod\npendaftaran kehadiran']].forEach(([value,label],i)=>{const x=M+i*(cardWidth+16);ctx.fillStyle=i===2?'#f8f4e9':'#eef5f0';ctx.fillRect(x,sy-8,cardWidth,139);y=sy+43;text(value,x+19,cardWidth-38,40,true,i===2?'#95702f':'#136f61');y=sy+79;text(label,x+19,cardWidth-38,18,false,'#5f7470');});y=sy+170;
 const ph='01  Senarai peserta mendaftar kehadiran',pc=[{title:'Bil.',x:0,width:65},{title:'Nama peserta',x:65,width:435},{title:'Sekolah / Organisasi',x:500,width:W-2*M-500}];
 section(ph);header(pc);if(!r.participants.length)text('Tiada rekod pendaftaran kehadiran.',M,W-2*M,21);r.participants.forEach((p,i)=>row([String(i+1),p.name,p.school],pc,i,ph,p.email));
 page();const sh='02  Sekolah tanpa rekod pendaftaran kehadiran';section(sh);text('Sasaran: '+(r.program.targetAudience==='primary'?'SR sahaja':r.program.targetAudience==='secondary'?'SM sahaja':'SR & SM')+' · Berdasarkan rekod pendaftaran kehadiran dalam sistem.',M,W-2*M,19,false,'#627777');y+=19;
 const sc=[{title:'Bil.',x:0,width:65},{title:'Kod sekolah',x:65,width:175},{title:'Nama sekolah',x:240,width:W-2*M-240}];header(sc);if(!r.schools.length)text('Semua sekolah sasaran mempunyai rekod pendaftaran kehadiran.',M,W-2*M,21);r.schools.forEach((s,i)=>row([String(i+1),s.code,s.name],sc,i,sh));
 pages.forEach((c,i)=>{const x=c.getContext('2d');x.strokeStyle='#d7e3dc';x.beginPath();x.moveTo(M,H-94);x.lineTo(W-M,H-94);x.stroke();x.font='18px Arial, sans-serif';x.fillStyle='#365e56';x.fillText('USTP PPD Petaling Utama',M,H-61);x.font='15px Arial, sans-serif';x.fillStyle='#70847e';x.fillText('Dijana '+stamp+' · Waktu Malaysia',M,H-34);x.textAlign='right';x.font='18px Arial, sans-serif';x.fillText('Halaman '+(i+1)+' / '+pages.length,W-M,H-61);});
 const images=pages.map(c=>({width:W,height:H,bytes:Uint8Array.from(atob(c.toDataURL('image/jpeg',.9).split(',')[1]),x=>x.charCodeAt(0))}));return {bytes:pdfBytes(images),fileName:r.program.id+'-laporan-kehadiran.pdf',pages:pages.length};
}
const api={reportData,pdfBytes,generate};root.USTPAttendanceReport=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
