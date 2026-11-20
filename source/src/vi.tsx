import { Page, Section, Text, Segmented, Select, Button, Callout, Table, Properties, LinkCards, Rows, useState, useMemo, useEffect, useGrokTheme } from "grok/canvas";
import type { ReactNode } from "grok/canvas";
import { Reader } from "./reader";
import { SpeakBtn, wordAudio } from "./audio";
import { RandomTest } from "./rtest";
import { PET_ON, PetTab, petEvent, quizWrong } from "./pet";

type Word = { h: string; p: string; pos: string; v: string; hv: string; l: number };
type Q = { id: string; sec: "listen" | "read" | "write"; kind: string; passage?: string; stem: string; opts: string[]; a: number; ex?: string };
type OrdQ = { id: string; tiles: string[]; answers: string[]; ex: string };

const WRAW = `爱情|àiqíng|n.|tình yêu (nam nữ)|ái tình|1
不仅|bùjǐn|conj.|không chỉ, không những|bất cận|1
从来|cónglái|adv.|từ trước đến nay, xưa nay|tòng lai|1
法律|fǎlǜ|n.|pháp luật|pháp luật|1
感动|gǎndòng|v.|cảm động, xúc động|cảm động|1
刚|gāng|adv.|vừa mới|cương|1
共同|gòngtóng|adj.|chung, cùng nhau||1
够|gòu|v.|đủ||1
互相|hùxiāng|adv.|lẫn nhau|hỗ tương|1
即使|jíshǐ|conj.|cho dù, dù cho|tức sử|1
加班|jiā bān|v.|làm thêm giờ, tăng ca|gia ban|1
接受|jiēshòu|v.|tiếp nhận, chấp nhận|tiếp thụ|1
开玩笑|kāi wánxiào||nói đùa, đùa giỡn|khai ngoạn tiếu|1
浪漫|làngmàn|adj.|lãng mạn|lãng mạn|1
俩|liǎ|num.-m.|hai người, cả hai||1
脾气|píqi|n.|tính khí, tính tình|tì khí|1
缺点|quēdiǎn|n.|khuyết điểm, nhược điểm|khuyết điểm|1
深|shēn|adj.|sâu|thâm|1
生活|shēnghuó|n./v.|cuộc sống; sống, sinh hoạt|sinh hoạt|1
适合|shìhé|v.|thích hợp, phù hợp|thích hợp|1
熟悉|shúxi|v.|quen thuộc, hiểu rõ|thục tất|1
吸引|xīyǐn|v.|thu hút, hấp dẫn|hấp dẫn|1
羡慕|xiànmù|v.|ngưỡng mộ, hâm mộ|tiện mộ|1
幸福|xìngfú|adj.|hạnh phúc|hạnh phúc|1
性格|xìnggé|n.|tính cách|tính cách|1
印象|yìnxiàng|n.|ấn tượng|ấn tượng|1
幽默|yōumò|adj.|hài hước|u mặc|1
原因|yuányīn|n.|nguyên nhân, lý do|nguyên nhân|1
自然|zìrán|adv.|tự nhiên, đương nhiên|tự nhiên|1
最好|zuìhǎo|adv.|tốt nhất là, tốt hơn hết là|tối hảo|1
毕业|bì yè|v.|tốt nghiệp|tất nghiệp|2
差不多|chàbuduō|adv.|gần như, xấp xỉ|sai bất đa|2
重新|chóngxīn|adv.|lại, làm lại từ đầu|trùng tân|2
当|dāng|prep.|khi, lúc (vào thời điểm/nơi nào đó)|đương|2
短信|duǎnxìn|n.|tin nhắn|đoản tín|2
而|ér|conj.|mà, còn (chỉ sự tương phản)|nhi|2
丰富|fēngfù|v.|làm phong phú|phong phú|2
逛|guàng|v.|đi dạo, dạo chơi||2
好像|hǎoxiàng|adv.|hình như, dường như|hảo tượng|2
及时|jíshí|adv.|kịp thời|cập thời|2
交|jiāo|v.|kết (bạn)|giao|2
交流|jiāoliú|v.|giao lưu, trao đổi|giao lưu|2
尽管|jǐnguǎn|conj.|mặc dù, tuy rằng|tận quản|2
镜子|jìngzi|n.|cái gương|kính tử|2
聚会|jùhuì|v./n.|tụ họp; buổi họp mặt, buổi tiệc|tụ hội|2
困难|kùnnan|n.|khó khăn|khốn nan|2
理解|lǐjiě|v.|hiểu, thấu hiểu|lý giải|2
联系|liánxì|v.|liên lạc, liên hệ|liên hệ|2
麻烦|máfan|v.|làm phiền|ma phiền|2
陪|péi|v.|đi cùng, ở bên cạnh|bồi|2
平时|píngshí|n.|ngày thường|bình thời|2
却|què|adv.|nhưng, lại|khước|2
适应|shìyìng|v.|thích nghi, thích ứng|thích ứng|2
讨厌|tǎoyàn|v.|ghét, chán ghét|thảo yếm|2
无聊|wúliáo|adj.|buồn chán, nhàm chán|vô liêu|2
友谊|yǒuyì|n.|tình bạn, tình hữu nghị|hữu nghị|2
真正|zhēnzhèng|adj.|thật sự, chân chính|chân chính|2
正好|zhènghǎo|adv.|vừa đúng lúc, vừa vặn|chính hảo|2
周围|zhōuwéi|n.|xung quanh||2
专门|zhuānmén|adv.|chuyên, dành riêng (đặc biệt)||2
安排|ānpái|v.|sắp xếp, bố trí|an bài|3
本来|běnlái|adv.|vốn dĩ, ban đầu|bản lai|3
不管|bùguǎn|conj.|bất kể, cho dù|bất quản|3
材料|cáiliào|n.|tài liệu, vật liệu|tài liệu|3
诚实|chéngshí|adj.|thành thật, trung thực|thành thực|3
符合|fúhé|v.|phù hợp với|phù hợp|3
负责|fùzé|v.|phụ trách, chịu trách nhiệm|phụ trách|3
改变|gǎibiàn|v.|thay đổi|cải biến|3
感觉|gǎnjué|n.|cảm giác|cảm giác|3
顾客|gùkè|n.|khách hàng|cố khách|3
紧张|jǐnzhāng|adj.|căng thẳng, hồi hộp||3
另外|lìngwài|conj.|ngoài ra|lánh ngoại|3
留|liú|v.|để lại|lưu|3
律师|lǜshī|n.|luật sư|luật sư|3
能力|nénglì|n.|năng lực, khả năng|năng lực|3
判断|pànduàn|v.|phán đoán, đánh giá|phán đoán|3
其次|qícì|pron.|thứ hai, tiếp theo|kỳ thứ|3
收入|shōurù|n.|thu nhập|thu nhập|3
首先|shǒuxiān|pron.|trước tiên, đầu tiên|thủ tiên|3
提供|tígōng|v.|cung cấp|đề cung|3
挺|tǐng|adv.|khá, rất|đĩnh|3
通知|tōngzhī|v.|thông báo|thông tri|3
信心|xìnxīn|n.|lòng tin, sự tự tin|tín tâm|3
应聘|yìngpìn|v.|ứng tuyển, xin việc|ứng sính|3
与|yǔ|prep.|với, và|dữ|3
约会|yuēhuì|v.|hẹn hò, cuộc hẹn|ước hội|3
咱们|zánmen|pron.|chúng ta||3
招聘|zhāopìn|v.|tuyển dụng|chiêu sính|3
正式|zhèngshì|adj.|chính thức|chính thức|3
专业|zhuānyè|n.|chuyên ngành||3
准时|zhǔnshí|adj.|đúng giờ|chuẩn thời|3
按时|ànshí|adv.|đúng giờ, đúng hạn|án thời|4
按照|ànzhào|prep.|theo, dựa theo|án chiếu|4
保证|bǎozhèng|v.|bảo đảm|bảo chứng|4
不得不|bù dé bù||đành phải, buộc phải|bất đắc bất|4
成功|chénggōng|adj.|thành công|thành công|4
调查|diàochá|v.|điều tra, khảo sát|điều tra|4
方法|fāngfǎ|n.|phương pháp, cách làm|phương pháp|4
份|fèn|m.|phần, suất (lượng từ cho công việc…)|phần|4
感谢|gǎnxiè|v.|cảm ơn, biết ơn|cảm tạ|4
工资|gōngzī|n.|tiền lương|công tư|4
积累|jīlěi|v.|tích lũy|tích lũy|4
计划|jìhuà|n./v.|kế hoạch; dự định|kế hoạch|4
奖金|jiǎngjīn|n.|tiền thưởng|tưởng kim|4
经验|jīngyàn|n.|kinh nghiệm|kinh nghiệm|4
乱|luàn|adj.|lộn xộn, rối loạn|loạn|4
甚至|shènzhì|conj.|thậm chí|thậm chí|4
生意|shēngyi|n.|việc kinh doanh, buôn bán|sinh ý|4
顺利|shùnlì|adj.|thuận lợi, suôn sẻ|thuận lợi|4
谈|tán|v.|nói chuyện, bàn bạc|đàm|4
提|tí|v.|nhắc đến|đề|4
提前|tíqián|v.|làm trước, trước thời hạn|đề tiền|4
提醒|tí xǐng|v.|nhắc nhở|đề tỉnh|4
完全|wánquán|adv.|hoàn toàn|hoàn toàn|4
消息|xiāoxi|n.|tin tức|tiêu tức|4
一切|yíqiè|pron.|tất cả, mọi thứ||4
以为|yǐwéi|v.|tưởng rằng, cho rằng|dĩ vi|4
原来|yuánlái|adj.|ban đầu, vốn có|nguyên lai|4
责任|zérèn|n.|trách nhiệm|trách nhiệm|4
知识|zhīshi|n.|kiến thức, tri thức|tri thức|4
赚|zhuàn|v.|kiếm (tiền)||4
标准|biāozhǔn|n.|tiêu chuẩn|tiêu chuẩn|5
打折|dǎ zhé|v.|giảm giá|đả chiết|5
购物|gòu wù||mua sắm|cấu vật|5
光|guāng|adv.|chỉ, chỉ có|quang|5
广告|guǎnggào|n.|quảng cáo|quảng cáo|5
寄|jì|v.|gửi (qua bưu điện)|ký|5
家具|jiājù|n.|đồ nội thất|gia cụ|5
价格|jiàgé|n.|giá cả|giá cách|5
考虑|kǎolǜ|v.|cân nhắc, suy nghĩ|khảo lự|5
肯定|kěndìng|adv.|chắc chắn, nhất định|khẳng định|5
浪费|làngfèi|v.|lãng phí|lãng phí|5
流行|liúxíng|v.|thịnh hành, đang mốt|lưu hành|5
年龄|niánlíng|n.|tuổi tác|niên linh|5
葡萄|pútao|n.|quả nho|bồ đào|5
任何|rènhé|pron.|bất kỳ|nhậm hà|5
沙发|shāfā|n.|ghế sofa||5
实际|shíjì|n.|thực tế|thực tế|5
实在|shízài|adv.|thật sự, quả thật||5
受到|shòudào|v.|nhận được, được (chịu)|thụ đáo|5
顺便|shùnbiàn|adv.|tiện thể, nhân tiện||5
台|tái|m.|chiếc, cái (lượng từ cho máy móc)|đài|5
味道|wèidào|n.|mùi vị, hương vị|vị đạo|5
现金|xiànjīn|n.|tiền mặt|hiện kim|5
效果|xiàoguǒ|n.|hiệu quả|hiệu quả|5
样子|yàngzi|n.|dáng vẻ, kiểu dáng|dạng tử|5
邀请|yāoqǐng|v.|mời|yêu thỉnh|5
艺术|yìshù|n.|nghệ thuật|nghệ thuật|5
优点|yōudiǎn|n.|ưu điểm|ưu điểm|5
尤其|yóuqí|adv.|nhất là, đặc biệt là|vưu kỳ|5
质量|zhìliàng|n.|chất lượng|chất lượng|5
百分之|bǎi fēn zhī||phần trăm|bách phân chi|6
倍|bèi|m.|lần, gấp (bội)|bội|6
尝|cháng|v.|nếm thử|thường|6
打扰|dǎrǎo|v.|làm phiền, quấy rầy|đả nhiễu|6
方面|fāngmiàn|n.|phương diện, mặt|phương diện|6
各|gè|pron.|các, mỗi|các|6
果汁|guǒzhī|n.|nước ép trái cây|quả trấp|6
好处|hǎochù|n.|lợi ích, điều tốt|hảo xứ|6
活动|huódòng|n.|hoạt động, sự kiện|hoạt động|6
获得|huòdé|v.|giành được, đạt được|hoạch đắc|6
降低|jiàngdī|v.|hạ thấp, giảm xuống|giáng đê|6
竟然|jìngrán|adv.|vậy mà, không ngờ|cánh nhiên|6
举办|jǔbàn|v.|tổ chức|cử biện|6
举行|jǔxíng|v.|tổ chức, cử hành (cuộc họp, sự kiện)|cử hành|6
例如|lìrú|v.|ví dụ như|lệ như|6
满|mǎn|v.|đủ, đạt mức (hạn định)|mãn|6
免费|miǎn fèi|v.|miễn phí|miễn phí|6
内|nèi|n.|trong, trong vòng|nội|6
皮肤|pífū|n.|da|bì phu|6
其中|qízhōng|n.|trong đó|kỳ trung|6
轻|qīng|adj.|nhẹ|khinh|6
情况|qíngkuàng|n.|tình hình, tình huống|tình huống|6
售货员|shòuhuòyuán|n.|nhân viên bán hàng|thụ hóa viên|6
所有|suǒyǒu|adj.|tất cả||6
袜子|wàzi|n.|tất, vớ||6
西红柿|xīhóngshì|n.|cà chua||6
小说|xiǎoshuō|n.|tiểu thuyết|tiểu thuyết|6
修理|xiūlǐ|v.|sửa chữa|tu lý|6
支持|zhīchí|v.|ủng hộ|chi trì|6
值得|zhídé|v.|đáng, xứng đáng|trị đắc|6
擦|cā|v.|lau|sát|7
超过|chāoguò|v.|vượt quá|siêu quá|7
抽烟|chōu yān||hút thuốc|trừu yên|7
出现|chūxiàn|v.|xuất hiện|xuất hiện|7
窗户|chuānghu|n.|cửa sổ|song hộ|7
大夫|dàifu|n.|bác sĩ|đại phu|7
掉|diào|v.|mất, rơi (bổ ngữ kết quả sau động từ)|điệu|7
动作|dòngzuò|n.|động tác|động tác|7
肚子|dùzi|n.|bụng|đỗ tử|7
烦恼|fánnǎo|adj.|phiền não, buồn phiền|phiền não|7
反对|fǎnduì|v.|phản đối|phản đối|7
感情|gǎnqíng|n.|tình cảm|cảm tình|7
估计|gūjì|v.|ước tính, đoán chừng|cổ kế|7
后悔|hòuhuǐ|v.|hối hận|hậu hối|7
减肥|jiǎn féi|v.|giảm cân|giảm phì|7
教授|jiàoshòu|n.|giáo sư|giáo thụ|7
咳嗽|késou|v.|ho|khái thấu|7
空气|kōngqì|n.|không khí|không khí|7
来不及|láibují|v.|không kịp|lai bất cập|7
气候|qìhòu|n.|khí hậu|khí hậu|7
散步|sàn bù|v.|đi dạo, tản bộ|tản bộ|7
数字|shùzì|n.|con số|số tự|7
帅|shuài|adj.|đẹp trai|soái|7
说明|shuōmíng|v.|giải thích, cho thấy|thuyết minh|7
辛苦|xīnkǔ|adj.|vất vả|tân khổ|7
严重|yánzhòng|adj.|nghiêm trọng|nghiêm trọng|7
研究|yánjiū|v.|nghiên cứu|nghiên cứu|7
要是|yàoshi|conj.|nếu như|yếu thị|7
植物|zhíwù|n.|thực vật, cây cối|thực vật|7
指|zhǐ|v.|chỉ, ám chỉ|chỉ|7
成为|chéngwéi|v.|trở thành|thành vi|8
大使馆|dàshǐguǎn|n.|đại sứ quán|đại sứ quán|8
到处|dàochù|adv.|khắp nơi|đáo xứ|8
堵车|dǔ chē|v.|tắc đường, kẹt xe|đổ xa|8
发生|fāshēng|v.|xảy ra, phát sinh|phát sinh|8
放松|fàngsōng|v.|thư giãn, thả lỏng|phóng tùng|8
回忆|huíyì|v.|hồi tưởng, nhớ lại|hồi ức|8
积极|jījí|adj.|tích cực|tích cực|8
景色|jǐngsè|n.|cảnh sắc, phong cảnh|cảnh sắc|8
距离|jùlí|n.|khoảng cách|cự ly|8
科学|kēxué|n.|khoa học|khoa học|8
耐心|nàixīn|n.|sự kiên nhẫn|nại tâm|8
巧克力|qiǎokèlì|n.|sô-cô-la||8
亲戚|qīnqi|n.|họ hàng, bà con|thân thích|8
缺少|quēshǎo|v.|thiếu|khuyết thiểu|8
伤心|shāng xīn|adj.|đau lòng, buồn bã|thương tâm|8
生命|shēngmìng|n.|sinh mệnh, sự sống|sinh mệnh|8
师傅|shīfu|n.|bác, thầy (cách gọi lịch sự người thợ lành nghề)|sư phó|8
使|shǐ|v.|khiến, làm cho|sử|8
态度|tàidu|n.|thái độ|thái độ|8
特点|tèdiǎn|n.|đặc điểm|đặc điểm|8
往往|wǎngwǎng|adv.|thường thường, thường hay|vãng vãng|8
心情|xīnqíng|n.|tâm trạng|tâm tình|8
压力|yālì|n.|áp lực|áp lực|8
阳光|yángguāng|adj.|tươi sáng, lạc quan|dương quang|8
因此|yīncǐ|conj.|vì vậy, do đó|nhân thử|8
愉快|yúkuài|adj.|vui vẻ|du khoái|8
证明|zhèngmíng|v.|chứng minh|chứng minh|8
只要|zhǐyào|conj.|chỉ cần|chỉ yếu|8
饼干|bǐnggān|n.|bánh quy|bính can|9
当时|dāngshí|n.|lúc đó, khi ấy|đương thời|9
得|děi|mod.|phải, cần phải|đắc|9
放弃|fàngqì|v.|từ bỏ|phóng khí|9
国际|guójì|n.|quốc tế|quốc tế|9
过程|guòchéng|n.|quá trình|quá trình|9
汗|hàn|n.|mồ hôi|hãn|9
坚持|jiānchí|v.|kiên trì|kiên trì|9
结果|jiéguǒ|n.|kết quả|kết quả|9
经历|jīnglì|v.|trải qua|kinh lịch|9
可是|kěshì|conj.|nhưng mà|khả thị|9
理想|lǐxiǎng|n.|lý tưởng|lý tưởng|9
难道|nándào|adv.|lẽ nào, chẳng lẽ (câu hỏi tu từ)|nan đạo|9
篇|piān|m.|bài (lượng từ cho bài văn, bài báo)|thiên|9
轻松|qīngsōng|adj.|nhẹ nhàng, thoải mái|khinh tùng|9
区别|qūbié|n.|sự khác biệt|khu biệt|9
取|qǔ|v.|lấy, giành lấy|thủ|9
失败|shībài|v.|thất bại|thất bại|9
随便|suíbiàn|adj.|tùy ý, tùy tiện|tùy tiện|9
通过|tōngguò|prep.|thông qua, bằng cách|thông qua|9
网球|wǎngqiú|n.|quần vợt, tennis|võng cầu|9
许多|xǔduō|num.|nhiều, rất nhiều|hứa đa|9
赢|yíng|v.|thắng|doanh|9
勇敢|yǒnggǎn|adj.|dũng cảm|dũng cảm|9
暂时|zànshí|n.|tạm thời|tạm thời|9
正确|zhèngquè|adj.|chính xác, đúng|chính xác|9
至少|zhìshǎo|adv.|ít nhất|chí thiểu|9
主意|zhǔyi / zhúyi|n.|ý tưởng, chủ ý|chủ ý|9
总结|zǒngjié|v.|tổng kết|tổng kết|9
作家|zuòjiā|n.|nhà văn|tác gia|9
比如|bǐrú|v.|ví dụ như|tỷ như|10
不过|búguò|conj.|nhưng, có điều|bất quá|10
答案|dá'àn|n.|đáp án|đáp án|10
等|děng|part.|v.v., vân vân|đẳng|10
低|dī|adj.|thấp|đê|10
发展|fāzhǎn|v.|phát triển|phát triển|10
翻译|fānyì|n.|người phiên dịch|phiên dịch|10
方向|fāngxiàng|n.|phương hướng|phương hướng|10
富|fù|adj.|giàu|phú|10
关键|guānjiàn|n.|then chốt, mấu chốt|quan kiện|10
建议|jiànyì|n.|đề nghị, lời khuyên|kiến nghị|10
将来|jiānglái|n.|tương lai|tương lai|10
经济|jīngjì|n.|kinh tế|kinh tế|10
空儿|kòngr|n.|thời gian rảnh||10
困|kùn|adj.|buồn ngủ|khốn|10
拉|lā|v.|kéo|lạp|10
礼拜天|lǐbàitiān|n.|chủ nhật|lễ bái thiên|10
母亲|mǔqīn|n.|mẹ, mẫu thân|mẫu thân|10
穷|qióng|adj.|nghèo|cùng|10
确实|quèshí|adv.|quả thật, đúng là|xác thực|10
硕士|shuòshì|n.|thạc sĩ|thạc sĩ|10
糖|táng|n.|đường, kẹo|đường|10
躺|tǎng|v.|nằm|thảng|10
条件|tiáojiàn|n.|điều kiện|điều kiện|10
橡皮|xiàngpí|n.|cục tẩy|tượng bì|10
兴奋|xīngfèn|adj.|phấn khích, hào hứng|hưng phấn|10
永远|yǒngyuǎn|adv.|mãi mãi, vĩnh viễn|vĩnh viễn|10
优秀|yōuxiù|adj.|xuất sắc, ưu tú|ưu tú|10
由于|yóuyú|conj.|do, bởi vì|do vu|10
职业|zhíyè|n.|nghề nghiệp|chức nghiệp|10
表示|biǎoshì|v.|biểu thị, bày tỏ|biểu thị|11
猜|cāi|v.|đoán|sai|11
词语|cíyǔ|n.|từ ngữ|từ ngữ|11
否则|fǒuzé|conj.|nếu không thì|phủ tắc|11
复杂|fùzá|adj.|phức tạp|phức tạp|11
精彩|jīngcǎi|adj.|đặc sắc, hấp dẫn|tinh thải|11
看法|kànfǎ|n.|quan điểm, cách nhìn|khán pháp|11
客厅|kètīng|n.|phòng khách|khách sảnh|11
来得及|láidejí|v.|còn kịp|lai đắc cập|11
厉害|lìhai|adj.|giỏi, lợi hại; dữ dội|lệ hại|11
连|lián|prep.|ngay cả|liên|11
流利|liúlì|adj.|lưu loát, trôi chảy|lưu lợi|11
内容|nèiróng|n.|nội dung|nội dung|11
然而|rán'ér|conj.|tuy nhiên|nhiên nhi|11
顺序|shùnxù|n.|thứ tự|thuận tự|11
填空|tián kòng|v.|điền vào chỗ trống|điền không|11
同时|tóngshí|conj.|đồng thời, cùng lúc|đồng thời|11
文章|wénzhāng|n.|bài văn, bài viết||11
无论|wúlùn|conj.|bất luận, cho dù|vô luận|11
相同|xiāngtóng|adj.|giống nhau|tương đồng|11
养成|yǎngchéng|v.|hình thành (thói quen)|dưỡng thành|11
页|yè|m.|trang|hiệt|11
语法|yǔfǎ|n.|ngữ pháp|ngữ pháp|11
阅读|yuèdú|v.|đọc|duyệt độc|11
杂志|zázhì|n.|tạp chí|tạp chí|11
增加|zēngjiā|v.|tăng thêm|tăng gia|11
之|zhī|part.|của (nối định ngữ với từ được bổ nghĩa)|chi|11
只好|zhǐhǎo|adv.|đành phải|chỉ hảo|11
著名|zhùmíng|adj.|nổi tiếng|trứ danh|11
准确|zhǔnquè|adj.|chính xác, chuẩn xác|chuẩn xác|11
保护|bǎohù|v.|bảo vệ|bảo hộ|12
并且|bìngqiě|conj.|và, hơn nữa|tịnh thả|12
对于|duìyú|prep.|đối với|đối vu|12
规定|guīdìng|n.|quy định|quy định|12
教育|jiàoyù|v.|giáo dục|giáo dục|12
节|jié|m.|đoạn, tiết (lượng từ)|tiết|12
节约|jiéyuē|v.|tiết kiệm|tiết ước|12
解释|jiěshì|v.|giải thích|giải thích|12
可惜|kěxī|adj.|đáng tiếc|khả tích|12
力气|lìqi|n.|sức lực|lực khí|12
全部|quánbù|n.|toàn bộ|toàn bộ|12
任务|rènwu|n.|nhiệm vụ|nhiệm vụ|12
商量|shāngliang|v.|bàn bạc, thương lượng|thương lượng|12
勺子|sháozi|n.|cái thìa, cái muỗng|thược tử|12
使用|shǐyòng|v.|sử dụng|sử dụng|12
死|sǐ|adj.|cứng nhắc, máy móc|tử|12
无|wú|v.|không có|vô|12
无法|wú fǎ|v.|không thể, không có cách nào|vô pháp|12
误会|wùhuì|n.|hiểu lầm|ngộ hội|12
相反|xiāngfǎn|conj.|ngược lại|tương phản|12
详细|xiángxì|adj.|chi tiết, tỉ mỉ|tường tế|12
盐|yán|n.|muối|diêm|12
也许|yěxǔ|adv.|có lẽ|dã hứa|12
叶子|yèzi|n.|lá cây|diệp tử|12
意见|yìjiàn|n.|ý kiến|ý kiến|12
引起|yǐnqǐ|v.|gây ra, dẫn đến|dẫn khởi|12
友好|yǒuhǎo|adj.|thân thiện, hữu hảo|hữu hảo|12
语言|yǔyán|n.|ngôn ngữ|ngữ ngôn|12
直接|zhíjiē|adj.|trực tiếp|trực tiếp|12
仔细|zǐxì|adj.|cẩn thận, kỹ lưỡng||12
作用|zuòyòng|n.|tác dụng|tác dụng|12
遍|biàn|m.|lần, lượt (từ đầu đến cuối)|biến|13
表演|biǎoyǎn|v.|biểu diễn|biểu diễn|13
部分|bùfen|n.|phần, bộ phận|bộ phận|13
餐厅|cāntīng|n.|nhà hàng|xan sảnh|13
吃惊|chī jīng|v.|giật mình, ngạc nhiên|cật kinh|13
错误|cuòwù|adj.|sai, sai lầm|thác ngộ|13
大概|dàgài|adv.|khoảng, đại khái|đại khái|13
大约|dàyuē|adv.|khoảng chừng, ước chừng|đại ước|13
观众|guānzhòng|n.|khán giả|quan chúng|13
厚|hòu|adj.|sâu đậm, dày|hậu|13
互联网|hùliánwǎng|n.|mạng Internet|hỗ liên võng|13
基础|jīchǔ|n.|cơ sở, nền tảng|cơ sở|13
继续|jìxù|v.|tiếp tục|kế tục|13
进行|jìnxíng|v.|tiến hành|tiến hành|13
京剧|jīngjù|n.|Kinh kịch (kịch Bắc Kinh)|Kinh kịch|13
开心|kāixīn|adj.|vui vẻ|khai tâm|13
苦|kǔ|adj.|đắng|khổ|13
来自|láizì|v.|đến từ|lai tự|13
偶尔|ǒu'ěr|adv.|thỉnh thoảng|ngẫu nhĩ|13
普遍|pǔbiàn|adj.|phổ biến|phổ biến|13
稍微|shāowēi|adv.|hơi, một chút|sảo vi|13
申请|shēnqǐng|v.|xin, nộp đơn|thân thỉnh|13
省|shěng|n.|tỉnh (đơn vị hành chính)|tỉnh|13
十分|shífēn|adv.|vô cùng, rất||13
随着|suízhe|prep.|cùng với, theo đà||13
讨论|tǎolùn|v.|thảo luận|thảo luận|13
演出|yǎnchū|v.|biểu diễn, trình diễn|diễn xuất|13
演员|yǎnyuán|n.|diễn viên|diễn viên|13
由|yóu|prep.|do (ai làm)|do|13
有趣|yǒuqù|adj.|thú vị|hữu thú|13
正常|zhèngcháng|adj.|bình thường|chính thường|13
纸袋|zhǐdài|n.|túi giấy|chỉ đại|13
抱歉|bàoqiàn|v.|xin lỗi, áy náy|bão khiểm|14
乘坐|chéngzuò|v.|đi, ngồi (phương tiện giao thông)|thừa tọa|14
出差|chū chāi|v.|đi công tác|xuất sai|14
得意|déyì|adj.|đắc ý, tự mãn|đắc ý|14
地球|dìqiú|n.|trái đất|địa cầu|14
丢|diū|v.|ném, vứt||14
鼓励|gǔlì|v.|khích lệ, động viên|cổ lệ|14
盒子|hézi|n.|cái hộp|hạp tử|14
既然|jìrán|conj.|đã… thì, một khi đã|ký nhiên|14
减少|jiǎnshǎo|v.|giảm bớt|giảm thiểu|14
拒绝|jùjué|v.|từ chối|cự tuyệt|14
空|kōng|adj.|rỗng, trống|không|14
垃圾桶|lājītǒng|n.|thùng rác||14
毛巾|máojīn|n.|khăn mặt, khăn tắm|mao cân|14
美丽|měilì|adj.|đẹp|mỹ lệ|14
目的|mùdì|n.|mục đích|mục đích|14
暖|nuǎn|adj.|ấm|noãn|14
扔|rēng|v.|vứt bỏ, ném đi||14
省|shěng|v.|tiết kiệm|tỉnh|14
数量|shùliàng|n.|số lượng|số lượng|14
速度|sùdù|n.|tốc độ|tốc độ|14
塑料袋|sùliàodài|n.|túi ni-lông|tố liệu đại|14
停|tíng|v.|dừng|đình|14
卫生间|wèishēngjiān|n.|nhà vệ sinh|vệ sinh gian|14
温度|wēndù|n.|nhiệt độ|ôn độ|14
污染|wūrǎn|v.|ô nhiễm|ô nhiễm|14
行|xíng|v.|được, ổn|hành|14
牙膏|yágāo|n.|kem đánh răng|nha cao|14
以|yǐ|prep.|bằng, lấy (chỉ phương thức)|dĩ|14
于是|yúshì|conj.|thế là, vì thế|ư thị|14
脏|zāng|adj.|bẩn||14
重|zhòng|adj.|nặng|trọng|14
棒|bàng|adj.|giỏi, tuyệt vời|bổng|15
笨|bèn|adj.|ngốc, đần||15
表扬|biǎoyáng|v.|khen ngợi, biểu dương|biểu dương|15
厕所|cèsuǒ|n.|nhà vệ sinh, toilet|xí sở|15
粗心|cūxīn|adj.|cẩu thả, sơ ý|thô tâm|15
打针|dǎ zhēn|v.|tiêm, chích|đả châm|15
儿童|értóng|n.|trẻ em, nhi đồng|nhi đồng|15
父亲|fùqīn|n.|bố, phụ thân|phụ thân|15
赶|gǎn|v.|vội, đuổi kịp|cản|15
故意|gùyì|adv.|cố ý|cố ý|15
管理|guǎnlǐ|v.|quản lý|quản lý|15
害羞|hàixiū|v.|xấu hổ, ngại ngùng|hại tu|15
寒假|hánjià|n.|kỳ nghỉ đông|hàn giả|15
合适|héshì|adj.|vừa vặn, thích hợp|hợp thích|15
护士|hùshi|n.|y tá|hộ sĩ|15
怀疑|huáiyí|v.|nghi ngờ|hoài nghi|15
假|jiǎ|adj.|giả|giả|15
骄傲|jiāo'ào|adj.|kiêu ngạo|kiêu ngạo|15
懒|lǎn|adj.|lười|lãn|15
弄|nòng|v.|làm|lộng|15
批评|pīpíng|v.|phê bình|phê bình|15
骗|piàn|v.|lừa, lừa gạt|biển|15
千万|qiānwàn|adv.|nhất định, nhất thiết (phải/đừng)|thiên vạn|15
敲|qiāo|v.|gõ|xao|15
孙子|sūnzi|n.|cháu trai (con của con trai)|tôn tử|15
弹钢琴|tán gāngqín||chơi đàn piano|đàn cương cầm|15
响|xiǎng|v.|reo, vang|hưởng|15
醒|xǐng|v.|tỉnh, thức dậy|tỉnh|15
整理|zhěnglǐ|v.|sắp xếp, dọn dẹp|chỉnh lý|15
左右|zuǒyòu|n.|khoảng, chừng|tả hữu|15
报名|bào míng|v.|đăng ký|báo danh|16
表格|biǎogé|n.|biểu mẫu, bảng|biểu cách|16
博士|bóshì|n.|tiến sĩ||16
参观|cānguān|v.|tham quan|tham quan|16
传真|chuánzhēn|v.|gửi fax|truyền chân|16
导游|dǎoyóu|n.|hướng dẫn viên du lịch|đạo du|16
到底|dàodǐ|adv.|rốt cuộc (nhấn mạnh trong câu hỏi)|đáo để|16
敢|gǎn|v.|dám|cảm|16
挂|guà|v.|treo|quải|16
号码|hàomǎ|n.|số (điện thoại, phòng…)|hiệu mã|16
激动|jīdòng|adj.|xúc động, kích động|kích động|16
记者|jìzhě|n.|phóng viên, nhà báo|ký giả|16
郊区|jiāoqū|n.|ngoại ô|giao khu|16
恐怕|kǒngpà|adv.|e rằng, sợ rằng|khủng phạ|16
冷静|lěngjìng|adj.|bình tĩnh|lãnh tĩnh|16
礼貌|lǐmào|n.|lịch sự, lễ phép|lễ mạo|16
马虎|mǎhu|adj.|qua loa, đại khái||16
签证|qiānzhèng|n.|thị thực, visa|thiêm chứng|16
失望|shīwàng|v.|thất vọng|thất vọng|16
输|shū|v.|thua|thâu|16
同情|tóngqíng|v.|thương cảm, cảm thông||16
推|tuī|v.|hoãn, lùi lại|thôi|16
小伙子|xiǎohuǒzi|n.|chàng trai trẻ||16
呀|ya|part.|nhé, nhỉ (biến thể của 啊, làm nhẹ ngữ khí cuối câu)||16
预习|yùxí|v.|chuẩn bị bài trước|dự tập|16
原谅|yuánliàng|v.|tha thứ|nguyên lượng|16
重点|zhòngdiǎn|n.|trọng điểm|trọng điểm|16
重视|zhòngshì|v.|coi trọng|trọng thị|16
自信|zìxìn|adj.|tự tin|tự tín|16
尊重|zūnzhòng|v.|tôn trọng|tôn trọng|16
抱|bào|v.|ôm, bế|bão|17
倒|dào|adv.|lại, trái lại (chỉ sự tương phản)|đảo|17
底|dǐ|n.|đáy|để|17
放暑假|fàng shǔjià||nghỉ hè|phóng thử giả|17
干|gàn|v.|làm|cán|17
公里|gōnglǐ|m.|ki-lô-mét|công lý|17
广播|guǎngbō|n.|phát thanh, chương trình radio|quảng bá|17
海洋|hǎiyáng|n.|biển, đại dương|hải dương|17
活泼|huópō|adj.|hoạt bát, sôi nổi|hoạt bát|17
竞争|jìngzhēng|v.|cạnh tranh|cạnh tranh|17
老虎|lǎohǔ|n.|con hổ|lão hổ|17
凉快|liángkuai|adj.|mát mẻ|lương khoái|17
毛|máo|n.|lông|mao|17
梦|mèng|n.|giấc mơ|mộng|17
难受|nánshòu|adj.|khó chịu, buồn bực|nan thụ|17
暖和|nuǎnhuo|adj.|ấm áp|noãn hòa|17
排队|pái duì|v.|xếp hàng|bài đội|17
排列|páiliè|v.|sắp xếp theo thứ tự|bài liệt|17
热闹|rènao|adj.|náo nhiệt, nhộn nhịp|nhiệt náo|17
仍然|réngrán|adv.|vẫn, vẫn còn|nhưng nhiên|17
入口|rùkǒu|n.|lối vào||17
森林|sēnlín|n.|rừng|sâm lâm|17
社会|shèhuì|n.|xã hội|xã hội|17
剩|shèng|v.|còn lại, thừa|thặng|17
趟|tàng|m.|chuyến, lượt (đi và về)||17
严格|yángé|adj.|nghiêm khắc|nghiêm cách|17
云|yún|n.|mây|vân|17
照|zhào|v.|chụp (ảnh)|chiếu|17
安全|ānquán|adj.|an toàn|an toàn|18
地点|dìdiǎn|n.|địa điểm|địa điểm|18
地址|dìzhǐ|n.|địa chỉ|địa chỉ|18
付款|fù kuǎn||trả tiền, thanh toán|phó khoản|18
火|huǒ|adj.|nổi tiếng, đắt khách (đang “hot”)|hỏa|18
技术|jìshù|n.|kỹ thuật, công nghệ|kỹ thuật|18
降落|jiàngluò|v.|hạ cánh|giáng lạc|18
交通|jiāotōng|n.|giao thông|giao thông|18
接着|jiēzhe|adv.|tiếp theo, ngay sau đó||18
警察|jǐngchá|n.|cảnh sát|cảnh sát|18
举|jǔ|v.|nêu, đưa ra (ví dụ)|cử|18
矿泉水|kuàngquánshuǐ|n.|nước khoáng|khoáng tuyền thủy|18
迷路|mí lù|v.|lạc đường|mê lộ|18
密码|mìmǎ|n.|mật khẩu, mật mã|mật mã|18
秒|miǎo|m.|giây|miểu|18
桥|qiáo|n.|cây cầu|kiều|18
日记|rìjì|n.|nhật ký|nhật ký|18
世纪|shìjì|n.|thế kỷ|thế kỷ|18
是否|shìfǒu|adv.|có… hay không|thị phủ|18
收|shōu|v.|nhận|thu|18
受不了|shòubuliǎo||không chịu nổi||18
网站|wǎngzhàn|n.|trang web|võng trạm|18
危险|wēixiǎn|adj.|nguy hiểm|nguy hiểm|18
咸|xián|adj.|mặn|hàm|18
信封|xìnfēng|n.|phong bì|tín phong|18
信息|xìnxī|n.|thông tin|tín tức|18
邮局|yóujú|n.|bưu điện|bưu cục|18
允许|yǔnxǔ|v.|cho phép|doãn hứa|18
作者|zuòzhě|n.|tác giả|tác giả|18
座|zuò|m.|tòa, ngọn, cây (lượng từ cho cầu, núi, nhà)|tọa|18
包子|bāozi|n.|bánh bao||19
场|chǎng|m.|trận, buổi (lượng từ cho thể thao, giải trí)|trường|19
出生|chūshēng|v.|sinh ra, ra đời|xuất sinh|19
厨房|chúfáng|n.|nhà bếp|trù phòng|19
打印|dǎyìn|v.|in (ra)|đả ấn|19
打招呼|dǎ zhāohu||chào hỏi||19
戴|dài|v.|đeo, đội|đái|19
刀|dāo|n.|con dao|đao|19
道歉|dào qiàn|v.|xin lỗi|đạo khiểm|19
房东|fángdōng|n.|chủ nhà (cho thuê)|phòng đông|19
复印|fùyìn|v.|photo, sao chụp|phục ấn|19
胳膊|gēbo|n.|cánh tay||19
功夫|gōngfu|n.|kung fu, võ thuật|công phu|19
国籍|guójí|n.|quốc tịch|quốc tịch|19
饺子|jiǎozi|n.|bánh sủi cảo|giảo tử|19
禁止|jìnzhǐ|v.|cấm|cấm chỉ|19
理发|lǐ fà|v.|cắt tóc|lý phát|19
零钱|língqián|n.|tiền lẻ|linh tiền|19
乒乓球|pīngpāngqiú|n.|bóng bàn||19
破|pò|adj.|rách, vỡ, hỏng|phá|19
抬|tái|v.|nâng, nhấc lên|đài|19
脱|tuō|v.|cởi|thoát|19
性别|xìngbié|n.|giới tính|tính biệt|19
学期|xuéqī|n.|học kỳ|học kỳ|19
眼镜|yǎnjìng|n.|kính mắt|nhãn kính|19
羽毛球|yǔmáoqiú|n.|cầu lông|vũ mao cầu|19
占线|zhànxiàn|v.|(điện thoại) máy bận|chiếm tuyến|19
转|zhuǎn|v.|chuyển, rẽ|chuyển|19
租|zū|v.|thuê|tô|19
座位|zuòwèi|n.|chỗ ngồi|tọa vị|19
出发|chūfā|v.|xuất phát, khởi hành|xuất phát|20
存|cún|v.|cất giữ, lưu|tồn|20
打扮|dǎban|v.|trang điểm, ăn diện||20
登机牌|dēngjīpái|n.|thẻ lên máy bay|đăng cơ bài|20
对话|duìhuà|v.|đối thoại|đối thoại|20
对面|duìmiàn|n.|đối diện|đối diện|20
干杯|gān bēi|v.|cạn ly|can bôi|20
高速公路|gāosù gōnglù||đường cao tốc|cao tốc công lộ|20
航班|hángbān|n.|chuyến bay|hàng ban|20
合格|hégé|adj.|đạt tiêu chuẩn, đủ tư cách|hợp cách|20
加油站|jiāyóuzhàn|n.|trạm xăng|gia du trạm|20
究竟|jiūjìng|adv.|rốt cuộc (nhấn mạnh trong câu hỏi)||20
烤鸭|kǎoyā|n.|vịt quay|khảo áp|20
棵|kē|m.|cây (lượng từ cho thực vật)|khỏa|20
可怜|kělián|adj.|đáng thương|khả liên|20
辣|là|adj.|cay|lạt|20
旅行|lǚxíng|v.|du lịch|lữ hành|20
民族|mínzú|n.|dân tộc|dân tộc|20
普通话|pǔtōnghuà|n.|tiếng phổ thông (tiếng Trung chuẩn)|phổ thông thoại|20
收拾|shōushi|v.|dọn dẹp, thu xếp||20
首都|shǒudū|n.|thủ đô|thủ đô|20
酸|suān|adj.|chua|toan|20
汤|tāng|n.|canh, súp|thang|20
推迟|tuīchí|v.|hoãn lại|thôi trì|20
香|xiāng|adj.|thơm|hương|20
小吃|xiǎochī|n.|đồ ăn vặt, món ăn nhẹ|tiểu cật|20
笑话|xiàohua|n.|truyện cười|tiếu thoại|20
钥匙|yàoshi|n.|chìa khóa||20
祝贺|zhùhè|v.|chúc mừng|chúc hạ|20`;

