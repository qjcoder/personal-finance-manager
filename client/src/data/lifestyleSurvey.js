export const SURVEY = [
  {
    id: 'home',
    title: { en: 'Home', ur: 'گھر', roman: 'Ghar' },
    items: [
      {
        id: 'own_house',
        type: 'yesno',
        binary: true,
        q: {
          en: 'Do you own your house?',
          ur: 'کیا گھر آپ کا اپنا ہے؟',
          roman: 'Kya ghar aapka apna hai?'
        }
      },
      {
        id: 'rent',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Housing',
        hideIf: { own_house: true },
        lockMonths: 12,
        binary: true,
        q: {
          en: 'Do you pay house rent?',
          ur: 'کیا آپ کرایہ دیتے ہیں؟',
          roman: 'Kya aap kiraya dete hain?'
        },
        hint: {
          en: 'Monthly rent (PKR)',
          ur: 'ماہانہ کرایہ',
          roman: 'Mahana kiraya'
        }
      },
      {
        id: 'society',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Housing',
        showIf: { own_house: true },
        binary: true,
        q: {
          en: 'Society / maintenance fee?',
          ur: 'سوسائٹی یا مرمت کا خرچ؟',
          roman: 'Society ya maintenance fee?'
        }
      }
    ]
  },
  {
    id: 'bills',
    title: { en: 'Monthly bills', ur: 'ماہانہ بل', roman: 'Mahana bills' },
    items: [
      {
        id: 'electricity',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Bills & Utilities',
        q: {
          en: 'Do you pay electricity (WAPDA / KE)?',
          ur: 'کیا بجلی کا بل دیتے ہیں؟',
          roman: 'Kya bijli ka bill dete hain?'
        }
      },
      {
        id: 'gas',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Bills & Utilities',
        q: {
          en: 'Do you pay gas bill?',
          ur: 'کیا گیس کا بل دیتے ہیں؟',
          roman: 'Kya gas ka bill dete hain?'
        }
      },
      {
        id: 'water',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Bills & Utilities',
        q: {
          en: 'Water / tanker expense?',
          ur: 'پانی یا ٹینکر کا خرچ؟',
          roman: 'Pani ya tanker ka kharch?'
        }
      },
      {
        id: 'internet',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Bills & Utilities',
        q: {
          en: 'Internet + mobile load?',
          ur: 'انٹرنیٹ اور موبائل لوڈ؟',
          roman: 'Internet aur mobile load?'
        }
      }
    ]
  },
  {
    id: 'food',
    title: { en: 'Food & kiryana', ur: 'کھانا اور کریانہ', roman: 'Khana aur kiryana' },
    items: [
      {
        id: 'daily_food',
        type: 'yesmoney',
        period: 'daily',
        cat: 'Food & Dining',
        q: {
          en: 'Daily sabzi, doodh, roti, kiryana?',
          ur: 'روزانہ سبزی، دودھ، روٹی، کریانہ؟',
          roman: 'Rozana sabzi, doodh, roti, kiryana?'
        }
      },
      {
        id: 'rashan',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Food & Dining',
        q: {
          en: 'Monthly rashan / grocery bulk?',
          ur: 'ماہانہ راشن؟',
          roman: 'Mahana rashan?'
        }
      },
      {
        id: 'eating_out',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Food & Dining',
        q: {
          en: 'Hotels / dhabas / delivery in a month?',
          ur: 'مہینے میں ہوٹل یا ڈیلیوری؟',
          roman: 'Mahine mein hotel ya delivery?'
        }
      }
    ]
  },
  {
    id: 'ride',
    title: { en: 'Transport', ur: 'سفر', roman: 'Safar' },
    items: [
      {
        id: 'vehicle',
        type: 'yesno',
        binary: true,
        q: {
          en: 'Do you have a bike or car?',
          ur: 'کیا بائیک یا کار ہے؟',
          roman: 'Kya bike ya car hai?'
        }
      },
      {
        id: 'fuel',
        type: 'yesmoney',
        period: 'daily',
        cat: 'Transportation',
        showIf: { vehicle: true },
        q: {
          en: 'Daily petrol / CNG / diesel?',
          ur: 'روزانہ پیٹرول، سی این جی یا ڈیزل؟',
          roman: 'Rozana petrol, CNG ya diesel?'
        }
      },
      {
        id: 'rickshaw',
        type: 'yesmoney',
        period: 'daily',
        cat: 'Transportation',
        q: {
          en: 'Rickshaw, bus, Careem, InDrive daily?',
          ur: 'رکشہ، بس، کریم روزانہ؟',
          roman: 'Rickshaw, bus, Careem rozana?'
        }
      }
    ]
  },
  {
    id: 'family',
    title: { en: 'Family', ur: 'خاندان', roman: 'Khandaan' },
    items: [
      {
        id: 'school',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Education',
        q: {
          en: 'School / college / tuition fees?',
          ur: 'سکول، کالج یا ٹیوشن فیس؟',
          roman: 'School, college ya tuition fees?'
        }
      },
      {
        id: 'health',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Healthcare',
        q: {
          en: 'Medicines and doctor visits?',
          ur: 'دوائیں اور ڈاکٹر؟',
          roman: 'Dawain aur doctor?'
        }
      },
      {
        id: 'maid',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Other',
        q: {
          en: 'Maid / cook / driver salary?',
          ur: 'نوکری، باورچی یا ڈرائیور؟',
          roman: 'Nokar, bawarchi ya driver?'
        }
      }
    ]
  },
  {
    id: 'wants',
    title: { en: 'Lifestyle', ur: 'طرز زندگی', roman: 'Lifestyle' },
    items: [
      {
        id: 'shopping',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Shopping',
        q: {
          en: 'Clothes, shoes, bazaar shopping?',
          ur: 'کپڑے، جوتے، بازار؟',
          roman: 'Kapray, joote, bazaar?'
        }
      },
      {
        id: 'fun',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Entertainment',
        q: {
          en: 'Cinema, cricket, outings?',
          ur: 'سینما، کرکٹ، سیر؟',
          roman: 'Cinema, cricket, sair?'
        }
      },
      {
        id: 'care',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Personal Care',
        q: {
          en: 'Salon, parlor, personal care?',
          ur: 'سیلون، پارلر؟',
          roman: 'Salon, parlor?'
        }
      },
      {
        id: 'gifts',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Gifts & Donations',
        q: {
          en: 'Gifts, sadqa, committee guest money?',
          ur: 'تحائف، صدقہ، مہمان نوازی؟',
          roman: 'Tohfe, sadqa, mehman nawazi?'
        }
      }
    ]
  },
  {
    id: 'save',
    title: { en: 'Saving', ur: 'بچت', roman: 'Bachat' },
    items: [
      {
        id: 'committee',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Goals',
        q: {
          en: 'Committee / BC installment?',
          ur: 'کمیٹی یا بی سی قسط؟',
          roman: 'Committee ya BC qist?'
        }
      },
      {
        id: 'gold',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Invest',
        q: {
          en: 'Gold, saving account, or invest?',
          ur: 'سونا، سیونگ یا انویسٹ؟',
          roman: 'Sona, saving ya invest?'
        }
      },
      {
        id: 'emergency',
        type: 'yesmoney',
        period: 'monthly',
        cat: 'Emergency fund',
        q: {
          en: 'Set aside for emergencies?',
          ur: 'ایمرجنسی کے لیے الگ؟',
          roman: 'Emergency ke liye alag?'
        }
      }
    ]
  }
]

