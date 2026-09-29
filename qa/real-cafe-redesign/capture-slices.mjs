import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'chrome'}),results=[];
for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4188/');await page.evaluate(()=>document.fonts.ready);
 for(const [key,selector] of [['program','.program-section'],['cafe','.cafe-section'],['rental','.rental-section'],['news','.news-section'],['visit','.visit-section']]){await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).screenshot({path:`qa/real-cafe-redesign/after/slice2-${key}-${name}.png`});}
 await page.screenshot({path:`qa/real-cafe-redesign/after/home-${name}.png`,fullPage:true});results.push({name,...await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}))});await page.close();
}
await browser.close();writeFileSync('qa/real-cafe-redesign/slice2.json',JSON.stringify(results,null,2));console.log(results);
