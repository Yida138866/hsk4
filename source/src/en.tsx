import { Page, Section, Text, Segmented, Select, Button, Callout, Table, Properties, LinkCards, Rows, useState, useMemo, useEffect, useGrokTheme } from "grok/canvas";
import { Reader } from "./reader";
import { SpeakBtn, wordAudio } from "./audio";
import { RandomTest } from "./rtest";
import { PET_ON, PetTab, petEvent, quizWrong } from "./pet";

type Word = { h: string; p: string; pos: string; m: string; l: number };
type Q = { id: string; sec: "listen" | "read" | "write"; kind: string; passage?: string; stem: string; opts: string[]; a: number };
type OrdQ = { id: string; tiles: string[]; answers: string[] };

const WRAW = `爱情|àiqíng|n.|love (between a man and a woman)|1
安排|ānpái|v.|to arrange|3
按时|ànshí|adv.|on time, on schedule|4
按照|ànzhào|prep.|according to|4
百分之|bǎi fēn zhī||percent|6
保证|bǎozhèng|v.|to guarantee|4
倍|bèi|m.|times, -fold|6
本来|běnlái|adv.|originally, at first|3
比如|bǐrú|v.|for example, such as|10
毕业|bì yè|v.|to graduate|2
标准|biāozhǔn|n.|standard|5
饼干|bǐnggān|n.|biscuit|9
不得不|bù dé bù||to have to, to have no choice but|4
不管|bùguǎn|conj.|no matter (what, how, etc.)|3
不过|búguò|conj.|but, yet|10
不仅|bùjǐn|conj.|not only|1
擦|cā|v.|to wipe|7
材料|cáiliào|n.|data, material|3
差不多|chàbuduō|adv.|almost|2
尝|cháng|v.|to taste|6
超过|chāoguò|v.|to exceed, to surpass|7
成功|chénggōng|adj.|successful|4
成为|chéngwéi|v.|to become|8
诚实|chéngshí|adj.|honest|3
重新|chóngxīn|adv.|again, once more|2
抽烟|chōu yān||to smoke|7
出现|chūxiàn|v.|to appear, to emerge|7
窗户|chuānghu|n.|window|7
从来|cónglái|adv.|always, all along|1
答案|dá'àn|n.|answer, key|10
打扰|dǎrǎo|v.|to disturb, to bother|6
打折|dǎ zhé|v.|to give a discount|5
大使馆|dàshǐguǎn|n.|embassy|8
大夫|dàifu|n.|doctor|7
当|dāng|prep.|when, just at (a time or place)|2
当时|dāngshí|n.|then, at that time|9
到处|dàochù|adv.|everywhere|8
得|děi|mod.|must, have to|9
等|děng|part.|etc., and so on|10
低|dī|adj.|low|10
调查|diàochá|v.|to survey, to investigate|4
掉|diào|v.|used after certain verbs, indicating the result of an action|7
动作|dòngzuò|n.|action, movement|7
堵车|dǔ chē|v.|traffic jam|8
肚子|dùzi|n.|belly, stomach|7
短信|duǎnxìn|n.|text message|2
而|ér|conj.|(showing a contrast) while, yet|2
发生|fāshēng|v.|to happen, to take place|8
发展|fāzhǎn|v.|to develop, to promote|10
法律|fǎlǜ|n.|law|1
翻译|fānyì|n.|translator, interpreter|10
烦恼|fánnǎo|adj.|worried, vexed|7
反对|fǎnduì|v.|to oppose, to object to|7
方法|fāngfǎ|n.|method, way|4
方面|fāngmiàn|n.|aspect|6
方向|fāngxiàng|n.|direction, orientation|10
放弃|fàngqì|v.|to give up|9
放松|fàngsōng|v.|to relax|8
份|fèn|m.|used for jobs among other things|4
丰富|fēngfù|v.|to enrich|2
符合|fúhé|v.|to accord with|3
负责|fùzé|v.|to be in charge of|3
富|fù|adj.|rich, wealthy|10
改变|gǎibiàn|v.|to change|3
感动|gǎndòng|v.|to touch, to move|1
感觉|gǎnjué|n.|feeling|3
感情|gǎnqíng|n.|affection, love|7
感谢|gǎnxiè|v.|to thank|4
刚|gāng|adv.|just, not long|1
各|gè|pron.|various, different|6
工资|gōngzī|n.|pay, salary|4
共同|gòngtóng|adj.|common, shared|1
购物|gòu wù||to shop, to buy things|5
够|gòu|v.|to be enough|1
估计|gūjì|v.|to estimate, to reckon|7
顾客|gùkè|n.|customer, client|3
关键|guānjiàn|n.|hinge, crux|10
光|guāng|adv.|only, merely|5
广告|guǎnggào|n.|advertisement|5
逛|guàng|v.|to stroll, to roam|2
国际|guójì|n.|international|9
果汁|guǒzhī|n.|fruit juice|6
过程|guòchéng|n.|course, process|9
汗|hàn|n.|sweat, perspiration|9
好处|hǎochù|n.|benefit, advantage|6
好像|hǎoxiàng|adv.|as if|2
后悔|hòuhuǐ|v.|to regret|7
互相|hùxiāng|adv.|mutually|1
回忆|huíyì|v.|to call to mind, to recall|8
活动|huódòng|n.|activity, event|6
获得|huòdé|v.|to get, to obtain|6
积极|jījí|adj.|positive|8
积累|jīlěi|v.|to accumulate|4
及时|jíshí|adv.|in time|2
即使|jíshǐ|conj.|even if|1
计划|jìhuà|n./v.|plan; to intend to|4
寄|jì|v.|to mail, to send|5
加班|jiā bān|v.|to work overtime|1
家具|jiājù|n.|furniture|5
价格|jiàgé|n.|price|5
坚持|jiānchí|v.|to insist, to persist|9
减肥|jiǎn féi|v.|to lose weight|7
建议|jiànyì|n.|suggestion, advice|10
将来|jiānglái|n.|future|10
奖金|jiǎngjīn|n.|money award, bonus|4
降低|jiàngdī|v.|to lower, to reduce|6
交|jiāo|v.|to make (friends)|2
交流|jiāoliú|v.|to exchange, to communicate|2
教授|jiàoshòu|n.|professor|7
接受|jiēshòu|v.|to accept|1
结果|jiéguǒ|n.|result|9
尽管|jǐnguǎn|conj.|although|2
紧张|jǐnzhāng|adj.|nervous|3
经济|jīngjì|n.|economy|10
经历|jīnglì|v.|to go through, to experience|9
经验|jīngyàn|n.|experience|4
景色|jǐngsè|n.|scene, view|8
竟然|jìngrán|adv.|indicating unexpectedness|6
镜子|jìngzi|n.|mirror|2
举办|jǔbàn|v.|to hold, to conduct|6
举行|jǔxíng|v.|to hold (a meeting, event, etc.)|6
距离|jùlí|n.|distance|8
聚会|jùhuì|v./n.|to have a party; party, get-together|2
开玩笑|kāi wánxiào||to be kidding|1
考虑|kǎolǜ|v.|to consider|5
科学|kēxué|n.|science|8
咳嗽|késou|v.|to cough|7
可是|kěshì|conj.|but, however|9
肯定|kěndìng|adv.|surely, certainly|5
空气|kōngqì|n.|air|7
空儿|kòngr|n.|free time, spare time|10
困|kùn|adj.|sleepy|10
困难|kùnnan|n.|difficulty|2
拉|lā|v.|to pull, to drag|10
来不及|láibují|v.|to have not enough time to, to be too late to|7
浪费|làngfèi|v.|to waste|5
浪漫|làngmàn|adj.|romantic|1
礼拜天|lǐbàitiān|n.|Sunday|10
理解|lǐjiě|v.|to understand|2
理想|lǐxiǎng|n.|ideal|9
例如|lìrú|v.|for example|6
俩|liǎ|num.-m.|two, both|1
联系|liánxì|v.|to contact|2
另外|lìngwài|conj.|besides, in addition|3
留|liú|v.|to leave|3
流行|liúxíng|v.|to be popular|5
律师|lǜshī|n.|lawyer|3
乱|luàn|adj.|hurry-scurry, confused|4
麻烦|máfan|v.|to bother|2
满|mǎn|v.|to reach a quota or limit|6
免费|miǎn fèi|v.|to be free of charge|6
母亲|mǔqīn|n.|mother|10
耐心|nàixīn|n.|patience|8
难道|nándào|adv.|used in a rhetorical question for emphasis|9
内|nèi|n.|in, within|6
能力|nénglì|n.|ability, competence|3
年龄|niánlíng|n.|age|5
判断|pànduàn|v.|to judge, to decide|3
陪|péi|v.|to accompany|2
皮肤|pífū|n.|skin|6
脾气|píqi|n.|temper, disposition|1
篇|piān|m.|used for writings, papers or articles|9
平时|píngshí|n.|normal times|2
葡萄|pútao|n.|grape|5
其次|qícì|pron.|second, next|3
其中|qízhōng|n.|among (which, them, etc.)|6
气候|qìhòu|n.|climate|7
巧克力|qiǎokèlì|n.|chocolate|8
亲戚|qīnqi|n.|relative, kinsfolk|8
轻|qīng|adj.|light, of little weight|6
轻松|qīngsōng|adj.|relaxed, effortless|9
情况|qíngkuàng|n.|situation, circumstances|6
穷|qióng|adj.|poor, impoverished|10
区别|qūbié|n.|difference, distinction|9
取|qǔ|v.|to gain, to seek|9
缺点|quēdiǎn|n.|shortcoming|1
缺少|quēshǎo|v.|to lack|8
却|què|adv.|but, yet|2
确实|quèshí|adv.|truly, indeed|10
任何|rènhé|pron.|any, whatever|5
散步|sàn bù|v.|to take a walk|7
沙发|shāfā|n.|sofa|5
伤心|shāng xīn|adj.|sad, sorrowful|8
深|shēn|adj.|deep|1
甚至|shènzhì|conj.|even, so far as to|4
生活|shēnghuó|n./v.|life; to live|1
生命|shēngmìng|n.|life|8
生意|shēngyi|n.|business, trade|4
失败|shībài|v.|to fail|9
师傅|shīfu|n.|polite title for a skilled tradesperson|8
实际|shíjì|n.|reality|5
实在|shízài|adv.|really|5
使|shǐ|v.|to make, to cause|8
适合|shìhé|v.|to suit, to fit|1
适应|shìyìng|v.|to get used to|2
收入|shōurù|n.|income|3
首先|shǒuxiān|pron.|first|3
受到|shòudào|v.|to receive|5
售货员|shòuhuòyuán|n.|salesperson|6
熟悉|shúxi|v.|to be familiar with|1
数字|shùzì|n.|number|7
帅|shuài|adj.|handsome|7
顺便|shùnbiàn|adv.|in passing|5
顺利|shùnlì|adj.|smooth|4
说明|shuōmíng|v.|to explain, to show|7
硕士|shuòshì|n.|Master, person who has a master's degree|10
随便|suíbiàn|adj.|casual, at random|9
所有|suǒyǒu|adj.|all|6
台|tái|m.|used for machines|5
态度|tàidu|n.|attitude|8
谈|tán|v.|to talk, to discuss|4
糖|táng|n.|sugar, candy|10
躺|tǎng|v.|to lie (on one's back)|10
讨厌|tǎoyàn|v.|to dislike|2
特点|tèdiǎn|n.|characteristic|8
提|tí|v.|to mention|4
提供|tígōng|v.|to provide|3
提前|tíqián|v.|to do (sth.) in advance|4
提醒|tí xǐng|v.|to remind|4
条件|tiáojiàn|n.|condition|10
挺|tǐng|adv.|quite, rather|3
通过|tōngguò|prep.|through, by means of|9
通知|tōngzhī|v.|to inform|3
袜子|wàzi|n.|socks|6
完全|wánquán|adv.|completely|4
网球|wǎngqiú|n.|tennis|9
往往|wǎngwǎng|adv.|often, usually|8
味道|wèidào|n.|taste|5
无聊|wúliáo|adj.|boring|2
西红柿|xīhóngshì|n.|tomato|6
吸引|xīyǐn|v.|to attract|1
现金|xiànjīn|n.|cash|5
羡慕|xiànmù|v.|to envy, to admire|1
橡皮|xiàngpí|n.|eraser, rubber|10
消息|xiāoxi|n.|news|4
小说|xiǎoshuō|n.|novel, fiction|6
效果|xiàoguǒ|n.|effect|5
心情|xīnqíng|n.|mood, state of mind|8
辛苦|xīnkǔ|adj.|hard, toilsome|7
信心|xìnxīn|n.|confidence|3
兴奋|xīngfèn|adj.|excited|10
幸福|xìngfú|adj.|happy|1
性格|xìnggé|n.|character, personality|1
修理|xiūlǐ|v.|to repair, to mend|6
许多|xǔduō|num.|many, plenty of|9
压力|yālì|n.|pressure, stress|8
严重|yánzhòng|adj.|serious, grave|7
研究|yánjiū|v.|to study, to do research|7
阳光|yángguāng|adj.|optimistic, cheerful|8
样子|yàngzi|n.|look, appearance|5
邀请|yāoqǐng|v.|to invite|5
要是|yàoshi|conj.|if, supposing|7
一切|yíqiè|pron.|all, every|4
以为|yǐwéi|v.|to think, to believe|4
艺术|yìshù|n.|art|5
因此|yīncǐ|conj.|therefore, so|8
印象|yìnxiàng|n.|impression|1
赢|yíng|v.|to win|9
应聘|yìngpìn|v.|to apply for a job|3
永远|yǒngyuǎn|adv.|forever|10
勇敢|yǒnggǎn|adj.|brave, courageous|9
优点|yōudiǎn|n.|merit|5
优秀|yōuxiù|adj.|excellent, outstanding|10
幽默|yōumò|adj.|humorous|1
尤其|yóuqí|adv.|especially|5
由于|yóuyú|conj.|because, since|10
友谊|yǒuyì|n.|friendship|2
愉快|yúkuài|adj.|glad, cheerful|8
与|yǔ|prep.|with|3
原来|yuánlái|adj.|original|4
原因|yuányīn|n.|reason|1
约会|yuēhuì|v.|to date, to go to an appointment|3
咱们|zánmen|pron.|we, us|3
暂时|zànshí|n.|temporary, for the time being|9
责任|zérèn|n.|responsibility, duty|4
招聘|zhāopìn|v.|to recruit|3
真正|zhēnzhèng|adj.|true, real|2
正好|zhènghǎo|adv.|just in time, just right|2
正确|zhèngquè|adj.|right, correct|9
正式|zhèngshì|adj.|formal|3
证明|zhèngmíng|v.|to prove|8
支持|zhīchí|v.|to support|6
知识|zhīshi|n.|knowledge|4
值得|zhídé|v.|to be worth|6
职业|zhíyè|n.|occupation, profession|10
植物|zhíwù|n.|plant|7
只要|zhǐyào|conj.|as long as, provided|8
指|zhǐ|v.|to refer to|7
至少|zhìshǎo|adv.|at least|9
质量|zhìliàng|n.|quality|5
周围|zhōuwéi|n.|surrounding|2
主意|zhǔyi / zhúyi|n.|idea, plan|9
专门|zhuānmén|adv.|specially|2
专业|zhuānyè|n.|major, specialty|3
赚|zhuàn|v.|to earn|4
准时|zhǔnshí|adj.|punctual, on time|3
自然|zìrán|adv.|naturally, certainly|1
总结|zǒngjié|v.|to sum up|9
最好|zuìhǎo|adv.|had better|1
作家|zuòjiā|n.|writer|9
安全|ānquán|adj.|safe, secure|18
棒|bàng|adj.|excellent, amazing|15
包子|bāozi|n.|steamed stuffed bun|19
保护|bǎohù|v.|to protect|12
报名|bào míng|v.|to apply, to sign up|16
抱|bào|v.|to hold in the arms, to hug|17
抱歉|bàoqiàn|v.|to be sorry|14
笨|bèn|adj.|stupid, foolish|15
遍|biàn|m.|(an action from beginning to end) time|13
表格|biǎogé|n.|form, table|16
表示|biǎoshì|v.|to express, to indicate|11
表演|biǎoyǎn|v.|to act, to perform|13
表扬|biǎoyáng|v.|to praise, to commend|15
并且|bìngqiě|conj.|and|12
博士|bóshì|n.|doctor (academic degree)|16
部分|bùfen|n.|part|13
猜|cāi|v.|to guess|11
参观|cānguān|v.|to visit, to look around|16
餐厅|cāntīng|n.|restaurant|13
厕所|cèsuǒ|n.|lavatory, toilet|15
场|chǎng|m.|used for sports or recreational events|19
乘坐|chéngzuò|v.|to take (a vehicle), to ride|14
吃惊|chī jīng|v.|to be surprised, to be shocked|13
出差|chū chāi|v.|to go on a business trip|14
出发|chūfā|v.|to depart, to set off|20
出生|chūshēng|v.|to be born|19
厨房|chúfáng|n.|kitchen|19
传真|chuánzhēn|v.|to send by fax|16
词语|cíyǔ|n.|word, expression|11
粗心|cūxīn|adj.|careless, thoughtless|15
存|cún|v.|to store, to keep|20
错误|cuòwù|adj.|wrong|13
打扮|dǎban|v.|to dress up, to deck out|20
打印|dǎyìn|v.|to print out|19
打招呼|dǎ zhāohu||to greet, to say hello|19
打针|dǎ zhēn|v.|to give or have an injection|15
大概|dàgài|adv.|roughly, approximately|13
大约|dàyuē|adv.|approximately, about|13
戴|dài|v.|to wear (accessories)|19
刀|dāo|n.|knife|19
导游|dǎoyóu|n.|tour guide|16
到底|dàodǐ|adv.|(used in questions for emphasis) on earth|16
倒|dào|adv.|(indicating contrast) yet, actually|17
道歉|dào qiàn|v.|to apologize|19
得意|déyì|adj.|complacent, gloating|14
登机牌|dēngjīpái|n.|boarding pass|20
底|dǐ|n.|bottom, base|17
地点|dìdiǎn|n.|place, site|18
地球|dìqiú|n.|earth, globe|14
地址|dìzhǐ|n.|address|18
丢|diū|v.|to throw, to cast|14
对话|duìhuà|v.|to have a dialogue|20
对面|duìmiàn|n.|opposite, across|20
对于|duìyú|prep.|for, to, with regard to|12
儿童|értóng|n.|children|15
房东|fángdōng|n.|landlord/landlady|19
放暑假|fàng shǔjià||to be on summer vacation|17
否则|fǒuzé|conj.|or, otherwise|11
父亲|fùqīn|n.|father|15
付款|fù kuǎn||to pay a sum of money|18
复印|fùyìn|v.|to photocopy|19
复杂|fùzá|adj.|complicated|11
干杯|gān bēi|v.|to drink a toast|20
赶|gǎn|v.|to rush for, to hurry|15
敢|gǎn|v.|to dare|16
干|gàn|v.|to do, to act|17
高速公路|gāosù gōnglù||expressway|20
胳膊|gēbo|n.|arm|19
公里|gōnglǐ|m.|kilometer|17
功夫|gōngfu|n.|kung fu|19
鼓励|gǔlì|v.|to encourage|14
故意|gùyì|adv.|intentionally, on purpose|15
挂|guà|v.|to hang, to put up|16
观众|guānzhòng|n.|audience|13
管理|guǎnlǐ|v.|to manage, to administer|15
广播|guǎngbō|n.|broadcast, radio program|17
规定|guīdìng|n.|rule, regulation|12
国籍|guójí|n.|nationality, citizenship|19
海洋|hǎiyáng|n.|sea, ocean|17
害羞|hàixiū|v.|to be shy, to be timid|15
寒假|hánjià|n.|winter vacation|15
航班|hángbān|n.|scheduled flight|20
号码|hàomǎ|n.|number|16
合格|hégé|adj.|qualified, up to standard|20
合适|héshì|adj.|fit, suitable|15
盒子|hézi|n.|box, case|14
厚|hòu|adj.|deep, profound|13
互联网|hùliánwǎng|n.|Internet|13
护士|hùshi|n.|nurse|15
怀疑|huáiyí|v.|to suspect, to doubt|15
活泼|huópō|adj.|lively, vivacious|17
火|huǒ|adj.|hot, popular|18
基础|jīchǔ|n.|basis, foundation|13
激动|jīdòng|adj.|excited, emotional|16
记者|jìzhě|n.|journalist, reporter|16
技术|jìshù|n.|technology|18
既然|jìrán|conj.|since, as, now that|14
继续|jìxù|v.|to go on, to continue|13
加油站|jiāyóuzhàn|n.|gas station|20
假|jiǎ|adj.|false, fake|15
减少|jiǎnshǎo|v.|to reduce, to decrease|14
降落|jiàngluò|v.|to descend, to land|18
交通|jiāotōng|n.|traffic, communication|18
郊区|jiāoqū|n.|suburb, outskirts|16
骄傲|jiāo'ào|adj.|arrogant, conceited|15
饺子|jiǎozi|n.|jiaozi, dumpling|19
教育|jiàoyù|v.|to educate|12
接着|jiēzhe|adv.|then, immediately after that|18
节|jié|m.|section, length|12
节约|jiéyuē|v.|to economize, to save|12
解释|jiěshì|v.|to explain|12
进行|jìnxíng|v.|to conduct, to carry out|13
禁止|jìnzhǐ|v.|to prohibit, to forbid|19
京剧|jīngjù|n.|Beijing opera|13
精彩|jīngcǎi|adj.|wonderful, splendid|11
警察|jǐngchá|n.|police|18
竞争|jìngzhēng|v.|to compete|17
究竟|jiūjìng|adv.|(used in questions for emphasis) exactly|20
举|jǔ|v.|to give, to enumerate|18
拒绝|jùjué|v.|to refuse, to reject|14
开心|kāixīn|adj.|happy, glad|13
看法|kànfǎ|n.|viewpoint, opinion|11
烤鸭|kǎoyā|n.|roast duck|20
棵|kē|m.|used for plants|20
可怜|kělián|adj.|pitiable, poor|20
可惜|kěxī|adj.|pitiful, regretful|12
客厅|kètīng|n.|living room|11
空|kōng|adj.|empty|14
恐怕|kǒngpà|adv.|(indicating an estimation) I guess…|16
苦|kǔ|adj.|bitter|13
矿泉水|kuàngquánshuǐ|n.|mineral water|18
垃圾桶|lājītǒng|n.|dustbin, trash can|14
辣|là|adj.|hot, spicy|20
来得及|láidejí|v.|there's still time (to do sth.)|11
来自|láizì|v.|to be from|13
懒|lǎn|adj.|lazy|15
老虎|lǎohǔ|n.|tiger|17
冷静|lěngjìng|adj.|calm, composed|16
礼貌|lǐmào|n.|polite|16
理发|lǐ fà|v.|to get a haircut|19
力气|lìqi|n.|physical strength, effort|12
厉害|lìhai|adj.|awesome, serious|11
连|lián|prep.|even|11
凉快|liángkuai|adj.|pleasantly cool|17
零钱|língqián|n.|small change|19
流利|liúlì|adj.|fluent|11
旅行|lǚxíng|v.|to travel, to tour|20
马虎|mǎhu|adj.|careless, slipshod|16
毛|máo|n.|hair, fur|17
毛巾|máojīn|n.|towel|14
美丽|měilì|adj.|beautiful|14
梦|mèng|n.|dream|17
迷路|mí lù|v.|to lose one's way|18
密码|mìmǎ|n.|password|18
秒|miǎo|m.|second, 1/60 minute|18
民族|mínzú|n.|nationality, ethnic group|20
目的|mùdì|n.|aim, purpose|14
难受|nánshòu|adj.|sad, unhappy|17
内容|nèiróng|n.|content|11
弄|nòng|v.|to do, to make|15
暖|nuǎn|adj.|warm|14
暖和|nuǎnhuo|adj.|warm|17
偶尔|ǒu'ěr|adv.|occasionally, once in a while|13
排队|pái duì|v.|to form a line, to line up|17
排列|páiliè|v.|to put in order, to arrange|17
批评|pīpíng|v.|to criticize|15
骗|piàn|v.|to cheat, to deceive|15
乒乓球|pīngpāngqiú|n.|table tennis, ping-pong|19
破|pò|adj.|broken, torn|19
普遍|pǔbiàn|adj.|universal, common|13
普通话|pǔtōnghuà|n.|Mandarin Chinese|20
千万|qiānwàn|adv.|must, to be sure to|15
签证|qiānzhèng|n.|visa|16
敲|qiāo|v.|to knock, to beat, to strike|15
桥|qiáo|n.|bridge|18
全部|quánbù|n.|all, whole|12
然而|rán'ér|conj.|but, however|11
热闹|rènao|adj.|busy, bustling|17
任务|rènwu|n.|task, mission|12
扔|rēng|v.|to throw away|14
仍然|réngrán|adv.|still, yet|17
日记|rìjì|n.|diary, journal|18
入口|rùkǒu|n.|entrance|17
森林|sēnlín|n.|forest|17
商量|shāngliang|v.|to discuss, to consult|12
稍微|shāowēi|adv.|a little, slightly|13
勺子|sháozi|n.|spoon|12
社会|shèhuì|n.|society|17
申请|shēnqǐng|v.|to apply for|13
省|shěng|n.|province|13
省|shěng|v.|to save, to economize|14
剩|shèng|v.|to be left over, to remain|17
失望|shīwàng|v.|disappointed|16
十分|shífēn|adv.|very, extremely|13
使用|shǐyòng|v.|to use|12
世纪|shìjì|n.|century|18
是否|shìfǒu|adv.|if, whether|18
收|shōu|v.|to receive|18
收拾|shōushi|v.|to put in order, to pack|20
首都|shǒudū|n.|capital (of a country)|20
受不了|shòubuliǎo||cannot stand, cannot bear|18
输|shū|v.|to lose, to suffer defeat|16
数量|shùliàng|n.|quantity, amount|14
顺序|shùnxù|n.|order, sequence|11
死|sǐ|adj.|rigid, inflexible|12
速度|sùdù|n.|speed|14
塑料袋|sùliàodài|n.|plastic bag|14
酸|suān|adj.|sour, tart|20
随着|suízhe|prep.|along with, as|13
孙子|sūnzi|n.|grandson|15
抬|tái|v.|to lift, to raise|19
弹钢琴|tán gāngqín||to play the piano|15
汤|tāng|n.|soup|20
趟|tàng|m.|(used for a round trip) time|17
讨论|tǎolùn|v.|to discuss, to talk over|13
填空|tián kòng|v.|to fill in a blank|11
停|tíng|v.|to stop, to cease|14
同情|tóngqíng|v.|to show sympathy for|16
同时|tóngshí|conj.|at the same time, meanwhile|11
推|tuī|v.|to put off, to postpone|16
推迟|tuīchí|v.|to postpone, to delay|20
脱|tuō|v.|to take off|19
网站|wǎngzhàn|n.|website|18
危险|wēixiǎn|adj.|dangerous|18
卫生间|wèishēngjiān|n.|restroom, bathroom|14
温度|wēndù|n.|temperature|14
文章|wénzhāng|n.|essay, article|11
污染|wūrǎn|v.|to pollute|14
无|wú|v.|not to have, to be without|12
无法|wú fǎ|v.|cannot, to be unable (to do sth.)|12
无论|wúlùn|conj.|regardless of, no matter (what, how, etc.)|11
误会|wùhuì|n.|misunderstanding|12
咸|xián|adj.|salty|18
相反|xiāngfǎn|conj.|on the contrary|12
相同|xiāngtóng|adj.|same|11
香|xiāng|adj.|fragrant, scented|20
详细|xiángxì|adj.|detailed|12
响|xiǎng|v.|to sound, to ring|15
小吃|xiǎochī|n.|small and cheap dishes, snacks|20
小伙子|xiǎohuǒzi|n.|young man|16
笑话|xiàohua|n.|joke|20
信封|xìnfēng|n.|envelope|18
信息|xìnxī|n.|news, information|18
行|xíng|v.|to be OK, to be all right|14
醒|xǐng|v.|to wake up, to be awake|15
性别|xìngbié|n.|sex, gender|19
学期|xuéqī|n.|term, semester|19
牙膏|yágāo|n.|toothpaste|14
呀|ya|part.|variant of 啊, used at the end of a question to soften the tone|16
严格|yángé|adj.|strict, rigorous|17
盐|yán|n.|salt|12
眼镜|yǎnjìng|n.|glasses, spectacles|19
演出|yǎnchū|v.|to perform, to put on (a show)|13
演员|yǎnyuán|n.|actor/actress|13
养成|yǎngchéng|v.|to develop, to form|11
钥匙|yàoshi|n.|key|20
也许|yěxǔ|adv.|maybe, perhaps|12
叶子|yèzi|n.|leaf|12
页|yè|m.|page|11
以|yǐ|prep.|via, by means of|14
意见|yìjiàn|n.|opinion, suggestion|12
引起|yǐnqǐ|v.|to cause, to lead to|12
由|yóu|prep.|by (sb.)|13
邮局|yóujú|n.|post office|18
友好|yǒuhǎo|adj.|friendly|12
有趣|yǒuqù|adj.|interesting, fun|13
于是|yúshì|conj.|hence, therefore|14
羽毛球|yǔmáoqiú|n.|badminton|19
语法|yǔfǎ|n.|grammar|11
语言|yǔyán|n.|language|12
预习|yùxí|v.|to prepare lessons before class|16
原谅|yuánliàng|v.|to forgive|16
阅读|yuèdú|v.|to read|11
云|yún|n.|cloud|17
允许|yǔnxǔ|v.|to allow, to permit|18
杂志|zázhì|n.|magazine|11
脏|zāng|adj.|dirty|14
增加|zēngjiā|v.|to increase, to add|11
占线|zhànxiàn|v.|(of a telephone line) to be busy|19
照|zhào|v.|to take a picture, to photograph|17
整理|zhěnglǐ|v.|to tidy up, to arrange|15
正常|zhèngcháng|adj.|normal, regular|13
之|zhī|part.|connecting the modifier and the word modified|11
直接|zhíjiē|adj.|direct, straight|12
只好|zhǐhǎo|adv.|cannot but, to be forced to|11
纸袋|zhǐdài|n.|paper bag|13
重|zhòng|adj.|heavy, weighty|14
重点|zhòngdiǎn|n.|focal point, emphasis|16
重视|zhòngshì|v.|to attach importance to|16
祝贺|zhùhè|v.|to congratulate|20
著名|zhùmíng|adj.|famous, well-known|11
转|zhuǎn|v.|to turn, to shift|19
准确|zhǔnquè|adj.|accurate, precise|11
仔细|zǐxì|adj.|careful, meticulous|12
自信|zìxìn|adj.|self-confident|16
租|zū|v.|to rent, to lease|19
尊重|zūnzhòng|v.|to respect|16
左右|zuǒyòu|n.|around, or so|15
作用|zuòyòng|n.|function|12
作者|zuòzhě|n.|author|18
座|zuò|m.|used for bridges, mountains, buildings|18
座位|zuòwèi|n.|seat|19`;