const TITLES: [string, string][] = [
  ["简单的爱情", "Tình yêu giản dị"], ["真正的朋友", "Người bạn thật sự"], ["经理对我印象不错", "Giám đốc có ấn tượng tốt về tôi"], ["不要太着急赚钱", "Đừng quá vội kiếm tiền"], ["只买对的，不买贵的", "Chỉ mua cái phù hợp, không mua cái đắt"],
  ["一分钱一分货", "Tiền nào của nấy"], ["最好的医生是自己", "Bác sĩ giỏi nhất là chính mình"], ["生活中不缺少美", "Cuộc sống không thiếu cái đẹp"], ["阳光总在风雨后", "Sau cơn mưa trời lại sáng"], ["幸福的标准", "Tiêu chuẩn của hạnh phúc"],
  ["读书好，读好书，好读书", "Đọc sách là tốt, đọc sách hay, thích đọc sách"], ["用心发现世界", "Dùng trái tim khám phá thế giới"], ["喝着茶看京剧", "Vừa uống trà vừa xem Kinh kịch"], ["保护地球母亲", "Bảo vệ Mẹ Trái Đất"], ["教育孩子的艺术", "Nghệ thuật dạy con"],
  ["生活可以更美好", "Cuộc sống có thể tốt đẹp hơn"], ["人与自然", "Con người và thiên nhiên"], ["科技与世界", "Khoa học công nghệ và thế giới"], ["生活的味道", "Hương vị cuộc sống"], ["路上的风景", "Phong cảnh trên đường"],
];

