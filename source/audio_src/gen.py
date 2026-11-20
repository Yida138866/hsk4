import asyncio,re,json,os,subprocess,edge_tts
s=open('/workspace/hsk4/repo/source/src/vi.tsx').read()
words=[]
for l in re.search(r'const WRAW = `(.*?)`',s,re.S).group(1).strip().split('\n'):
    w=l.split('|')[0]
    if w not in words: words.append(w)
T=json.load(open('/workspace/hsk4/repo/source/texts.json'))
jobs=[(w,f'w/{w}.mp3') for w in words]
for L in T:
    for t in L['texts']:
        for i,ln in enumerate(t['lines']):
            jobs.append((ln['t'],f"t/{L['l']}_{t['n']}_{i}.mp3"))
os.makedirs('raw/w',exist_ok=True);os.makedirs('raw/t',exist_ok=True);os.makedirs('out/w',exist_ok=True);os.makedirs('out/t',exist_ok=True)
sem=asyncio.Semaphore(6)
async def one(text,path):
    if os.path.exists('out/'+path): return
    async with sem:
        for a in range(4):
            try:
                await edge_tts.Communicate(text,'zh-CN-XiaoxiaoNeural',rate='-10%' if path.startswith('t/') else '-5%').save('raw/'+path); break
            except Exception as e:
                await asyncio.sleep(2+a*3)
        p=await asyncio.create_subprocess_exec('ffmpeg','-y','-loglevel','error','-i','raw/'+path,'-af','silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15','-ac','1','-ar','24000','-b:a','32k','out/'+path)
        await p.wait()
async def main(): await asyncio.gather(*[one(t,p) for t,p in jobs])
asyncio.run(main())
miss=[p for _,p in jobs if not os.path.exists('out/'+p)]
print(len(jobs),'missing',len(miss),miss[:5])