const TITLES: [string, string][] = [
  ["简单的爱情", "Simple love"], ["真正的朋友", "A true friend"], ["经理对我印象不错", "I've made a good impression on the manager"], ["不要太着急赚钱", "Don't be anxious to make money"], ["只买对的，不买贵的", "Buy the right, not the expensive"],
  ["一分钱一分货", "The higher the price, the better the quality"], ["最好的医生是自己", "The best doctor is yourself"], ["生活中不缺少美", "Beauty is not rare in life"], ["阳光总在风雨后", "The sun will shine again after the storm"], ["幸福的标准", "Standards of happiness"],
  ["读书好，读好书，好读书", "It's good to read; read good books and like reading"], ["用心发现世界", "Discover the world with your heart"], ["喝着茶看京剧", "Drink tea while watching Beijing opera"], ["保护地球母亲", "Protect our Mother Earth"], ["教育孩子的艺术", "The art of educating children"],
  ["生活可以更美好", "Life can be better"], ["人与自然", "Humans and nature"], ["科技与世界", "Science, technology and the world"], ["生活的味道", "Taste of life"], ["路上的风景", "The view along the way"],
];

const TRAW = `1|1|对话：阿玲和小雪聊阿玲的男朋友|阿玲跟周南是怎么认识的？阿玲为什么喜欢他？
1|2|对话：阿玲告诉小雪她准备结婚|小雪为什么觉得阿玲在开玩笑？她们后来谈到了什么？
1|3|对话：林阿姨和赵阿姨聊婚后的日子|林阿姨刚结婚时是什么感觉？赵阿姨觉得两个人该怎样相处？
1|4|短文：生活里的小浪漫|文中写了哪些小小的浪漫？最让作者感动的是什么？
1|5|短文：走进婚姻的理由|作者认为两个人走进婚姻，最重要的是什么？
2|1|对话：阿玲和阮明聊刚到中国的日子|阮明刚来的时候适应这儿的生活吗？阿玲平时带他做些什么？
2|2|对话：小雪为同学聚会发愁|小雪为什么为同学聚会发愁？阿玲怎么安慰她？
2|3|对话：阿玲和小雪翻看夏令营的照片|她们看着照片想起了什么？阿玲觉得真正让人记得住的是什么？
2|4|短文：宿舍里的那一小时|作者刚住进宿舍时是什么感觉？后来生活有了什么变化？她为什么还给自己留出一小时？
2|5|短文：朋友不是只会说好话的人|作者为什么说真正的朋友更像一扇窗？真正的朋友在你遇到困难时会怎么做？
3|1|对话：阿玲面试前有点儿紧张|阿玲为什么紧张？小雪怎样鼓励她？
3|2|对话：周姐和阿玲谈两份应聘材料|周姐本来想找什么样的人？她们最后打算先通知谁？
3|3|对话：陈晓跟阿玲说她的新工作|陈晓找到了什么工作？她为什么觉得还可以继续上课？
3|4|短文：面试时我想着的两件事|作者参加正式面试时记住了哪两件事？
3|5|短文：把约定的时间放在心里|作者在咖啡馆遇到了什么事？她为什么觉得准时是一种尊重？
4|1|对话：小雪又想换工作|小雪为什么又想换工作？阿玲怎么看这件事？
4|2|对话：林主管请小雪把调查提前做完|那份调查的完成时间有什么变化？林主管为什么要提前？
4|3|对话：赵叔叔跟阿玲谈做小生意|赵叔叔刚开店时一切顺利吗？以前当老师的经验对他有什么帮助？
4|4|短文：一条让人放心的消息|他们今年的工作进行得怎么样？经理用什么方式感谢大家？
4|5|短文：不愿做的那份工作|遇到不愿意做的工作时，作者后来是怎么做的？做完以后他发现了什么？
5|1|对话：阿玲在家具店看沙发|阿玲想买什么样的沙发？她为什么不马上决定？
5|2|对话：阿玲和周南在商场|阿玲先是来看什么的？周南为什么不让她只看宣传上的效果？
5|3|对话：给陈老师挑一份礼物|她们想邀请谁？为什么不能只看广告就买葡萄？
5|4|短文：买衣服时我给自己的几条标准|以前作者买衣服有什么问题？后来她给自己定了哪些标准？
5|5|短文：网上购物也要停一停|作者在网上买家具时遇到了什么问题？后来她给自己定了什么习惯？
6|1|对话：小雪逛完小店回来|小雪为什么回来得晚？她在小店里买了什么？
6|2|对话：阿玲和周南帮社区挑西红柿|他们为什么买西红柿？最后为什么选了那一筐？
6|3|对话：周南要出远门买箱子|周南想买什么样的箱子？为什么觉得值得买？
6|4|短文：书店里的一场小活动|书店举行了什么活动？同学怎样才能获得一本小说？
6|5|短文：比的不只是价格|作者在减价时看到了哪两种笔记本？后来明白了什么？
7|1|对话：换季的时候阿玲咳嗽了|阿玲为什么咳嗽？小雪建议她怎么做？
7|2|对话：小雪劝表哥少抽烟|家里为什么反对表哥抽烟？他有没有后悔过？
7|3|对话：陈晓坐太久，大夫让他多走走|陈晓为什么去看大夫？大夫让他做些什么？
7|4|短文：教授指给我看的一组数字|教授用数字说明了什么？作者为什么把数字贴在书桌前？
7|5|短文：掉下去的不是只是体重|作者的朋友开始是怎么减肥的？坚持以后，掉下去的还有什么？
8|1|对话：阿玲买巧克力走亲戚|阿玲为什么买巧克力？她觉得巧克力对林阿姨有什么帮助？
8|2|对话：周末在山上踢球以后|阿玲为什么还想再去山上踢球？她回忆起来先想起什么？
8|3|对话：程师傅送阿玲去办事|阿玲要去哪儿？路上为什么比平时慢？
8|4|短文：路边也能看见的东西|作者以前觉得美只在哪里？后来态度有了什么变化？
8|5|短文：阳光下的好心情，也要自己找|作者认为阳光和心情是什么关系？积极的人有什么特点？
9|1|对话：小雪又为零食发愁|小雪为什么把饼干放得很高？阿玲给了她什么主意？
9|2|对话：周南的网球又赢了|周南今天打得怎么样？他平时怎么训练？
9|3|对话：陈晓想当作家|陈晓的理想是什么？他打算怎样同时照顾工作和写作？
9|4|短文：一次陶艺课给我的总结|作者第一次做杯子时结果如何？后来她总结出了什么？
9|5|短文：暂时落后的时候|暂时落后时，两种态度有什么区别？作者后来明白了什么？
10|1|对话：礼拜天阿玲陪母亲出门|阿玲为什么星期天起得很早？她们出门后可能怎么走？
10|2|对话：两位老师谈同事的新消息|王老师有什么好消息？下午她还要做什么？
10|3|对话：陈晓为将来的工作发愁|陈晓为什么躺在宿舍里？阿玲和小雪给了他什么建议？
10|4|短文：小店门口的一句话|文具店的老板穷不穷？他对扩大店面是怎么看的？
10|5|短文：黑板上的几种答案|老师让学生回答什么问题？黑板上出现了哪些不同的答案？
11|1|对话：林安说他的汉语是怎么练的|林安每天怎么练习词语和语法？他为什么说要先求准确？
11|2|对话：小雪考试前有点儿来不及|小雪觉得哪一部分比较复杂？阿玲为什么说现在开始还来得及？
11|3|对话：阿玲家客厅里的杂志|阿玲的妈妈为什么订杂志？阿玲觉得阅读给她带来了什么？
11|4|短文：我慢慢有了自己的看法|老师让学生读完文章后写什么？作者后来明白了什么？
11|5|短文：把读书养成一种顺序|作者选书时给自己定了什么顺序？对他来说，读书表示什么？
12|1|对话：陈晓的小店遇到了规定|小店接到了什么新规定？为什么陈晓很着急？
12|2|对话：吴姐教阿玲护一护深色衣服|为什么深色衣服最好不要和浅色的一起洗？盐有什么作用？
12|3|对话：程老师的一节自然课|程老师这节课是怎么上的？小雪为什么喜欢这种教育方法？
12|4|短文：一句话引起的误会|作者的哪句话引起了误会？后来再提醒别人时，他会怎么说？
12|5|短文：力气要花在该花的地方|两种完成任务的方法有什么相反之处？作者认为该怎样对待别人的意见？
13|1|对话：陈叔叔要在社区演京剧|陈叔叔是做什么的？阿玲为什么说他顾不上热？
13|2|对话：周南跟着视频学了一段京剧|周南是怎么学京剧的？他的兴趣来自哪里？
13|3|对话：程老师向校长申请一个小活动|程老师申请了什么？活动由谁来表演，放在什么时间？
13|4|短文：餐厅里的一张小说明|餐厅桌子上的说明写了什么？老板为什么要在互联网上改这张说明？
13|5|短文：老家那碗稍微有点儿苦的汤|这种汤是什么味道？随着什么变化，它变得更普遍了？
14|1|对话：阿玲出差前整理箱子|阿玲的箱子为什么有点儿重？小雪建议她拿出什么？
14|2|对话：店长请小雪先把卫生间收拾一下|卫生间有什么问题？店长为什么让小雪快一点？
14|3|对话：周南为关灯夜做了一张海报|“关灯夜”的目的是什么？阿玲为什么说天气还暖，关灯没问题？
14|4|短文：我开始少拿一只塑料袋|作者第一次是怎样减少塑料袋的？收银员是什么态度？
14|5|短文：把丢掉的习惯也一起丢掉|乘坐公交时应该注意什么？作者现在出门前会先看什么？
15|1|对话：周南的父亲让孩子寒假坚持弹钢琴|寒假里父亲让弟弟怎么做？弟弟为什么后来高兴了？
15|2|对话：小雪家早上总为出门着急|弟弟早上做了什么，害得大家要赶车？后来妈妈想先教他什么？
15|3|对话：诊所里的一次小小表扬|护士是怎样让妹妹不怕打针的？小雪认为表扬时千万要注意什么？
15|4|短文：敲门进来之前|有的孩子把房间弄乱，一定是故意的吗？作者建议大人怎么做？
15|5|短文：教室左右两边的两种孩子|粗心或害羞的孩子该怎样理解？怎样才能让他们安静地学下去？
16|1|对话：林安办签证把表格填错了|林安的表格出了什么问题？老师建议他怎么补救？
16|2|对话：一个小伙子被记者采访|那个小伙子开了什么店？他第一次见到记者时怎么样？
16|3|对话：周南不好意思拒绝做导游|同学为什么想让周南当导游？阿玲和小雪建议他怎么拒绝？
16|4|短文：把今天的事先做完|作者以前是怎么把事情推到明天的？老师的哪句话改变了他？
16|5|短文：输了，也要冷静|作者认为输了以后真正该重视的是什么？为什么还要尊重自己？
17|1|对话：雨后的傍晚倒凉快了|广播里说今晚天气会怎样？他们为什么想去河边？
17|2|对话：隔壁的小狗把毛弄湿了|小狗为什么难受？吴姐是怎么照顾它的？
17|3|对话：放暑假去看老虎|阿玲为什么还想再去一趟野生园？他们打算怎么少排队？
17|4|短文：森林里剩下的那一点儿空地|春天暖和以后，森林里会发生什么？作者认为竞争里还应该记得什么？
17|5|短文：船还在海的底下走|作者在船上想起了什么梦？海洋给他留下了什么感觉？
18|1|对话：阿玲推荐一本很火的书|这本书写的是什么？为什么阿玲觉得值得看？
18|2|对话：密码太多，陈晓有点儿受不了|陈晓为什么受不了？日记里可不可以写密码？
18|3|对话：小雪做了一个奇怪的梦|小雪的梦里出现了哪些人和东西？矿泉水是什么味道？
18|4|短文：迷路的时候把手机举起来|作者第一次到这座城时遇到了什么事？他后来是怎么找到小店的？
18|5|短文：一封还在路上的信|外婆为什么仍然喜欢去邮局？作者觉得快的信息和慢的信各告诉他什么？
19|1|对话：林安补交学期申请|林安的申请表哪里写错了？他做了哪些补救？
19|2|对话：包饺子时刀把皮划破了|阿玲的手是怎么破的？后来饺子和包子做得怎么样？
19|3|对话：国际交流课上练习转身|老师让他们先做什么，再怎么转？周南戴着眼镜有没有掉？
19|4|短文：电话占线的那天下午|作者为什么一直打不通房东的电话？后来他明白了什么？
19|5|短文：球场边那条不能踩的线|这场活动有哪些规矩？作者从白线里看出了什么？
20|1|对话：送周南去机场，航班却推迟了|他们在路上遇到了什么？航班推迟后，周南怎么看？
20|2|对话：祝贺一次合格的小旅行|他们的旅行为什么说很合格？陈晓给妹妹买了什么？
20|3|对话：钥匙存前台的那晚|他们在民族村里做了什么？钥匙到底有没有丢？
20|4|短文：树下那碗汤，和一句普通话|作者和舅舅是怎么开始对话的？他后来明白语言是为了什么？
20|5|短文：出发前把小吃也收拾进包里|作者出发前会收拾些什么小吃？这些味道对他说有什么意义？`;