const TRAW = `1|1|孙月和王静聊王静的男朋友|王静跟李进是怎么认识的？王静为什么喜欢李进？|Tôn Nguyệt và Vương Tĩnh nói chuyện về bạn trai của Vương Tĩnh|Vương Tĩnh và Lý Tiến quen nhau thế nào? Vì sao Vương Tĩnh thích Lý Tiến?
1|2|王静跟李老师聊她要结婚的事情|王静和李进有哪些共同的爱好？|Vương Tĩnh nói chuyện với giáo viên Lý về việc mình sắp kết hôn|Vương Tĩnh và Lý Tiến có những sở thích chung nào?
1|3|高老师和李老师聊结婚后的生活|丈夫和妻子两个人怎样才能很好地生活在一起？|Giáo viên Cao và giáo viên Lý nói chuyện về cuộc sống sau khi kết hôn|Vợ chồng làm thế nào mới có thể sống tốt với nhau?
1|4|短文|年轻人、中年人、老年人（对爱情）有什么不同的看法？什么样的爱情让人感动？|Đoạn văn|Người trẻ, người trung niên và người già có quan điểm khác nhau thế nào (về tình yêu)? Tình yêu như thế nào khiến người ta cảm động?
1|5|短文|爱情跟结婚是什么关系？|Đoạn văn|Tình yêu và hôn nhân có quan hệ gì?
2|1|小夏和马克聊马克的中国朋友|马克刚来中国的时候适应这儿的生活吗？马克新交的中国朋友怎么样？|Tiểu Hạ và Mark nói chuyện về bạn Trung Quốc của Mark|Khi mới đến Trung Quốc, Mark có thích nghi với cuộc sống ở đây không? Người bạn Trung Quốc mới quen của Mark thế nào?
2|2|小李和小林聊同学聚会的事情|小李为什么给小林打电话？|Tiểu Lý và Tiểu Lâm nói chuyện về buổi họp lớp|Vì sao Tiểu Lý gọi điện cho Tiểu Lâm?
2|3|孙月和王静聊她们的朋友|王静看到上大学时的照片会想起什么？|Tôn Nguyệt và Vương Tĩnh nói chuyện về bạn bè của họ|Khi xem ảnh thời đại học, Vương Tĩnh nhớ lại điều gì?
2|4|短文|如果没有朋友，我们的生活会怎么样？怎样才能交到更多的朋友？|Đoạn văn|Nếu không có bạn bè, cuộc sống của chúng ta sẽ ra sao? Làm thế nào để kết được nhiều bạn hơn?
2|5|短文|什么是真正的朋友？|Đoạn văn|Thế nào là người bạn thật sự?
3|1|小夏和小雨聊小雨面试的情况|小雨面试时紧张吗？面试时应该怎样？|Tiểu Hạ và Tiểu Vũ nói chuyện về buổi phỏng vấn của Tiểu Vũ|Tiểu Vũ có hồi hộp khi phỏng vấn không? Khi phỏng vấn nên thế nào?
3|2|马经理和小林聊招聘的事情|参加应聘的两个人适合不适合这个工作？为什么？|Giám đốc Mã và Tiểu Lâm nói chuyện về việc tuyển dụng|Hai người đến ứng tuyển có phù hợp với công việc này không? Vì sao?
3|3|小林和王静聊王静的工作情况|王静为什么很喜欢她现在的工作？|Tiểu Lâm và Vương Tĩnh nói chuyện về công việc của Vương Tĩnh|Vì sao Vương Tĩnh rất thích công việc hiện tại?
4|1|小林和小李聊换工作（标题未能提取）|你觉得小李为什么总是换工作？|Tiểu Lâm và Tiểu Lý nói chuyện về việc đổi việc (chưa trích xuất được tiêu đề gốc)|Bạn nghĩ vì sao Tiểu Lý cứ đổi việc mãi?
4|2|王经理和小李在说工作|那份调查的完成时间有什么变化？每天把计划要做的事情记下来有什么好处？|Giám đốc Vương và Tiểu Lý nói về công việc|Thời hạn hoàn thành bản khảo sát đó thay đổi thế nào? Mỗi ngày ghi lại những việc định làm có lợi ích gì?
4|3|王经理和马经理在说工作|马经理觉得做生意容易吗？为什么？“万事开头难”是什么意思？|Giám đốc Vương và giám đốc Mã nói về công việc|Giám đốc Mã có thấy kinh doanh dễ không? Vì sao? “Vạn sự khởi đầu nan” nghĩa là gì?
4|4|短文|他们今年工作的完成情况怎么样？公司用什么方法来感谢大家的努力工作？|Đoạn văn|Năm nay họ hoàn thành công việc thế nào? Công ty dùng cách gì để cảm ơn sự làm việc chăm chỉ của mọi người?
4|5|短文|我们遇到不愿意做的工作时应该怎么办？|Đoạn văn|Khi gặp công việc mình không muốn làm, chúng ta nên làm thế nào?
5|1|王静在家具店买沙发||Vương Tĩnh mua ghế sofa ở cửa hàng nội thất|
5|2|王静和李进在商场买东西|李进开始为什么不同意买冰箱？后来为什么又同意了？|Vương Tĩnh và Lý Tiến mua sắm ở trung tâm thương mại|Lúc đầu vì sao Lý Tiến không đồng ý mua tủ lạnh? Sau đó vì sao lại đồng ý?
5|3|李进和王静在超市买礼物|王静和李进打算给李老师买什么礼物？为什么不能完全相信广告？|Lý Tiến và Vương Tĩnh mua quà ở siêu thị|Vương Tĩnh và Lý Tiến định mua quà gì cho giáo viên Lý? Vì sao không thể hoàn toàn tin vào quảng cáo?
6|1|张远和李进聊李进昨晚的购物经历|昨天晚上李进为什么没接张远的电话？|Trương Viễn và Lý Tiến nói chuyện về lần mua sắm tối qua của Lý Tiến|Tối qua vì sao Lý Tiến không nghe điện thoại của Trương Viễn?
6|2|王静在商店买西红柿|王静买的西红柿怎么样？|Vương Tĩnh mua cà chua ở cửa hàng|Cà chua Vương Tĩnh mua thế nào?
6|3|李进在商场买行李箱|李进想买什么样的行李箱？花了多少钱买的？|Lý Tiến mua vali ở trung tâm thương mại|Lý Tiến muốn mua vali như thế nào? Đã mua hết bao nhiêu tiền?
6|4|短文|书店今天有什么活动？怎么才能免费办会员卡？|Đoạn văn|Hôm nay hiệu sách có hoạt động gì? Làm thế nào để làm thẻ hội viên miễn phí?
6|5|短文|“一分钱一分货”是什么意思？一般什么时候商场会降价？|Đoạn văn|“Tiền nào của nấy” nghĩa là gì? Thường khi nào trung tâm thương mại giảm giá?
7|1|小李和小林聊天气和身体情况|小林可能是中国哪里人？春天的时候怎么才能少感冒？|Tiểu Lý và Tiểu Lâm nói chuyện về thời tiết và sức khỏe|Tiểu Lâm có thể là người vùng nào của Trung Quốc? Mùa xuân làm thế nào để ít bị cảm?
7|2|小夏和小雨聊小雨抽烟的事情|如果你有抽烟的朋友，你想对他/她说些什么？|Tiểu Hạ và Tiểu Vũ nói chuyện về việc Tiểu Vũ hút thuốc|Nếu bạn có người bạn hút thuốc, bạn muốn nói gì với người đó?
7|3|小李和小林聊电脑对身体的影响|长时间坐在电脑前面工作好不好？为什么？|Tiểu Lý và Tiểu Lâm nói chuyện về ảnh hưởng của máy tính đến sức khỏe|Ngồi làm việc trước máy tính trong thời gian dài có tốt không? Vì sao?
7|4|短文|过去和现在的人们对健康的认识有哪些不同？晚饭后和家人一起去散散步有哪几个方面的好处？|Đoạn văn|Nhận thức về sức khỏe của con người trước đây và bây giờ khác nhau thế nào? Sau bữa tối đi dạo cùng gia đình có lợi ích về những mặt nào?
8|1|李老师和高老师聊关于巧克力的事情|吃巧克力对人的心情有哪些影响？|Giáo viên Lý và giáo viên Cao nói chuyện về sô-cô-la|Ăn sô-cô-la ảnh hưởng thế nào đến tâm trạng con người?
8|2|小夏和马克聊关于上次足球比赛的事情|马克可能因为什么原因带小夏去看那里的景色？|Tiểu Hạ và Mark nói chuyện về trận bóng đá lần trước|Có thể vì lý do gì mà Mark đưa Tiểu Hạ đi ngắm cảnh ở đó?
8|3|马克和司机聊关于堵车的事情||Mark và tài xế nói chuyện về tắc đường|
8|4|短文|怎么理解“生活中的美到处都是”这句话？哪种方法可以让我们了解一个人的性格？|Đoạn văn|Hiểu câu “Cái đẹp trong cuộc sống có ở khắp nơi” như thế nào? Cách nào giúp chúng ta hiểu tính cách của một người?
9|1|王静和孙月聊孙月减肥的事情|怎样减肥才能有效果？|Vương Tĩnh và Tôn Nguyệt nói chuyện về việc giảm cân của Tôn Nguyệt|Giảm cân thế nào mới có hiệu quả?
9|2|李进和张远聊张远的成功经历|张远的网球为什么打得那么好？为什么说没有人能随随便便成功？|Lý Tiến và Trương Viễn nói chuyện về con đường thành công của Trương Viễn|Vì sao Trương Viễn chơi quần vợt giỏi như vậy? Vì sao nói không ai có thể thành công một cách dễ dàng?
9|3|小林和小李谈王红的成功经历|王红是干什么的？她是怎样获得成功的？|Tiểu Lâm và Tiểu Lý nói về con đường thành công của Vương Hồng|Vương Hồng làm nghề gì? Cô ấy đã thành công như thế nào?
9|4|短文|过程和结果，哪个更重要？为什么说失败了也没关系？|Đoạn văn|Quá trình và kết quả, cái nào quan trọng hơn? Vì sao nói thất bại cũng không sao?
9|5|短文|人们对困难的态度有什么不同？爱迪生是怎样成功发明电灯的？|Đoạn văn|Thái độ của mọi người trước khó khăn khác nhau thế nào? Edison đã phát minh thành công bóng đèn điện như thế nào?
10|1|孙月和王静聊王静的生活情况|孙月让王静陪她去做什么？王静为什么很辛苦？她为什么也觉得很幸福？|Tôn Nguyệt và Vương Tĩnh nói chuyện về cuộc sống của Vương Tĩnh|Tôn Nguyệt nhờ Vương Tĩnh đi cùng để làm gì? Vì sao Vương Tĩnh rất vất vả? Vì sao cô ấy vẫn thấy rất hạnh phúc?
10|2|高老师和李老师在谈幸福|高老师为什么羡慕王老师？|Giáo viên Cao và giáo viên Lý nói về hạnh phúc|Vì sao giáo viên Cao ngưỡng mộ giáo viên Vương?
10|3|小雨和小夏聊找工作的事情|小雨对选择职业有什么建议？在小雨看来，什么是幸福？|Tiểu Vũ và Tiểu Hạ nói chuyện về việc tìm việc làm|Tiểu Vũ có lời khuyên gì về việc chọn nghề? Theo Tiểu Vũ, thế nào là hạnh phúc?
10|4|短文|为什么说没钱也很难过得幸福？|Đoạn văn|Vì sao nói không có tiền cũng khó sống hạnh phúc?
10|5|短文|关于幸福，人们有哪些不同的看法？怎样才算是真正的幸福？|Đoạn văn|Về hạnh phúc, mọi người có những quan điểm khác nhau nào? Thế nào mới là hạnh phúc thật sự?
11|1|马克介绍自己学习汉语的方法|大卫认为对学习汉语的外国人来说，做什么特别难？|Mark giới thiệu phương pháp học tiếng Trung của mình|David cho rằng đối với người nước ngoài học tiếng Trung, việc gì đặc biệt khó?
11|2|小夏和小雨聊考试的情况|要想考好，应该注意哪些方面？为什么？|Tiểu Hạ và Tiểu Vũ nói chuyện về kỳ thi|Muốn thi tốt cần chú ý những mặt nào? Vì sao?
11|3|小李告诉小林阅读的好处|小李家的客厅有什么特点？坚持阅读能给人带来哪些好处？|Tiểu Lý kể cho Tiểu Lâm về lợi ích của việc đọc sách|Phòng khách nhà Tiểu Lý có đặc điểm gì? Kiên trì đọc sách mang lại những lợi ích gì?
11|5|短文|我们应该选择读什么样的书？为什么？|Đoạn văn|Chúng ta nên chọn đọc những cuốn sách như thế nào? Vì sao?
12|1|王经理做生意遇到了困难|要是工作或学习遇到困难，你可能用什么方法去解决？|Giám đốc Vương gặp khó khăn trong kinh doanh|Nếu gặp khó khăn trong công việc hoặc học tập, bạn có thể dùng cách gì để giải quyết?
12|2|高老师告诉女儿洗衣服的方法|哪种方法可以保护衣服不掉颜色？|Giáo viên Cao chỉ cho con gái cách giặt quần áo|Cách nào giúp quần áo không bị phai màu?
12|3|高老师学习王教授的教育方法|高老师认为王教授上课成功有哪些方面的原因？|Giáo viên Cao học phương pháp giáo dục của giáo sư Vương|Giáo viên Cao cho rằng giáo sư Vương dạy thành công vì những lý do nào?
12|4|短文|人们的说话方式可能和什么有关系？|Đoạn văn|Cách nói chuyện của con người có thể liên quan đến điều gì?
12|5|短文|你的学习方法是“事半功倍”还是“事倍功半”？对于别人的意见，什么态度是正确的？|Đoạn văn|Phương pháp học của bạn là “làm ít được nhiều” hay “làm nhiều được ít”? Đối với ý kiến của người khác, thái độ nào là đúng?
13|1|小雨和小夏在聊小夏的爷爷表演京剧的情况|小夏受了爷爷哪些影响？|Tiểu Vũ và Tiểu Hạ nói chuyện về việc ông nội Tiểu Hạ biểu diễn Kinh kịch|Tiểu Hạ chịu những ảnh hưởng nào từ ông nội?
13|2|小雨和马克在聊京剧|马克学过京剧吗？他怎么学的？京剧给了马克哪些新的想法？|Tiểu Vũ và Mark nói chuyện về Kinh kịch|Mark đã từng học Kinh kịch chưa? Anh ấy học thế nào? Kinh kịch mang lại cho Mark những ý tưởng mới nào?
13|3|李老师和校长在谈工作|为什么李老师想申请举办中国传统文化节活动？|Giáo viên Lý và hiệu trưởng nói về công việc|Vì sao giáo viên Lý muốn xin tổ chức hoạt động Lễ hội văn hóa truyền thống Trung Quốc?
13|4|短文|为什么国外的中国餐厅会提供使用筷子的详细说明？|Đoạn văn|Vì sao các nhà hàng Trung Quốc ở nước ngoài cung cấp hướng dẫn chi tiết cách dùng đũa?
13|5|短文|茶开始时被用来做什么？后来呢？广东人爱喝的凉茶是一种什么样的饮料？|Đoạn văn|Lúc đầu trà được dùng để làm gì? Sau đó thì sao? Trà thảo mộc (凉茶) mà người Quảng Đông thích uống là loại đồ uống như thế nào?
14|1|李进要出差，王静和李进在聊天儿||Lý Tiến sắp đi công tác, Vương Tĩnh và Lý Tiến đang trò chuyện|
14|2|经理和服务员在谈工作|经理希望小王做什么？店里哪些地方需要打扫？|Giám đốc và nhân viên phục vụ nói về công việc|Giám đốc muốn Tiểu Vương làm gì? Những chỗ nào trong cửa hàng cần dọn dẹp?
14|3|孙月和王静在聊关于环保的事情|“地球一小时”是个什么活动？这个活动的目的是什么？|Tôn Nguyệt và Vương Tĩnh nói chuyện về bảo vệ môi trường|“Giờ Trái Đất” là hoạt động gì? Mục đích của hoạt động này là gì?
14|4|短文|塑料袋有什么好处？有什么坏处？怎样解决使用塑料袋带来的污染问题？|Đoạn văn|Túi ni-lông có lợi ích gì? Có tác hại gì? Giải quyết vấn đề ô nhiễm do dùng túi ni-lông như thế nào?
14|5|短文|我们需要注意哪些事情来保护地球环境？怎样才能使地球变得更美丽？|Đoạn văn|Chúng ta cần chú ý những việc gì để bảo vệ môi trường Trái Đất? Làm thế nào để Trái Đất đẹp hơn?
15|1|李老师建议王静让孩子养成好习惯|怎么理解“父母是孩子最重要的老师”这句话？|Giáo viên Lý khuyên Vương Tĩnh giúp con hình thành thói quen tốt|Hiểu câu “Cha mẹ là người thầy quan trọng nhất của con” như thế nào?
15|2|王静建议孙月教育孩子学会安排时间|孙月常因为什么事情心情不好？|Vương Tĩnh khuyên Tôn Nguyệt dạy con biết sắp xếp thời gian|Tôn Nguyệt thường không vui vì chuyện gì?
15|3|王静和孙月讨论表扬孩子的方法|用表扬这种方式教育孩子时，应该注意哪些问题？|Vương Tĩnh và Tôn Nguyệt thảo luận cách khen con|Khi dạy con bằng cách khen ngợi, cần chú ý những vấn đề gì?
15|4|短文|有的孩子为什么故意乱扔东西？为什么有的孩子会说假话骗人？|Đoạn văn|Vì sao có trẻ cố ý vứt đồ lung tung? Vì sao có trẻ nói dối để lừa người khác?
15|5|短文|对教儿童的老师来说，怎么做才能让他们安静地学习？|Đoạn văn|Đối với giáo viên dạy trẻ em, làm thế nào để các em yên lặng học bài?
16|1|小夏出国留学遇到了问题|如果想出国留学可能需要准备哪些材料？|Tiểu Hạ gặp vấn đề khi đi du học|Nếu muốn đi du học, có thể cần chuẩn bị những giấy tờ gì?
16|2|王老板告诉李进自己成功的经验|王老板怎么介绍自己的成功经验的？|Ông chủ Vương kể cho Lý Tiến kinh nghiệm thành công của mình|Ông chủ Vương giới thiệu kinh nghiệm thành công của mình như thế nào?
16|3|小林不好意思拒绝朋友|小李和小林两个人对“拒绝别人”有哪些不同的理解？|Tiểu Lâm ngại từ chối bạn bè|Tiểu Lý và Tiểu Lâm hiểu về việc “từ chối người khác” khác nhau thế nào?
16|4|短文|对于“有什么事情明天再说”这句话，你认为正确吗？为什么？|Đoạn văn|Bạn có cho rằng câu “Có việc gì để mai hãy nói” là đúng không? Vì sao?
16|5|短文|怎么理解“天外有天，人外有人”这句话？|Đoạn văn|Hiểu câu “Núi cao còn có núi cao hơn, người giỏi còn có người giỏi hơn” như thế nào?
17|1|小夏和安娜在聊天气|现在是什么季节？天气怎么样？|Tiểu Hạ và Anna nói chuyện về thời tiết|Bây giờ là mùa gì? Thời tiết thế nào?
17|2|小林和小李在聊小李的狗|小林为什么喜欢小李的狗？他为什么也想养狗？|Tiểu Lâm và Tiểu Lý nói chuyện về con chó của Tiểu Lý|Vì sao Tiểu Lâm thích con chó của Tiểu Lý? Vì sao anh ấy cũng muốn nuôi chó?
17|3|马克和小夏在聊动物|马克什么时候去的北京动物园？他去那儿做什么了？|Mark và Tiểu Hạ nói chuyện về động vật|Mark đi sở thú Bắc Kinh khi nào? Anh ấy đến đó làm gì?
17|4|短文|植物之间会竞争吗？它们会为了什么而竞争？|Đoạn văn|Giữa các loài thực vật có cạnh tranh không? Chúng cạnh tranh vì điều gì?
17|5|短文|海洋在地球上占多大比例？海底世界里有什么？|Đoạn văn|Đại dương chiếm tỷ lệ bao nhiêu trên Trái Đất? Thế giới dưới đáy biển có gì?
18|1|王静给孙月推荐一本书|王静给孙月推荐了一本什么书？为什么给她推荐这本书？|Vương Tĩnh giới thiệu cho Tôn Nguyệt một cuốn sách|Vương Tĩnh giới thiệu cho Tôn Nguyệt cuốn sách gì? Vì sao giới thiệu cuốn sách này cho cô ấy?
18|2|李老师和高老师在聊电脑和互联网技术的发展|现在的大学生遇到不明白的问题怎么办？|Giáo viên Lý và giáo viên Cao nói chuyện về sự phát triển của máy tính và công nghệ Internet|Sinh viên bây giờ gặp vấn đề không hiểu thì làm thế nào?
18|3|王静和孙月在聊关于梦的情况|人们对梦进行过哪些解释？目前的研究结果是什么？|Vương Tĩnh và Tôn Nguyệt nói chuyện về giấc mơ|Con người từng giải thích giấc mơ như thế nào? Kết quả nghiên cứu hiện nay là gì?
18|4|短文|为什么说现代人的生活越来越离不开手机了？|Đoạn văn|Vì sao nói cuộc sống của người hiện đại ngày càng không thể thiếu điện thoại di động?
18|5|短文|为什么人们把地球叫作“地球村”？|Đoạn văn|Vì sao người ta gọi Trái Đất là “ngôi làng toàn cầu”?
19|1|马克申请下个学期继续在学校学习|填写申请表格时，应该提供哪些方面的信息？|Mark xin tiếp tục học ở trường vào học kỳ sau|Khi điền đơn xin, cần cung cấp những thông tin gì?
19|2|课文2|今天他们能吃到羊肉饺子吗？如果吃不到，他们会怎么办？|Bài khóa 2 (chưa trích xuất được tiêu đề)|Hôm nay họ có ăn được sủi cảo nhân thịt cừu không? Nếu không ăn được, họ sẽ làm thế nào?
19|3|安娜帮助马克练习舞蹈动作|马克的那个动作做得正确吗？那个动作应该怎么做？|Anna giúp Mark tập động tác múa|Mark làm động tác đó có đúng không? Động tác đó nên làm thế nào?
19|4|短文|马克现在租的房子和广告上的房子各有哪些特点？马克为什么一直没联系上房东？|Đoạn văn|Căn nhà Mark đang thuê và căn nhà trên quảng cáo mỗi cái có đặc điểm gì? Vì sao Mark mãi không liên lạc được với chủ nhà?
19|5|短文|“乒乓球”这个名字是怎么来的？|Đoạn văn|Cái tên “乒乓球” (bóng bàn) ra đời như thế nào?
20|1|小张去北京，朋友送小张去机场||Tiểu Trương đi Bắc Kinh, bạn bè tiễn Tiểu Trương ra sân bay|
20|2|孙月和丈夫计划放寒假带女儿去旅行|孙月和丈夫为什么想带女儿去旅行？他们准备去哪儿旅行？|Tôn Nguyệt và chồng dự định đưa con gái đi du lịch vào kỳ nghỉ đông|Vì sao Tôn Nguyệt và chồng muốn đưa con gái đi du lịch? Họ định đi du lịch ở đâu?
20|3|安娜向马克介绍去丽江旅行的经验|安娜这次去丽江找的那个导游怎么样？为什么丽江值得去旅游？|Anna kể cho Mark kinh nghiệm du lịch Lệ Giang|Hướng dẫn viên Anna tìm khi đi Lệ Giang lần này thế nào? Vì sao Lệ Giang đáng để đi du lịch?
20|4|短文|一个北方人跟上海人对话时，可能会遇到什么问题？|Đoạn văn|Khi một người miền Bắc nói chuyện với người Thượng Hải, có thể gặp vấn đề gì?
20|5|短文|对“我”来说，旅行有哪些好处？旅行中什么东西给“我”的印象最深？|Đoạn văn|Đối với “tôi”, du lịch có những lợi ích gì? Trong chuyến đi, điều gì để lại cho “tôi” ấn tượng sâu sắc nhất?`;

