(function(root){'use strict';
// PDF generated locally on explicit admin request. No participant data leaves the page.
function reportData(d,generatedAt=new Date().toISOString()){
 const participants=d.participants.filter(r=>r.attendance).sort((a,b)=>a.school.localeCompare(b.school,'ms')||a.name.localeCompare(b.name,'ms'));
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
 if(document.fonts)await document.fonts.ready;const r=reportData(d),W=1240,H=1754,M=88,BOTTOM=H-120,pages=[];let canvas,ctx,y,pageNo=0;
 const date=new Intl.DateTimeFormat('ms-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(r.program.date+'T00:00:00Z'));
 const stamp=new Date(r.generatedAt).toLocaleString('ms-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'});
 const font=(size=20,bold=false)=>{ctx.font=(bold?'700 ':'400 ')+size+'px Arial, sans-serif';};
 function lines(value,max){const out=[];for(const para of String(value||'—').split(/\n/)){let line='';for(const word of para.split(/\s+/)){if(ctx.measureText(line+(line?' ':'')+word).width>max&&line){out.push(line);line='';}if(ctx.measureText(word).width>max){for(const char of word){if(ctx.measureText(line+char).width>max){out.push(line);line='';}line+=char;}}else line+=(line?' ':'')+word;}out.push(line);}return out;}
 function text(value,x,max,size=20,bold=false,color='#193b40'){font(size,bold);ctx.fillStyle=color;const a=lines(value,max);for(const line of a){ctx.fillText(line,x,y);y+=size*1.4;}return a.length;}
 function page(){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,W,H);ctx.fillStyle='#113f46';ctx.fillRect(0,0,W,20);y=75;text('USTP PPD PETALING UTAMA',M,W-2*M,18,true,'#137c75');y+=15;text('LAPORAN KEHADIRAN',M,W-2*M,30,true);y+=10;text(r.program.title,M,W-2*M,25,true);text(date+'  |  '+r.program.start+' - '+r.program.end,M,W-2*M,19);text(r.program.venue,M,W-2*M,19);y+=10;text('Dijana: '+stamp+' (waktu Malaysia)',M,W-2*M,16,false,'#647878');ctx.strokeStyle='#c6d6d1';ctx.beginPath();ctx.moveTo(M,y+6);ctx.lineTo(W-M,y+6);ctx.stroke();y+=40;pageNo++;pages.push(canvas);}
 function ensure(height,heading,columns){if(y+height>BOTTOM){page();if(heading)section(heading);if(columns)header(columns);}}
 function section(title){font(23,true);const n=lines(title,W-2*M).length;ensure(n*34+35,'');text(title,M,W-2*M,23,true);y+=16;}
 function header(cols){ctx.fillStyle='#eaf2ee';ctx.fillRect(M,y-24,W-2*M,42);font(17,true);ctx.fillStyle='#193b40';cols.forEach(c=>ctx.fillText(c.title,M+c.x+10,y));y+=35;}
 function row(cells,cols,index,heading){font(18);const wrapped=cells.map((v,i)=>lines(v,cols[i].width-24)),height=Math.max(...wrapped.map(a=>a.length))*26+24;ensure(height,heading,cols);if(index%2===0){ctx.fillStyle='#f5f8f6';ctx.fillRect(M,y-19,W-2*M,height);}ctx.fillStyle='#213b3f';font(18);wrapped.forEach((a,i)=>a.forEach((line,j)=>ctx.fillText(line,M+cols[i].x+10,y+j*26)));y+=height;}
 page();text(r.participants.length+' peserta hadir  •  '+r.attendedSchools+'/'+r.totalSchools+' sekolah sasaran hadir  •  '+r.schools.length+' sekolah belum hadir',M,W-2*M,19,true);y+=20;
 const pc=[{title:'Bil.',x:0,width:60},{title:'Nama peserta',x:60,width:390},{title:'Sekolah / Organisasi',x:450,width:390},{title:'Penyertaan',x:840,width:W-2*M-840}];
 const ph='A. Peserta yang telah hadir';section(ph);header(pc);if(!r.participants.length)text('Belum ada peserta hadir.',M,W-2*M);r.participants.forEach((p,i)=>row([String(i+1),p.name,p.school,(p.participationType==='representative'?'Wakil':p.participationType==='participant'?'Peserta':'Belum dinyatakan')+(p.position?'\n'+p.position:'')],pc,i,ph+' (sambungan)'));
 y+=32;const sh='B. Sekolah yang belum mempunyai peserta hadir';ensure(160,'');section(sh);text('Sasaran: '+(r.program.targetAudience==='primary'?'SR sahaja':r.program.targetAudience==='secondary'?'SM sahaja':'SR & SM')+'. Sekolah dikira hadir apabila sekurang-kurangnya seorang peserta atau wakil hadir.',M,W-2*M,17);y+=15;
 const sc=[{title:'Bil.',x:0,width:60},{title:'Kod sekolah',x:60,width:180},{title:'Nama sekolah',x:240,width:W-2*M-240}];header(sc);if(!r.schools.length)text('Semua sekolah sasaran mempunyai peserta hadir.',M,W-2*M);r.schools.forEach((s,i)=>row([String(i+1),s.code,s.name],sc,i,sh+' (sambungan)'));
 pages.forEach((c,i)=>{const x=c.getContext('2d');x.strokeStyle='#c6d6d1';x.beginPath();x.moveTo(M,H-90);x.lineTo(W-M,H-90);x.stroke();x.font='16px Arial, sans-serif';x.fillStyle='#526e6b';x.fillText('USTP PPD Petaling Utama',M,H-57);x.textAlign='right';x.fillText('Halaman '+(i+1)+' / '+pages.length,W-M,H-57);});
 const images=pages.map(c=>({width:W,height:H,bytes:Uint8Array.from(atob(c.toDataURL('image/jpeg',.92).split(',')[1]),x=>x.charCodeAt(0))}));return {bytes:pdfBytes(images),fileName:r.program.id+'-laporan-kehadiran.pdf',pages:pages.length};
}
const api={reportData,pdfBytes,generate};root.USTPAttendanceReport=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