const GRAW = `1|不仅……也/还/而且……|他不仅足球踢得好，性格也不错。
1|从来|虽然我们认识的时间不长，但我从来没这么快乐过。
1|刚|我上午刚借的那本书，怎么找不到了？
1|即使……也……|大部分人每天晚上最少应该睡7个小时，但有些人即使只睡5个小时也没问题。
1|(在)……上|两个人共同生活，不仅需要浪漫的爱情，更需要性格上互相吸引。
2|正好|你来得正好，我的钱包不见了，借我点儿钱吧。
2|差不多|女儿上中学后，个子长得特别快，现在都快一米七了，差不多跟我一样高了。
2|尽管|尽管已经毕业这么多年，我们还是经常联系的。
2|却|现在很多人虽然住在同一个楼里，但是却从来没说过话。
2|而|有些人觉得朋友就是能和自己一起快乐的人，而我的理解是：当你遇到困难的时候，真正的朋友会站出来，及时给你帮助。
3|挺|他们问的问题都挺容易的。
3|本来|我本来不会开车，但现在开得特别好。
3|另外|家里的空调坏了，咱们另外再买一个吧。
3|首先……其次……|不管做什么事情，首先应该明白你为什么要做，其次要知道怎么做。
3|不管|不管忙不忙，他每天都要锻炼一个小时身体。
4|以为|她汉语说得那么好，我还以为她是中国人。
4|原来|她原来是汉语老师，现在已经成了一名律师。
4|并|我原来以为做生意很简单，后来才发现其实并不容易。
4|按照|我们今年的工作都已经按照计划完成了。
4|甚至|很多时候，我们不得不去做一些自己不愿意做甚至是非常不喜欢的工作。
5|肯定|每天喝一点儿葡萄酒，对身体是有好处的。但是不能喝太多，喝太多酒肯定对身体不好。
5|再说|现在的事，做了再说；以后的事，以后再说。
5|实际|你们做计划应该联系实际。
5|对……来说|对我来说，衣服的样子流行不流行并不是很重要。
5|尤其|您女儿真可爱，长得真像您，尤其是眼睛。
6|竟然|这个歌特别好听，最近很流行，你竟然没听过？
6|倍|我的工资是每月5000块，他的工资是我的两倍。
6|值得|你应该改改自己的脾气，别总是为一点儿小事生气，不值得。
6|其中|我们不仅要会读书，还要会选择其中的好书来读。
6|(在)……下|在老师和同学们的帮助下，他的汉语提高得非常快。
7|估计|你有没有去问问小王？估计他应该有办法。
7|来不及|等你身体出现问题了，后悔就来不及了。
7|离合词重叠|咱们午饭后就去附近的公园散散步吧。
7|要是|要是质量比别人的好的话，那么价格贵一点儿也是可以接受的。
7|既……又/也/还……|散步是生活中最简单的锻炼方法，既可以活动身体，又可以减肥。
8|使|在中国生活的三年使他在音乐方面有了很多新的想法。
8|只要|只要这次你好好儿准备，一定能把比赛踢好。
8|可不是|A：没想到咱们毕业都已经十年了。B：可不是！时间过得太快了。
8|因此|我认识他很多年，因此，很了解他的性格。
8|往往|女孩子对衣服颜色的选择往往与她们的性格有关。
9|难道|怎么又买了这么多饼干和巧克力？难道你不减肥了？
9|通过|任何成功都要通过努力才能得到。
9|可是|虽然收入高，可是经常要加班，很少有时间和家人在一起。
9|结果|小张，你这份计划书写得不错，就按照这个计划去做市场调查吧。下个月把调查结果交上来。
9|上|这个城市的地铁已经有上百年的历史了。
10|不过|我现在上有老，下有小。除了工作以外，家里还有母亲和儿子需要照顾。不过现在我很幸福。
10|确实|爱情确实是结婚的重要原因，但仅有爱情是不够的。
10|在……看来|在我看来，比赛结果并不是最重要的，在参加比赛的过程中使自己获得提高更重要。
10|由于|由于种种原因，我们不得不改变原来的计划。
10|比如|还有人说，小时候幸福是一件东西，比如一块橡皮、一块糖，得到了就很幸福。
11|连|你太厉害了！连中文报纸都看得懂。
11|否则|他一定有重要的事找你，否则不会打这么多次电话来。
11|无论|无论做什么事都要注意方法，正确的方法可以让我们做得更好。
11|然而|他虽然失败了很多次，然而一直没有放弃。
11|同时|在学习汉语的同时，我还了解了中国文化，认识了很多中国朋友。
12|并且|他做事很认真，并且有丰富的经验，让他负责很合适。
12|再……也……|事情已经发生了，你再后悔也无法改变，别伤心了。
12|对于|对于这件事，我跟大家的看法不同。
12|名量词重叠|做好小事是完成大事的第一步，因此，件件小事都应该被看成是一次学习的机会。
12|相反|调查结果和他们想的几乎完全相反，他们不得不改变原来的计划。
13|大概|他8岁就开始上台演出，到现在大概唱了60多年了，他对这门艺术的热爱从来没有改变过。
13|偶尔|三叶草的叶子一般为三个，但偶尔也会出现四个叶子的。
13|由|按照规定，这件事情应该由王大夫负责。
13|进行|有人在互联网上专门进行过调查，结果发现每六个中国人中就有一个使用筷子的方法是错误的。
13|随着|随着社会的发展，京剧也在改变，以适应不同年龄观众的需要。
14|够|不用拿这些，宾馆都会免费提供的。再说，箱子已经够重的了！
14|以|经理您放心，我一定以最快的速度完成。
14|既然|A：真抱歉，明天我得出差，不能参加明天的会议了。B：既然这样，就只好安排在下周了。
14|于是|……它的大量使用也带来了严重的环境污染问题。于是，一些国家规定，超市、商场不能为顾客提供免费塑料袋。
14|什么的|A：我们去趟超市吧，明天出去玩儿得买点儿饼干和面包。B：好，还有矿泉水、果汁什么的。
15|想起来|我突然想起来得去银行，所以不能陪你去大使馆了。
15|弄|每天因为这些小事批评她，弄得我俩心情都不好。
15|千万|我要等她生日那天再送给她这个礼物，你现在千万别告诉她。
15|来|小王经验比较丰富，并且做事认真，这次就让他来负责吧。
15|左右|网上买的那本书估计三天左右就能到，你收到了记得给我打个电话说一声。
16|可|下个星期就要去使馆办签证了，这可怎么办？
16|恐怕|我的工作经验还比较少，那份工作我恐怕完成不了。
16|到底|你不是已经买好火车票了吗？你到底怎么打算的呀？
16|拿……来说|这次招聘很多人符合公司的要求，拿他来说，他不仅专业符合职业要求，而且还有工作经验。
16|敢|小时候我总喜欢躺在床上看书，结果眼睛越来越不好，所以从那以后我就不敢再躺着看书了。
17|倒|我以为坐出租车会快些，没想到倒比骑车还慢。
17|干|每次你让它干什么，它就像能听懂你的话一样去做。
17|趟|我要出趟差，你能帮我照顾一下我的小狗吗？
17|为了……而……|植物会为了阳光、空气和水而竞争。
17|仍然|人比动物聪明，但动物仍然有很多值得人学习的地方。
18|是否|不过她这么小，这本书我不知道她是否能读懂。
18|受不了|不过天天对着电脑看，眼睛实在受不了。
18|接着|这本书的内容非常有趣，你看完以后先不要还，我接着看。
18|除此以外|他和弟弟同一天出生，兄弟俩长得很像，但除此以外几乎再找不到其他共同点。
18|把……叫作……|黄河是中国第二大河，从中国西部流向东部，全长5464公里，人们把它叫作“母亲河”。
19|疑问代词活用表示任指|“世界上没有免费的午餐”这句话是说，什么东西都要通过努力才能得到。
19|上|现在堵车这么厉害，看来今天坐不上8点那趟去上海的飞机了。
19|出来|你要的那篇文章我已经翻译出来了，你方便的时候就来取吧。
19|总的来说|很多人问去丽江旅游怎么样，总的来说，丽江景色不错，那里的人也很热情，去那里旅游是个不错的选择。
19|在于|选择职业的关键在于兴趣，当你喜欢做一件事情的时候，你会带着热情去工作。
20|V+着+V+着|她讲着讲着自己就先笑了，而大家却不明白她到底为什么笑。
20|一……就……|100年前，塑料一出现就受到人们的普遍欢迎。
20|究竟|究竟哪个季节去丽江旅游比较好呢？
20|起来|邻居小王最近一定遇到了很多开心的事，你听，他又唱起来了。
20|V+起|聊起那场网球比赛，他们俩就兴奋得停不下来了。`;