const GRAW = `1|不仅……也/还/而且……|他不仅足球踢得好，性格也不错。|“không những… mà còn…”: vế sau bổ sung thêm một ý cùng chiều, thường mạnh hơn vế trước.|Anh ấy không những đá bóng giỏi mà tính cách cũng rất tốt.
1|从来|虽然我们认识的时间不长，但我从来没这么快乐过。|“từ trước đến nay”: nhấn mạnh một tình trạng chưa bao giờ thay đổi; thường đi với dạng phủ định 从来没(有)…过 / 从来不….|Tuy chúng tôi quen nhau chưa lâu, nhưng tôi chưa bao giờ hạnh phúc như thế này.
1|刚|我上午刚借的那本书，怎么找不到了？|“vừa mới”: phó từ đặt trước động từ, chỉ hành động xảy ra cách đây không lâu.|Quyển sách tôi vừa mượn sáng nay, sao lại không tìm thấy nữa?
1|即使……也……|大部分人每天晚上最少应该睡7个小时，但有些人即使只睡5个小时也没问题。|“cho dù… cũng…”: nêu một giả thiết (thường là trường hợp cực đoan), kết quả vẫn không thay đổi.|Phần lớn mọi người mỗi tối nên ngủ ít nhất 7 tiếng, nhưng có người cho dù chỉ ngủ 5 tiếng cũng không sao.
1|(在)……上|两个人共同生活，不仅需要浪漫的爱情，更需要性格上互相吸引。|“về mặt…”: chỉ phương diện, lĩnh vực của sự việc; thường dùng dạng (在)+danh từ+上.|Hai người chung sống không chỉ cần tình yêu lãng mạn, mà còn cần sự hấp dẫn lẫn nhau về mặt tính cách.
2|正好|你来得正好，我的钱包不见了，借我点儿钱吧。|“vừa đúng lúc, vừa vặn”: thời gian, kích cỡ, số lượng… vừa khớp; có thể làm bổ ngữ (来得正好) hoặc phó từ.|Bạn đến đúng lúc quá, ví của tôi bị mất rồi, cho tôi mượn ít tiền nhé.
2|差不多|女儿上中学后，个子长得特别快，现在都快一米七了，差不多跟我一样高了。|“gần như, xấp xỉ”: chỉ mức độ, số lượng gần bằng; có thể đứng trước tính từ, động từ hoặc làm vị ngữ.|Con gái tôi lên trung học thì cao lên rất nhanh, giờ đã gần 1m70, gần như cao bằng tôi rồi.
2|尽管|尽管已经毕业这么多年，我们还是经常联系的。|“mặc dù”: thừa nhận một sự thật, vế sau thường có 但是 / 可是 / 还是 / 却 để chuyển ý.|Mặc dù đã tốt nghiệp nhiều năm như vậy, chúng tôi vẫn thường xuyên liên lạc.
2|却|现在很多人虽然住在同一个楼里，但是却从来没说过话。|“lại, nhưng lại”: phó từ chỉ sự chuyển ý, đặt sau chủ ngữ và trước động từ; có thể dùng cùng 但是.|Bây giờ nhiều người tuy sống cùng một tòa nhà nhưng lại chưa bao giờ nói chuyện với nhau.
2|而|有些人觉得朋友就是能和自己一起快乐的人，而我的理解是：当你遇到困难的时候，真正的朋友会站出来，及时给你帮助。|“còn, mà”: liên từ nối hai vế có ý tương phản hoặc so sánh.|Có người cho rằng bạn bè là người có thể cùng mình vui vẻ, còn theo tôi hiểu: khi bạn gặp khó khăn, người bạn thật sự sẽ đứng ra giúp đỡ bạn kịp thời.
3|挺|他们问的问题都挺容易的。|“khá, rất”: phó từ chỉ mức độ, dùng trong khẩu ngữ, thường có cấu trúc 挺…的.|Những câu họ hỏi đều khá dễ.
3|本来|我本来不会开车，但现在开得特别好。|“vốn dĩ, lúc đầu”: chỉ tình hình ban đầu, nay đã thay đổi.|Lúc đầu tôi không biết lái xe, nhưng bây giờ lái rất giỏi.
3|另外|家里的空调坏了，咱们另外再买一个吧。|“khác, thêm (cái khác)”: chỉ người/vật/việc ngoài cái đã nói; cũng dùng làm liên từ “ngoài ra”.|Điều hòa ở nhà hỏng rồi, chúng ta mua thêm một cái khác nhé.
3|首先……其次……|不管做什么事情，首先应该明白你为什么要做，其次要知道怎么做。|“trước tiên… tiếp theo…”: liệt kê các bước hoặc các ý theo thứ tự.|Dù làm việc gì, trước tiên phải hiểu vì sao mình làm, sau đó phải biết làm như thế nào.
3|不管|不管忙不忙，他每天都要锻炼一个小时身体。|“bất kể, dù… thế nào”: trong mọi điều kiện kết quả không thay đổi; vế sau thường có 都 / 也.|Dù bận hay không, ngày nào anh ấy cũng tập thể dục một tiếng.
4|以为|她汉语说得那么好，我还以为她是中国人。|“cứ tưởng”: điều mình nghĩ trước đó hóa ra không đúng sự thật.|Cô ấy nói tiếng Trung giỏi như vậy, tôi cứ tưởng cô ấy là người Trung Quốc.
4|原来|她原来是汉语老师，现在已经成了一名律师。|“trước đây, ban đầu”: chỉ tình trạng trước kia, khác với hiện tại; cũng có nghĩa “hóa ra”.|Trước đây cô ấy là giáo viên tiếng Trung, bây giờ đã trở thành luật sư.
4|并|我原来以为做生意很简单，后来才发现其实并不容易。|“hoàn toàn (không)”: phó từ đặt trước 不 / 没, nhấn mạnh phủ định, thường để bác bỏ suy nghĩ trước đó.|Trước đây tôi tưởng kinh doanh rất đơn giản, sau này mới phát hiện thực ra không hề dễ.
4|按照|我们今年的工作都已经按照计划完成了。|“theo, dựa theo”: làm việc căn cứ vào quy định, kế hoạch, yêu cầu….|Công việc năm nay của chúng tôi đều đã hoàn thành theo kế hoạch.
4|甚至|很多时候，我们不得不去做一些自己不愿意做甚至是非常不喜欢的工作。|“thậm chí”: nêu ra một ví dụ nổi bật, mức độ cao hơn.|Nhiều khi chúng ta buộc phải làm những công việc mình không muốn làm, thậm chí là rất không thích.
5|肯定|每天喝一点儿葡萄酒，对身体是有好处的。但是不能喝太多，喝太多酒肯定对身体不好。|“chắc chắn”: phó từ biểu thị sự khẳng định, không nghi ngờ.|Mỗi ngày uống một chút rượu vang nho thì tốt cho sức khỏe. Nhưng không được uống quá nhiều, uống quá nhiều rượu chắc chắn không tốt cho sức khỏe.
5|再说|现在的事，做了再说；以后的事，以后再说。|“rồi hãy tính, để sau sẽ nói”: tạm gác một việc lại; còn có nghĩa “hơn nữa” để thêm lý do.|Việc hiện tại thì cứ làm rồi tính; việc sau này thì để sau hãy nói.
5|实际|你们做计划应该联系实际。|“thực tế”: danh từ/tính từ chỉ tình hình thực tế; 联系实际 = gắn với thực tế.|Các bạn lập kế hoạch nên gắn với thực tế.
5|对……来说|对我来说，衣服的样子流行不流行并不是很重要。|“đối với… mà nói”: nêu quan điểm từ góc độ của một người hay một sự việc.|Đối với tôi, kiểu quần áo có hợp mốt hay không thật ra không quan trọng lắm.
5|尤其|您女儿真可爱，长得真像您，尤其是眼睛。|“nhất là, đặc biệt là”: nhấn mạnh một phần nổi bật nhất trong tổng thể.|Con gái chị thật đáng yêu, trông rất giống chị, nhất là đôi mắt.
6|竟然|这个歌特别好听，最近很流行，你竟然没听过？|“vậy mà, không ngờ”: biểu thị sự việc ngoài dự đoán, gây bất ngờ.|Bài hát này rất hay, gần đây rất thịnh hành, vậy mà bạn chưa nghe à?
6|倍|我的工资是每月5000块，他的工资是我的两倍。|“lần, gấp… lần”: dùng để so sánh số lượng: A 是 B 的 X 倍.|Lương của tôi mỗi tháng 5000 tệ, lương của anh ấy gấp hai lần tôi.
6|值得|你应该改改自己的脾气，别总是为一点儿小事生气，不值得。|“đáng, xứng đáng”: việc gì đó có giá trị để làm; 不值得 = không đáng.|Bạn nên sửa tính khí của mình đi, đừng lúc nào cũng nổi giận vì chuyện nhỏ, không đáng đâu.
6|其中|我们不仅要会读书，还要会选择其中的好书来读。|“trong đó”: chỉ một phần trong phạm vi vừa nhắc đến.|Chúng ta không chỉ phải biết đọc sách, mà còn phải biết chọn những cuốn sách hay trong đó để đọc.
6|(在)……下|在老师和同学们的帮助下，他的汉语提高得非常快。|“dưới (sự)…”: chỉ điều kiện, hoàn cảnh: 在…的帮助/支持下 = nhờ sự giúp đỡ/ủng hộ của….|Nhờ sự giúp đỡ của thầy cô và các bạn, tiếng Trung của anh ấy tiến bộ rất nhanh.
7|估计|你有没有去问问小王？估计他应该有办法。|“ước chừng, đoán là”: đưa ra phán đoán dựa trên tình hình.|Bạn đã hỏi Tiểu Vương chưa? Tôi đoán cậu ấy chắc có cách.
7|来不及|等你身体出现问题了，后悔就来不及了。|“không kịp”: không đủ thời gian để làm gì; trái nghĩa là 来得及.|Đợi đến khi sức khỏe có vấn đề thì hối hận cũng không kịp nữa.
7|离合词重叠|咱们午饭后就去附近的公园散散步吧。|Lặp lại động từ ly hợp: lặp phần động từ (AAB), ví dụ 散散步, 聊聊天, mang nghĩa “làm một chút, thử làm”.|Ăn trưa xong chúng ta đi dạo một chút ở công viên gần đây nhé.
7|要是|要是质量比别人的好的话，那么价格贵一点儿也是可以接受的。|“nếu như”: nêu giả thiết, thường đi với 的话 / 就 / 那么.|Nếu chất lượng tốt hơn của người khác thì giá đắt hơn một chút cũng có thể chấp nhận được.
7|既……又/也/还……|散步是生活中最简单的锻炼方法，既可以活动身体，又可以减肥。|“vừa… vừa…”: hai tính chất hoặc hai tình huống cùng tồn tại.|Đi dạo là cách tập thể dục đơn giản nhất trong cuộc sống, vừa có thể vận động cơ thể, vừa có thể giảm cân.
8|使|在中国生活的三年使他在音乐方面有了很多新的想法。|“khiến, làm cho”: 使 + người/vật + động từ/tính từ, chỉ kết quả do một nguyên nhân gây ra.|Ba năm sống ở Trung Quốc đã khiến anh ấy có nhiều ý tưởng mới về âm nhạc.
8|只要|只要这次你好好儿准备，一定能把比赛踢好。|“chỉ cần… là…”: nêu điều kiện đủ, vế sau thường có 就 / 一定.|Chỉ cần lần này cậu chuẩn bị thật tốt, nhất định sẽ đá trận đấu thật hay.
8|可不是|A：没想到咱们毕业都已经十年了。B：可不是！时间过得太快了。|“chứ còn gì nữa, đúng vậy”: khẩu ngữ, biểu thị đồng ý hoàn toàn với người nói trước.|A: Không ngờ chúng ta tốt nghiệp đã mười năm rồi. B: Đúng thế! Thời gian trôi nhanh quá.
8|因此|我认识他很多年，因此，很了解他的性格。|“vì vậy, do đó”: liên từ nêu kết quả, kết luận.|Tôi quen anh ấy nhiều năm, vì vậy rất hiểu tính cách của anh ấy.
8|往往|女孩子对衣服颜色的选择往往与她们的性格有关。|“thường thường”: chỉ quy luật thường xảy ra trong một điều kiện nhất định (không dùng cho ý muốn chủ quan).|Việc con gái chọn màu quần áo thường có liên quan đến tính cách của họ.
9|难道|怎么又买了这么多饼干和巧克力？难道你不减肥了？|“lẽ nào, chẳng lẽ”: dùng trong câu hỏi tu từ để nhấn mạnh, thường kết thúc bằng 吗 / 了.|Sao lại mua nhiều bánh quy và sô-cô-la thế này? Chẳng lẽ bạn không giảm cân nữa à?
9|通过|任何成功都要通过努力才能得到。|“thông qua, bằng”: chỉ phương tiện, cách thức để đạt được mục đích.|Bất kỳ thành công nào cũng phải thông qua nỗ lực mới có được.
9|可是|虽然收入高，可是经常要加班，很少有时间和家人在一起。|“nhưng mà”: liên từ chỉ chuyển ý, thường đi với 虽然.|Tuy thu nhập cao nhưng thường phải làm thêm giờ, rất ít thời gian ở bên gia đình.
9|结果|小张，你这份计划书写得不错，就按照这个计划去做市场调查吧。下个月把调查结果交上来。|“kết quả”: danh từ chỉ kết cục cuối cùng; cũng làm liên từ “kết quả là”.|Tiểu Trương, bản kế hoạch này cậu viết khá tốt, cứ theo kế hoạch này mà khảo sát thị trường. Tháng sau nộp kết quả khảo sát lên nhé.
9|上|这个城市的地铁已经有上百年的历史了。|“lên tới, đạt tới”: 上 + số lượng (百, 千, 万…), chỉ con số lớn.|Tàu điện ngầm của thành phố này đã có lịch sử lên đến hàng trăm năm.
10|不过|我现在上有老，下有小。除了工作以外，家里还有母亲和儿子需要照顾。不过现在我很幸福。|“nhưng, có điều”: chuyển ý nhẹ, thường bổ sung hoặc điều chỉnh ý trước.|Tôi bây giờ trên có già, dưới có trẻ. Ngoài công việc ra, ở nhà còn có mẹ và con trai cần chăm sóc. Nhưng bây giờ tôi rất hạnh phúc.
10|确实|爱情确实是结婚的重要原因，但仅有爱情是不够的。|“quả thật, đúng là”: khẳng định tính chân thực của sự việc.|Tình yêu quả thật là lý do quan trọng để kết hôn, nhưng chỉ có tình yêu thôi thì chưa đủ.
10|在……看来|在我看来，比赛结果并不是最重要的，在参加比赛的过程中使自己获得提高更重要。|“theo… thấy, theo ý của…”: nêu quan điểm, cách nhìn của ai đó.|Theo tôi, kết quả trận đấu không phải là điều quan trọng nhất; trong quá trình thi đấu khiến bản thân tiến bộ mới quan trọng hơn.
10|由于|由于种种原因，我们不得不改变原来的计划。|“do, bởi vì”: liên từ nêu nguyên nhân, thường dùng trong văn viết.|Do nhiều lý do, chúng tôi buộc phải thay đổi kế hoạch ban đầu.
10|比如|还有人说，小时候幸福是一件东西，比如一块橡皮、一块糖，得到了就很幸福。|“ví dụ như”: đưa ra ví dụ minh họa.|Còn có người nói, hồi nhỏ hạnh phúc là một món đồ, ví dụ như một cục tẩy, một viên kẹo, có được là thấy rất hạnh phúc.
11|连|你太厉害了！连中文报纸都看得懂。|“ngay cả… cũng/đều…”: nhấn mạnh trường hợp cực đoan: 连…都/也….|Bạn giỏi quá! Ngay cả báo tiếng Trung cũng đọc hiểu được.
11|否则|他一定有重要的事找你，否则不会打这么多次电话来。|“nếu không thì”: nếu điều kiện vế trước không đúng thì sẽ có kết quả ở vế sau.|Anh ấy chắc chắn có việc quan trọng tìm bạn, nếu không đã không gọi điện nhiều lần như vậy.
11|无论|无论做什么事都要注意方法，正确的方法可以让我们做得更好。|“bất luận, cho dù”: trong mọi tình huống kết quả vẫn vậy; vế sau thường có 都 / 也.|Dù làm việc gì cũng phải chú ý phương pháp, phương pháp đúng giúp chúng ta làm tốt hơn.
11|然而|他虽然失败了很多次，然而一直没有放弃。|“tuy nhiên, thế nhưng”: liên từ chuyển ý, văn viết, tương đương 但是 / 可是.|Tuy anh ấy đã thất bại nhiều lần, thế nhưng vẫn chưa bao giờ bỏ cuộc.
11|同时|在学习汉语的同时，我还了解了中国文化，认识了很多中国朋友。|“đồng thời, cùng lúc”: hai việc diễn ra cùng một lúc; 在…的同时 = trong khi….|Trong khi học tiếng Trung, tôi còn tìm hiểu văn hóa Trung Quốc và quen được nhiều bạn Trung Quốc.
12|并且|他做事很认真，并且有丰富的经验，让他负责很合适。|“và, hơn nữa”: liên từ nối hai vế có quan hệ tăng tiến hoặc song song.|Anh ấy làm việc rất nghiêm túc, hơn nữa có kinh nghiệm phong phú, để anh ấy phụ trách là rất thích hợp.
12|再……也……|事情已经发生了，你再后悔也无法改变，别伤心了。|“dù có… cũng…”: cho dù mức độ cao hơn nữa thì kết quả cũng không đổi.|Chuyện đã xảy ra rồi, bạn có hối hận nữa cũng không thể thay đổi, đừng buồn nữa.
12|对于|对于这件事，我跟大家的看法不同。|“đối với, về”: giới từ chỉ đối tượng được nói đến.|Về chuyện này, tôi có quan điểm khác với mọi người.
12|名量词重叠|做好小事是完成大事的第一步，因此，件件小事都应该被看成是一次学习的机会。|Lặp lại lượng từ (件件, 个个, 天天…): mang nghĩa “mỗi, từng… đều…”.|Làm tốt việc nhỏ là bước đầu tiên để hoàn thành việc lớn, vì vậy mỗi việc nhỏ đều nên được coi là một cơ hội học hỏi.
12|相反|调查结果和他们想的几乎完全相反，他们不得不改变原来的计划。|“ngược lại”: hai sự việc trái ngược nhau hoàn toàn; cũng làm liên từ đầu câu.|Kết quả khảo sát gần như hoàn toàn ngược với những gì họ nghĩ, họ buộc phải thay đổi kế hoạch ban đầu.
13|大概|他8岁就开始上台演出，到现在大概唱了60多年了，他对这门艺术的热爱从来没有改变过。|“khoảng, đại khái”: ước đoán số lượng, thời gian hoặc tình hình.|Ông ấy 8 tuổi đã bắt đầu lên sân khấu biểu diễn, đến nay đã hát khoảng hơn 60 năm, tình yêu của ông với môn nghệ thuật này chưa bao giờ thay đổi.
13|偶尔|三叶草的叶子一般为三个，但偶尔也会出现四个叶子的。|“thỉnh thoảng”: tần suất thấp, không thường xuyên.|Lá cỏ ba lá thường có ba chiếc, nhưng thỉnh thoảng cũng có cây mọc bốn lá.
13|由|按照规定，这件事情应该由王大夫负责。|“do, bởi (ai)”: giới thiệu người chịu trách nhiệm hoặc thực hiện hành động.|Theo quy định, việc này phải do bác sĩ Vương phụ trách.
13|进行|有人在互联网上专门进行过调查，结果发现每六个中国人中就有一个使用筷子的方法是错误的。|“tiến hành”: 进行 + danh động từ hai âm tiết (调查, 讨论, 研究…), mang tính trang trọng.|Có người đã chuyên tiến hành khảo sát trên Internet, kết quả cho thấy cứ sáu người Trung Quốc thì có một người cầm đũa sai cách.
13|随着|随着社会的发展，京剧也在改变，以适应不同年龄观众的需要。|“cùng với, theo đà”: một sự việc thay đổi kéo theo sự việc khác thay đổi.|Cùng với sự phát triển của xã hội, Kinh kịch cũng đang thay đổi để đáp ứng nhu cầu của khán giả ở các độ tuổi khác nhau.
14|够|不用拿这些，宾馆都会免费提供的。再说，箱子已经够重的了！|“đủ, khá, rất”: 够 + tính từ + 的了, nhấn mạnh mức độ đã cao.|Không cần mang mấy thứ này, khách sạn đều cung cấp miễn phí. Hơn nữa, vali đã nặng lắm rồi!
14|以|经理您放心，我一定以最快的速度完成。|“bằng, với”: giới từ chỉ phương thức, cách thức (văn viết).|Giám đốc cứ yên tâm, tôi nhất định sẽ hoàn thành với tốc độ nhanh nhất.
14|既然|A：真抱歉，明天我得出差，不能参加明天的会议了。B：既然这样，就只好安排在下周了。|“đã… thì…”: dựa vào sự thật đã có để đưa ra kết luận; vế sau thường có 就.|A: Thật xin lỗi, mai tôi phải đi công tác, không thể dự cuộc họp ngày mai được. B: Đã vậy thì đành dời sang tuần sau thôi.
14|于是|……它的大量使用也带来了严重的环境污染问题。于是，一些国家规定，超市、商场不能为顾客提供免费塑料袋。|“thế là, vì vậy”: nối sự việc xảy ra sau như kết quả tự nhiên của việc trước.|… việc sử dụng với số lượng lớn của nó cũng gây ra vấn đề ô nhiễm môi trường nghiêm trọng. Vì vậy, một số nước quy định siêu thị, trung tâm thương mại không được cung cấp túi ni-lông miễn phí cho khách hàng.
14|什么的|A：我们去趟超市吧，明天出去玩儿得买点儿饼干和面包。B：好，还有矿泉水、果汁什么的。|“vân vân, …gì đó”: khẩu ngữ, đặt sau một hoặc vài danh từ để liệt kê chưa hết.|A: Chúng ta đi siêu thị một chuyến nhé, mai đi chơi phải mua ít bánh quy và bánh mì. B: Được, còn nước khoáng, nước ép gì đó nữa.
15|想起来|我突然想起来得去银行，所以不能陪你去大使馆了。|“nhớ ra”: 想起来 chỉ điều đã quên nay hiện lại trong trí nhớ.|Tôi bỗng nhớ ra phải đi ngân hàng, nên không thể đi cùng bạn đến đại sứ quán được.
15|弄|每天因为这些小事批评她，弄得我俩心情都不好。|“làm (cho)”: động từ thay cho nhiều động từ cụ thể; 弄得 + kết quả = khiến cho….|Ngày nào cũng phê bình cô ấy vì mấy chuyện nhỏ này, khiến tâm trạng cả hai chúng tôi đều không tốt.
15|千万|我要等她生日那天再送给她这个礼物，你现在千万别告诉她。|“nhất định, nhất thiết”: dặn dò khẩn thiết, thường dùng 千万要 / 千万别.|Tôi muốn đợi đến hôm sinh nhật cô ấy mới tặng món quà này, bây giờ bạn nhất định đừng nói với cô ấy nhé.
15|来|小王经验比较丰富，并且做事认真，这次就让他来负责吧。|“(để) … làm”: 来 + động từ, biểu thị chủ động đảm nhận một việc.|Tiểu Vương có kinh nghiệm khá phong phú, hơn nữa làm việc nghiêm túc, lần này để cậu ấy phụ trách nhé.
15|左右|网上买的那本书估计三天左右就能到，你收到了记得给我打个电话说一声。|“khoảng, chừng”: đặt sau số lượng để chỉ con số ước lượng.|Cuốn sách mua trên mạng ước chừng khoảng ba ngày sẽ đến, nhận được thì nhớ gọi điện báo cho tôi một tiếng.
16|可|下个星期就要去使馆办签证了，这可怎么办？|“thật là, quả là”: phó từ nhấn mạnh ngữ khí (khẩu ngữ).|Tuần sau đã phải đến đại sứ quán làm thị thực rồi, thế này thì biết làm sao đây?
16|恐怕|我的工作经验还比较少，那份工作我恐怕完成不了。|“e rằng, sợ rằng”: nêu dự đoán (thường là không tốt) một cách nhẹ nhàng.|Kinh nghiệm làm việc của tôi còn khá ít, công việc đó e rằng tôi không hoàn thành được.
16|到底|你不是已经买好火车票了吗？你到底怎么打算的呀？|“rốt cuộc”: dùng trong câu hỏi để truy hỏi đến cùng.|Chẳng phải bạn đã mua vé tàu rồi sao? Rốt cuộc bạn định thế nào?
16|拿……来说|这次招聘很多人符合公司的要求，拿他来说，他不仅专业符合职业要求，而且还有工作经验。|“lấy… làm ví dụ”: nêu một ví dụ cụ thể để minh họa.|Lần tuyển dụng này nhiều người đáp ứng yêu cầu của công ty, lấy anh ấy làm ví dụ, anh ấy không chỉ có chuyên ngành phù hợp với yêu cầu nghề nghiệp mà còn có kinh nghiệm làm việc.
16|敢|小时候我总喜欢躺在床上看书，结果眼睛越来越不好，所以从那以后我就不敢再躺着看书了。|“dám”: có can đảm làm gì; 不敢 = không dám.|Hồi nhỏ tôi luôn thích nằm trên giường đọc sách, kết quả mắt ngày càng kém, nên từ đó trở đi tôi không dám nằm đọc sách nữa.
17|倒|我以为坐出租车会快些，没想到倒比骑车还慢。|“lại, trái lại”: kết quả ngược với dự đoán.|Tôi tưởng đi taxi sẽ nhanh hơn, không ngờ lại còn chậm hơn đi xe đạp.
17|干|每次你让它干什么，它就像能听懂你的话一样去做。|“làm”: động từ khẩu ngữ, thay cho nhiều động từ cụ thể.|Mỗi lần bạn bảo nó làm gì, nó đều làm như thể hiểu được lời bạn.
17|趟|我要出趟差，你能帮我照顾一下我的小狗吗？|“chuyến”: lượng từ chỉ số lần đi lại; 出趟差 = đi công tác một chuyến.|Tôi phải đi công tác một chuyến, bạn có thể giúp tôi trông con chó nhỏ không?
17|为了……而……|植物会为了阳光、空气和水而竞争。|“vì… mà…”: 为了 nêu mục đích, 而 nối với hành động.|Thực vật cạnh tranh nhau vì ánh nắng, không khí và nước.
17|仍然|人比动物聪明，但动物仍然有很多值得人学习的地方。|“vẫn, vẫn còn”: tình trạng không thay đổi, thường đi sau 但.|Con người thông minh hơn động vật, nhưng động vật vẫn có nhiều điều đáng để con người học hỏi.
18|是否|不过她这么小，这本书我不知道她是否能读懂。|“có… hay không”: văn viết, tương đương 是不是 / 能不能.|Nhưng con bé còn nhỏ như vậy, tôi không biết nó có đọc hiểu được cuốn sách này hay không.
18|受不了|不过天天对着电脑看，眼睛实在受不了。|“không chịu nổi”: không thể chịu đựng được.|Nhưng ngày nào cũng nhìn máy tính, mắt thật sự không chịu nổi.
18|接着|这本书的内容非常有趣，你看完以后先不要还，我接着看。|“tiếp theo, nối tiếp”: tiếp tục làm việc ngay sau người khác hoặc sau việc trước.|Nội dung cuốn sách này rất thú vị, bạn đọc xong đừng trả vội, tôi đọc tiếp.
18|除此以外|他和弟弟同一天出生，兄弟俩长得很像，但除此以外几乎再找不到其他共同点。|“ngoài điều này ra”: ngoài những gì vừa nói thì không có/còn có gì khác.|Anh ấy và em trai sinh cùng một ngày, hai anh em trông rất giống nhau, nhưng ngoài điều đó ra thì hầu như không tìm được điểm chung nào khác.
18|把……叫作……|黄河是中国第二大河，从中国西部流向东部，全长5464公里，人们把它叫作“母亲河”。|“gọi… là…”: đặt tên hoặc gọi ai/cái gì bằng một tên khác.|Hoàng Hà là con sông lớn thứ hai của Trung Quốc, chảy từ miền Tây sang miền Đông, dài 5464 km, người ta gọi nó là “sông Mẹ”.
19|疑问代词活用表示任指|“世界上没有免费的午餐”这句话是说，什么东西都要通过努力才能得到。|Đại từ nghi vấn chỉ phiếm chỉ (什么, 谁, 哪儿…): mang nghĩa “bất cứ… nào”, thường đi với 都 / 也.|Câu “Trên đời không có bữa trưa miễn phí” muốn nói rằng thứ gì cũng phải thông qua nỗ lực mới có được.
19|上|现在堵车这么厉害，看来今天坐不上8点那趟去上海的飞机了。|“kịp, được (bổ ngữ khả năng)”: V+不/得+上 chỉ có/không thể đạt được mục tiêu.|Bây giờ tắc đường nghiêm trọng thế này, xem ra hôm nay không kịp chuyến bay 8 giờ đi Thượng Hải rồi.
19|出来|你要的那篇文章我已经翻译出来了，你方便的时候就来取吧。|“ra (bổ ngữ kết quả)”: V+出来 chỉ hành động hoàn thành và tạo ra kết quả.|Bài viết bạn cần tôi đã dịch xong rồi, lúc nào tiện thì bạn đến lấy nhé.
19|总的来说|很多人问去丽江旅游怎么样，总的来说，丽江景色不错，那里的人也很热情，去那里旅游是个不错的选择。|“nói chung, tóm lại”: dùng để tổng kết, đưa ra nhận xét chung.|Nhiều người hỏi đi du lịch Lệ Giang thế nào, nói chung cảnh sắc Lệ Giang đẹp, người ở đó cũng rất nhiệt tình, đi du lịch ở đó là một lựa chọn không tồi.
19|在于|选择职业的关键在于兴趣，当你喜欢做一件事情的时候，你会带着热情去工作。|“nằm ở, là ở”: chỉ ra điểm then chốt, bản chất của sự việc.|Điều then chốt khi chọn nghề nằm ở sở thích; khi bạn thích làm một việc, bạn sẽ làm việc với lòng nhiệt tình.
20|V+着+V+着|她讲着讲着自己就先笑了，而大家却不明白她到底为什么笑。|“đang… thì (bỗng)”: V着V着 chỉ trong lúc đang làm thì xảy ra việc khác.|Cô ấy đang kể thì tự mình bật cười trước, còn mọi người lại không hiểu rốt cuộc cô ấy cười vì sao.
20|一……就……|100年前，塑料一出现就受到人们的普遍欢迎。|“hễ… là…, vừa… liền…”: hai việc xảy ra liên tiếp ngay sau nhau.|100 năm trước, nhựa vừa xuất hiện đã được mọi người hoan nghênh rộng rãi.
20|究竟|究竟哪个季节去丽江旅游比较好呢？|“rốt cuộc”: dùng trong câu hỏi để truy hỏi, văn viết hơn 到底.|Rốt cuộc mùa nào đi du lịch Lệ Giang thì tốt hơn?
20|起来|邻居小王最近一定遇到了很多开心的事，你听，他又唱起来了。|“bắt đầu (bổ ngữ xu hướng)”: V+起来 chỉ hành động bắt đầu và tiếp diễn.|Tiểu Vương hàng xóm gần đây chắc gặp nhiều chuyện vui, bạn nghe xem, anh ấy lại bắt đầu hát rồi.
20|V+起|聊起那场网球比赛，他们俩就兴奋得停不下来了。|“nhắc đến, nói đến”: V+起 (聊起, 说起, 提起…) chỉ bắt đầu đề cập đến một chủ đề.|Nhắc đến trận quần vợt ấy, hai người họ hào hứng đến mức không dừng lại được.`;

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

