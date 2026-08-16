export const SAVE_QUOTES = [
  { line: 'Save first. Spend what is left — never the other way around.', by: 'Tarteeb' },
  { line: 'Small amounts, saved daily, become freedom.', by: 'Tarteeb' },
  { line: 'A penny saved is a penny earned.', by: 'Benjamin Franklin' },
  { line: 'Do not save what is left after spending. Spend what is left after saving.', by: 'Warren Buffett' },
  { line: 'Wealth is what you do not spend.', by: 'Tarteeb' },
  { line: 'The best time to save was yesterday. The next best is today.', by: 'Tarteeb' },
  { line: 'Every rupee you keep is a vote for your future self.', by: 'Tarteeb' },
  { line: 'Beware of little expenses; a small leak will sink a great ship.', by: 'Benjamin Franklin' },
  { line: 'If you buy things you do not need, you will soon need to sell things you need.', by: 'Tarteeb' },
  { line: 'Pay yourself first. Then pay the world.', by: 'Tarteeb' },
  { line: 'Discipline is the bridge between income and wealth.', by: 'Tarteeb' },
  { line: 'You do not need more money. You need fewer leaks.', by: 'Tarteeb' },
  { line: 'Wait 24 hours. Most wants fade. Needs stay.', by: 'Tarteeb' },
  { line: 'Rich is not what you earn. Rich is what you keep.', by: 'Tarteeb' },
  { line: 'Skip one want today. Fund one goal tomorrow.', by: 'Tarteeb' },
  { line: 'A budget tells your money where to go so you do not wonder where it went.', by: 'Tarteeb' },
  { line: 'The habit of saving is itself an education.', by: 'T.T. Munger' },
  { line: 'Empty pockets teach. Full pockets, if wasted, teach nothing.', by: 'Tarteeb' },
  { line: 'Save like you might lose your job. Spend like you already have one.', by: 'Tarteeb' },
  { line: 'Compound interest is the eighth wonder — start it with what you save.', by: 'Tarteeb' },
  { line: 'Luxury is a feeling. Savings are a fact.', by: 'Tarteeb' },
  { line: 'Track it. If you cannot see it, you cannot save it.', by: 'Tarteeb' },
  { line: 'Cut one subscription. Keep one promise to yourself.', by: 'Tarteeb' },
  { line: 'Your future bill is already on its way. Meet it with a surplus.', by: 'Tarteeb' },
  { line: 'Do not count coins. Count days of peace they buy.', by: 'Tarteeb' },
  { line: 'Impulse is expensive. Pause is free.', by: 'Tarteeb' },
  { line: 'The goal is not to look rich. The goal is to be calm.', by: 'Tarteeb' },
  { line: 'Save 10%. Live on 90%. Sleep better than 100%.', by: 'Tarteeb' },
  { line: 'Money grows in silence. Spending makes noise.', by: 'Tarteeb' },
  { line: 'Today’s leftover is tomorrow’s option.', by: 'Tarteeb' },
  { line: 'Buy time, not things. Saving buys time.', by: 'Tarteeb' }
]

const URDU_QUOTES = [
  { line: 'پہلے بچت کرو، پھر خرچ — الٹ نہیں۔', by: 'ترتیب' },
  { line: 'روزانہ تھوڑی بچت آزادی بن جاتی ہے۔', by: 'ترتیب' },
  { line: 'جو روپیہ بچا، وہ کمایا گیا۔', by: 'بنجمن فرینکلن' },
  { line: 'خرچ کے بعد نہیں، بچت کے بعد خرچ کرو۔', by: 'وارن بفیٹ' },
  { line: 'دولت وہ ہے جو تم خرچ نہ کرو۔', by: 'ترتیب' },
  { line: 'بچت کا بہترین وقت کل تھا، اگلا بہترین آج ہے۔', by: 'ترتیب' },
  { line: 'ہر بچا ہوا روپیہ کل کے لیے ووٹ ہے۔', by: 'ترتیب' }
]

const ROMAN_QUOTES = [
  { line: 'Pehle bachaao, phir kharch — ulta nahi.', by: 'Tarteeb' },
  { line: 'Roz thori bachat azadi ban jati hai.', by: 'Tarteeb' },
  { line: 'Jo rupiya bacha, woh kamaya gaya.', by: 'Benjamin Franklin' },
  { line: 'Kharch ke baad nahi, bachat ke baad kharch karo.', by: 'Warren Buffett' },
  { line: 'Daulat woh hai jo tum kharch na karo.', by: 'Tarteeb' },
  { line: 'Bachat ka behtareen waqt kal tha. Agla behtareen aaj hai.', by: 'Tarteeb' },
  { line: 'Har bachaya hua rupiya kal ke liye vote hai.', by: 'Tarteeb' }
]

export function quoteForScheme(id, lang = 'en') {
  const pack = SCHEME_QUOTES[id] || SCHEME_QUOTES['50-30-20']
  return pack[lang] || pack.en
}

const SCHEME_QUOTES = {
  '50-30-20': {
    en: { line: 'Do not save what is left after spending. Spend what is left after saving.', by: 'Warren Buffett' },
    ur: { line: 'خرچ کے بعد نہیں، بچت کے بعد خرچ کرو۔', by: 'وارن بفیٹ' },
    roman: { line: 'Kharch ke baad nahi, bachat ke baad kharch karo.', by: 'Warren Buffett' }
  },
  '40-30-30': {
    en: { line: 'Small amounts, saved daily, become freedom.', by: 'Tarteeb' },
    ur: { line: 'روزانہ تھوڑی بچت آزادی بن جاتی ہے۔', by: 'ترتیب' },
    roman: { line: 'Roz thori bachat azadi ban jati hai.', by: 'Tarteeb' }
  },
  '40-20-40': {
    en: { line: 'Pay yourself first. Then pay the world.', by: 'Tarteeb' },
    ur: { line: 'پہلے بچت کرو، پھر خرچ — الٹ نہیں۔', by: 'ترتیب' },
    roman: { line: 'Pehle bachaao, phir kharch — ulta nahi.', by: 'Tarteeb' }
  },
  '60-20-20': {
    en: { line: 'Beware of little expenses; a small leak will sink a great ship.', by: 'Benjamin Franklin' },
    ur: { line: 'چھوٹے خرچ سے ڈرو — چھوٹا رسا بڑا جہاز ڈبو دیتا ہے۔', by: 'بنجمن فرینکلن' },
    roman: { line: 'Chhote kharch se daro — chhota rasa bara jahaaz dubo deta hai.', by: 'Benjamin Franklin' }
  }
}

export function quoteForToday(lang = 'en') {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const day = Math.floor((now - start) / 86400000)
  const pool = lang === 'ur' ? URDU_QUOTES : lang === 'roman' ? ROMAN_QUOTES : SAVE_QUOTES
  return pool[day % pool.length]
}
