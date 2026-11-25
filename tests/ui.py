import asyncio, subprocess, time, json, sys
from playwright.async_api import async_playwright
srv = subprocess.Popen(['python3','-m','http.server','8765','--directory','/home/claude/vane-house'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
URL='http://localhost:8765/'
async def main():
    errs=[]
    async with async_playwright() as p:
        try: b = await p.chromium.launch()
        except Exception: b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/home/claude/shots/1-title.png')
        # manifest + SW + cache
        man = await pg.evaluate("fetch('./manifest.json').then(r=>r.json())")
        print('manifest display:', man['display'], 'icons', len(man['icons']))
        await pg.evaluate("navigator.serviceWorker.ready.then(()=>1)")
        await pg.reload(); await pg.wait_for_timeout(800)
        print('SW controlled:', await pg.evaluate("!!navigator.serviceWorker.controller"))
        keys = await pg.evaluate("caches.keys()"); print('caches:', keys)
        n = await pg.evaluate("caches.open('vane-house-v2.1.0').then(c=>c.keys()).then(k=>k.length)"); print('cached entries:', n)
        # offline reload
        await ctx.set_offline(True); await pg.reload(); await pg.wait_for_timeout(600)
        print('offline title visible:', await pg.locator('h1').first.inner_text())
        imgs = await pg.evaluate("[...document.images].every(i=>i.complete&&i.naturalWidth>0)"); print('offline images ok:', imgs)
        # play
        await pg.click('[data-act=new-run]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/2-prologue.png')
        await pg.click('[data-act=begin-first-day]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/3-tea.png', full_page=True)
        await pg.click('[data-act=choose][data-key=e2]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/4-result.png')
        await pg.click('[data-act=continue]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/5-hub.png', full_page=True)
        # attend first available sibling then choose quiet
        await pg.locator('[data-act=attend]').first.click(); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/6-scene.png', full_page=True)
        await pg.locator('[data-act=choose]').nth(3).click(); await pg.wait_for_timeout(200)
        await pg.click('[data-act=continue]'); await pg.wait_for_timeout(200)
        # ledger (may be on a transition screen first)
        while not await pg.locator('[data-act=ledger]').count(): await pg.locator('[data-act=continue]').first.click(); await pg.wait_for_timeout(150)
        await pg.click('[data-act=ledger]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/home/claude/shots/7-ledger.png')
        await pg.click('[data-act=close-modal]')
        # reload mid-run -> continue persists
        await pg.reload(); await pg.wait_for_timeout(500)
        cont = await pg.locator('[data-act=continue-run]').count(); print('continue button after reload:', cont)
        await pg.click('[data-act=continue-run]'); await pg.wait_for_timeout(200)
        # autoplay to the end via UI with a simple loop
        steps=0
        while steps<600:
            steps+=1
            if await pg.locator('.ending').count(): break
            c = await pg.locator('[data-act=choose]').count()
            if await pg.locator('[data-act=rit-skip]').count():
                await pg.locator('[data-act=rit-skip]').click()
            elif c:
                await pg.locator('[data-act=choose]').nth(min(3, c-1)).click()
            elif await pg.locator('[data-act=rit-skip]').count():
                await pg.locator('[data-act=rit-skip]').click()
            elif await pg.locator('[data-act=continue]').count():
                await pg.locator('[data-act=continue]').click()
            elif await pg.locator('[data-act=attend-opp]:not([disabled])').count():
                await pg.locator('[data-act=attend-opp]:not([disabled])').first.click()
            elif await pg.locator('[data-act=attend]:not([disabled])').count():
                await pg.locator('[data-act=attend]:not([disabled])').first.click()
            else:
                await pg.click('[data-act=pass]')
        print('reached ending via UI in', steps, 'steps:', await pg.locator('.ending h2').inner_text())
        await pg.screenshot(path='/home/claude/shots/8-ending.png', full_page=True)
        meta = await pg.evaluate("window.__vane.meta"); print('achievements persisted:', len(meta['achievements']), 'endings', meta['endings'])
        await b.close()
    print('console errors:', errs or 'none')
try:
    asyncio.run(main())
finally:
    srv.terminate()