const CLRAW = `1:爱情~脾气,不仅~刚,共同~互相,脾气~性格
2:差不多~好像,重新~丰富,重新~麻烦,当~及时,当~正好,而~却,丰富~麻烦,及时~正好,聚会~适应,讨厌~无聊,联系~交流
3:本来~首先,应聘~招聘,另外~其次
4:按时~提前,方法~提前,工资~奖金,经验~生意,提~提醒,完全~一切
5:打折~价格,肯定~尤其,葡萄~实在,葡萄~效果,实在~效果,肯定~实在
6:活动~举行,获得~满,举办~举行,所有~袜子,所有~各
7:掉~动作,空气~来不及,空气~气候,指~说明
8:发生~生命,回忆~心情,阳光~愉快,因此~使
9:当时~暂时,结果~总结,经历~通过,理想~主意,随便~主意
10:不过~条件,比如~等
11:词语~语法,词语~之,复杂~杂志,来得及~同时,然而~只好,同时~相同,精彩~厉害
12:节~节约,节~详细,节约~详细,使用~作用,无~无法,仔细~详细
13:遍~来自,表演~演出,表演~演员,大概~大约,十分~随着,演出~演员,开心~有趣,稍微~大概
14:丢~扔,速度~温度,于是~既然,减少~省
15:粗心~故意
16:导游~记者,导游~礼貌,到底~重点,挂~推,重点~重视,重点~尊重,重视~尊重,自信~敢
17:倒~仍然,排队~排列,仍然~剩,热闹~活泼
18:地点~地址,火~受不了,交通~信息,桥~座,是否~受不了
19:包子~饺子,厨房~房东,打印~复印
20:打扮~对面,打扮~小吃,登机牌~航班,对话~对面,出发~旅行`;

