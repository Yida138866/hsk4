import re,json
from pypinyin import pinyin, Style, load_phrases_dict
load_phrases_dict({'适应':[['shì'],['yìng']],'着凉':[['zháo'],['liáng']],'说着说着':[['shuō'],['zhe'],['shuō'],['zhe']],'好读书':[['hào'],['dú'],['shū']],
 '一分钱一分货':[['yì'],['fēn'],['qián'],['yì'],['fēn'],['huò']],'差点儿':[['chà'],['diǎn'],['r']],'打招呼':[['dǎ'],['zhāo'],['hu']],
 '还是':[['hái'],['shì']],'还有':[['hái'],['yǒu']],'还能':[['hái'],['néng']],'都是':[['dōu'],['shì']],'都要':[['dōu'],['yào']],'都有':[['dōu'],['yǒu']],
 '睡得':[['shuì'],['de']],'得好':[['de'],['hǎo']],'弹钢琴':[['tán'],['gāng'],['qín']],'弹得':[['tán'],['de']],'长大':[['zhǎng'],['dà']],'成长':[['chéng'],['zhǎng']],
 '为了':[['wèi'],['le']],'为我们':[['wèi'],['wǒ'],['men']],'行李':[['xíng'],['li']],'行李箱':[['xíng'],['li'],['xiāng']],'了解':[['liǎo'],['jiě']],'觉得':[['jué'],['de']],
 '睡觉':[['shuì'],['jiào']],'只听懂':[['zhǐ'],['tīng'],['dǒng']],'一会儿':[['yí'],['huìr'],],'看着':[['kàn'],['zhe']],'倒是':[['dào'],['shì']],
 '重视':[['zhòng'],['shì']],'太重了':[['tài'],['zhòng'],['le']],'便宜':[['pián'],['yi']],'方便':[['fāng'],['biàn']],'快乐':[['kuài'],['lè']],'音乐':[['yīn'],['yuè']],
 '记得':[['jì'],['de']],'得到':[['dé'],['dào']],'地图':[['dì'],['tú']],'各地':[['gè'],['dì']],'当地':[['dāng'],['dì']],'调查':[['diào'],['chá']],'空儿':[['kòng'],['r']],'有空儿':[['yǒu'],['kòng'],['r']],
 '少用':[['shǎo'],['yòng']],'教我':[['jiāo'],['wǒ']],'教大家':[['jiāo'],['dà'],['jiā']],'背':[['bèi']],'数字':[['shù'],['zì']],'得意':[['dé'],['yì']],'得到':[['dé'],['dào']],
 '要是':[['yào'],['shi']],'好主意':[['hǎo'],['zhǔ'],['yi']],'主意':[['zhǔ'],['yi']],'打扮':[['dǎ'],['ban']],'朋友':[['péng'],['you']],'东西':[['dōng'],['xi']],'什么':[['shén'],['me']],'怎么':[['zěn'],['me']],'这么':[['zhè'],['me']],'那么':[['nà'],['me']],
 '不长':[['bù'],['cháng']],'时间长了':[['shí'],['jiān'],['cháng'],['le']],'一起':[['yì'],['qǐ']],'周南':[['zhōu'],['nán']],'阿姨':[['ā'],['yí']],'踏实':[['tā'],['shi']],'痛快':[['tòng'],['kuai']],

 '短信':[['duǎn'],['xìn']],'聚会':[['jù'],['huì']],'适应':[['shì'],['yìng']],'差不多':[['chà'],['bu'],['duō']],'尽管':[['jǐn'],['guǎn']],'重新':[['chóng'],['xīn']],'友谊':[['yǒu'],['yì']],'无聊':[['wú'],['liáo']],'讨厌':[['tǎo'],['yàn']],'镜子':[['jìng'],['zi']],'应聘':[['yìng'],['pìn']],'招聘':[['zhāo'],['pìn']],'律师':[['lǜ'],['shī']],'材料':[['cái'],['liào']],'收入':[['shōu'],['rù']],'诚实':[['chéng'],['shí']],'准时':[['zhǔn'],['shí']],'调查':[['diào'],['chá']],'积累':[['jī'],['lěi']],'奖金':[['jiǎng'],['jīn']],'沙发':[['shā'],['fā']],'家具':[['jiā'],['jù']],'质量':[['zhì'],['liàng']],'打折':[['dǎ'],['zhé']],'葡萄':[['pú'],['tao']],'广告':[['guǎng'],['gào']],'现金':[['xiàn'],['jīn']],'顺便':[['shùn'],['biàn']],'实在':[['shí'],['zài']],'浪费':[['làng'],['fèi']],'年龄':[['nián'],['líng']],'尤其':[['yóu'],['qí']],'阮明':[['ruǎn'],['míng']],'陈晓':[['chén'],['xiǎo']],'周姐':[['zhōu'],['jiě']],'林主管':[['lín'],['zhǔ'],['guǎn']],'赵叔叔':[['zhào'],['shū'],['shu']],'吴姐':[['wú'],['jiě']],'台灯':[['tái'],['dēng']],
})
SP=set('，。！？：；、“”（）《》…—,.!?:;" 0123456789')
def py(s):
    r=pinyin(s,style=Style.TONE,heteronym=False,errors=lambda x:[''for _ in x])
    out=[]
    for ch,p in zip(s,r):
        out.append('' if (ch in SP or not '\u4e00'<=ch<='\u9fff') else p[0])
    return out
