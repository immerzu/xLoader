'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../xLoader.user.js'),'utf8');
const ctx={URL,extFromUrl:()=> 'jpg',hlsUrl:url=>/\.m3u8(?:\?|$)/i.test(url),allowedImageUrl:url=>/^https:\/\/pbs\.twimg\.com\/(?:media|card_img|amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\//.test(url)};
vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('function allowedImageUrl('),src.indexOf('function responseHeader('))+src.slice(src.indexOf('function isProgressiveVideoUrl('),src.indexOf('function isMediaUrl('))+src.slice(src.indexOf('function collectTweetObjects('),src.indexOf('function fetchLiveBearerToken(')),ctx);
ctx.isMediaUrl=url=>ctx.isProgressiveVideoUrl(url);
const base='https://video.twimg.com/amplify_video/2112656490213281793/';
for(const suffix of ['vid/avc1/0/0/1280x720/init.mp4','vid/avc1/0/3000/1280x720/part.m4s','pl/master.m3u8','pl/master.mpd','aud/mp4a/0/0/128000/init.mp4']){
 test('reject adaptive resource '+suffix,()=>assert.equal(ctx.isProgressiveVideoUrl(base+suffix),false));
}
test('progressive modern, legacy and GIF URLs remain valid',()=>{
 for(const url of [base+'vid/avc1/1920x1080/full.mp4?tag=29','https://video.twimg.com/ext_tw_video/123/pu/vid/640x360/full.mp4','https://video.twimg.com/tweet_video/gif.mp4'])assert.equal(ctx.isProgressiveVideoUrl(url),true);
 assert.equal(ctx.isProgressiveVideoUrl('https://video.twimg.com.evil.test/vid/1280x720/full.mp4'),false);
});
const data=require('./fixtures/realamvoice-2112667113039011886.json');
test('real reference API selects full 1080p MP4',()=>{
 const items=ctx.parseApiData(data,data.id_str).media;
 assert.equal(items.length,1);assert.match(items[0].url,/\/vid\/avc1\/1920x1080\/[^/]+\.mp4/);
});
test('rendered props are restricted to the exact tweet',()=>{
 const el={'__reactFiber$test':{memoizedProps:{tweet:data},return:null}};
 assert.equal(ctx.renderedTweetMedia(el,data.id_str).length,1);
 assert.equal(ctx.renderedTweetMedia(el,'another-tweet').length,0);
 assert.equal(ctx.renderedTweetMedia({},data.id_str).length,0);
});
test('nested legacy props and bounded cyclic fibers are safe',()=>{
 const fiber={memoizedProps:{tweet:{rest_id:data.id_str,legacy:data}}};fiber.return=fiber;
 assert.equal(ctx.renderedTweetMedia({'__reactFiber$test':fiber},data.id_str).length,1);
 assert.equal(ctx.renderedTweetMedia({'__reactFiber$test':fiber},'missing').length,0);
});
test('API-labelled init segment is still excluded',()=>{
 const invalid={extended_entities:{media:[{type:'video',video_info:{variants:[{content_type:'video/mp4',bitrate:999999,url:base+'vid/avc1/0/0/1280x720/init.mp4'}]}}]}};
 assert.equal(ctx.apiMediaFromTweet(invalid).length,0);
});
test('quoted syndication tweet selects its highest-bitrate progressive MP4 instead of the poster',()=>{
 const quotedId='2113332367637012898';
 const fixture={id_str:'2113396033896268085',text:'outer tweet',quoted_tweet:{
  id_str:quotedId,text:'quoted video',entities:{media:[{url:'https://t.co/example'}]},mediaDetails:[{type:'video',
   media_url_https:'https://pbs.twimg.com/amplify_video_thumb/2113159347912237056/img/poster.jpg',
   video_info:{variants:[
    {content_type:'application/x-mpegURL',url:'https://video.twimg.com/amplify_video/2113159347912237056/pl/master.m3u8'},
    {content_type:'video/mp4',bitrate:256000,url:'https://video.twimg.com/amplify_video/2113159347912237056/vid/avc1/480x270/low.mp4'},
    {content_type:'video/mp4',bitrate:2176000,url:'https://video.twimg.com/amplify_video/2113159347912237056/vid/avc1/1280x718/high.mp4'}
   ]}}]
 }};
 const items=ctx.parseApiData(fixture,fixture.id_str).media;
 assert.equal(items.length,1);
 assert.match(items[0].url,/\/1280x718\/high\.mp4$/);
 assert.equal(items[0].ext,'mp4');
});
test('video posters are recognized but never accepted as downloadable photos',()=>{
 const poster='https://pbs.twimg.com/amplify_video_thumb/2113159347912237056/img/poster.jpg';
 assert.equal(ctx.isVideoPosterUrl(poster),true);
 assert.equal(ctx.downloadableImageUrl(poster),false);
 assert.equal(ctx.apiMediaFromTweet({extended_entities:{media:[{type:'photo',media_url_https:poster}]}}).length,0);
});
test('unresolved amplify poster is omitted by the DOM merge',async()=>{
 const poster='https://pbs.twimg.com/amplify_video_thumb/2113159347912237056/img/poster.jpg';
 Object.assign(ctx,{
  ensureNotCancelled(){},performanceHlsFromTweet(){return[]},renderedTweetMedia(){return[]},
  getTweetId(){return'2113396033896268085'},extractDomMedia(){return[poster]},
  mediaIdOf(){return'2113159347912237056'},normBase:url=>url,
  resolvePosterVideoUrls:async()=>({}),extFromUrl:()=> 'jpg'
 });
 vm.runInContext(src.slice(src.indexOf('async function mergeDomItems('),src.indexOf('/**\n     * Live-Fallback für den Klick')),ctx);
 const items=await ctx.mergeDomItems({},[],null);
 assert.equal(items.length,0);
});
test('GM_download rejects init segment before transport',async()=>{
 ctx.GM_download=()=>{throw Error('transport must not start')};
 vm.runInContext(src.slice(src.indexOf('function downloadUrl('),src.indexOf('// ============================ Menü & Konfiguration')),ctx);
 await assert.rejects(ctx.downloadUrl(base+'vid/avc1/0/0/1280x720/init.mp4','bad.mp4',false),/unzulässige direkte Medienadresse/);
});
test('streaming rejects init segment before opening or requesting data',async()=>{
 ctx.GM_xmlhttpRequest=()=>{throw Error('transport must not start')};
 vm.runInContext(src.slice(src.indexOf('async function selectDownloadFile('),src.indexOf('function downloadUrl(')),ctx);
 await assert.rejects(ctx.downloadSelectedFile(base+'vid/avc1/0/0/1280x720/init.mp4',{createWritable(){throw Error('file must not open')}}),/unzulässige direkte Medienadresse/);
});
