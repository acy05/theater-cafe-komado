import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('qa/real-cafe-redesign/motion',{recursive:true});
test('rendered text fits each viewport and grouped phrases remain intact',async({page})=>{
 for(const route of ['index','events','space','journal','contact']){
  await page.goto(`/${route}.html`);await page.evaluate(()=>document.fonts.ready);
  const issues=await page.evaluate(()=>{
   const result=[];for(const el of document.querySelectorAll('h1,h2,h3,p,.journal-title,.button,.filter,.keep-phrase')){
    const box=el.getBoundingClientRect(),s=getComputedStyle(el);if(!box.width||el.closest('dialog:not([open])'))continue;
    if(box.x<-.5||box.right>innerWidth+.5)result.push({text:el.textContent,reason:'viewport'});
    if(el.clientWidth&&el.scrollWidth>el.clientWidth+2&&s.overflowX==='visible')result.push({text:el.textContent,reason:'internal'});
   }return result;
  });expect(issues).toEqual([]);
 }
});
test('entrance frames, hover and reduced motion render correctly',async({page},info)=>{
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 for(const time of [50,280,1100]){
  await page.evaluate(t=>{for(const a of document.getAnimations()){a.pause();a.currentTime=t;}},time);
  const fits=await page.evaluate(()=>{const h=document.querySelector('.hero').getBoundingClientRect(),c=document.querySelector('.hero-content').getBoundingClientRect();return c.left>=h.left&&c.right<=h.right&&c.top>=h.top&&c.bottom<=h.bottom&&document.documentElement.scrollWidth<=innerWidth;});expect(fits).toBe(true);
  await page.screenshot({path:`qa/real-cafe-redesign/motion/${info.project.name}-entrance-${time}.png`,animations:'allow'});
 }
 await page.evaluate(()=>document.getAnimations().forEach(a=>a.finish()));
 if(info.project.name==='desktop'){
  const btn=page.locator('.hero .button'),before=await btn.boundingBox();await btn.hover();await expect(btn).toHaveCSS('transform','none');
  await expect(btn.locator('span')).toHaveCSS('transform','matrix(1, 0, 0, 1, 3, 0)');expect((await btn.boundingBox()).y).toBe(before.y);
  await page.screenshot({path:'qa/real-cafe-redesign/motion/desktop-hover.png'});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.evaluate(()=>document.fonts.ready);
 expect(await page.locator('.hero-image').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
 await page.goto('/events.html');await page.locator('[data-event="moon"]').click();
 expect(await page.locator('#dialog-content').evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/body-lock/);
});
test('state transitions support rapid repetition and calendar bounds',async({page},info)=>{
 await page.goto('/');
 if(info.project.name!=='desktop'){
  for(let i=0;i<3;i++){await page.locator('.menu-toggle').click();await expect(page.locator('#navigation')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#navigation')).not.toBeVisible();}
 }
 await page.goto('/events.html');
 for(let i=0;i<3;i++){await page.locator('[data-event="moon"]').click();await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('body')).not.toHaveClass(/body-lock/);}
 await page.goto('/space.html');
 for(let i=0;i<12;i++)await page.locator('[data-month="1"]').click();
 await expect(page.locator('#calendar-month')).toHaveText('2027年 11月');await expect(page.locator('[data-month="1"]')).toBeDisabled();
 for(let i=0;i<12;i++)await page.locator('[data-month="-1"]').click();
 await expect(page.locator('#calendar-month')).toHaveText('2026年 11月');await expect(page.locator('[data-month="-1"]')).toBeDisabled();
 await page.locator('[data-date="2026-11-28"]').click();await expect(page.locator('[data-date="2026-11-28"]')).toBeFocused();
 await page.locator('[name="purpose"]').selectOption('その他');await page.locator('[name="guests"]').selectOption('5');await page.locator('[name="details"]').fill('操作確認用の利用相談です。');
 const button=page.getByRole('button',{name:'選択内容を確認する'});await button.click();await expect(page.locator('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await expect(button).toBeFocused();
});
test('keyboard skip link is focusable, visible on focus and reaches the content',async({page},info)=>{
 await page.goto('/');await page.keyboard.press('Tab');const skip=page.locator('.skip');await expect(skip).toBeFocused();
 await expect(skip).toHaveCSS('clip-path','none');const box=await skip.boundingBox();expect(box.y).toBeGreaterThanOrEqual(7);expect(box.x).toBeGreaterThanOrEqual(0);
 await page.screenshot({path:`qa/real-cafe-redesign/motion/${info.project.name}-keyboard-skip.png`});
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/#main$/);
});
