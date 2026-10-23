'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {ReadableStream}=require('node:stream/web');

const source=fs.readFileSync(path.join(__dirname,'../xLoader.user.js'),'utf8');
const stop=source.indexOf("    if (document.readyState === 'loading')");
const exposed=`globalThis.X={CONFIG,isMediaUrl,normalizeMediaUrl,hlsPlaylist,downloadHlsFile,
 downloadSelectedFile,fetchTweetData,sanitizeFilenamePart,performanceHlsFromTweet,
 failPrefetch,queuePrefetch,clearMediaCache,getCachedItems,mediaCache,prefetchSeen,prefetchQueue,hlsFetch,
 active:()=>activePrefetches,generation:()=>cacheGeneration,
 setHlsFetch:fn=>{hlsFetch=fn},setTweetFetch:fn=>{fetchTweetData=fn}};\n})();`;

function runtime(){
 let seq=0;const timers=new Map();
 const ctx={URL,AbortController,Uint8Array,DataView,ReadableStream,performance:{now:()=>100000,getEntriesByType:()=>[]},
  console:{log(){},warn(){},error(){}},location:{origin:'https://x.com'},navigator:{},window:{},
  document:{cookie:'',querySelectorAll(){return[]}},localStorage:{getItem(){return null},setItem(){}},
  setTimeout(fn,ms){timers.set(++seq,{fn,ms});return seq},clearTimeout(id){timers.delete(id)},
  GM_addStyle(){},GM_registerMenuCommand(){}};
 vm.createContext(ctx);vm.runInContext(source.slice(0,stop)+exposed,ctx);
 return {ctx,X:ctx.X,timers};
}
function box(type,...parts){
 const payload=Buffer.concat(parts.map(Buffer.from));const out=Buffer.alloc(payload.length+8);
 out.writeUInt32BE(out.length,0);out.write(type,4);payload.copy(out,8);return out;
}
function u32(n){const b=Buffer.alloc(4);b.writeUInt32BE(n);return b}
function validInit(track=1){
 const tkhd=box('tkhd',Buffer.concat([Buffer.alloc(12),u32(track),Buffer.alloc(4)]));
 const trak=box('trak',tkhd);const trex=box('trex',Buffer.concat([Buffer.alloc(4),u32(track),Buffer.alloc(12)]));
 return new Uint8Array(Buffer.concat([box('ftyp',Buffer.from('iso6')),box('moov',trak,box('mvex',trex))]));
}
function validFragment(track=1,time=0){
 const tfhd=box('tfhd',Buffer.concat([Buffer.alloc(4),u32(track)]));
 const tfdt=box('tfdt',Buffer.concat([Buffer.alloc(4),u32(time)]));
 const trun=box('trun',Buffer.concat([Buffer.alloc(4),u32(1)]));
 return new Uint8Array(Buffer.concat([box('moof',box('traf',tfhd,tfdt,trun)),box('mdat',Buffer.from([1]))]));
}
function sink(){const s={writes:[],closed:0,aborted:0};s.file={async createWritable(){return{
 async write(v){s.writes.push(Buffer.from(v))},async close(){s.closed++},async abort(){s.aborted++}}}};return s}
function directResponse(status,headers,bytes){return{status,readyState:4,responseHeaders:headers,
 response:new ReadableStream({start(c){if(bytes.length)c.enqueue(new Uint8Array(bytes));c.close()}})}}
const tinyMp4=[0,0,0,12,102,116,121,112,105,115,111,109];

