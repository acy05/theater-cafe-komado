import {chromium} from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('qa/real-cafe-redesign/states',{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 async function shot(key){await page.screenshot({path:`qa/real-cafe-redesign/states/${key}-${name}.png`});results.push({name,key,...await page.evaluate(()=>{const d=document.querySelector('dialog[open]'),close=document.querySelector('.dialog-close')?.getBoundingClientRect();return{width:innerWidth,scroll:document.documentElement.scrollWidth,dialogOverflow:d?d.scrollWidth>d.clientWidth:false,closeVisible:d?close.top>=0&&close.bottom<=innerHeight:null};})});}
 await page.goto('http://127.0.0.1:4188/index.html');await page.evaluate(()=>document.fonts.ready);
 if(name!=='desktop'){await page.locator('.menu-toggle').click();await shot('menu');await page.getByRole('link',{name:'喫茶のこと'}).click();await page.locator('#cafe').waitFor();await shot('cafe-anchor');}
 await page.goto('http://127.0.0.1:4188/events.html');await page.locator('[data-event="jazz"]').click();await page.locator('[name="count"]').selectOption('3');await shot('event-details');await page.locator('#event-form button').click();await shot('event-confirm');await page.locator('#back-booking').click();results.push({name,key:'back-retains-count',count:await page.locator('[name="count"]').inputValue()});await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4188/space.html');await page.locator('[data-date="2026-11-28"]').click();await page.locator('.calendar-panel').screenshot({path:`qa/real-cafe-redesign/states/calendar-${name}.png`});await page.locator('.slot').first().click();await shot('rental-confirm');await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4188/contact.html');await page.locator('[name="type"]').selectOption('その他');await page.locator('[name="name"]').fill('動作確認用');await page.locator('[name="email"]').fill('test@example.com');await page.locator('[name="message"]').fill('上映会についての相談です。予定人数は10名です。');await page.locator('input[type=checkbox]').check();await page.locator('#contact-form button[type=submit]').click();await shot('contact-confirm');await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4188/journal.html?article=opening');await shot('article');await page.keyboard.press('Escape');await page.locator('#open-editor').click();await page.locator('#editor').screenshot({path:`qa/real-cafe-redesign/states/editor-${name}.png`});
 await page.close();
}
await browser.close();writeFileSync('qa/real-cafe-redesign/states.json',JSON.stringify(results,null,2));console.log(results);
