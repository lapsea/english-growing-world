// 小游戏静态内容：句子工厂素材 + 语法侦探题库（统一由 MockRepository 提供给游戏）
export interface GrammarDetectItem {
  sentence: string
  wrongIndex: number
  fix: string
  options: string[]
  explain: string
  corrected: string
}

export const scrambleSentences: string[] = [
  'I am a student in Grade Seven.',
  'My schoolbag is blue and white.',
  'These rabbits are very cute.',
  'My favourite subject is science.',
  'We play football after school.',
  'There is a library near the playground.',
  'My mother is a doctor in a hospital.',
  'I get up at six thirty every day.',
  'Can you play the guitar?',
  'My grandpa tells me funny stories.',
]

export const grammarDetectItems: GrammarDetectItem[] = [
  {
    sentence: 'She have a nice schoolbag.',
    wrongIndex: 1,
    fix: 'has',
    options: ['have', 'haves', 'having'],
    explain: '主语 She 是第三人称单数，一般现在时中 have 要变成 has。',
    corrected: 'She has a nice schoolbag.',
  },
  {
    sentence: 'There are a library in my school.',
    wrongIndex: 1,
    fix: 'is',
    options: ['are', 'am', 'be'],
    explain: 'there be 句型遵循“就近原则”：a library 是单数，所以用 There is。',
    corrected: 'There is a library in my school.',
  },
  {
    sentence: 'I and Meimei is good friends.',
    wrongIndex: 3,
    fix: 'are',
    options: ['is', 'am', 'be'],
    explain: '主语 I and Meimei 是复数（两个人），be 动词要用 are。另外习惯上把 I 放在并列主语最后：Meimei and I。',
    corrected: 'Meimei and I are good friends.',
  },
  {
    sentence: 'The cat is under the chair.',
    wrongIndex: -1,
    fix: '',
    options: ['没有错误', 'under 应改为 on', 'cat 应改为 cats'],
    explain: '这句话完全正确！The cat is under the chair. 意思是“猫在椅子下面”。',
    corrected: 'The cat is under the chair.（原句正确）',
  },
  {
    sentence: 'Why do you like maths? Because they are useful.',
    wrongIndex: 9,
    fix: 'it',
    options: ['they', 'them', 'their'],
    explain: 'maths（数学）是单数名词，代词要用 it，不能用 they。',
    corrected: 'Why do you like maths? Because it is useful.',
  },
  {
    sentence: 'My father go to work at seven.',
    wrongIndex: 2,
    fix: 'goes',
    options: ['go', 'going', 'gos'],
    explain: '主语 My father 是第三人称单数，动词 go 要加 -es 变成 goes。',
    corrected: 'My father goes to work at seven.',
  },
  {
    sentence: 'Can you plays chess with me?',
    wrongIndex: 2,
    fix: 'play',
    options: ['plays', 'playing', 'played'],
    explain: '情态动词 can 后面用动词原形，所以是 Can you play...?',
    corrected: 'Can you play chess with me?',
  },
  {
    sentence: 'This is my sister book.',
    wrongIndex: 3,
    fix: "sister's",
    options: ['sister', 'sisters', "sisters'"],
    explain: '表示“某人的”要用名词所有格 ' + "'s" + '：my sister' + "'s" + ' book 我姐姐的书。',
    corrected: "This is my sister's book.",
  },
  {
    sentence: 'What time do you gets up?',
    wrongIndex: 4,
    fix: 'get',
    options: ['gets', 'getting', 'got'],
    explain: '疑问句中有助动词 do 时，后面的动词用原形：What time do you get up?',
    corrected: 'What time do you get up?',
  },
  {
    sentence: 'My birthday is on June one.',
    wrongIndex: 5,
    fix: 'first',
    options: ['one', 'ones', 'once'],
    explain: '日期要用序数词：June first（6月1日），也可以写作 June 1st。',
    corrected: 'My birthday is on June first.',
  },
]
