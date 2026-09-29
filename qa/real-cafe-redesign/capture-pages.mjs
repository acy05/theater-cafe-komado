import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});
const routes=process.argv.slice(2);
for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 for(const route of routes){await page.goto(`http://127.0.0.1:4188/${route}.html`);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`qa/real-cafe-redesign/after/${route}-${name}.png`,fullPage:true});console.log(name,route,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})));}
 await page.close();
}
await browser.close();