const PARTIAL: Record<number, [string, string]> = {
  3: ["课文4、5 的内容未能从扫描件中可靠提取", "chưa trích xuất được nội dung bài khóa 4, 5 từ bản scan"],
  5: ["课文1 的要点、课文4、5 的内容未能从扫描件中可靠提取", "chưa trích xuất được câu hỏi của bài khóa 1 và nội dung bài khóa 4, 5"],
  7: ["课文5 的内容未能从扫描件中可靠提取", "chưa trích xuất được nội dung bài khóa 5"],
  8: ["课文3、5 的要点未能从扫描件中可靠提取", "chưa trích xuất được câu hỏi của bài khóa 3 và nội dung bài khóa 5"],
  11: ["课文4 的要点未能从扫描件中可靠提取", "chưa trích xuất được bài khóa 4"],
  19: ["课文2 的标题未能提取", "chưa trích xuất được tiêu đề bài khóa 2"],
};

function cells(line: string): string[] { return line.split("|"); }
const WORDS: Word[] = WRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { h: f[0] ?? "", p: f[1] ?? "", pos: f[2] ?? "", v: f[3] ?? "", hv: f[4] ?? "", l: Number(f[5] ?? 0) }; });
const TEXTS = TRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), n: Number(f[1]), title: f[2] ?? "", q: f[3] ?? "", tv: f[4] ?? "", qv: f[5] ?? "" }; });
const GRAM = GRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), point: f[1] ?? "", ex: f[2] ?? "", vi: f[3] ?? "", exv: f[4] ?? "" }; });
const GQ = GQRAW.trim().split("\n").map((line: string) => { const f = cells(line); return { l: Number(f[0]), s: f[1] ?? "", a: f[2] ?? "", d: [f[3] ?? "", f[4] ?? "", f[5] ?? ""] }; });
const CL = new Map<number, Set<string>>();
CLRAW.trim().split("\n").forEach((line: string) => { const k = line.indexOf(":"); CL.set(Number(line.slice(0, k)), new Set(line.slice(k + 1).split(",").filter((x: string) => x.length > 0))); });
function clash(l: number, a: string, b: string): boolean { const s = CL.get(l); return !!s && (s.has(`${a}~${b}`) || s.has(`${b}~${a}`)); }

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = a[i] as T; a[i] = a[j] as T; a[j] = tmp; }
  return a;
}
function normPy(p: string): string { return p.replace(/[\s']/g, "").toLowerCase(); }

const K_MEAN = "看汉字选意思 · Xem chữ Hán, chọn nghĩa";
const K_HANZI = "看意思选汉字 · Xem nghĩa, chọn chữ Hán";
const K_PY = "看汉字选拼音 · Xem chữ Hán, chọn pinyin";
const K_GRAM = "语言点填空 · Chọn từ ngữ pháp điền vào chỗ trống";

function genQuiz(lesson: number, seed: number): Q[] {
  const r = rng(lesson * 1000 + seed);
  const pool = WORDS.filter((w: Word) => w.l === lesson);
  const picks = shuffle(pool, r).slice(0, 8);
  const qs: Q[] = picks.map((w: Word, i: number) => {
    let kind = K_MEAN;
    if (i >= 5 && i < 7) kind = K_HANZI;
    if (i === 7) kind = K_PY;
    const others = shuffle(pool.filter((o: Word) => o.h !== w.h), r);
    let distract: string[] = [];
    if (kind === K_MEAN) distract = others.filter((o: Word) => !clash(lesson, o.h, w.h) && o.v !== w.v).map((o: Word) => o.v);
    else if (kind === K_HANZI) distract = others.filter((o: Word) => !clash(lesson, o.h, w.h) && o.v !== w.v).map((o: Word) => o.h);
    else distract = others.filter((o: Word) => normPy(o.p) !== normPy(w.p)).map((o: Word) => o.p);
    const right = kind === K_MEAN ? w.v : kind === K_HANZI ? w.h : w.p;
    const uniq = Array.from(new Set(distract.filter((x: string) => x !== right))).slice(0, 3);
    const opts = shuffle([right, ...uniq], r);
    const stem = kind === K_HANZI ? w.v : w.h;
    return { id: `L${lesson}-${i}`, sec: "read", kind, stem, opts, a: opts.indexOf(right) };
  });
  GQ.filter((g) => g.l === lesson).forEach((g, i: number) => {
    const opts = shuffle([g.a, ...g.d], r);
    qs.push({ id: `L${lesson}-g${i}`, sec: "read", kind: K_GRAM, stem: g.s, opts, a: opts.indexOf(g.a) });
  });
  return qs;
}

const JUDGE = ["对 √ · Đúng", "错 × · Sai"];
const BANK = ["竟然", "尤其", "千万", "来得及", "值得", "偶尔"];
const KJ = "判断对错 · Đúng hay sai";
const KF = "选词填空 · Chọn từ điền vào chỗ trống";
const KO = "排列顺序 · Sắp xếp thứ tự";
const KR = "短文理解 · Đọc hiểu đoạn văn";
const ORDER_STEM = "正确的顺序是：· Thứ tự đúng là:";
const PLACE: Q[] = [
  { id: "p1", sec: "listen", kind: KJ, passage: "她汉语说得那么好，我还以为她是中国人。", stem: "★ 她是中国人。", opts: JUDGE, a: 1, ex: "以为 = tưởng (nhưng thực tế không phải). Người nói “cứ tưởng” cô ấy là người Trung Quốc, nghĩa là cô ấy không phải người Trung Quốc → Sai." },
  { id: "p2", sec: "listen", kind: KJ, passage: "我原来以为做生意很简单，后来才发现其实并不容易。", stem: "★ 他现在觉得做生意不容易。", opts: JUDGE, a: 0, ex: "并不容易 = hoàn toàn không dễ. Bây giờ anh ấy thấy kinh doanh không dễ → Đúng." },
  { id: "p3", sec: "listen", kind: KJ, passage: "我以为坐出租车会快些，没想到倒比骑车还慢。", stem: "★ 坐出租车比骑车快。", opts: JUDGE, a: 1, ex: "倒比骑车还慢 = lại còn chậm hơn đi xe đạp, nên taxi không nhanh hơn → Sai." },
  { id: "p4", sec: "listen", kind: KJ, passage: "他一定有重要的事找你，否则不会打这么多次电话来。", stem: "★ 他给你打了很多次电话。", opts: JUDGE, a: 0, ex: "否则不会打这么多次电话来 = nếu không đã không gọi nhiều lần như vậy, tức là anh ấy đã gọi rất nhiều lần → Đúng." },
  { id: "p5", sec: "listen", kind: KJ, passage: "这次招聘很多人符合公司的要求，拿他来说，他不仅专业符合职业要求，而且还有工作经验。", stem: "★ 他没有工作经验。", opts: JUDGE, a: 1, ex: "而且还有工作经验 = hơn nữa còn có kinh nghiệm làm việc → Sai." },
  { id: "p6", sec: "listen", kind: KJ, passage: "我的工资是每月5000块，他的工资是我的两倍。", stem: "★ 他每月工资一万块。", opts: JUDGE, a: 0, ex: "两倍 = gấp hai lần: 5000 × 2 = 10000 tệ (一万块) → Đúng." },
  { id: "p7", sec: "listen", kind: KJ, passage: "京剧演出7点就开始了，现在恐怕已经结束了。", stem: "★ 说话人认为演出可能已经结束了。", opts: JUDGE, a: 0, ex: "恐怕已经结束了 = e rằng đã kết thúc rồi, tức người nói cho rằng có thể buổi diễn đã kết thúc → Đúng." },
  { id: "p8", sec: "listen", kind: KJ, passage: "网上买的那本书估计三天左右就能到，你收到了记得给我打个电话说一声。", stem: "★ 那本书已经到了。", opts: JUDGE, a: 1, ex: "估计三天左右就能到 = ước chừng khoảng ba ngày nữa mới đến, nên sách chưa đến → Sai." },
  { id: "p9", sec: "listen", kind: KJ, passage: "小时候我总喜欢躺在床上看书，结果眼睛越来越不好，所以从那以后我就不敢再躺着看书了。", stem: "★ 他现在还经常躺着看书。", opts: JUDGE, a: 1, ex: "不敢再躺着看书了 = không dám nằm đọc sách nữa → Sai." },
  { id: "p10", sec: "listen", kind: KJ, passage: "随着社会的发展，京剧也在改变，以适应不同年龄观众的需要。", stem: "★ 京剧在改变，以适应不同年龄的观众。", opts: JUDGE, a: 0, ex: "Câu gốc nói rõ Kinh kịch đang thay đổi để đáp ứng nhu cầu của khán giả ở nhiều độ tuổi → Đúng." },
  { id: "p11", sec: "read", kind: KF, stem: "这个歌特别好听，最近很流行，你（　）没听过？", opts: BANK, a: 0, ex: "竟然 = vậy mà, không ngờ: bài hát đang rất thịnh hành mà bạn lại chưa nghe, người nói thấy bất ngờ." },
  { id: "p12", sec: "read", kind: KF, stem: "您女儿真可爱，长得真像您，（　）是眼睛。", opts: BANK, a: 1, ex: "尤其 = nhất là: trong những nét giống nhau, đôi mắt là giống nhất." },
  { id: "p13", sec: "read", kind: KF, stem: "我要等她生日那天再送给她这个礼物，你现在（　）别告诉她。", opts: BANK, a: 2, ex: "千万 + 别 = nhất định đừng: lời dặn dò khẩn thiết." },
  { id: "p14", sec: "read", kind: KF, stem: "我们总是很容易看到一个人的缺点，但是别忘了，他身上的优点更（　）我们去发现、去学习。", opts: BANK, a: 4, ex: "值得 = đáng: ưu điểm của người khác càng đáng để chúng ta khám phá và học hỏi." },
  { id: "p15", sec: "read", kind: KF, stem: "三叶草的叶子一般为三个，但（　）也会出现四个叶子的。", opts: BANK, a: 5, ex: "偶尔 = thỉnh thoảng: cỏ ba lá thường có 3 lá, chỉ thỉnh thoảng mới có cây 4 lá." },
  { id: "p16", sec: "read", kind: KO, passage: "A 其次要知道怎么做　B 不管做什么事情　C 首先应该明白你为什么要做", stem: ORDER_STEM, opts: ["BCA", "CBA", "BAC", "ACB"], a: 0, ex: "B (bất kể làm việc gì) mở đầu, rồi C 首先 (trước tiên), sau đó A 其次 (tiếp theo) → BCA." },
  { id: "p17", sec: "read", kind: KO, passage: "A 如果还是使用以前的办法　B 相反，会使问题变得更复杂　C 不但不能解决任何问题", stem: ORDER_STEM, opts: ["CAB", "ACB", "ABC", "BAC"], a: 1, ex: "A 如果 (nếu) nêu giả thiết, C 不但不能… (không những không giải quyết được), B 相反 (ngược lại còn phức tạp hơn) → ACB." },
  { id: "p18", sec: "read", kind: KO, passage: "A 所以从那以后我就不敢再躺着看书了　B 结果眼睛越来越不好　C 小时候我总喜欢躺在床上看书", stem: ORDER_STEM, opts: ["BCA", "CAB", "CBA", "ABC"], a: 2, ex: "C (hồi nhỏ thích nằm đọc sách) → B 结果 (kết quả là mắt kém dần) → A 所以 (vì vậy không dám nữa) → CBA." },
  { id: "p19", sec: "read", kind: KO, passage: "A 它能丰富你的知识　B 同时，它还会丰富你的情感　C 阅读有许多好处", stem: ORDER_STEM, opts: ["ABC", "CBA", "BAC", "CAB"], a: 3, ex: "C nêu chủ đề (đọc sách có nhiều lợi ích) → A (làm phong phú kiến thức) → B 同时 (đồng thời còn làm phong phú tình cảm) → CAB." },
  { id: "p20", sec: "read", kind: KO, passage: "A 无论结果怎么样　B 这次比赛他已经打出了自己最好的水平　C 我们都应该为他高兴", stem: ORDER_STEM, opts: ["BAC", "CAB", "ABC", "BCA"], a: 0, ex: "B nêu sự việc → A 无论… (bất kể kết quả thế nào) → C 都 (chúng ta đều nên vui cho anh ấy). 无论 luôn đi với 都 ở vế sau → BAC." },
  { id: "p21", sec: "read", kind: KR, passage: "一般情况下，你花的钱越多，买的东西也就越好。", stem: "★ 这句话的意思最接近：", opts: ["便宜的东西质量更好", "一分钱一分货", "买东西一定要花很多钱", "好东西都不贵"], a: 1, ex: "Tiêu càng nhiều tiền thì mua được đồ càng tốt = 一分钱一分货 (tiền nào của nấy)." },
  { id: "p22", sec: "read", kind: KR, passage: "人们常说“生命在于运动”，所以很多人一到周末就会到体育馆打几场球。", stem: "★ 很多人周末去体育馆做什么？", opts: ["看比赛", "工作", "学习", "打球"], a: 3, ex: "到体育馆打几场球 = đến nhà thi đấu chơi vài trận bóng → 打球." },
  { id: "p23", sec: "read", kind: KR, passage: "100年前，塑料一出现就受到人们的普遍欢迎。可是，它的大量使用也带来了严重的环境污染问题。于是，一些国家规定，超市、商场不能为顾客提供免费塑料袋。", stem: "★ 一些国家为什么规定超市、商场不能提供免费塑料袋？", opts: ["塑料袋太贵", "顾客不喜欢塑料袋", "塑料袋带来了严重的环境污染", "塑料袋质量不好"], a: 2, ex: "Đoạn văn nói dùng nhựa với số lượng lớn gây ô nhiễm môi trường nghiêm trọng; 于是 (vì vậy) mới có quy định này." },
  { id: "p24", sec: "read", kind: KR, passage: "选择职业的关键在于兴趣，当你喜欢做一件事情的时候，你会带着热情去工作，就不会感到累，更不会觉得有太大的压力。", stem: "★ 根据这段话，选择职业的关键是：", opts: ["兴趣", "收入", "压力", "时间"], a: 0, ex: "关键在于兴趣 = điều then chốt nằm ở sở thích → 兴趣." },
  { id: "p25", sec: "read", kind: KR, passage: "很多人问去丽江旅游怎么样，总的来说，丽江景色不错，那里的人也很热情，去那里旅游是个不错的选择。", stem: "★ 说话人觉得去丽江旅游怎么样？", opts: ["那里的人不太热情", "是个不错的选择", "景色一般", "交通不方便"], a: 1, ex: "Câu cuối: 去那里旅游是个不错的选择 = đi du lịch ở đó là một lựa chọn không tồi. Đoạn văn cũng nói cảnh đẹp và người nhiệt tình, nên các đáp án khác đều sai." },
];
const ORD: OrdQ[] = [
  { id: "w1", tiles: ["负责", "这件事情", "王大夫", "应该由"], answers: ["这件事情应该由王大夫负责", "应该由王大夫负责这件事情"], ex: "由 + người + 负责 = do ai phụ trách: Việc này nên do bác sĩ Vương phụ trách." },
  { id: "w2", tiles: ["别告诉她", "你现在", "千万"], answers: ["你现在千万别告诉她"], ex: "千万 đứng ngay trước 别: Bây giờ bạn nhất định đừng nói với cô ấy." },
  { id: "w3", tiles: ["看法不同", "对于这件事", "我跟大家的"], answers: ["对于这件事我跟大家的看法不同"], ex: "对于 + sự việc thường đứng đầu câu: Về việc này, quan điểm của tôi khác mọi người." },
  { id: "w4", tiles: ["两倍", "他的工资", "是", "我的"], answers: ["他的工资是我的两倍"], ex: "Cấu trúc A 是 B 的 X 倍: Lương của anh ấy gấp hai lần lương của tôi." },
  { id: "w5", tiles: ["没听过", "竟然", "这个歌", "你"], answers: ["这个歌你竟然没听过", "你竟然没听过这个歌"], ex: "竟然 đặt sau chủ ngữ, trước động từ: Bài hát này vậy mà bạn chưa nghe." },
];

const WEEKS: number[][] = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16, 17], [18, 19, 20], []];
type Task = { title: string; tv: string; detail: string; dv: string; min: number };
function weekTasks(w: number): Task[] {
  const ls = WEEKS[w] ?? [];
  if (ls.length === 0) return [
    { title: "随机水平测验（再做一次）", tv: "Làm lại Kiểm tra ngẫu nhiên", detail: "做「随机水平测验」（随机30题），和第一次的分数对比，找出最弱的课。", dv: "Làm «Kiểm tra ngẫu nhiên» (30 câu ngẫu nhiên), so sánh với điểm lần đầu và tìm ra bài yếu nhất.", min: 40 },
    { title: "官方 HSK 3.0 样题：听力", tv: "Đề mẫu chính thức HSK 3.0: Nghe", detail: "在 chinesetest.cn 下载 HSK 3.0 四级样题包，完成听力部分（约20分钟）并对答案。", dv: "Tải bộ đề mẫu HSK 3.0 cấp 4 tại chinesetest.cn, làm phần nghe (khoảng 20 phút) rồi đối chiếu đáp án.", min: 35 },
    { title: "官方样题：阅读（限时30分钟）", tv: "Đề mẫu: Đọc hiểu (giới hạn 30 phút)", detail: "完成阅读部分，错题标出生词和语言点。", dv: "Làm phần đọc hiểu; ở các câu sai, đánh dấu từ mới và điểm ngữ pháp.", min: 40 },
    { title: "官方样题：写作（限时25分钟）", tv: "Đề mẫu: Viết (giới hạn 25 phút)", detail: "5个看图用词造句 + 1篇不少于80字的短文。", dv: "5 câu nhìn tranh, dùng từ cho sẵn đặt câu + 1 đoạn văn ít nhất 80 chữ.", min: 40 },
    { title: "第1–10课总复习", tv: "Tổng ôn bài 1–10", detail: "闪卡打乱复习；重做第1–10课小测里的错题。", dv: "Ôn thẻ từ theo thứ tự xáo trộn; làm lại các câu sai trong bài kiểm tra bài 1–10.", min: 40 },
    { title: "第11–20课总复习", tv: "Tổng ôn bài 11–20", detail: "闪卡打乱复习；重做第11–20课小测里的错题。", dv: "Ôn thẻ từ theo thứ tự xáo trộn; làm lại các câu sai trong bài kiểm tra bài 11–20.", min: 40 },
    { title: "全真模拟", tv: "Thi thử như thật", detail: "按考试时间完整做一套（纸笔考约85分钟），考后只复习错题。", dv: "Làm trọn một đề đúng thời gian thi thật (thi giấy khoảng 85 phút), sau đó chỉ ôn lại câu sai.", min: 85 },
  ];
  const study = (l: number): Task[] => [
    { title: `第${l}课 生词 + 课文`, tv: `Bài ${l}: Từ mới + Bài khóa`, detail: `「课程」→ 第${l}课：生词表朗读两遍，闪卡过一遍；看课文要点，用中文回答问题。`, dv: `Vào «Bài học» → Bài ${l}: đọc to bảng từ mới hai lần, xem thẻ từ một lượt; đọc ý chính các bài khóa và trả lời câu hỏi bằng tiếng Trung.`, min: ls.length === 3 ? 45 : 40 },
    { title: `第${l}课 语言点 + 小测`, tv: `Bài ${l}: Ngữ pháp + Kiểm tra`, detail: `学5个语言点，每个照例句自己造1句；做第${l}课小测（目标 8/10 以上），错词抄写3遍。`, dv: `Học 5 điểm ngữ pháp, mỗi điểm tự đặt 1 câu theo câu mẫu; làm bài kiểm tra bài ${l} (mục tiêu từ 8/10 trở lên), chép lại từ sai 3 lần.`, min: ls.length === 3 ? 45 : 35 },
  ];
  const days: Task[] = [];
  if (ls.length === 2) {
    const a = ls[0] as number; const b = ls[1] as number;
    days.push({ title: `第${a}课 生词（前一半）+ 课文1–3`, tv: `Bài ${a}: Từ mới (nửa đầu) + Bài khóa 1–3`, detail: `「课程」→ 第${a}课：前15个生词朗读两遍、闪卡过一遍；看课文1–3要点，用中文回答问题。`, dv: `Vào «Bài học» → Bài ${a}: đọc to 15 từ đầu hai lần, xem thẻ từ một lượt; đọc ý chính bài khóa 1–3 và trả lời câu hỏi bằng tiếng Trung.`, min: 40 });
    days.push({ title: `第${a}课 生词（后一半）+ 语言点`, tv: `Bài ${a}: Từ mới (nửa sau) + Ngữ pháp`, detail: "后一半生词 + 5个语言点，每个照例句自己造1句；看课文4–5。", dv: "Nửa sau từ mới + 5 điểm ngữ pháp, mỗi điểm tự đặt 1 câu theo câu mẫu; đọc bài khóa 4–5.", min: 40 });
    days.push({ title: `第${a}课 复习 + 小测`, tv: `Bài ${a}: Ôn tập + Kiểm tra`, detail: `闪卡打乱复习全部生词，做第${a}课小测（目标 8/10 以上），错词抄写3遍。`, dv: `Ôn toàn bộ từ mới bằng thẻ từ xáo trộn, làm bài kiểm tra bài ${a} (mục tiêu từ 8/10 trở lên), chép lại từ sai 3 lần.`, min: 30 });
    days.push({ title: `第${b}课 生词（前一半）+ 课文1–3`, tv: `Bài ${b}: Từ mới (nửa đầu) + Bài khóa 1–3`, detail: `「课程」→ 第${b}课：前15个生词朗读两遍、闪卡过一遍；看课文1–3要点。`, dv: `Vào «Bài học» → Bài ${b}: đọc to 15 từ đầu hai lần, xem thẻ từ một lượt; đọc ý chính bài khóa 1–3.`, min: 40 });
    days.push({ title: `第${b}课 生词（后一半）+ 语言点`, tv: `Bài ${b}: Từ mới (nửa sau) + Ngữ pháp`, detail: "后一半生词 + 5个语言点，每个照例句自己造1句；看课文4–5。", dv: "Nửa sau từ mới + 5 điểm ngữ pháp, mỗi điểm tự đặt 1 câu theo câu mẫu; đọc bài khóa 4–5.", min: 40 });
    days.push({ title: `第${b}课 复习 + 小测`, tv: `Bài ${b}: Ôn tập + Kiểm tra`, detail: `闪卡打乱复习，做第${b}课小测，错词抄写3遍。`, dv: `Ôn bằng thẻ từ xáo trộn, làm bài kiểm tra bài ${b}, chép lại từ sai 3 lần.`, min: 30 });
  } else {
    ls.forEach((l: number) => { study(l).forEach((t: Task) => days.push(t)); });
  }
  days.push({ title: "本周复习 + 写作", tv: "Ôn tập tuần + Viết", detail: "本周各课闪卡混合复习；用本周语言点写一段不少于80字的短文（新版 HSK 3.0 写作题型）。", dv: "Ôn trộn thẻ từ của các bài trong tuần; dùng ngữ pháp của tuần viết một đoạn văn ít nhất 80 chữ (dạng bài viết của HSK 3.0 mới).", min: 40 });
  return days;
}

function strip(s: string): string { return s.replace(/[\s，。！？、,.!?“”"]/g, ""); }
const STORE = "hsk4-plan-vi-v1";

function Opt({ label, state, onClick }: { label: string; state: "idle" | "sel" | "right" | "wrong" | "missed"; onClick: () => void }) {
  const t = useGrokTheme();
  const bg = state === "sel" ? t.fill.accentSubtle : state === "right" || state === "missed" ? t.fill.successSubtle : state === "wrong" ? t.fill.dangerSubtle : "transparent";
  const bd = state === "sel" ? t.border.focus : t.border.default;
  const mark = state === "right" ? "  ✓" : state === "wrong" ? "  ✗" : state === "missed" ? "  ← 正确答案 · Đáp án đúng" : "";
  return (
    <button onClick={onClick} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: `1px solid ${bd}`, background: bg, color: t.text.primary, fontFamily: t.font.family, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, cursor: "pointer", width: "100%" }}>
      {label}{mark}
    </button>
  );
}

function QBlock({ q, idx, chosen, done, onPick }: { q: Q; idx: number; chosen: number | undefined; done: boolean; onPick: (i: number) => void }) {
  const t = useGrokTheme();
  const letters = ["A", "B", "C", "D", "E", "F"];
  const big = q.kind.startsWith("看汉字");
  return (
    <div style={{ padding: "14px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, marginBottom: 6 }}>{idx}. {q.kind}</div>
      {q.passage ? <div style={{ color: t.text.secondary, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, marginBottom: 6 }}>{q.passage}</div> : null}
      <div style={{ color: t.text.primary, fontSize: big ? "28px" : t.font.body1.fontSize, lineHeight: big ? "36px" : t.font.body1.lineHeight, marginBottom: 10 }}>{q.stem}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {q.opts.map((o: string, i: number) => {
          let st: "idle" | "sel" | "right" | "wrong" | "missed" = chosen === i ? "sel" : "idle";
          if (done) st = i === q.a ? (chosen === i ? "right" : "missed") : chosen === i ? "wrong" : "idle";
          return <Opt key={i} label={q.opts.length > 2 ? `${letters[i]}  ${o}` : o} state={st} onClick={() => { if (!done) onPick(i); }} />;
        })}
      </div>
      {done && q.ex ? <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 8 }}>Giải thích: {q.ex}</div> : null}
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
      <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, marginBottom: 6 }}>{idx}. 完成句子 · Hoàn thành câu (bấm vào từ để ghép thành câu)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {q.tiles.map((w: string, i: number) => tile(w, () => { if (!done) onChange([...order, i]); }, i, !done && !order.includes(i)))}
      </div>
      <div style={{ minHeight: 40, padding: "8px 12px", borderRadius: 8, border: `1px dashed ${t.border.strong}`, color: t.text.primary, fontSize: t.font.body1.fontSize, background: done ? (ok ? t.fill.successSubtle : t.fill.dangerSubtle) : "transparent" }}>
        {built ? `${built}。` : "（你的句子 · Câu của bạn）"}{done ? (ok ? "  ✓" : "  ✗") : ""}
      </div>
      {done && !ok ? <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, marginTop: 6 }}>参考答案 · Đáp án tham khảo：{q.answers.join(" ／ ")}。</div> : null}
      {done ? <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 6 }}>Giải thích: {q.ex}</div> : null}
      {!done ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <Button label="撤销一个 · Bỏ từ cuối" onClick={() => onChange(order.slice(0, -1))} />
          <Button label="清空 · Xóa hết" onClick={() => onChange([])} />
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
      <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, marginTop: 6 }}>已完成 {value} / {total} 天 · Đã hoàn thành {value} / {total} ngày ({pct}%)</div>
    </div>
  );
}