export const NEED_CATS = ['Housing', 'Bills & Utilities', 'Food & Dining', 'Transportation', 'Healthcare', 'Education']
export const WANT_CATS = ['Shopping', 'Entertainment', 'Travel', 'Personal Care', 'Gifts & Donations', 'Other']
export const SAVE_CATS = ['Emergency fund', 'Goals', 'Invest']

export function txt(lang, obj) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.en
}

export function visible(item, answers) {
  if (item.hideIf) {
    return !Object.entries(item.hideIf).every(([k, v]) => answers[k]?.on === v)
  }
  if (item.showIf) {
    return Object.entries(item.showIf).every(([k, v]) => answers[k]?.on === v)
  }
  return true
}

export function questionQueue(answers) {
  const list = []
  for (const group of SURVEY) {
    for (const item of group.items) {
      if (visible(item, answers)) list.push({ ...item, groupTitle: group.title })
    }
  }
  return list
}

export function allowsSometimes(item) {
  return !item.binary && !item.lockMonths
}

export function isOn(row) {
  if (!row) return false
  if (row.choice === 'no') return false
  if (row.choice === 'yes' || row.choice === 'sometimes') return true
  return Boolean(row.on)
}

export function monthlyOf(row) {
  if (!isOn(row)) return 0
  return (Number(row.monthly) || 0) + (Number(row.daily) || 0) * 30
}

export function totalsFromLifestyle(lifestyle) {
  const answers = lifestyle?.answers || {}
  const byCat = {}
  let daily = 0
  let monthlyOnly = 0
  for (const group of SURVEY) {
    for (const item of group.items) {
      if (!item.cat) continue
      const row = answers[item.id]
      if (!isOn(row)) continue
      const m = Number(row.monthly) || 0
      const d = Number(row.daily) || 0
      daily += d
      monthlyOnly += m
      byCat[item.cat] = (byCat[item.cat] || 0) + m + d * 30
    }
  }
  const need = NEED_CATS.reduce((s, c) => s + (byCat[c] || 0), 0)
  const want = WANT_CATS.reduce((s, c) => s + (byCat[c] || 0), 0)
  const save = SAVE_CATS.reduce((s, c) => s + (byCat[c] || 0), 0)
  return { byCat, need, want, save, daily, monthlyOnly, spend: need + want }
}

export function catsFromLifestyle(lifestyle) {
  const answers = lifestyle?.answers || {}
  const cats = []
  for (const group of SURVEY) {
    for (const item of group.items) {
      if (!item.cat || !isOn(answers[item.id])) continue
      if (!cats.includes(item.cat)) cats.push(item.cat)
    }
  }
  return cats
}

export function applyLocks(answers) {
  const next = { ...answers }
  for (const group of SURVEY) {
    for (const item of group.items) {
      if (!item.lockMonths) continue
      const row = next[item.id]
      if (!isOn(row)) continue
      if (row.lockedUntil && new Date(`${row.lockedUntil}T23:59:59`) >= new Date()) continue
      const until = new Date()
      until.setMonth(until.getMonth() + item.lockMonths)
      next[item.id] = {
        ...row,
        fixedMonths: item.lockMonths,
        lockedUntil: until.toISOString().slice(0, 10)
      }
    }
  }
  return next
}

export function emptyAnswers() {
  const answers = {}
  for (const group of SURVEY) {
    for (const item of group.items) {
      answers[item.id] = { on: false, monthly: '', daily: '' }
    }
  }
  return answers
}