// lesson|sentence|answer|distractor1|distractor2|distractor3
const GQRAW = `1|虽然我们认识的时间不长，但我＿＿没这么快乐过。|从来|刚|即使|不仅
1|我上午＿＿借的那本书，怎么找不到了？|刚|从来|即使|不仅
2|你来得＿＿，我的钱包不见了，借我点儿钱吧。|正好|尽管|却|而
2|＿＿已经毕业这么多年，我们还是经常联系的。|尽管|正好|却|差不多
3|他们问的问题都＿＿容易的。|挺|本来|另外|首先
3|＿＿忙不忙，他每天都要锻炼一个小时身体。|不管|本来|另外|挺
4|她汉语说得那么好，我还＿＿她是中国人。|以为|按照|甚至|原来
4|我们今年的工作都已经＿＿计划完成了。|按照|以为|甚至|并
5|您女儿真可爱，长得真像您，＿＿是眼睛。|尤其|肯定|实际|再说
5|＿＿我来说，衣服的样子流行不流行并不是很重要。|对|尤其|肯定|实际
6|这个歌特别好听，最近很流行，你＿＿没听过？|竟然|值得|其中|倍
6|我的工资是每月5000块，他的工资是我的两＿＿。|倍|竟然|其中|值得
7|等你身体出现问题了，后悔就＿＿了。|来不及|估计|要是|既
7|＿＿质量比别人的好的话，那么价格贵一点儿也是可以接受的。|要是|估计|来不及|既
8|＿＿这次你好好儿准备，一定能把比赛踢好。|只要|可不是|往往|使
8|女孩子对衣服颜色的选择＿＿与她们的性格有关。|往往|只要|可不是|使
9|怎么又买了这么多饼干和巧克力？＿＿你不减肥了？|难道|通过|结果|上
9|任何成功都要＿＿努力才能得到。|通过|难道|结果|上
10|爱情＿＿是结婚的重要原因，但仅有爱情是不够的。|确实|比如|由于|在
10|＿＿种种原因，我们不得不改变原来的计划。|由于|确实|比如|不过
11|你太厉害了！＿＿中文报纸都看得懂。|连|否则|无论|然而
11|他一定有重要的事找你，＿＿不会打这么多次电话来。|否则|连|无论|同时
12|＿＿这件事，我跟大家的看法不同。|对于|并且|相反|也
12|他做事很认真，＿＿有丰富的经验，让他负责很合适。|并且|对于|相反|再
13|按照规定，这件事情应该＿＿王大夫负责。|由|随着|偶尔|进行
13|＿＿社会的发展，京剧也在改变，以适应不同年龄观众的需要。|随着|由|偶尔|大概
14|经理您放心，我一定＿＿最快的速度完成。|以|够|于是|既然
14|A：真抱歉，明天我得出差，不能参加明天的会议了。B：＿＿这样，就只好安排在下周了。|既然|于是|够|以
15|我要等她生日那天再送给她这个礼物，你现在＿＿别告诉她。|千万|左右|弄|来
15|网上买的那本书估计三天＿＿就能到。|左右|千万|弄|来
16|我的工作经验还比较少，那份工作我＿＿完成不了。|恐怕|到底|敢|拿
16|你不是已经买好火车票了吗？你＿＿怎么打算的呀？|到底|恐怕|敢|拿
17|我要出＿＿差，你能帮我照顾一下我的小狗吗？|趟|倒|干|仍然
17|人比动物聪明，但动物＿＿有很多值得人学习的地方。|仍然|趟|干|而
18|这本书的内容非常有趣，你看完以后先不要还，我＿＿看。|接着|是否|受不了|除此以外
18|不过她这么小，这本书我不知道她＿＿能读懂。|是否|接着|受不了|除此以外
19|你要的那篇文章我已经翻译＿＿了，你方便的时候就来取吧。|出来|在于|上|总的来说
19|选择职业的关键＿＿兴趣。|在于|出来|上|总的来说
20|＿＿哪个季节去丽江旅游比较好呢？|究竟|一|起来|着
20|邻居小王最近一定遇到了很多开心的事，你听，他又唱＿＿了。|起来|究竟|着|就`;

