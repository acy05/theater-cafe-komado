import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
mkdirSync('qa/real-cafe-redesign/test-screenshots',{recursive:true});
test('five pages render without runtime errors, missing images or horizontal overflow',async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['index','events','space','journal','contact']){
  const response=await page.goto(`/${route}.html`);expect(response.status()).toBe(200);
  await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
  await page.screenshot({path:`qa/real-cafe-redesign/test-screenshots/${route}-${info.project.name}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});
test('event filters, price calculation, confirmation, completion and Escape',async({page})=>{
 await page.goto('/events.html');await expect(page.locator('.event-card')).toHaveCount(3);
 await page.locator('[data-filter="music"]').click();await expect(page.locator('.event-card')).toHaveCount(1);
 await page.locator('[data-event="jazz"]').click();await page.locator('[name="count"]').selectOption('3');
 await expect(page.locator('#booking-total')).toContainText('8,400');
 await page.getByRole('button',{name:'予約内容を確認'}).click();await expect(page.locator('dialog')).toContainText('3名');
 await page.locator('#back-booking').click();await expect(page.locator('[name="count"]')).toHaveValue('3');await expect(page.locator('#booking-total')).toContainText('8,400');await page.getByRole('button',{name:'予約内容を確認'}).click();
 await page.locator('#finish-demo').click();await expect(page.locator('dialog')).toContainText('実際の予約は作成されていません');
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
 await expect(page.locator('[data-event="jazz"]')).toBeFocused();
});
test('rental dates, unavailable days, month navigation and inquiry handoff',async({page})=>{
 await page.goto('/space.html');await expect(page.locator('[data-month="-1"]')).toBeDisabled();
 await expect(page.locator('[data-date="2026-11-01"]')).toBeDisabled();
 await page.locator('[data-date="2026-11-28"]').click();await expect(page.locator('.slot')).toHaveCount(3);
 await page.locator('.slot').first().click();await page.getByRole('link',{name:'利用内容の相談へ'}).click();
 await expect(page.locator('[name="type"]')).toHaveValue('スペースレンタルについて');
 await expect(page.locator('[name="message"]')).toHaveValue(/2026-11-28/);
 await expect(page.locator('[name="message"]')).toHaveValue(/10:00 – 13:00/);
 await page.goto('/space.html');await page.locator('[data-month="1"]').click();await expect(page.locator('#calendar-month')).toHaveText('2026年 12月');
 await expect(page.locator('[data-date="2026-12-01"]')).toBeDisabled();
 await page.locator('[data-date="2026-12-03"]').click();await expect(page.locator('.slot')).toHaveCount(1);
});
test('contact validation, escaped content, correction and no submission',async({page})=>{
 const mutations=[];page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method()))mutations.push(r.url());});
 await page.goto('/contact.html');await page.locator('#contact-form button[type="submit"]').click();await expect(page.locator('dialog')).not.toBeVisible();
 await page.locator('[name="type"]').selectOption('その他');await page.locator('[name="name"]').fill('テスト利用者');
 await page.locator('[name="email"]').fill('test@example.com');await page.locator('[name="message"]').fill('<img src=x onerror=alert(1)> テスト相談');
 await page.locator('input[type="checkbox"]').check();await page.locator('#contact-form button[type="submit"]').click();
 await expect(page.locator('.article-body')).toContainText('<img src=x');await expect(page.locator('dialog img')).toHaveCount(0);
 await page.locator('#contact-back').click();await expect(page.locator('[name="name"]')).toHaveValue('テスト利用者');
 await page.locator('#contact-form button[type="submit"]').click();await page.locator('#contact-done').click();
 await expect(page.locator('dialog')).toContainText('内容は送信・保存されていません');expect(mutations).toEqual([]);
});
test('journal add/edit persistence, safe text and JSON export',async({page})=>{
 await page.goto('/journal.html');await page.locator('#open-editor').click();
 await page.locator('[name="title"]').fill('新しい上映のお知らせ');await page.locator('[name="body"]').fill('<script>alert(1)</script>本文');
 await page.locator('#editor-form button[type="submit"]').click();await expect(page.locator('#editor-status')).toContainText('保存しました');
 await page.reload();await page.getByRole('button',{name:/新しい上映のお知らせ/}).click();
 await expect(page.locator('.article-body')).toHaveText('<script>alert(1)</script>本文');await expect(page.locator('dialog script')).toHaveCount(0);await page.keyboard.press('Escape');
 await page.locator('#open-editor').click();const id=await page.locator('#edit-id option').last().getAttribute('value');await page.locator('#edit-id').selectOption(id);
 await page.locator('[name="title"]').fill('上映のお知らせ 更新版');await page.locator('#editor-form button[type="submit"]').click();
 await expect(page.getByRole('button',{name:/上映のお知らせ 更新版/})).toBeVisible();
 const download=page.waitForEvent('download');await page.locator('#export-content').click();expect((await download).suggestedFilename()).toBe('komado-articles.json');
});
test('mobile navigation and linked article',async({page},info)=>{
 await page.goto('/index.html');if(info.project.name!=='desktop'){await page.getByRole('button',{name:'メニューを開く'}).click();await page.locator('#navigation').getByRole('link',{name:'喫茶のこと'}).click();await expect(page).toHaveURL(/#cafe$/);await expect(page.locator('#navigation')).not.toBeVisible();await page.evaluate(()=>scrollTo(0,0));}
 if(info.project.name==='mobile'){await page.getByRole('button',{name:'メニューを開く'}).click();await expect(page.locator('#navigation')).toBeVisible();await page.locator('#navigation').getByRole('link',{name:'場所を借りる'}).click();await expect(page).toHaveURL(/space.html/);}
 await page.goto('/journal.html?article=opening');await expect(page.locator('dialog')).toBeVisible();await expect(page.locator('#dialog-title')).toContainText('オープン');
});