def fix(s,p):
    # 一 / 不 tone sandhi
    for i,ch in enumerate(s):
        nxt=p[i+1] if i+1<len(p) else ''
        tone4=bool(re.search('[àòèìùǜ]',nxt))
        if ch=='不' and p[i] in('bù','bú'): p[i]='bú' if tone4 else 'bù'
        if ch=='一' and p[i] in('yī','yí','yì'):
            prev=s[i-1] if i>0 else ''
            if prev in '第十' or not nxt or s[i+1] in SP or s[i+1] in '月': p[i]='yī'
            else: p[i]='yí' if tone4 else 'yì'
        if ch=='得' and s[i+1:i+2] not in ('到','意'): p[i]='de'
        if ch=='都' and (i==0 or s[i-1] not in '成首'): p[i]='dōu'
        if ch=='长' and i>0 and s[i-1] in '多很': p[i]='cháng'
        if ch=='儿' and i>0 and s[i-1] in '点哪那这玩会空块味' : p[i]='r'
        if s[i:i+2]=='一起': p[i],p[i+1]='yì','qǐ'
    return p
def parse(block):
    texts=[];cur=None
    for line in block.split('\n'):
        if line.startswith('# '):
            n,rest=line[2:].split(' ',1); zh,vi,en=[x.strip() for x in rest.split(' | ')]
            cur={'n':int(n),'zh':zh,'vi':vi,'en':en,'kw':[],'lines':[]}; texts.append(cur)
        elif line.startswith('@ '):
            cur['kw']=[w.strip() for w in line[2:].replace(',','，').split('，') if w.strip()]
        elif line.startswith('= '): cur['lines'][-1]['vi']=line[2:]
        elif line.startswith('~ '): cur['lines'][-1]['en']=line[2:]
        elif line.strip():
            m=re.match(r'^([^：]{1,4})：(.*)$',line)
            sp,t=(m.group(1),m.group(2)) if m else ('',line)
            cur['lines'].append({'s':sp,'sp':fix(sp,py(sp)) if sp else [],'t':t,'p':fix(t,py(t))})
    return texts
src=open('all.txt').read()
out=[]
for chunk in src.split('## ')[1:]:
    L,body=chunk.split('\n',1)
    out.append({'l':int(L),'texts':parse(body)})
json.dump(out,open('texts.json','w'),ensure_ascii=False)
for L in out:
  for t in L['texts']:
    for ln in t['lines']:
      assert len(ln['t'])==len(ln['p']) and 'vi' in ln and 'en' in ln
print('ok',sum(len(t['lines']) for L in out for t in L['texts']))
