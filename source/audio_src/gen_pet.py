import asyncio,os,edge_tts
L=[l.rstrip('\n').split('|') for l in open('/workspace/hsk4/repo/source/pet_src/lines.txt') if l.strip()]
os.makedirs('raw/pet',exist_ok=True);os.makedirs('out/pet',exist_ok=True)
async def one(i,t):
    p=f'pet/{i}.mp3'
    for a in range(4):
        try: await edge_tts.Communicate(t,'zh-CN-XiaoxiaoNeural',rate='-5%',pitch='+8Hz').save('raw/'+p); break
        except Exception: await asyncio.sleep(3)
    pr=await asyncio.create_subprocess_exec('ffmpeg','-y','-loglevel','error','-i','raw/'+p,'-af','silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15','-ac','1','-ar','24000','-b:a','32k','out/'+p); await pr.wait()
async def main(): await asyncio.gather(*[one(i,l[1]) for i,l in enumerate(L)])
asyncio.run(main()); print(len(L), len(os.listdir('out/pet')))
