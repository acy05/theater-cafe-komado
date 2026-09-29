import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const [slice='hero',stage='baseline']=process.argv.slice(2);
const dir=`qa/visual-review/${stage}`;mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const sizes={desktop:{width:1440,height:1000},tablet:{width:820,height:1180},mobile:{width:390,height:844}};
const scenarios={
 hero:[['index.html','.site-header','header'],['index.html','.hero','hero']],
 program:[['index.html','.home-events','home-program'],['events.html','.page-heading','program-heading'],['events.html','.events-grid','program'],['events.html','dialog','event-dialog',async p=>p.locator('[data-event="moon"]').click()]],
 story:[['index.html','.about-section','about'],['index.html','.space-preview','rental-preview'],['index.html','.journal-section','home-journal'],['index.html','.closing','closing'],['index.html','footer','footer']],
 rental:[['space.html','.page-heading','space-heading'],['space.html','.space-specs','space-specs'],['space.html','.rental-layout','calendar'],['space.html','.steps','rental-steps'],['space.html','dialog','rental-dialog',async p=>{await p.locator('[data-date="2026-11-28"]').click();await p.locator('.slot').first().click();}]],
 content:[['journal.html','main','journal'],['journal.html','#editor','editor',async p=>p.locator('#open-editor').click()],['contact.html','main','contact'],['contact.html','dialog','privacy',async p=>p.locator('footer [data-privacy]').click()]]
};
const results=[];
for(const [device,viewport] of Object.entries(sizes)){
 const context=await browser.newContext({viewport,isMobile:device==='mobile',hasTouch:device!=='desktop',reducedMotion:'reduce'});
 const page=await context.newPage();let lastUrl='';const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [url,selector,name,action] of scenarios[slice]){
  if(url!==lastUrl||action||await page.locator('dialog[open]').count()){await page.goto(`http://127.0.0.1:4188/${url}`);await page.evaluate(()=>document.fonts.ready);}lastUrl=url;if(action)await action(page);
  const target=page.locator(selector);await target.scrollIntoViewIfNeeded();
  await target.screenshot({path:`${dir}/${device}-${name}.png`});
  const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,overflow:[...document.querySelectorAll('main *,header *,footer *,dialog *')].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return r.width>0&&s.position!=='absolute'&&s.position!=='fixed'&&s.overflowX==='visible'&&el.scrollWidth>el.clientWidth+2&&el.clientWidth>0;}).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,55),client:el.clientWidth,scroll:el.scrollWidth})).slice(0,20)}));
  results.push({device,name,...geometry,errors:[...errors]});
 }
 await context.close();
}
await browser.close();writeFileSync(`${dir}/${slice}-geometry.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results));