function DayRow({ n, task, done, onToggle }: { n: number; task: Task; done: boolean; onToggle: () => void }) {
  const t = useGrokTheme();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ flex: "1 1 260px" }}>
        <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, fontWeight: t.weight.medium, textDecoration: done ? "line-through" : "none" }}>第{n}天 · {task.title}</div>
        <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, textDecoration: done ? "line-through" : "none" }}>Ngày {n} · {task.tv}</div>
        <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 4 }}>{task.detail}</div>
        <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 2 }}>{task.dv} 约{task.min}分钟 · khoảng {task.min} phút</div>
      </div>
      <Button label={done ? "✓ 已完成 · Đã xong" : "标记完成 · Đánh dấu xong"} variant={done ? "primary" : "quiet"} onClick={onToggle} />
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
            <div style={{ fontSize: "18px", lineHeight: "26px", color: t.text.primary, marginTop: 6 }}>{w.v}</div>
            <div style={{ fontSize: t.font.label.fontSize, color: t.text.tertiary, marginTop: 4 }}>{w.pos ? `${w.pos}` : ""}{w.pos && w.hv ? " · " : ""}{w.hv ? `Hán Việt: ${w.hv}` : ""}</div>
          </div>
        ) : (
          <div style={{ fontSize: t.font.label.fontSize, color: t.text.tertiary }}>点卡片看拼音和释义 · Bấm vào thẻ để xem pinyin và nghĩa</div>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}>
        <Button label="上一张 · Thẻ trước" onClick={() => { setI((i - 1 + deck.length) % deck.length); setFlip(false); }} />
        <Button label={flip ? "盖住 · Úp lại" : "翻面 · Lật thẻ"} variant="primary" onClick={() => setFlip(!flip)} />
        <Button label="下一张 · Thẻ sau" onClick={() => { if ((i + 1) % deck.length === 0 && deck[0]) petEvent("cards", { lesson: (deck[0] as Word).l }); setI((i + 1) % deck.length); setFlip(false); }} />
        <Button label="打乱顺序 · Xáo trộn" onClick={() => { setSeed(Math.floor(Math.random() * 100000) + 1); setI(0); setFlip(false); }} />
        <span style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize }}>{(i % deck.length) + 1} / {deck.length}</span>
      </div>
    </div>
  );
}

function GramItem({ n, point, ex, vi, exv }: { n: number; point: string; ex: string; vi: string; exv: string }) {
  const t = useGrokTheme();
  return (
    <div style={{ padding: "14px 0", borderTop: `1px solid ${t.border.subtle}` }}>
      <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, fontWeight: t.weight.semibold }}>{n}. {point}</div>
      <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, marginTop: 4 }}>{vi}</div>
      <div style={{ color: t.text.secondary, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, marginTop: 6 }}>例句 · Ví dụ：{ex}</div>
      <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 2 }}>→ {exv}</div>
    </div>
  );
}

