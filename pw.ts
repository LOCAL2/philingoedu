import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://4263ec37-dbf5-4f49-9f32-029a2a590bef-00-lkz2fetr2su2.pike.replit.dev/schools', { waitUntil: 'networkidle' });

  const schools = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('h2')).filter(h2 => h2.innerText).map(h2 => h2.closest('div.group') || h2.closest('.rounded-3xl'));
    const results = [];
    for (const card of cards) {
      if (!card) continue;
      const h2 = card.querySelector('h2');
      const img = card.querySelector('img');
      if (h2 && img) {
        results.push({ name: h2.innerText, image: img.src });
      }
    }
    return results;
  });

  console.log(JSON.stringify(schools, null, 2));
  await browser.close();
}
run();