test('H1 rejects unexpected HTTP partial response',async()=>{
 const r=runtime(),s=sink();r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const x=directResponse(206,'Content-Length: 3\r\nContent-Range: bytes 0-2/1000',[1,2,3]);o.onloadstart(x);o.onload(x)});return{abort(){}}};
 await assert.rejects(r.X.downloadSelectedFile('https://video.twimg.com/tweet_video/a.mp4',s.file),/Teilantwort/);assert.equal(s.closed,0)
});
test('H1 accepts complete 200 media response',async()=>{
 const r=runtime(),s=sink();r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const x=directResponse(200,'Content-Length: 12\r\nContent-Type: video/mp4',tinyMp4);o.onloadstart(x);o.onreadystatechange(x);o.onload(x)});return{abort(){}}};
 await r.X.downloadSelectedFile('https://video.twimg.com/tweet_video/a.mp4',s.file);assert.equal(s.closed,1)
});
test('H1 rejects falsely labelled non-media body',async()=>{
 const r=runtime(),s=sink(),fake=Buffer.from('<html>error</html>');r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const x=directResponse(200,'Content-Length: '+fake.length+'\r\nContent-Type: video/mp4',fake);o.onloadstart(x);o.onload(x)});return{abort(){}}};
 await assert.rejects(r.X.downloadSelectedFile('https://video.twimg.com/tweet_video/a.mp4',s.file),/MP4-Signatur/);assert.equal(s.closed,0);assert.equal(s.aborted,1)
});
test('H2 rejects empty fMP4 boxes without tracks or samples',async()=>{
 const r=runtime(),s=sink(),empty=new Uint8Array(Buffer.concat([box('ftyp'),box('moov')]));
 r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:1,\na.m4s\n#EXT-X-ENDLIST':u.endsWith('init.mp4')?empty:new Uint8Array(Buffer.concat([box('moof'),box('mdat')])));
 await assert.rejects(r.X.downloadHlsFile('https://video.twimg.com/x/list.m3u8',s.file,null,null,'mp4'),/Track|Medienfragment/);assert.equal(s.closed,0)
});
test('H2 accepts structurally valid fMP4 init and media fragment',async()=>{
 const r=runtime(),s=sink();r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:1,\na.m4s\n#EXT-X-ENDLIST':u.endsWith('init.mp4')?validInit():validFragment());
 await r.X.downloadHlsFile('https://video.twimg.com/x/list.m3u8',s.file,null,null,'mp4');assert.equal(s.closed,1);assert.equal(s.writes.length,2)
});
test('H2 rejects fragment sample count beyond media payload',async()=>{const r=runtime(),s=sink(),bad=validFragment();new DataView(bad.buffer,bad.byteOffset,bad.byteLength).setUint32(60,2);r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:1,\na.m4s\n#EXT-X-ENDLIST':u.endsWith('init.mp4')?validInit():bad);await assert.rejects(r.X.downloadHlsFile('https://video.twimg.com/x/list.m3u8',s.file,null,null,'mp4'),/Sampleanzahl/);assert.equal(s.closed,0)});
test('H3 rejects MAP changes, gaps and discontinuities',()=>{
 const r=runtime(),base='https://video.twimg.com/x/list.m3u8';
 assert.throws(()=>r.X.hlsPlaylist('#EXTM3U\n#EXT-X-MAP:URI="a"\n#EXTINF:1,\na.m4s\n#EXT-X-MAP:URI="b"\n#EXTINF:1,\nb.m4s\n#EXT-X-ENDLIST',base),/MAP-Wechsel/);
 assert.throws(()=>r.X.hlsPlaylist('#EXTM3U\n#EXTINF:1,\n#EXT-X-GAP\na.ts\n#EXT-X-ENDLIST',base),/Medienlücke/)
});
test('H3 accepts stable complete playlist',()=>{const r=runtime();const p=r.X.hlsPlaylist('#EXTM3U\n#EXT-X-MAP:URI="i"\n#EXTINF:1,\na.m4s\n#EXT-X-ENDLIST','https://video.twimg.com/x/l.m3u8');assert.equal(p.segments.length,1);assert.equal(p.endlist,true)});
test('H3 rejects a video timeline discontinuity before writing',async()=>{const r=runtime(),s=sink(),ts=new Uint8Array(188);ts[0]=0x47;ts[1]=0x40;ts[3]=0x10;r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXTINF:1,\na.ts\n#EXT-X-DISCONTINUITY\n#EXTINF:1,\nb.ts\n#EXT-X-ENDLIST':ts);await assert.rejects(r.X.downloadHlsFile('https://video.twimg.com/x/l.m3u8',s.file,null,null,'ts'),/Zeitachsenwechsel/);assert.equal(s.writes.length,0)});
test('H4 rejects TS output requested as MP4',async()=>{
 const r=runtime(),s=sink(),ts=new Uint8Array(188);ts[0]=0x47;ts[1]=0x40;ts[3]=0x10;
 r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXTINF:1,\na.ts\n#EXT-X-ENDLIST':ts);
 await assert.rejects(r.X.downloadHlsFile('https://video.twimg.com/x/l.m3u8',s.file,null,null,'mp4'),e=>e.code==='HLS_CONTAINER_MISMATCH');assert.equal(s.writes.length,0)
});
test('H4 accepts validated TS under TS extension',async()=>{
 const r=runtime(),s=sink(),ts=new Uint8Array(188);ts[0]=0x47;ts[1]=0x40;ts[3]=0x10;
 r.X.setHlsFetch(async(u,k)=>k==='text'?'#EXTM3U\n#EXTINF:1,\na.ts\n#EXT-X-ENDLIST':ts);
 await r.X.downloadHlsFile('https://video.twimg.com/x/l.m3u8',s.file,null,null,'ts');assert.equal(s.closed,1)
});
test('H5 aborts active metadata request',async()=>{
 const r=runtime(),c=new AbortController();let aborted=0;r.ctx.GM_xmlhttpRequest=()=>({abort(){aborted++}});
 const p=r.X.fetchTweetData('1',c.signal);c.abort();await assert.rejects(p,/abgebrochen/);assert.equal(aborted,1)
});
test('H5 metadata request still completes normally',async()=>{
 const r=runtime();r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onload({status:200,responseText:'{"ok":true}'}));return{abort(){}}};assert.equal((await r.X.fetchTweetData('1')).ok,true)
});
test('H5 abort during file write aborts the staging file',async()=>{const r=runtime(),s=sink(),c=new AbortController();let releaseWrite;s.file={async createWritable(){return{async write(){await new Promise(resolve=>{releaseWrite=resolve})},async close(){s.closed++},async abort(){s.aborted++}}}};r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>{const x=directResponse(200,'Content-Length: 12\r\nContent-Type: video/mp4',tinyMp4);o.onloadstart(x);o.onload(x)});return{abort(){if(o.onabort)o.onabort()}}};const p=r.X.downloadSelectedFile('https://video.twimg.com/tweet_video/a.mp4',s.file,null,c.signal);while(!releaseWrite)await new Promise(resolve=>setImmediate(resolve));c.abort();releaseWrite();await assert.rejects(p,/abgebrochen/);assert.equal(s.closed,0);assert.equal(s.aborted,1)});
test('H6 rejects deceptive or insecure image URLs',()=>{const r=runtime();assert.equal(r.X.isMediaUrl('https://evil.test/pbs.twimg.com/media/a.jpg'),false);assert.equal(r.X.isMediaUrl('http://pbs.twimg.com/media/a.jpg'),false)});
test('H6 accepts exact HTTPS media host and path',()=>{const r=runtime();assert.equal(r.X.isMediaUrl('https://pbs.twimg.com/media/a.jpg?format=jpg'),true);assert.ok(r.X.normalizeMediaUrl('https://pbs.twimg.com/card_img/a.jpg'))});
test('H7 retries obey shared parallel limit and clear invalidates queued work',async()=>{
 const r=runtime(),pending=[];r.X.setTweetFetch(()=>new Promise(resolve=>pending.push(resolve)));
 for(let i=0;i<4;i++)r.X.failPrefetch('r'+i,'network');for(const item of [...r.timers.values()])item.fn();
 assert.equal(r.X.active(),3);assert.equal(r.X.prefetchQueue.length,1);const generation=r.X.generation();r.X.clearMediaCache();assert.equal(r.X.generation(),generation+1);assert.equal(r.X.prefetchQueue.length,0)
});
test('H7 prunes expired cache and keeps a fresh entry',()=>{const r=runtime();for(let i=0;i<300;i++)r.X.mediaCache.set('old'+i,{items:[],fetchedAt:1});r.X.mediaCache.set('fresh',{items:[1],fetchedAt:Date.now()});assert.deepEqual(Array.from(r.X.getCachedItems('fresh')),[1]);assert.equal(r.X.mediaCache.size,1)});
test('H7 rejects oversized HLS responses and accepts bounded ones',async()=>{const r=runtime();r.X.CONFIG.maxHlsSegmentBytes=4;r.ctx.GM_xmlhttpRequest=o=>{queueMicrotask(()=>o.onload({status:200,responseHeaders:'Content-Length: 5',response:new Uint8Array(5).buffer}));return{abort(){}}};await assert.rejects(r.X.hlsFetch('https://video.twimg.com/x/a.ts','bytes'),/zu groß/);r.X.CONFIG.maxHlsSegmentBytes=5;assert.equal((await r.X.hlsFetch('https://video.twimg.com/x/a.ts','bytes')).length,5)});
test('H7 cache clear prevents an old prefetch result from refilling cache',async()=>{const r=runtime(),data=require('./fixtures/two-videos-2111770022419075168.json');let finish;r.X.setTweetFetch(()=>new Promise(resolve=>{finish=resolve}));const id=data.id_str;r.X.queuePrefetch(id,r.X.generation());assert.equal(r.X.active(),1);r.X.clearMediaCache();finish(data);await new Promise(resolve=>setImmediate(resolve));assert.equal(r.X.getCachedItems(id),null)});
test('Windows filenames remove reserved names, controls and trailing dots',()=>{const r=runtime();assert.equal(r.X.sanitizeFilenamePart('CON.txt'),'_CON.txt');assert.equal(r.X.sanitizeFilenamePart('bad\u0001name. '),'bad_name');assert.equal(r.X.sanitizeFilenamePart('normal-video_1.mp4'),'normal-video_1.mp4')});
test('stale broadcast performance playlist is ignored',()=>{const r=runtime();r.ctx.performance.getEntriesByType=()=>[{name:'https://video.pscp.tv/a.m3u8',responseEnd:1}];const video={paused:false,currentSrc:'',getAttribute:()=>null,closest:()=>tweet};const tweet={querySelectorAll:s=>s==='img, video'?[video]:s==='video'?[video]:[]};assert.deepEqual(Array.from(r.X.performanceHlsFromTweet(tweet)),[])});
test('fresh unique broadcast performance playlist is retained',()=>{const r=runtime();r.ctx.performance.getEntriesByType=()=>[{name:'https://video.pscp.tv/a.m3u8',responseEnd:99990}];const video={paused:false,currentSrc:'',getAttribute:()=>null,closest:()=>tweet};const tweet={querySelectorAll:s=>s==='img, video'?[video]:s==='video'?[video]:[]};r.ctx.document.querySelectorAll=()=>[video];const items=Array.from(r.X.performanceHlsFromTweet(tweet));assert.equal(items.length,1);assert.equal(items[0].ext,'ts')});
