import asyncio,json,os,edge_tts
b=json.load(open('/workspace/hsk4/repo/source/bank_vi.json'))
jobs={i['au'][0]:i['au'][1] for i in b if i['au'][0].startswith('g/')}
os.makedirs('raw/g',exist_ok=True);os.makedirs('out/g',exist_ok=True)
sem=asyncio.Semaphore(6)
async def one(p,t):
    if os.path.exists('out/'+p): return
    async with sem:
        for a in range(4):
            try: await edge_tts.Communicate(t,'zh-CN-XiaoxiaoNeural',rate='-10%').save('raw/'+p); break
            except Exception: await asyncio.sleep(3)
        pr=await asyncio.create_subprocess_exec('ffmpeg','-y','-loglevel','error','-i','raw/'+p,'-af','silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15','-ac','1','-ar','24000','-b:a','32k','out/'+p)
        await pr.wait()
async def main(): await asyncio.gather(*[one(p,t) for p,t in jobs.items()])
asyncio.run(main())
print(len(jobs),sum(os.path.exists('out/'+p) for p in jobs))