function MeaningCell({ v, hv }: { v: string; hv: string }) {
  const t = useGrokTheme();
  return (
    <div>
      <div>{v}</div>
      {hv ? <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize }}>Hán Việt: {hv}</div> : null}
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
  const weekOpts = WEEKS.map((ls: number[], i: number) => ({ value: String(i), label: ls.length ? `第${i + 1}周 · 第${ls.join("、")}课 · Tuần ${i + 1} · Bài ${ls.join(", ")}` : `第${i + 1}周 · 全真模拟 · Tuần ${i + 1} · Thi thử` }));
  const lessonOpts = TITLES.map((tt: [string, string], i: number) => ({ value: String(i + 1), label: `第${i + 1}课 ${tt[0]} · Bài ${i + 1}: ${tt[1]}` }));

  const L = Number(lesson);
  const lw = WORDS.filter((w: Word) => w.l === L);
  const lt = TEXTS.filter((x) => x.l === L);
  const lg = GRAM.filter((g) => g.l === L);
  const title = TITLES[L - 1] ?? ["", ""];
  const partial = PARTIAL[L];

  const quiz = useMemo(() => genQuiz(Number(qLesson), qSeed), [qLesson, qSeed]);
  const qScore = quiz.filter((q: Q) => qAns[q.id] === q.a).length;

  const secScore = (sec: "listen" | "read") => PLACE.filter((q: Q) => q.sec === sec && pAns[q.id] === q.a).length;
  const wScore = ORD.filter((q: OrdQ) => { const o = pOrd[q.id] ?? []; const b = o.map((i: number) => q.tiles[i] ?? "").join(""); return q.answers.some((a: string) => strip(a) === strip(b)); }).length;
  const ls = secScore("listen"); const rs = secScore("read");
  const estL = Math.round((ls / 10) * 100); const estR = Math.round((rs / 15) * 100); const estW = Math.round((wScore / 5) * 100);
  const est = estL + estR + estW;
  const answered = Object.keys(pAns).length + ORD.filter((q: OrdQ) => (pOrd[q.id] ?? []).length > 0).length;

  return (
    <Page title="HSK 4 系统学习 · Học HSK 4 có hệ thống (中文–Tiếng Việt)" summary="按《HSK标准教程4》上下册 20 课整理：10 周学习计划、602 个生词（越南语释义 + 闪卡）、100 个语言点、水平测试和每课小测。· Theo 20 bài của giáo trình chuẩn HSK 4 (Quyển Thượng và Hạ): kế hoạch 10 tuần, 602 từ mới có nghĩa tiếng Việt và thẻ từ, 100 điểm ngữ pháp, bài kiểm tra trình độ và bài kiểm tra từng bài. HSK 3.0 bắt đầu áp dụng từ 13/12/2026, xem «Thông tin kỳ thi»." width="column" lang="zh-Hans">
      <Segmented options={[{ value: "plan", label: "学习计划 · Kế hoạch học tập" }, { value: "read", label: "课文 · Bài khoá" }, { value: "lessons", label: "课程 · Bài học" }, { value: "quiz", label: "每课小测 · Kiểm tra từng bài" }, { value: "test", label: "随机水平测验 · Kiểm tra ngẫu nhiên" }, { value: "exam", label: "考试须知 · Thông tin kỳ thi" }, ...(PET_ON ? [{ value: "pet", label: "我的宠物 · Thú cưng" }] : [])]} value={tab} onChange={(v: string) => setTab(v)} />

      {tab === "plan" ? (
        <Section heading="10 周学习计划 · Kế hoạch học 10 tuần">
          <ProgressBar value={doneCount} total={totalDays} />
          <Select label="选择周 · Chọn tuần" options={weekOpts} value={week} onChange={(v: string) => setWeek(v)} />
          <div>
            {tasks.map((task: Task, d: number) => (
              <DayRow key={`${wk}-${d}`} n={d + 1} task={task} done={!!done[`${wk}-${d}`]} onToggle={() => toggleDay(`${wk}-${d}`)} />
            ))}
          </div>
          <Text>第1–7周每周2课，第8–9周每周3课，第10周做全真模拟。开始前先做一次「随机水平测验」，第10周再做一次对比。进度保存在这台设备的浏览器里；如果浏览器不允许保存，关闭页面后会重置。</Text>
          <Text>Tuần 1–7 mỗi tuần học 2 bài, tuần 8–9 mỗi tuần 3 bài, tuần 10 thi thử. Trước khi bắt đầu hãy làm «Kiểm tra ngẫu nhiên» một lần, đến tuần 10 làm lại để so sánh. Tiến độ được lưu trong trình duyệt của thiết bị này; nếu trình duyệt không cho phép lưu, tiến độ sẽ mất khi đóng trang.</Text>
        </Section>
      ) : null}

      {tab === "read" ? <Reader lang="vi" titles={TITLES} /> : null}

      {tab === "lessons" ? (
        <Section heading={`第${L}课 ${title[0]} · Bài ${L}: ${title[1]}`} caption={`${L <= 10 ? "4上 · Quyển 4 Thượng" : "4下 · Quyển 4 Hạ"} · ${lw.length} 个生词 · ${lw.length} từ mới`}>
          <Select label="选择课 · Chọn bài" options={lessonOpts} value={lesson} onChange={(v: string) => { setLesson(v); }} />
          <Segmented options={[{ value: "words", label: "生词 · Từ mới", count: lw.length }, { value: "cards", label: "闪卡 · Thẻ từ" }, { value: "grammar", label: "语言点 · Ngữ pháp" }, { value: "texts", label: "课文 · Bài khóa" }]} value={view} onChange={(v: string) => setView(v)} />
          {view === "words" ? (
            <Table columns={["汉字 · Chữ Hán", "拼音 · Pinyin", "词性 · Từ loại", "越南语 · Nghĩa tiếng Việt"]} rows={lw.map((w: Word) => [<span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}><SpeakBtn items={wordAudio(w.h)} k={"w:" + w.h} size={28} /><span lang="zh-Hans" style={{ fontSize: 17 }}>{w.h}</span></span>, w.p, w.pos || "—", <MeaningCell v={w.v} hv={w.hv} />])} align={["start", "start", "start", "start"]} />
          ) : null}
          {view === "cards" ? <Flashcards key={`fc-${L}`} words={lw} /> : null}
          {view === "grammar" ? (
            <div>
              {lg.map((g, i: number) => <GramItem key={`${L}-${i}`} n={i + 1} point={g.point} ex={g.ex} vi={g.vi} exv={g.exv} />)}
            </div>
          ) : null}
          {view === "texts" ? (
            <Rows rows={lt.map((x) => ({ lead: `课文${x.n} · Bài khóa ${x.n}`, title: `${x.title} · ${x.tv}`, detail: x.q ? `要点问题：${x.q}　Câu hỏi: ${x.qv}` : undefined }))} />
          ) : null}
          {view === "texts" && partial ? <Callout tone="info">本课部分内容：{partial[0]}。生词和语言点是完整的。· Bài này chưa đầy đủ: {partial[1]}. Từ mới và ngữ pháp thì đầy đủ.</Callout> : null}
        </Section>
      ) : null}

      {tab === "pet" && PET_ON ? <PetTab /> : null}

      {tab === "test" ? <RandomTest lang="vi" /> : null}

      {tab === "__old_test" ? (
        <Section heading="水平测试（30题）· Kiểm tra trình độ (30 câu)" caption="没有音频，「听力」用阅读形式的判断对错代替。· Không có âm thanh, phần «Nghe» được thay bằng câu đúng/sai dạng đọc. Từ vựng và ngữ pháp đều lấy từ giáo trình.">
          {PLACE.map((q: Q, i: number) => (
            <Fragment2 key={q.id}>
              {i === 0 ? <SubHead text="一、听力（替代）· 判断对错 · I. Nghe (thay thế) · Đúng hay sai" sub="先读句子（代替听录音），再判断★句对不对。· Đọc câu trước (thay cho nghe băng), sau đó xác định câu có dấu ★ đúng hay sai." /> : null}
              {i === 10 ? <SubHead text="二、阅读 · 选词填空 · II. Đọc hiểu · Chọn từ điền vào chỗ trống" sub={`每题选一个最合适的词。· Mỗi câu chọn một từ thích hợp nhất. 词语 · Từ cho sẵn：${BANK.map((b: string, k: number) => `${"ABCDEF"[k]} ${b}`).join("　")}`} /> : null}
              {i === 15 ? <SubHead text="二、阅读 · 排列顺序 · II. Đọc hiểu · Sắp xếp thứ tự" sub="把A、B、C三个句子排成正确的顺序。· Sắp xếp ba câu A, B, C theo đúng thứ tự." /> : null}
              {i === 20 ? <SubHead text="二、阅读 · 短文理解 · II. Đọc hiểu · Đọc hiểu đoạn văn" sub="读短文，选出正确答案。· Đọc đoạn văn, chọn đáp án đúng." /> : null}
              <QBlock q={q} idx={i + 1} chosen={pAns[q.id]} done={pDone} onPick={(k: number) => setPAns({ ...pAns, [q.id]: k })} />
            </Fragment2>
          ))}
          <SubHead text="三、书写 · 完成句子 · III. Viết · Hoàn thành câu" sub="点词语，组成一个正确的句子。· Bấm lần lượt vào các từ để ghép thành một câu đúng." />
          {ORD.map((q: OrdQ, i: number) => (
            <OrdBlock key={q.id} q={q} idx={26 + i} order={pOrd[q.id] ?? []} done={pDone} onChange={(o: number[]) => setPOrd({ ...pOrd, [q.id]: o })} />
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {!pDone ? <Button label="交卷看成绩 · Nộp bài xem điểm" variant="primary" onClick={() => setPDone(true)} /> : <Button label="重新做 · Làm lại" onClick={() => { setPDone(false); setPAns({}); setPOrd({}); }} />}
            <span style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize }}>已作答 · Đã trả lời {answered} / 30</span>
          </div>
          {pDone ? (
            <Table columns={["部分 · Phần", "答对 · Số câu đúng", "折算 · Quy đổi (/100)"]} rows={[["听力（替代）· Nghe (thay thế)", `${ls} / 10`, String(estL)], ["阅读 · Đọc hiểu", `${rs} / 15`, String(estR)], ["书写 · Viết", `${wScore} / 5`, String(estW)], ["合计 · Tổng", `${ls + rs + wScore} / 30`, `${est} / 300`]]} emphasis={3} />
          ) : null}
          {pDone ? (
            <Callout tone={est >= 180 ? "success" : "warning"} lead={`估计成绩 · Điểm ước tính: ${est} / 300（合格线 · Điểm đạt: 180）`}>这是按本测验正确率折算的粗略估计，不是官方分数换算；题量小、没有真实听力，误差很大。{est >= 180 ? "目前已接近合格水平，按计划巩固并多做官方样题。" : "按 10 周计划从第1课开始，每周做小测，第10周再测一次。"} · Đây chỉ là ước tính sơ bộ theo tỷ lệ câu đúng, không phải cách quy đổi điểm chính thức; số câu ít và không có phần nghe thật nên sai số lớn. {est >= 180 ? "Hiện đã gần đạt mức đỗ, hãy củng cố theo kế hoạch và làm thêm đề mẫu chính thức." : "Hãy học theo kế hoạch 10 tuần từ bài 1, mỗi tuần làm bài kiểm tra, đến tuần 10 kiểm tra lại."} Xem giải thích bằng tiếng Việt dưới mỗi câu.</Callout>
          ) : null}
        </Section>
      ) : null}

      {tab === "quiz" ? (
        <Section heading={`第${qLesson}课 小测（10题）· Kiểm tra bài ${qLesson} (10 câu)`} caption="8题词汇（意思、汉字、拼音）+ 2题语言点填空，全部取自本课。· 8 câu từ vựng (nghĩa, chữ Hán, pinyin) + 2 câu điền ngữ pháp, tất cả lấy từ bài này. Chọn một đáp án cho mỗi câu rồi bấm «Nộp bài».">
          <Select label="选择课 · Chọn bài" options={lessonOpts} value={qLesson} onChange={(v: string) => { setQLesson(v); setQAns({}); setQDone(false); setQSeed(1); }} />
          {quiz.map((q: Q, i: number) => (
            <QBlock key={`${qSeed}-${q.id}`} q={q} idx={i + 1} chosen={qAns[q.id]} done={qDone} onPick={(k: number) => setQAns((a: Record<string, number>) => ({ ...a, [q.id]: k }))} />
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {!qDone ? <Button label="交卷 · Nộp bài" variant="primary" onClick={() => { setQDone(true); petEvent("quiz", { lesson: Number(qLesson), score: qScore, wrong: PET_ON ? quizWrong(quiz, qAns) : [] }); }} /> : <Button label="换一套题 · Đổi đề khác" variant="primary" onClick={() => { setQSeed(qSeed + 1); setQAns({}); setQDone(false); }} />}
            <Button label="重做本套 · Làm lại đề này" onClick={() => { setQAns({}); setQDone(false); }} />
            {qDone ? <span style={{ color: t.text.primary, fontSize: t.font.body1.fontSize }}>得分 · Điểm: {qScore} / 10{qScore >= 8 ? " · 不错！Tốt lắm!" : " · 把错词放进闪卡多复习几遍。Hãy ôn lại các từ sai bằng thẻ từ nhiều lần."}</span> : null}
          </div>
        </Section>
      ) : null}

      {tab === "exam" ? (
        <Section heading="考试须知 · Thông tin kỳ thi">
          <Callout tone="warning" lead="注意：新版 HSK 3.0 已启用 · Lưu ý: áp dụng HSK 3.0 mới">官方公告：3.0 版 HSK 于 2026 年 12 月 13 日全球正式开考。按 10 周计划，你参加的将是新版考试；教材按旧版大纲编写，第10周请用官方 HSK 3.0 样题熟悉新题型。· Theo thông báo chính thức, HSK phiên bản 3.0 chính thức thi trên toàn cầu từ ngày 13/12/2026. Theo kế hoạch 10 tuần, bạn sẽ thi theo dạng đề mới; giáo trình được biên soạn theo đề cương cũ, nên ở tuần 10 hãy dùng đề mẫu HSK 3.0 chính thức để làm quen dạng bài mới.</Callout>
          <Section heading="新版 HSK 四级（3.0）题型 · Cấu trúc đề HSK 4 mới (3.0)">
            <Table columns={["部分 · Phần", "题数 · Số câu", "时间 · Thời gian (phút)"]} rows={[["听力 第一部分 · Nghe, phần 1", "14", "约20 · khoảng 20 (cả phần nghe)"], ["听力 第二部分 · Nghe, phần 2", "18", ""], ["填写答题卡 · Điền phiếu trả lời", "—", "5"], ["阅读 第一部分 · Đọc, phần 1", "10", "30 (cả phần đọc)"], ["阅读 第二部分 · Đọc, phần 2", "15", ""], ["阅读 第三部分 · Đọc, phần 3", "7", ""], ["写作 第一部分 · Viết, phần 1", "5", "25 (cả phần viết)"], ["写作 第二部分 · Viết, phần 2", "1", ""], ["合计 · Tổng", "70", "80"]]} emphasis={8} />
            <Text>官网表格合计 80 分钟；纸笔考另有约 5 分钟填写个人信息，全程约 85 分钟。官方样卷中，写作第一部分是看图用词造句，第二部分是一篇不少于 80 字的短文。2026 年 9 月的试行考试要求四级笔试与口语同时报名（口语约 20 分钟），正式考试请以报名页面为准。</Text>
            <Text>Bảng trên trang chính thức ghi tổng 80 phút; thi trên giấy có thêm khoảng 5 phút điền thông tin cá nhân, tổng cộng khoảng 85 phút. Trong đề mẫu chính thức, phần viết 1 là nhìn tranh dùng từ đặt câu, phần viết 2 là một đoạn văn ít nhất 80 chữ. Kỳ thi thử tháng 9/2026 yêu cầu đăng ký thi viết và thi nói (khoảng 20 phút) cấp 4 cùng lúc; với kỳ thi chính thức, hãy theo hướng dẫn trên trang đăng ký.</Text>
          </Section>
          <Section heading="分数 · Điểm số">
            <Properties items={[{ label: "满分 · Điểm tối đa", value: "300 分（听力、阅读、写作各一项分数 + 总分）· 300 điểm (có điểm riêng cho Nghe, Đọc, Viết và tổng điểm)" }, { label: "合格线 · Điểm đạt", value: "总分 180 分 · Tổng điểm từ 180" }, { label: "成绩有效期 · Hiệu lực", value: "两年（从考试当日算起）· 2 năm (tính từ ngày thi)" }, { label: "开考时间 · Giờ thi", value: "当地时间 09:00 · 09:00 giờ địa phương" }]} />
          </Section>
          <Section heading="旧版 HSK 四级（2.0，供参考）· HSK 4 bản cũ (2.0, để tham khảo)">
            <Table columns={["部分 · Phần", "题数 · Số câu", "时间 · Thời gian (phút)"]} rows={[["听力 · Nghe (đúng/sai 10 + hội thoại ngắn 15 + hội thoại dài/đoạn văn 20)", "45", "约30 · khoảng 30"], ["填写答题卡 · Điền phiếu trả lời", "—", "5"], ["阅读 · Đọc (chọn từ 10 + sắp xếp 10 + đọc hiểu 20)", "40", "40"], ["书写 · Viết (hoàn thành câu 10 + nhìn tranh đặt câu 5)", "15", "25"], ["合计 · Tổng", "100", "约100 · khoảng 100 (cả buổi khoảng 105)"]]} emphasis={4} />
            <Text>本页「随机水平测验」从约2100题的题库里每次随机抽30题（词义、拼音、选词填空、语法、阅读），用来检查自己目前的水平；它不是官方题型，也没有听力。</Text>
            <Text>«Kiểm tra ngẫu nhiên» trên trang này mỗi lần rút 30 câu từ ngân hàng khoảng 2.100 câu (nghĩa từ, pinyin, điền từ, ngữ pháp, đọc hiểu) để bạn tự kiểm tra trình độ hiện tại; đây không phải dạng đề chính thức và không có phần nghe.</Text>
          </Section>
          <LinkCards links={[
            { title: "HSK (Level 4) 考试结构 · Cấu trúc đề HSK 4", site: "chinesetest.cn", href: "https://www.chinesetest.cn/HSK/4" },
            { title: "3.0版HSK将于12月13日正式开考 · HSK 3.0 chính thức thi từ 13/12", site: "chinesetest.cn", href: "https://admin.chinesetest.cn/gonewcontent.do?id=51336724" },
            { title: "HSK3.0第二轮全球试行考试通知 · Thông báo thi thử HSK 3.0 vòng 2", site: "chinesetest.cn", href: "https://admin.chinesetest.cn/gonewcontent.do?id=51236758" },
            { title: "HSK（四级）旧版样卷 · Đề mẫu HSK 4 bản cũ", site: "chinesetest.cn", href: "http://download.chinesetest.cn/newhsk-site/model/HSK4_yj.pdf" },
          ]} />
        </Section>
      ) : null}
    </Page>
  );
}

function Fragment2({ children }: { children?: ReactNode }) { return <div>{children}</div>; }
function SubHead({ text, sub }: { text: string; sub?: string }) {
  const t = useGrokTheme();
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ color: t.text.primary, fontSize: t.font.heading3.fontSize, lineHeight: t.font.heading3.lineHeight, fontWeight: t.weight.semibold }}>{text}</div>
      {sub ? <div style={{ color: t.text.secondary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}
