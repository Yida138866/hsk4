import json, re, random, unicodedata, itertools
from pypinyin import pinyin, Style
random.seed(42)
C = json.load(open('../../data/course_vi.json'))
T = json.load(open('../texts.json'))
W = []
for L in C['lessons']:
    for w in L['words']:
        W.append({**w, 'l': int(L['n'])})
POSK = lambda p: (p or '?').split('/')[0].split('.')[0]

def phrases(s):
    s = re.sub(r'\(.*?\)|（.*?）', '', s.lower())
    return [x.strip() for x in re.split(r'[,;，；/]| or ', s) if x.strip()]
def clash(a, b):
    A, B = phrases(a), phrases(b)
    if not A or not B: return a.strip().lower() == b.strip().lower()
    for x in A:
        for y in B:
            if x == y: return True
            if len(x) >= 4 and len(y) >= 4 and (x in y or y in x): return True
    return False

def pick_distractors(target, pool, key, n=3, extra_ok=lambda d: True):
    cands = [d for d in pool if d['h'] != target['h'] and extra_ok(d)]
    random.shuffle(cands)
    out = []
    for d in cands:
        if any(clash(key(d), key(o)) for o in out + [target]): continue
        if any(key(d) == key(o) for o in out): continue
        out.append(d)
        if len(out) == n: break
    return out

items = {'vi': [], 'en': []}
def add(lang, it): items[lang].append(it)
nid = itertools.count(1)
def wa(h): return ['w/' + h + '.mp3', h]

# ---- 1 meaning (看汉字选意思) and 2 hanzi (看意思选词) ----
for w in W:
    same = [d for d in W if d['l'] == w['l']]
    near = [d for d in W if abs(d['l'] - w['l']) <= 2]
    for lang, key in (('vi', lambda d: d['vi']), ('en', lambda d: d['m'])):
        pass
    i1 = next(nid); i2 = next(nid)
    # distractors must clash in neither language; same POS preferred
    def both(d, ref=w): return True
    pool = [d for d in near if POSK(d['pos']) == POSK(w['pos'])]
    if len(pool) < 8: pool = near
    ds = []
    cands = [d for d in pool if d['h'] != w['h']]
    random.shuffle(cands)
    for d in cands:
        if any(clash(d['vi'], o['vi']) or clash(d['m'], o['m']) for o in ds + [w]): continue
        ds.append(d)
        if len(ds) == 3: break
    if len(ds) < 3: continue
    for lang in ('vi', 'en'):
        mk = (lambda d: d['vi']) if lang == 'vi' else (lambda d: d['m'])
        ex_vi = f"{w['h']} ({w['p']}) = {w['vi']}" + (f" · Hán Việt: {w['hv']}" if w.get('hv') else '')
        ex_en = f"{w['h']} ({w['p']}) = {w['m']}"
        add(lang, {'id': f'm{i1}', 'l': w['l'], 'ty': 'meaning', 'stem': w['h'], 'opts': [mk(w)] + [mk(d) for d in ds], 'ex': ex_vi if lang == 'vi' else ex_en, 'au': wa(w['h'])})
        add(lang, {'id': f'h{i2}', 'l': w['l'], 'ty': 'hanzi', 'stem': mk(w), 'opts': [w['h']] + [d['h'] for d in ds], 'ex': ex_vi if lang == 'vi' else ex_en, 'au': wa(w['h'])})

# ---- 3 pinyin / tones ----
TONES = {'a': 'āáǎà', 'e': 'ēéěè', 'i': 'īíǐì', 'o': 'ōóǒò', 'u': 'ūúǔù', 'ü': 'ǖǘǚǜ'}
def base_tone(s):
    for v, ts in TONES.items():
        for k, c in enumerate(ts):
            if c in s: return s.replace(c, v), k + 1, v
    return s, 0, None
def with_tone(syl, t):
    b, _, _ = base_tone(syl)
    if t == 0: return b
    for v in ['a', 'e', 'ou']:
        if v in b:
            ch = v[0]; return b.replace(ch, TONES[ch][t - 1], 1)
    vs = [k for k, c in enumerate(b) if c in 'aeiouü']
    if not vs: return None
    k = vs[-1]; return b[:k] + TONES[b[k]][t - 1] + b[k + 1:]
def norm(p): return re.sub(r"[\s']", '', p).lower()
cnt_py = 0
for w in W:
    syl = [x[0] for x in pinyin(w['h'], style=Style.TONE)]
    if norm(''.join(syl)) != norm(w['p']):
        continue
    het = [set(x) for x in pinyin(w['h'], style=Style.TONE, heteronym=True)]
    correct = w['p']
    variants = set()
    for k, s in enumerate(syl):
        _, t, _ = base_tone(s)
        for nt in (1, 2, 3, 4):
            if nt == t: continue
            ns = with_tone(s, nt)
            if not ns or ns in het[k]: continue
            v = syl[:k] + [ns] + syl[k + 1:]
            variants.add(tuple(v))
    # two-syllable swaps too
    variants = list(variants); random.shuffle(variants)
    sep = ' ' if ' ' in w['p'] else ''
    opts = []
    for v in variants:
        s = sep.join(v)
        if norm(s) == norm(correct) or s in opts: continue
        opts.append(s)
        if len(opts) == 3: break
    if len(opts) < 3: continue
    i = next(nid); cnt_py += 1
    for lang in ('vi', 'en'):
        add(lang, {'id': f'p{i}', 'l': w['l'], 'ty': 'pinyin', 'stem': w['h'], 'opts': [correct] + opts,
                   'ex': (f"{w['h']} đọc là {correct} — {w['vi']}" if lang == 'vi' else f"{w['h']} is read {correct} — {w['m']}"), 'au': wa(w['h'])})