const PARTIAL: Record<number, string> = {
  3: "课文4、5 的内容未能从扫描件中可靠提取",
  5: "课文1 的要点、课文4、5 的内容未能从扫描件中可靠提取",
  7: "课文5 的内容未能从扫描件中可靠提取",
  8: "课文3、5 的要点未能从扫描件中可靠提取",
  11: "课文4 的要点未能从扫描件中可靠提取",
  19: "课文2 的标题未能提取",
};

function cells(line: string): string[] { return line.split("|"); }
const WORDS: Word[] = WRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { h: f[0] ?? "", p: f[1] ?? "", pos: f[2] ?? "", m: f[3] ?? "", l: Number(f[4] ?? 0) }; });
const TEXTS = TRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), n: Number(f[1]), title: f[2] ?? "", q: f[3] ?? "" }; });
const GRAM = GRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), point: f[1] ?? "", ex: f[2] ?? "" }; });
const GQ = GQRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), s: f[1] ?? "", a: f[2] ?? "", d: [f[3] ?? "", f[4] ?? "", f[5] ?? ""] }; });

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = a[i] as T; a[i] = a[j] as T; a[j] = tmp; }
  return a;
}
const STOP = new Set(["the", "for", "used", "and", "sth", "one", "etc", "with", "certain", "indicating", "after", "of"]);
function toks(m: string): string[] { return m.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w: string) => w.length >= 3 && !STOP.has(w)); }
function clash(a: string, b: string): boolean { const A = new Set(toks(a)); return toks(b).some((w: string) => A.has(w)); }
function normPy(p: string): string { return p.replace(/[\s']/g, "").toLowerCase(); }

function genQuiz(lesson: number, seed: number): Q[] {
  const r = rng(lesson * 1000 + seed);
  const pool = WORDS.filter((w: Word) => w.l === lesson);
  const picks = shuffle(pool, r).slice(0, 8);
  const qs: Q[] = picks.map((w: Word, i: number) => {
    let kind = "看汉字选意思";
    if (i >= 5 && i < 7) kind = "看意思选汉字";
    if (i === 7) kind = "看汉字选拼音";
    const others = shuffle(pool.filter((o: Word) => o.h !== w.h), r);
    let distract: string[] = [];
    if (kind === "看汉字选意思") distract = others.filter((o: Word) => !clash(o.m, w.m) && o.m !== w.m).map((o: Word) => o.m);
    else if (kind === "看意思选汉字") distract = others.filter((o: Word) => !clash(o.m, w.m) && o.m !== w.m).map((o: Word) => o.h);
    else distract = others.filter((o: Word) => normPy(o.p) !== normPy(w.p)).map((o: Word) => o.p);
    const right = kind === "看汉字选意思" ? w.m : kind === "看意思选汉字" ? w.h : w.p;
    const uniq = Array.from(new Set(distract.filter((x: string) => x !== right))).slice(0, 3);
    const opts = shuffle([right, ...uniq], r);
    const stem = kind === "看意思选汉字" ? w.m : w.h;
    return { id: `L${lesson}-${i}`, sec: "read", kind, stem, opts, a: opts.indexOf(right) };
  });
  GQ.filter((g) => g.l === lesson).forEach((g, i: number) => {
    const opts = shuffle([g.a, ...g.d], r);
    qs.push({ id: `L${lesson}-g${i}`, sec: "read", kind: "语言点填空", stem: g.s, opts, a: opts.indexOf(g.a) });
  });
  return qs;
}

const JUDGE = ["对 √", "错 ×"];
const BANK = ["竟然", "尤其", "千万", "来得及", "值得", "偶尔"];
const PLACE: Q[] = [
  { id: "p1", sec: "listen", kind: "判断对错", passage: "她汉语说得那么好，我还以为她是中国人。", stem: "★ 她是中国人。", opts: JUDGE, a: 1 },
  { id: "p2", sec: "listen", kind: "判断对错", passage: "我原来以为做生意很简单，后来才发现其实并不容易。", stem: "★ 他现在觉得做生意不容易。", opts: JUDGE, a: 0 },
  { id: "p3", sec: "listen", kind: "判断对错", passage: "我以为坐出租车会快些，没想到倒比骑车还慢。", stem: "★ 坐出租车比骑车快。", opts: JUDGE, a: 1 },
  { id: "p4", sec: "listen", kind: "判断对错", passage: "他一定有重要的事找你，否则不会打这么多次电话来。", stem: "★ 他给你打了很多次电话。", opts: JUDGE, a: 0 },
  { id: "p5", sec: "listen", kind: "判断对错", passage: "这次招聘很多人符合公司的要求，拿他来说，他不仅专业符合职业要求，而且还有工作经验。", stem: "★ 他没有工作经验。", opts: JUDGE, a: 1 },
  { id: "p6", sec: "listen", kind: "判断对错", passage: "我的工资是每月5000块，他的工资是我的两倍。", stem: "★ 他每月工资一万块。", opts: JUDGE, a: 0 },
  { id: "p7", sec: "listen", kind: "判断对错", passage: "京剧演出7点就开始了，现在恐怕已经结束了。", stem: "★ 说话人认为演出可能已经结束了。", opts: JUDGE, a: 0 },
  { id: "p8", sec: "listen", kind: "判断对错", passage: "网上买的那本书估计三天左右就能到，你收到了记得给我打个电话说一声。", stem: "★ 那本书已经到了。", opts: JUDGE, a: 1 },
  { id: "p9", sec: "listen", kind: "判断对错", passage: "小时候我总喜欢躺在床上看书，结果眼睛越来越不好，所以从那以后我就不敢再躺着看书了。", stem: "★ 他现在还经常躺着看书。", opts: JUDGE, a: 1 },
  { id: "p10", sec: "listen", kind: "判断对错", passage: "随着社会的发展，京剧也在改变，以适应不同年龄观众的需要。", stem: "★ 京剧在改变，以适应不同年龄的观众。", opts: JUDGE, a: 0 },
  { id: "p11", sec: "read", kind: "选词填空", stem: "这个歌特别好听，最近很流行，你（　）没听过？", opts: BANK, a: 0 },
  { id: "p12", sec: "read", kind: "选词填空", stem: "您女儿真可爱，长得真像您，（　）是眼睛。", opts: BANK, a: 1 },
  { id: "p13", sec: "read", kind: "选词填空", stem: "我要等她生日那天再送给她这个礼物，你现在（　）别告诉她。", opts: BANK, a: 2 },
  { id: "p14", sec: "read", kind: "选词填空", stem: "我们总是很容易看到一个人的缺点，但是别忘了，他身上的优点更（　）我们去发现、去学习。", opts: BANK, a: 4 },
  { id: "p15", sec: "read", kind: "选词填空", stem: "三叶草的叶子一般为三个，但（　）也会出现四个叶子的。", opts: BANK, a: 5 },
  { id: "p16", sec: "read", kind: "排列顺序", passage: "A 其次要知道怎么做　B 不管做什么事情　C 首先应该明白你为什么要做", stem: "正确的顺序是：", opts: ["BCA", "CBA", "BAC", "ACB"], a: 0 },
  { id: "p17", sec: "read", kind: "排列顺序", passage: "A 如果还是使用以前的办法　B 相反，会使问题变得更复杂　C 不但不能解决任何问题", stem: "正确的顺序是：", opts: ["CAB", "ACB", "ABC", "BAC"], a: 1 },
  { id: "p18", sec: "read", kind: "排列顺序", passage: "A 所以从那以后我就不敢再躺着看书了　B 结果眼睛越来越不好　C 小时候我总喜欢躺在床上看书", stem: "正确的顺序是：", opts: ["BCA", "CAB", "CBA", "ABC"], a: 2 },
  { id: "p19", sec: "read", kind: "排列顺序", passage: "A 它能丰富你的知识　B 同时，它还会丰富你的情感　C 阅读有许多好处", stem: "正确的顺序是：", opts: ["ABC", "CBA", "BAC", "CAB"], a: 3 },
  { id: "p20", sec: "read", kind: "排列顺序", passage: "A 无论结果怎么样　B 这次比赛他已经打出了自己最好的水平　C 我们都应该为他高兴", stem: "正确的顺序是：", opts: ["BAC", "CAB", "ABC", "BCA"], a: 0 },
  { id: "p21", sec: "read", kind: "短文理解", passage: "一般情况下，你花的钱越多，买的东西也就越好。", stem: "★ 这句话的意思最接近：", opts: ["便宜的东西质量更好", "一分钱一分货", "买东西一定要花很多钱", "好东西都不贵"], a: 1 },
  { id: "p22", sec: "read", kind: "短文理解", passage: "人们常说“生命在于运动”，所以很多人一到周末就会到体育馆打几场球。", stem: "★ 很多人周末去体育馆做什么？", opts: ["看比赛", "工作", "学习", "打球"], a: 3 },
  { id: "p23", sec: "read", kind: "短文理解", passage: "100年前，塑料一出现就受到人们的普遍欢迎。可是，它的大量使用也带来了严重的环境污染问题。于是，一些国家规定，超市、商场不能为顾客提供免费塑料袋。", stem: "★ 一些国家为什么规定超市、商场不能提供免费塑料袋？", opts: ["塑料袋太贵", "顾客不喜欢塑料袋", "塑料袋带来了严重的环境污染", "塑料袋质量不好"], a: 2 },
  { id: "p24", sec: "read", kind: "短文理解", passage: "选择职业的关键在于兴趣，当你喜欢做一件事情的时候，你会带着热情去工作，就不会感到累，更不会觉得有太大的压力。", stem: "★ 根据这段话，选择职业的关键是：", opts: ["兴趣", "收入", "压力", "时间"], a: 0 },
  { id: "p25", sec: "read", kind: "短文理解", passage: "很多人问去丽江旅游怎么样，总的来说，丽江景色不错，那里的人也很热情，去那里旅游是个不错的选择。", stem: "★ 说话人觉得去丽江旅游怎么样？", opts: ["那里的人不太热情", "是个不错的选择", "景色一般", "交通不方便"], a: 1 },
];
const ORD: OrdQ[] = [
  { id: "w1", tiles: ["负责", "这件事情", "王大夫", "应该由"], answers: ["这件事情应该由王大夫负责", "应该由王大夫负责这件事情"] },
  { id: "w2", tiles: ["别告诉她", "你现在", "千万"], answers: ["你现在千万别告诉她"] },
  { id: "w3", tiles: ["看法不同", "对于这件事", "我跟大家的"], answers: ["对于这件事我跟大家的看法不同"] },
  { id: "w4", tiles: ["两倍", "他的工资", "是", "我的"], answers: ["他的工资是我的两倍"] },
  { id: "w5", tiles: ["没听过", "竟然", "这个歌", "你"], answers: ["这个歌你竟然没听过", "你竟然没听过这个歌"] },
];

const WEEKS: number[][] = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16, 17], [18, 19, 20], []];
type Task = { title: string; detail: string; min: number };
function weekTasks(w: number): Task[] {
  const ls = WEEKS[w] ?? [];
  if (ls.length === 0) return [
    { title: "随机水平测验（再做一次）", detail: "做「随机水平测验」（随机30题），和第一次的分数对比，找出最弱的课。", min: 40 },
    { title: "官方 HSK 3.0 样题：听力", detail: "在 chinesetest.cn 下载 HSK 3.0 四级样题包，完成听力部分（约20分钟）并对答案。", min: 35 },
    { title: "官方样题：阅读（限时30分钟）", detail: "完成阅读部分，错题标出生词和语言点。", min: 40 },
    { title: "官方样题：写作（限时25分钟）", detail: "5个看图用词造句 + 1篇不少于80字的短文。", min: 40 },
    { title: "第1–10课总复习", detail: "闪卡打乱复习；重做第1–10课小测里的错题。", min: 40 },
    { title: "第11–20课总复习", detail: "闪卡打乱复习；重做第11–20课小测里的错题。", min: 40 },
    { title: "全真模拟", detail: "按考试时间完整做一套（纸笔考约85分钟），考后只复习错题。", min: 85 },
  ];
  const study = (l: number): Task[] => [
    { title: `第${l}课 生词 + 课文文章`, detail: `「课程」→ 第${l}课：生词表朗读两遍，闪卡过一遍；看课文文章要点，用中文回答问题。`, min: ls.length === 3 ? 45 : 40 },
    { title: `第${l}课 语言点 + 小测`, detail: `学5个语言点，每个照例句自己造1句；做第${l}课小测（目标 8/10 以上），错词抄写3遍。`, min: ls.length === 3 ? 45 : 35 },
  ];
  const days: Task[] = [];
  if (ls.length === 2) {
    const a = ls[0] as number; const b = ls[1] as number;
    days.push({ title: `第${a}课 生词（前一半）+ 课文1–3`, detail: `「课程」→ 第${a}课：前15个生词朗读两遍、闪卡过一遍；看课文1–3要点，用中文回答问题。`, min: 40 });
    days.push({ title: `第${a}课 生词（后一半）+ 语言点`, detail: "后一半生词 + 5个语言点，每个照例句自己造1句；看课文4–5。", min: 40 });
    days.push({ title: `第${a}课 复习 + 小测`, detail: `闪卡打乱复习全部生词，做第${a}课小测（目标 8/10 以上），错词抄写3遍。`, min: 30 });
    days.push({ title: `第${b}课 生词（前一半）+ 课文1–3`, detail: `「课程」→ 第${b}课：前15个生词朗读两遍、闪卡过一遍；看课文1–3要点。`, min: 40 });
    days.push({ title: `第${b}课 生词（后一半）+ 语言点`, detail: "后一半生词 + 5个语言点，每个照例句自己造1句；看课文4–5。", min: 40 });
    days.push({ title: `第${b}课 复习 + 小测`, detail: `闪卡打乱复习，做第${b}课小测，错词抄写3遍。`, min: 30 });
  } else {
    ls.forEach((l: number) => { study(l).forEach((t: Task) => days.push(t)); });
  }
  days.push({ title: "本周复习 + 写作", detail: "本周各课闪卡混合复习；用本周语言点写一段不少于80字的短文（新版 HSK 3.0 写作题型）。", min: 40 });
  return days;
}

function strip(s: string): string { return s.replace(/[\s，。！？、,.!?“”"]/g, ""); }
const STORE = "hsk4-plan-v1";

function Opt({ label, state, onClick }: { label: string; state: "idle" | "sel" | "right" | "wrong" | "missed"; onClick: () => void }) {
  const t = useGrokTheme();
  const bg = state === "sel" ? t.fill.accentSubtle : state === "right" || state === "missed" ? t.fill.successSubtle : state === "wrong" ? t.fill.dangerSubtle : "transparent";
  const bd = state === "sel" ? t.border.focus : t.border.default;
  const mark = state === "right" ? "  ✓" : state === "wrong" ? "  ✗" : state === "missed" ? "  ← 正确答案" : "";
  return (
    <button onClick={onClick} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: `1px solid ${bd}`, background: bg, color: t.text.primary, fontFamily: t.font.family, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, cursor: "pointer", width: "100%" }}>
      {label}{mark}
    </button>
  );
}

function QBlock({ q, idx, chosen, done, onPick }: { q: Q; idx: number; chosen: number | undefined; done: boolean; onPick: (i: number) => void }) {
  const t = useGrokTheme();
  const letters = ["A", "B", "C", "D", "E", "F"];
  return (
    <div style={{ padding: "14px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, marginBottom: 6 }}>{idx}. {q.kind}</div>
      {q.passage ? <div style={{ color: t.text.secondary, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, marginBottom: 6 }}>{q.passage}</div> : null}
      <div style={{ color: t.text.primary, fontSize: q.kind.startsWith("看汉字") ? "28px" : t.font.body1.fontSize, lineHeight: q.kind.startsWith("看汉字") ? "36px" : t.font.body1.lineHeight, marginBottom: 10 }}>{q.stem}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
        {q.opts.map((o: string, i: number) => {
          let st: "idle" | "sel" | "right" | "wrong" | "missed" = chosen === i ? "sel" : "idle";
          if (done) st = i === q.a ? (chosen === i ? "right" : "missed") : chosen === i ? "wrong" : "idle";
          return <Opt key={i} label={q.opts.length > 2 ? `${letters[i]}  ${o}` : o} state={st} onClick={() => { if (!done) onPick(i); }} />;
        })}
      </div>
    </div>
  );
}

function OrdBlock({ q, idx, order, done, onChange }: { q: OrdQ; idx: number; order: number[]; done: boolean; onChange: (o: number[]) => void }) {
  const t = useGrokTheme();
  const built = order.map((i: number) => q.tiles[i] ?? "").join("");
  const ok = q.answers.some((a: string) => strip(a) === strip(built));
  const tile = (label: string, onClick: () => void, key: number, active: boolean) => (
    <button key={key} onClick={onClick} disabled={!active} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.border.default}`, background: active ? t.bg.elevated : t.fill.secondary, color: active ? t.text.primary : t.text.tertiary, fontFamily: t.font.family, fontSize: t.font.body1.fontSize, cursor: active ? "pointer" : "default" }}>{label}</button>
  );
  return (
    <div style={{ padding: "14px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, marginBottom: 6 }}>{idx}. 完成句子（点词语排成一句话）</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {q.tiles.map((w: string, i: number) => tile(w, () => { if (!done) onChange([...order, i]); }, i, !done && !order.includes(i)))}
      </div>
      <div style={{ minHeight: 40, padding: "8px 12px", borderRadius: 8, border: `1px dashed ${t.border.strong}`, color: t.text.primary, fontSize: t.font.body1.fontSize, background: done ? (ok ? t.fill.successSubtle : t.fill.dangerSubtle) : "transparent" }}>
        {built ? `${built}。` : "（你的句子）"}{done ? (ok ? "  ✓" : "  ✗") : ""}
      </div>
      {done && !ok ? <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, marginTop: 6 }}>参考答案：{q.answers.join(" ／ ")}。</div> : null}
      {!done ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <Button label="撤销一个" onClick={() => onChange(order.slice(0, -1))} />
          <Button label="清空" onClick={() => onChange([])} />
        </div>
      ) : null}
    </div>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const t = useGrokTheme();
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ height: 10, borderRadius: 9999, background: t.fill.secondary, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: t.dataviz.categorical[0] }} />
      </div>
      <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, marginTop: 6 }}>已完成 {value} / {total} 天（{pct}%）</div>
    </div>
  );
}

function DayRow({ n, task, done, onToggle }: { n: number; task: Task; done: boolean; onToggle: () => void }) {
  const t = useGrokTheme();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ flex: "1 1 240px" }}>
        <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, fontWeight: t.weight.medium, textDecoration: done ? "line-through" : "none" }}>第{n}天 · {task.title}</div>
        <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 2 }}>{task.detail} 约{task.min}分钟</div>
      </div>
      <Button label={done ? "✓ 已完成" : "标记完成"} variant={done ? "primary" : "quiet"} onClick={onToggle} />
    </div>
  );
}

function Flashcards({ words }: { words: Word[] }) {
  const t = useGrokTheme();
  const [i, setI] = useState<number>(0);
  const [flip, setFlip] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(0);
  const deck = useMemo(() => (seed === 0 ? words : shuffle(words, rng(seed))), [words, seed]);
  const w = deck[i % Math.max(deck.length, 1)];
  if (!w) return null;
  return (
    <div>
      <div onClick={() => setFlip(!flip)} style={{ cursor: "pointer", border: `1px solid ${t.border.default}`, borderRadius: 16, padding: "36px 20px", textAlign: "center", background: t.bg.elevated, minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}><div lang="zh-Hans" style={{ fontSize: "44px", lineHeight: "52px", color: t.text.primary }}>{w.h}</div><SpeakBtn items={wordAudio(w.h)} k={"w:" + w.h} size={40} /></div>
        {flip ? (
          <div>
            <div style={{ fontSize: "22px", lineHeight: "30px", color: t.text.primary }}>{w.p}</div>
            <div style={{ fontSize: t.font.body1.fontSize, color: t.text.secondary, marginTop: 4 }}>{w.pos ? `${w.pos} ` : ""}{w.m}</div>
          </div>
        ) : (
          <div style={{ fontSize: t.font.label.fontSize, color: t.text.tertiary }}>点卡片看拼音和释义</div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}>
        <Button label="上一张" onClick={() => { setI((i - 1 + deck.length) % deck.length); setFlip(false); }} />
        <Button label={flip ? "盖住" : "翻面"} variant="primary" onClick={() => setFlip(!flip)} />
        <Button label="下一张" onClick={() => { if ((i + 1) % deck.length === 0 && deck[0]) petEvent("cards", { lesson: (deck[0] as Word).l }); setI((i + 1) % deck.length); setFlip(false); }} />
        <Button label="打乱顺序" onClick={() => { setSeed(Math.floor(Math.random() * 100000) + 1); setI(0); setFlip(false); }} />
        <span style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize }}>{(i % deck.length) + 1} / {deck.length}</span>
      </div>
    </div>
  );
}

export default function App() {
  const t = useGrokTheme();
  const [tab, setTab] = useState<string>("plan");
  useEffect(() => { const f = (e: Event) => { const d = (e as CustomEvent).detail; if (typeof d === "string") { setTab(d); setTimeout(() => { const el = document.getElementById("pet-top"); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50); } }; window.addEventListener("hsk4-goto", f); return () => window.removeEventListener("hsk4-goto", f); }, []);
  const [week, setWeek] = useState<string>("0");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [lesson, setLesson] = useState<string>("1");
  const [view, setView] = useState<string>("words");
  const [pAns, setPAns] = useState<Record<string, number>>({});
  const [pOrd, setPOrd] = useState<Record<string, number[]>>({});
  const [pDone, setPDone] = useState<boolean>(false);
  const [qLesson, setQLesson] = useState<string>("1");
  const [qSeed, setQSeed] = useState<number>(1);
  const [qAns, setQAns] = useState<Record<string, number>>({});
  const [qDone, setQDone] = useState<boolean>(false);

  useEffect(() => {
    try { const raw = window.localStorage.getItem(STORE); if (raw) setDone(JSON.parse(raw) as Record<string, boolean>); } catch (e) { /* storage unavailable */ }
  }, []);
  const toggleDay = (key: string) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    if (next[key]) petEvent("task", { key });
    try { window.localStorage.setItem(STORE, JSON.stringify(next)); } catch (e) { /* storage unavailable */ }
  };

  const wk = Number(week);
  const tasks = weekTasks(wk);
  const totalDays = 70;
  const doneCount = Object.keys(done).filter((k: string) => done[k]).length;
  const weekOpts = WEEKS.map((ls: number[], i: number) => ({ value: String(i), label: ls.length ? `第${i + 1}周 · 第${ls.join("、")}课` : `第${i + 1}周 · 全真模拟` }));
  const lessonOpts = TITLES.map((tt: [string, string], i: number) => ({ value: String(i + 1), label: `第${i + 1}课 ${tt[0]}` }));

  const L = Number(lesson);
  const lw = WORDS.filter((w: Word) => w.l === L);
  const lt = TEXTS.filter((x) => x.l === L);
  const lg = GRAM.filter((g) => g.l === L);
  const title = TITLES[L - 1] ?? ["", ""];

  const quiz = useMemo(() => genQuiz(Number(qLesson), qSeed), [qLesson, qSeed]);
  const qScore = quiz.filter((q: Q) => qAns[q.id] === q.a).length;

  const secScore = (sec: "listen" | "read") => PLACE.filter((q: Q) => q.sec === sec && pAns[q.id] === q.a).length;
  const wScore = ORD.filter((q: OrdQ) => { const o = pOrd[q.id] ?? []; const b = o.map((i: number) => q.tiles[i] ?? "").join(""); return q.answers.some((a: string) => strip(a) === strip(b)); }).length;
  const ls = secScore("listen"); const rs = secScore("read");
  const estL = Math.round((ls / 10) * 100); const estR = Math.round((rs / 15) * 100); const estW = Math.round((wScore / 5) * 100);
  const est = estL + estR + estW;
  const answered = Object.keys(pAns).length + ORD.filter((q: OrdQ) => (pOrd[q.id] ?? []).length > 0).length;

  return (
    <Page title="HSK 4 系统学习：10 周计划 · 20 课 · 测试" summary="按《HSK标准教程4》上下册 20 课整理：每天 30–45 分钟的 10 周计划、全部 602 个生词（闪卡）、100 个语言点、水平测试和每课小测。新版 HSK 3.0 已于 2026 年 12 月 13 日启用，题型见「考试须知」。" width="column" lang="zh-Hans">
      <Segmented options={[{ value: "plan", label: "学习计划" }, { value: "read", label: "课文文章 · Texts" }, { value: "lessons", label: "课程" }, { value: "quiz", label: "每课小测" }, { value: "test", label: "随机水平测验 · Random Level Test" }, { value: "exam", label: "考试须知" }, ...(PET_ON ? [{ value: "pet", label: "我的宠物 · My Pet" }] : [])]} value={tab} onChange={(v: string) => setTab(v)} />

      {tab === "plan" ? (
        <Section heading="10 周学习计划">
          <ProgressBar value={doneCount} total={totalDays} />
          <Select label="选择周" options={weekOpts} value={week} onChange={(v: string) => setWeek(v)} />
          <div>
            {tasks.map((task: Task, d: number) => (
              <DayRow key={`${wk}-${d}`} n={d + 1} task={task} done={!!done[`${wk}-${d}`]} onToggle={() => toggleDay(`${wk}-${d}`)} />
            ))}
          </div>
          <Text>第1–7周每周2课，第8–9周每周3课，第10周做全真模拟。开始前先做一次「随机水平测验」，第10周再做一次对比。进度保存在这台设备的浏览器里；如果浏览器不允许保存，关闭页面后会重置。</Text>
        </Section>
      ) : null}

      {tab === "read" ? <Reader lang="en" titles={TITLES} /> : null}

      {tab === "lessons" ? (
        <Section heading={`第${L}课 ${title[0]}`} caption={`${title[1]} · ${L <= 10 ? "4上" : "4下"} · ${lw.length} 个生词`}>
          <Select label="选择课" options={lessonOpts} value={lesson} onChange={(v: string) => { setLesson(v); }} />
          <Segmented options={[{ value: "words", label: "生词", count: lw.length }, { value: "cards", label: "闪卡" }, { value: "grammar", label: "语言点" }, { value: "texts", label: "课文" }]} value={view} onChange={(v: string) => setView(v)} />
          {view === "words" ? (
            <Table columns={["汉字", "拼音", "词性", "释义"]} rows={lw.map((w: Word) => [<span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}><SpeakBtn items={wordAudio(w.h)} k={"w:" + w.h} size={28} /><span lang="zh-Hans" style={{ fontSize: 17 }}>{w.h}</span></span>, w.p, w.pos || "—", w.m])} align={["start", "start", "start", "start"]} />
          ) : null}
          {view === "cards" ? <Flashcards key={`fc-${L}`} words={lw} /> : null}
          {view === "grammar" ? (
            <Rows rows={lg.map((g, i: number) => ({ lead: String(i + 1), title: g.point, detail: g.ex }))} />
          ) : null}
          {view === "texts" ? (
            <Rows rows={lt.map((x) => ({ lead: `课文${x.n}`, title: x.title, detail: x.q ? `要点问题：${x.q}` : undefined }))} />
          ) : null}
          {view === "texts" && PARTIAL[L] ? <Callout tone="info">本课部分内容：{PARTIAL[L]}。生词和语言点是完整的。</Callout> : null}
        </Section>
      ) : null}

      {tab === "pet" && PET_ON ? <PetTab /> : null}

      {tab === "test" ? <RandomTest lang="en" /> : null}

      {tab === "__old_test" ? (
        <Section heading="水平测试（30题）" caption="没有音频，「听力」用阅读形式的判断对错代替。词汇和语言点全部来自教材。">
          {PLACE.map((q: Q, i: number) => (
            <Fragment2 key={q.id}>
              {i === 0 ? <SubHead text="一、听力（替代）· 判断对错" /> : null}
              {i === 10 ? <SubHead text={`二、阅读 · 选词填空（词语：${BANK.map((b: string, k: number) => `${"ABCDEF"[k]} ${b}`).join("　")}）`} /> : null}
              {i === 15 ? <SubHead text="二、阅读 · 排列顺序" /> : null}
              {i === 20 ? <SubHead text="二、阅读 · 短文理解" /> : null}
              <QBlock q={q} idx={i + 1} chosen={pAns[q.id]} done={pDone} onPick={(k: number) => setPAns({ ...pAns, [q.id]: k })} />
            </Fragment2>
          ))}
          <SubHead text="三、书写 · 完成句子" />
          {ORD.map((q: OrdQ, i: number) => (
            <OrdBlock key={q.id} q={q} idx={26 + i} order={pOrd[q.id] ?? []} done={pDone} onChange={(o: number[]) => setPOrd({ ...pOrd, [q.id]: o })} />
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {!pDone ? <Button label="交卷看成绩" variant="primary" onClick={() => setPDone(true)} /> : <Button label="重新做" onClick={() => { setPDone(false); setPAns({}); setPOrd({}); }} />}
            <span style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize }}>已作答 {answered} / 30</span>
          </div>
          {pDone ? (
            <Table columns={["部分", "答对", "折算（满分100）"]} rows={[["听力（替代）", `${ls} / 10`, String(estL)], ["阅读", `${rs} / 15`, String(estR)], ["书写", `${wScore} / 5`, String(estW)], ["合计", `${ls + rs + wScore} / 30`, `${est} / 300`]]} emphasis={3} />
          ) : null}
          {pDone ? (
            <Callout tone={est >= 180 ? "success" : "warning"} lead={`估计成绩 ${est} / 300（合格线 180）`}>这是按本测验正确率折算的粗略估计，不是官方分数换算；题量小、没有真实听力，误差很大。{est >= 180 ? "目前已接近合格水平，按计划巩固并多做官方样题。" : "按 10 周计划从第1课开始，每周做小测，第10周再测一次。"}</Callout>
          ) : null}
        </Section>
      ) : null}

      {tab === "quiz" ? (
        <Section heading={`第${qLesson}课 小测（10题）`} caption="8题词汇（意思、汉字、拼音）+ 2题语言点填空，全部取自本课。">
          <Select label="选择课" options={lessonOpts} value={qLesson} onChange={(v: string) => { setQLesson(v); setQAns({}); setQDone(false); setQSeed(1); }} />
          {quiz.map((q: Q, i: number) => (
            <QBlock key={`${qSeed}-${q.id}`} q={q} idx={i + 1} chosen={qAns[q.id]} done={qDone} onPick={(k: number) => setQAns((a: Record<string, number>) => ({ ...a, [q.id]: k }))} />
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {!qDone ? <Button label="交卷" variant="primary" onClick={() => { setQDone(true); petEvent("quiz", { lesson: Number(qLesson), score: qScore, wrong: PET_ON ? quizWrong(quiz, qAns) : [] }); }} /> : <Button label="换一套题" variant="primary" onClick={() => { setQSeed(qSeed + 1); setQAns({}); setQDone(false); }} />}
            <Button label="重做本套" onClick={() => { setQAns({}); setQDone(false); }} />
            {qDone ? <span style={{ color: t.text.primary, fontSize: t.font.body1.fontSize }}>得分 {qScore} / 10{qScore >= 8 ? "，不错！" : "，把错词放进闪卡多复习几遍。"}</span> : null}
          </div>
        </Section>
      ) : null}

      {tab === "exam" ? (
        <Section heading="考试须知">
          <Callout tone="warning" lead="注意：新版 HSK 3.0 已启用">官方公告：3.0 版 HSK 于 2026 年 12 月 13 日全球正式开考。按 10 周计划，你参加的将是新版考试；教材按旧版大纲编写，第10周请用官方 HSK 3.0 样题熟悉新题型。</Callout>
          <Section heading="新版 HSK 四级（3.0）题型">
            <Table columns={["部分", "题数", "时间（分钟）"]} rows={[["听力 第一部分", "14", "约20（听力合计）"], ["听力 第二部分", "18", ""], ["填写答题卡", "—", "5"], ["阅读 第一部分", "10", "30（阅读合计）"], ["阅读 第二部分", "15", ""], ["阅读 第三部分", "7", ""], ["写作 第一部分", "5", "25（写作合计）"], ["写作 第二部分", "1", ""], ["合计", "70", "80"]]} emphasis={8} />
            <Text>官网表格合计 80 分钟；纸笔考另有约 5 分钟填写个人信息，全程约 85 分钟。官方样卷中，写作第一部分是看图用词造句，第二部分是一篇不少于 80 字的短文。2026 年 9 月的试行考试要求四级笔试与口语同时报名（口语约 20 分钟），正式考试请以报名页面为准。</Text>
          </Section>
          <Section heading="分数">
            <Properties items={[{ label: "满分", value: "300 分（听力、阅读、写作各一项分数 + 总分）" }, { label: "合格线", value: "总分 180 分" }, { label: "成绩有效期", value: "两年（从考试当日算起）" }, { label: "开考时间", value: "当地时间 09:00" }]} />
          </Section>
          <Section heading="旧版 HSK 四级（2.0，供参考）">
            <Table columns={["部分", "题数", "时间（分钟）"]} rows={[["听力（判断对错 10 + 对话 15 + 长对话/短文 20）", "45", "约30"], ["填写答题卡", "—", "5"], ["阅读（选词填空 10 + 排列顺序 10 + 短文理解 20）", "40", "40"], ["书写（完成句子 10 + 看图用词造句 5）", "15", "25"], ["合计", "100", "约100（全程约105）"]]} emphasis={4} />
            <Text>本页「随机水平测验」从约2100题的题库里每次随机抽30题（词义、拼音、选词填空、语法、阅读），用来检查自己目前的水平；它不是官方题型，也没有听力。</Text>
          </Section>
          <LinkCards links={[
            { title: "HSK (Level 4) 考试结构", site: "chinesetest.cn", href: "https://www.chinesetest.cn/HSK/4" },
            { title: "3.0版HSK将于12月13日正式开考", site: "chinesetest.cn", href: "https://admin.chinesetest.cn/gonewcontent.do?id=51336724" },
            { title: "HSK3.0第二轮全球试行考试通知", site: "chinesetest.cn", href: "https://admin.chinesetest.cn/gonewcontent.do?id=51236758" },
            { title: "HSK（四级）旧版样卷", site: "chinesetest.cn", href: "http://download.chinesetest.cn/newhsk-site/model/HSK4_yj.pdf" },
          ]} />
        </Section>
      ) : null}
    </Page>
  );
}

function Fragment2({ children }: { children?: import("grok/canvas").ReactNode }) { return <div>{children}</div>; }
function SubHead({ text }: { text: string }) {
  const t = useGrokTheme();
  return <div style={{ color: t.text.primary, fontSize: t.font.heading3.fontSize, lineHeight: t.font.heading3.lineHeight, fontWeight: t.weight.semibold, marginTop: 18 }}>{text}</div>;
}
