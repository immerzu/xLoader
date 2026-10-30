// Native picker / Tampermonkey callbacks are test doubles. The HTTP test uses
// real local HTTP and disk I/O; Windows dialog behavior is user-confirmed.
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const http=require('node:http');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=require('node:fs').readFileSync(path.join(__dirname,'../xLoader.user.js'),'utf8');
const functions=source.slice(source.indexOf('async function selectDownloadFile('),source.indexOf('function downloadUrl('));
const click=source.slice(source.indexOf('function pruneTaskButtons('),source.indexOf('function normBase('))+
 source.slice(source.indexOf('async function onDownloadClick('),source.indexOf('// ============================ Button-Injektion'));
function fixture(){
 const state={events:[],chunks:[],closed:0,aborted:0,progress:[],timers:new Map(),requests:0};let id=0;
 const media=new Uint8Array([0,0,0,12,102,116,121,112,105,115,111,109]);
 const file={async createWritable(){state.events.push('writable');return {async write(b){state.chunks.push(Buffer.from(b))},async close(){state.closed++},async abort(){state.aborted++}}}};
 const win={async showSaveFilePicker(o){assert.equal(this,win);state.events.push('picker');state.suggested=o.suggestedName;return file}};
 const context={URL,AbortController,CONFIG:{requestTimeoutMs:60000},window:{showSaveFilePicker:win.showSaveFilePicker},document:{defaultView:win},navigator:{userActivation:{isActive:true}},log:{info(){},warn(){},error(){}},setTimeout(fn){state.timers.set(++id,fn);return id},clearTimeout(id){state.timers.delete(id)},
  isMediaUrl(){return true},hlsUrl(){return false},allowedImageUrl(){return true},responseHeader(headers,name){const m=new RegExp('(?:^|\\r?\\n)'+name+':\\s*([^\\r\\n]+)','i').exec(headers||'');return m?m[1].trim():''},
  assertFullHttpResponse(status){if(status!==200)throw Error('Download HTTP '+status)},assertMediaContentType(){},
  ensureNotCancelled(signal){if(signal&&signal.aborted){const e=Error('Download abgebrochen');e.name='AbortError';throw e}},
  downloadAbortError(){const e=Error('Download abgebrochen');e.name='AbortError';return e},
  isCancellation(e,signal){return !!(signal&&signal.aborted)||!!(e&&e.name==='AbortError')},
  onDownloadAbort(signal,fn){if(!signal)return()=>{};signal.addEventListener('abort',fn,{once:true});return()=>signal.removeEventListener('abort',fn)}};
 context.GM_xmlhttpRequest=o=>{assert.equal('timeout' in o,false);assert.equal(typeof o.onloadend,'function');state.requests++;queueMicrotask(()=>{o.onloadstart({status:0,readyState:1,responseHeaders:'',response:new ReadableStream({start(c){c.enqueue(media);c.close()}})});const final={status:200,readyState:4,responseHeaders:'Content-Length: '+media.length};o.onreadystatechange(final);o.onload(final)});return {abort(){state.events.push('abort')}}};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function allowedImageUrl('),source.indexOf('function hlsUrl(')),context);vm.runInContext(source.slice(source.indexOf('function isProgressiveVideoUrl('),source.indexOf('function isMediaUrl(')),context);vm.runInContext(functions,context);
 context.__beginDirectMediaSizeProbe=context.beginDirectMediaSizeProbe;
 context.beginDirectMediaSizeProbe=(url,signal,onSize)=>{onSize(media.length);return()=>{}};
 return {context,state,file,media};
}
function clickFixture({cached=true,all=false,picker=true,cancel=false,mergeError=false,pending=false,detail=false}={}){
 const f=fixture(),{context:c,state:s,file}=f;let accept;
 Object.assign(c,{location:{pathname:detail?'/author/status/123':'/home'},isMediaUrl(){return true},hlsUrl(){return false},mediaIdOf(url){const m=String(url).match(/(?:amplify_video|ext_tw_video|tweet_video)[^/]*\/([A-Za-z0-9_-]+)/);return m?m[1]:null},renderedTweetMedia(){return []},broadcastFromDom(){return null},saveAsMode:all?'all':'first',CONFIG:{progressBadgeMinBytes:5e6},runningDownloads:new WeakMap(),runningDownloadsByTweet:new Map(),showCancelPopup(){},closeCancelPopup(){},setBusy(b,v){b.disabled=v},getTweetId(){return '123'},getHandle(){return 'author'},sanitizeFilenamePart(v){return v},formatFilename(t,d){return '@'+d.handle+'_'+d.id+'_'+d.index+'.'+d.ext},getFilenameTemplate(){return ''},getCachedItems(){return cached?[{url:'first',ext:'mp4'}]:null},mediaCache:new Map(),prefetchSeen:new Set(),prefetchSeenAt:new Map(),setCachedItems(){},async loadItemsLive(){s.events.push('metadata');return {items:[{url:'first',ext:'mp4'}]}},async mergeDomItems(t,items){s.events.push('merge');if(mergeError)throw Error('merge');return [...items,{url:'second',ext:'png'}]},async downloadUrl(url,name,saveAs,onProgress){s.events.push({legacy:true,url,name,saveAs});if(c.__progressEvent&&onProgress)onProgress(c.__progressEvent)},hideProgress(){s.progress.push('hidden')},showProgress(b,value){s.progress.push(value)},flashError(b,msg){s.error=true;s.errorMessage=msg}});
 c.selectDownloadFile=async name=>{s.events.push('picker');if(cancel){const e=Error();e.name='AbortError';throw e}if(pending)return new Promise(r=>accept=r);return picker?file:null};
 c.downloadSelectedFile=async(url,handle)=>{assert.equal(handle,file);s.events.push({selected:true,url})};
 vm.runInContext(click,c);return {...f,accept:()=>accept(file)};
}
test('picker uses native receiver, preserves name and starts no transfer',async()=>{const f=fixture();await f.context.selectDownloadFile('a.mp4');assert.deepEqual(f.state.events,['picker']);assert.equal(f.state.suggested,'a.mp4');assert.equal(f.state.requests,0)});
test('missing File System Access API uses legacy fallback',async()=>{const f=fixture();f.context.window={};assert.equal(await f.context.selectDownloadFile('a'),null)});
test('expired activation uses legacy fallback',async()=>{const f=fixture();f.context.navigator.userActivation.isActive=false;assert.equal(await f.context.selectDownloadFile('a'),null);assert.equal(f.state.events.length,0)});
for(const name of ['SecurityError','NotSupportedError','TypeError'])test(name+' uses legacy fallback',async()=>{const f=fixture();f.context.window.showSaveFilePicker=()=>{const e=Error();e.name=name;throw e};assert.equal(await f.context.selectDownloadFile('a'),null)});
test('picker cancellation is not retried as legacy download',async()=>{const f=clickFixture({cancel:true}),btn={};await f.context.onDownloadClick({},btn);assert.deepEqual(f.state.events,['picker']);assert.equal(btn.disabled,false)});
test('HEAD size probe supplies a missing stream total without downloading media',async()=>{
 const f=fixture();let options,size=0;
 f.context.GM_xmlhttpRequest=o=>{options=o;queueMicrotask(()=>o.onload({status:200,responseHeaders:'Content-Length: 50000000'}));return{abort(){}}};
 f.context.__beginDirectMediaSizeProbe('https://video.twimg.com/tweet_video/a.mp4',null,value=>{size=value});
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(options.method,'HEAD');assert.equal(size,50000000);
});
test('stream writes exact bytes, reports progress, closes once, clears timer',async()=>{const f=fixture();await f.context.downloadSelectedFile('u',f.file,p=>f.state.progress.push(p));assert.deepEqual(Buffer.concat(f.state.chunks),Buffer.from(f.media));assert.equal(f.state.closed,1);assert.equal(f.state.progress[0].done,f.media.length);assert.equal(f.state.progress[0].total,f.media.length);assert.equal(f.state.timers.size,0)});
test('stream progress uses probed total when Tampermonkey omits response length',async()=>{
 const f=fixture();f.context.beginDirectMediaSizeProbe=(url,signal,onSize)=>{onSize(f.media.length);return()=>{}};
 f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{o.onloadstart({status:0,responseHeaders:'',response:new ReadableStream({start(c){c.enqueue(f.media);c.close()}})});o.onload({status:200,responseHeaders:''})});return{abort(){}}};
 await f.context.downloadSelectedFile('u',f.file,p=>f.state.progress.push(p));
 assert.equal(f.state.progress.at(-1).total,f.media.length);assert.equal(f.state.progress.at(-1).done,f.media.length);assert.equal(f.state.closed,1);
});

test('stream end waits for final HTTP status before committing',async()=>{
 const f=fixture();let finish;
 f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{o.onloadstart({status:0,response:new ReadableStream({start(c){c.enqueue(f.media);c.close()}})});finish=()=>o.onload({status:200,responseHeaders:'Content-Length: '+f.media.length})});return {abort(){}}};
 const pending=f.context.downloadSelectedFile('u',f.file);
 await new Promise(r=>setImmediate(r));assert.equal(f.state.closed,0);
 finish();await pending;assert.equal(f.state.closed,1);
});
test('HTTP failure after status-zero start aborts the staging file',async()=>{
 const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{o.onloadstart({status:0,response:new ReadableStream({start(c){c.close()}})});o.onload({status:403})});return {abort(){}}};
 await assert.rejects(f.context.downloadSelectedFile('u',f.file),/HTTP 403/);assert.equal(f.state.closed,0);assert.equal(f.state.events.includes('writable'),false);
});
test('loadend-only transport failure rejects instead of hanging',async()=>{
 const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{o.onloadstart({status:0,response:new ReadableStream({start(){}})});o.onloadend({status:408})});return {abort(){}}};
 await assert.rejects(f.context.downloadSelectedFile('u',f.file),/HTTP 408/);assert.equal(f.state.closed,0);assert.equal(f.state.timers.size,0);
});
test('empty successful media stream is not committed',async()=>{
 const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{o.onloadstart({status:0,response:new ReadableStream({start(c){c.close()}})});o.onload({status:200})});return {abort(){}}};
 await assert.rejects(f.context.downloadSelectedFile('u',f.file),/unvollständig/);assert.equal(f.state.closed,0);assert.equal(f.state.aborted,1);
});
test('Tampermonkey closes the stream only when loadend was requested',async()=>{
 const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{let control;const response=new ReadableStream({start(c){control=c;c.enqueue(f.media)}});o.onloadstart({status:0,response});o.onload({status:200,responseHeaders:'Content-Length: '+f.media.length});assert.equal(typeof o.onloadend,'function');control.close();o.onloadend({status:200})});return {abort(){}}};
 await f.context.downloadSelectedFile('u',f.file);assert.equal(f.state.closed,1);assert.equal(Buffer.concat(f.state.chunks).length,f.media.length);
});
test('HTTP failure does not open writable or overwrite file',async()=>{const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onloadstart({status:403}));return {abort(){}}};await assert.rejects(f.context.downloadSelectedFile('u',f.file),/HTTP 403/);assert.equal(f.state.events.includes('writable'),false);assert.equal(f.state.timers.size,0)});
test('truncated body aborts without committing',async()=>{const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const res={status:200,responseHeaders:'Content-Length: '+(f.media.length+1),response:new ReadableStream({start(c){c.enqueue(f.media);c.close()}})};o.onloadstart(res);o.onload(res)});return {abort(){}}};await assert.rejects(f.context.downloadSelectedFile('u',f.file),/unvollständig/);assert.equal(f.state.closed,0);assert.equal(f.state.aborted,1)});
test('network error clears watchdog',async()=>{const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onerror());return {abort(){}}};await assert.rejects(f.context.downloadSelectedFile('u',f.file),/Netzwerk/);assert.equal(f.state.timers.size,0)});
test('unsupported GM stream fails visibly without committing',async()=>{const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onloadstart({status:200,response:{}}));return {abort(){}}};await assert.rejects(f.context.downloadSelectedFile('u',f.file),/keinen Download-Stream/);assert.equal(f.state.closed,0)});
test('watchdog aborts a stalled request',async()=>{const f=fixture();let aborts=0;f.context.GM_xmlhttpRequest=()=>({abort(){aborts++}});const p=f.context.downloadSelectedFile('u',f.file);const rejected=assert.rejects(p,/Timeout/);[...f.state.timers.values()][0]();await rejected;assert.equal(aborts,1);assert.equal(f.state.timers.size,0)});
test('disk error aborts instead of closing',async()=>{const f=fixture();f.file.createWritable=async()=>({async write(){throw Error('disk full')},async close(){f.state.closed++},async abort(){f.state.aborted++}});await assert.rejects(f.context.downloadSelectedFile('u',f.file),/disk full/);assert.equal(f.state.closed,0);assert.equal(f.state.aborted,1)});
test('transport abort during read does not commit partial bytes',async()=>{const f=fixture();f.context.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array([1]));},pull(){queueMicrotask(()=>o.onabort())}});o.onloadstart({status:200,responseHeaders:'',response:stream})});return {abort(){}}};await assert.rejects(f.context.downloadSelectedFile('u',f.file),/abgebrochen/);assert.equal(f.state.closed,0);assert.equal(f.state.aborted,1)});
test('cache hit selects file before metadata refresh and video merge, preserves multi-media filenames',async()=>{const f=clickFixture(),b={};await f.context.onDownloadClick({},b);assert.deepEqual(f.state.events.slice(0,3),['picker','metadata','merge']);const next=f.state.events.find(x=>x.legacy);assert.equal(next.name,'@author_123_2.png');assert.equal(next.saveAs,false);assert.equal(b.disabled,false)});
test('timeline cache hit replaces stale video URL only after the picker',async()=>{
 const f=clickFixture(),stale='https://video.twimg.com/amplify_video/99/vid/old.mp4?tag=1',fresh='https://video.twimg.com/amplify_video/99/vid/fresh.mp4?tag=2';
 f.context.getCachedItems=()=>[{url:stale,ext:'mp4'}];
 f.context.loadItemsLive=async()=>{f.state.events.push('metadata');return {items:[{url:fresh,ext:'mp4'}]}};
 f.context.mergeDomItems=async(t,v)=>{f.state.events.push('merge');return v};
 await f.context.onDownloadClick({},{});
 assert.deepEqual(f.state.events.slice(0,3),['picker','metadata','merge']);
 assert.equal(f.state.events.find(e=>e.selected).url,fresh);
});
test('incomplete fresh response updates its matching item without dropping other media',()=>{
 const f=clickFixture(),current=[
  {url:'https://video.twimg.com/amplify_video/11/vid/old.mp4',ext:'mp4'},
  {url:'https://video.twimg.com/amplify_video/22/vid/second.mp4',ext:'mp4'}
 ],fresh=[{url:'https://video.twimg.com/amplify_video/11/vid/fresh.mp4',ext:'mp4'}];
 const result=f.context.preferFreshItems(current,fresh);
 assert.equal(result.length,2);assert.equal(result[0].url,fresh[0].url);assert.equal(result[1].url,current[1].url);
});
test('tweet detail view keeps its rendered source and skips the timeline refresh',async()=>{
 const f=clickFixture({detail:true});await f.context.onDownloadClick({},{});
 assert.deepEqual(f.state.events.slice(0,2),['picker','merge']);
 assert.equal(f.state.events.some(e=>e==='metadata'),false);
});
test('all mode keeps legacy saveAs for subsequent media',async()=>{const f=clickFixture({all:true});await f.context.onDownloadClick({},{});assert.equal(f.state.events.find(x=>x.legacy).saveAs,true)});
test('cache miss resolves metadata before choosing file',async()=>{const f=clickFixture({cached:false});await f.context.onDownloadClick({},{});assert.deepEqual(f.state.events.slice(0,3),['metadata','picker','merge'])});
test('double click while picker pending opens one picker',async()=>{const f=clickFixture({pending:true}),b={};const p=f.context.onDownloadClick({},b);await f.context.onDownloadClick({},b);assert.equal(f.state.events.filter(e=>e==='picker').length,1);f.accept();await p;assert.equal(b.disabled,false)});
test('legacy fallback downloads all media',async()=>{const f=clickFixture({picker:false});await f.context.onDownloadClick({},{});assert.equal(f.state.events.filter(e=>e.legacy).length,2)});
test('legacy video shows indeterminate progress when GM_download reports no total',async()=>{const f=clickFixture({picker:false});f.context.__progressEvent={done:1024,total:0};await f.context.onDownloadClick({},{});assert.equal(f.state.progress.includes('…'),true);assert.equal(f.state.progress.some(v=>String(v).includes('NaN')),false)});
test('legacy large video switches from indeterminate state to percentage',async()=>{const f=clickFixture({picker:false});f.context.__progressEvent={done:25e6,total:50e6};await f.context.onDownloadClick({},{});assert.equal(f.state.progress.includes('…'),true);assert.equal(f.state.progress.includes(50),true)});
test('replacement button restores running tweet progress after DOM recycling',()=>{const f=clickFixture(),oldBtn={isConnected:false},newBtn={isConnected:true};const task={signal:new AbortController().signal,btn:oldBtn,buttons:[oldBtn],progressVisible:true,progressValue:63,statusTitle:'Lade 1/1 … 63%'};f.context.bindRunningDownloadButton(task,newBtn);assert.equal(f.context.runningDownloads.get(newBtn),task);assert.equal(task.btn,newBtn);assert.equal(newBtn.disabled,true);assert.equal(newBtn.title,'Lade 1/1 … 63%');assert.equal(f.state.progress.at(-1),63)});
test('rebinding prunes detached buttons and their stale WeakMap entries',()=>{const f=clickFixture(),oldBtn={isConnected:false},newBtn={isConnected:true};const task={signal:new AbortController().signal,btn:oldBtn,buttons:[oldBtn],progressVisible:true,progressValue:41,statusTitle:'41%'};f.context.runningDownloads.set(oldBtn,task);f.context.bindRunningDownloadButton(task,newBtn);assert.equal(f.context.runningDownloads.has(oldBtn),false);assert.equal(task.buttons.length,1);assert.equal(task.buttons[0],newBtn);assert.equal(f.context.runningDownloads.get(newBtn),task)});
test('progress is mirrored to every connected representation of one tweet',()=>{const f=clickFixture(),a={isConnected:true},b={isConnected:true};const task={signal:new AbortController().signal,btn:b,buttons:[a,b]};f.context.setTaskProgress(task,77,'77%');assert.deepEqual(f.state.progress.slice(-2),[77,77]);assert.equal(a.title,'77%');assert.equal(b.title,'77%')});
test('expired second HLS picker caches remainder and resumes on next click',async()=>{
 const f=clickFixture(),items=[{url:'https://video.twimg.com/x/1.m3u8',ext:'mp4'},{url:'https://video.twimg.com/x/2.m3u8',ext:'mp4'}];let cache=items,picks=0;
 f.context.getCachedItems=()=>cache;f.context.mergeDomItems=async(t,v)=>v;f.context.hlsUrl=()=>true;
 f.context.loadItemsLive=async()=>({items:[]});
 f.context.downloadHlsFile=async url=>f.state.events.push({hls:url});
 f.context.setCachedItems=(id,v)=>{cache=v};f.context.selectDownloadFile=async()=>++picks===2?null:f.file;
 await f.context.onDownloadClick({},{});assert.equal(f.state.events.filter(e=>e.hls).length,1);assert.equal(cache.length,1);assert.equal(cache[0].url,items[1].url);
 await f.context.onDownloadClick({},{});assert.equal(f.state.events.filter(e=>e.hls).length,2);assert.equal(f.state.events.filter(e=>e.hls)[1].hls,items[1].url)
});
test('reported two-video tweet keeps both highest-quality MP4s and downloads both',async()=>{
 const f=clickFixture();const data=require('./fixtures/two-videos-2111770022419075168.json');
 vm.runInContext(source.slice(source.indexOf('function collectTweetObjects('),source.indexOf('function fetchLiveBearerToken(')),f.context);
 const items=f.context.parseApiData(data,data.id_str).media;assert.equal(items.length,2);
 assert.match(items[0].url,/2160x3840/);assert.match(items[1].url,/480x852/);
 f.context.isMediaUrl=()=>true;f.context.renderedTweetMedia=()=>[];f.context.getCachedItems=()=>items;f.context.mergeDomItems=async(t,v)=>v;
 f.context.loadItemsLive=async()=>({items});
 await f.context.onDownloadClick({querySelectorAll(){return[]}},{});
 const downloads=f.state.events.filter(e=>e.selected||e.legacy);
 assert.equal(downloads.length,2,f.state.errorMessage);assert.equal(downloads[0].url,items[0].url);assert.equal(downloads[1].url,items[1].url);assert.match(downloads[1].name,/_2\.mp4$/);
});
test('merge error releases button and starts no transfer',async()=>{const f=clickFixture({mergeError:true}),b={};await f.context.onDownloadClick({},b);assert.equal(b.disabled,false);assert.equal(f.state.events.some(e=>e.selected||e.legacy),false);assert.equal(f.state.error,true)});
test('real HTTP stream completes with matching disk bytes and SHA-256',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'xloader-stream-'));
 const bytes=Buffer.alloc(512*1024);for(let i=0;i<bytes.length;i++)bytes[i]=i%251;Buffer.from([0,0,0,12,102,116,121,112,105,115,111,109]).copy(bytes,0);
 const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Length':bytes.length,'Content-Type':'video/mp4'});res.end(bytes)});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const f=fixture();
 f.context.GM_xmlhttpRequest=o=>{const controller=new AbortController();fetch(o.url,{signal:controller.signal}).then(r=>{const parts=r.body.tee();const result={status:r.status,responseHeaders:'Content-Length: '+r.headers.get('content-length')};o.onloadstart({...result,status:0,response:parts[0]});return new Response(parts[1]).arrayBuffer().then(()=>o.onload(result))}).catch(()=>o.onerror());return {abort(){controller.abort()}}};
 const target=path.join(dir,'download.mp4'),staged=path.join(dir,'download.part');
 const file={async createWritable(){const handle=await fs.open(staged,'w');return {async write(b){await handle.write(b)},async close(){await handle.close();await fs.rename(staged,target)},async abort(){await handle.close();await fs.rm(staged,{force:true})}}}};
 try{await f.context.downloadSelectedFile('http://127.0.0.1:'+server.address().port,file);const actual=await fs.readFile(target);assert.equal(actual.length,bytes.length);assert.equal(crypto.createHash('sha256').update(actual).digest('hex'),crypto.createHash('sha256').update(bytes).digest('hex'));assert.equal(f.state.timers.size,0)}
 finally{server.closeAllConnections();await new Promise(r=>server.close(r));assert.equal(path.dirname(path.resolve(dir)),path.resolve(os.tmpdir()));assert.match(path.basename(dir),/^xloader-stream-/);await fs.rm(dir,{recursive:true,force:true})}
});