# ---- 4 fill in the blank from our own practice texts ----
lw = {}
for w in W: lw.setdefault(w['l'], []).append(w)
fills = 0
for L in T:
    l = L['l']; words = [w for w in lw[l] if len(w['h']) >= 2]
    allh = [w['h'] for w in W]
    used = set()
    for t in L['texts']:
        for li, ln in enumerate(t['lines']):
            sents = [s for s in re.findall(r'[^。！？]+[。！？]?', ln['t']) if len(s) >= 6]
            for s in sents:
                for w in words:
                    if w['h'] in used or w['h'] not in s: continue
                    pos = s.index(w['h'])
                    # don't cut inside a longer listed word
                    if any(len(o) > len(w['h']) and w['h'] in o and o in s for o in allh): continue
                    if s.count(w['h']) > 1: continue
                    dpool = [d for d in lw[l] if POSK(d['pos']) != POSK(w['pos']) and d['h'] not in s and len(d['h']) >= 2]
                    random.shuffle(dpool)
                    ds = []
                    for d in dpool:
                        if POSK(d['pos']) in [POSK(o['pos']) for o in ds] and len(set(POSK(x['pos']) for x in dpool)) > 3: continue
                        ds.append(d)
                        if len(ds) == 3: break
                    if len(ds) < 3: continue
                    stem = s[:pos] + '＿＿' + s[pos + len(w['h']):]
                    i = next(nid); used.add(w['h']); fills += 1
                    for lang in ('vi', 'en'):
                        add(lang, {'id': f'f{i}', 'l': l, 'ty': 'fill', 'stem': stem, 'opts': [w['h']] + [d['h'] for d in ds],
                                   'ex': (f"{s}　— {w['h']} ({w['p']}): {w['vi']}. Câu gốc: {ln['vi']}" if lang == 'vi' else f"{s}　— {w['h']} ({w['p']}): {w['m']}. Full line: {ln['en']}"),
                                   'au': [f"t/{l}_{t['n']}_{li}.mp3", ln['t']]})
                    break

# ---- 5 grammar (hand-written) ----
gram = 0
for line in open('grammar.txt'):
    if not line.strip() or line.startswith('#'): continue
    f = line.rstrip('\n').split('|'); l = int(f[0]); stem = f[1]; opts = f[2:6]; exv, exe = f[6], f[7]
    assert len(set(opts)) == 4, line
    choice = stem.startswith('!')
    full = opts[0] if choice else re.sub(r'＿+', opts[0], stem, count=1)
    if not choice: assert stem.count('＿') >= 1
    i = next(nid); gram += 1
    for lang in ('vi', 'en'):
        add(lang, {'id': f'g{i}', 'l': l, 'ty': 'grammar' if not choice else 'order', 'stem': ('选出正确的句子 · ' + ('Chọn câu đúng' if lang == 'vi' else 'Choose the correct sentence')) if choice else stem,
                   'opts': opts, 'ex': (exv if lang == 'vi' else exe) + f'　✓ {full}', 'au': [f'g/{i}.mp3', full]})

# ---- 6 reading: comprehension (hand-written) + sentence meaning (auto) ----
def findline(src):
    for L in T:
        for t in L['texts']:
            for li, ln in enumerate(t['lines']):
                if src.rstrip('。！？') in ln['t']: return L['l'], t, li, ln
    raise Exception(src)
rd = 0
for line in open('reading.txt'):
    if not line.strip() or line.startswith('#'): continue
    f = line.rstrip('\n').split('|'); l = int(f[0]); q = f[1]; opts = f[2:6]; src = f[6]
    assert len(set(opts)) == 4
    ll, t, li, ln = findline(src); assert ll == l, (l, ll)
    i = next(nid); rd += 1
    psg = ' '.join((x['s'] + '：' if x['s'] else '') + x['t'] for x in t['lines'])
    for lang in ('vi', 'en'):
        add(lang, {'id': f'r{i}', 'l': l, 'ty': 'reading', 'passage': psg, 'stem': q, 'opts': opts,
                   'ex': f"{src}　— " + (ln['vi'] if lang == 'vi' else ln['en']), 'au': [f"t/{l}_{t['n']}_{li}.mp3", ln['t']]})
tm = 0
for L in T:
    lines = [(t, li, ln) for t in L['texts'] for li, ln in enumerate(t['lines'])]
    for (t, li, ln) in lines:
        if len(ln['t']) > 60: continue
        others = [x for x in lines if x[2] is not ln]
        random.shuffle(others); ds = others[:3]
        i = next(nid); tm += 1
        for lang in ('vi', 'en'):
            k = 'vi' if lang == 'vi' else 'en'
            add(lang, {'id': f's{i}', 'l': L['l'], 'ty': 'reading', 'stem': ln['t'], 'q': 'meaning', 'opts': [ln[k]] + [d[2][k] for d in ds],
                       'ex': ln['t'] + '　— ' + ln[k], 'au': [f"t/{L['l']}_{t['n']}_{li}.mp3", ln['t']]})

for lang in ('vi', 'en'):
    for it in items[lang]:
        assert len(it['opts']) == 4 and len(set(it['opts'])) == 4, it
    json.dump(items[lang], open(f'../bank_{lang}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(items['vi']), Counter(i['ty'] for i in items['vi']), 'fills', fills, 'grammar', gram, 'reading-q', rd, 'trans', tm)
