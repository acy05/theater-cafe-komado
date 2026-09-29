import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage({reducedMotion:'reduce'});const results=[];
for(const width of [320,375,390,768,820,980,1024,1280,1440]){
 await page.setViewportSize({width,height:1000});
 for(const route of ['index','events','space','journal','contact']){
  await page.goto(`http://127.0.0.1:4188/${route}.html`);await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(()=>{
   const widows=[];for(const el of document.querySelectorAll('h1,h2,h3,p,.journal-title')){
    if(el.closest('dialog:not([open])')||!el.getBoundingClientRect().width)continue;
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),lines=new Map();let node;
    while(node=walker.nextNode()){for(let i=0;i<node.textContent.length;i++){const char=node.textContent[i];if(!char.trim())continue;const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);const box=r.getBoundingClientRect();if(!box.width||!box.height)continue;const y=Math.round(box.y/3)*3;lines.set(y,(lines.get(y)||'')+char);}}
    if(lines.size>1){const strings=[...lines.entries()].sort((a,b)=>a[0]-b[0]).map(e=>e[1]);const last=strings.at(-1);if(last.length<=2)widows.push({selector:el.tagName+'.'+el.className,text:el.textContent,lines:strings});}
   }
   const overflow=[...document.querySelectorAll('main *,header *,footer *')].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return r.width>0&&s.position!=='absolute'&&s.overflowX==='visible'&&el.clientWidth>0&&el.scrollWidth>el.clientWidth+2;}).map(el=>({selector:el.tagName+'.'+el.className,text:el.textContent.slice(0,70),width:el.clientWidth,scroll:el.scrollWidth}));
   return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,widows,overflow};
  });results.push({route,...result});
 }
}
await browser.close();writeFileSync('qa/real-cafe-redesign/layout-audit.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.filter(r=>r.widows.length||r.overflow.length||r.scrollWidth>r.width),null,2));
