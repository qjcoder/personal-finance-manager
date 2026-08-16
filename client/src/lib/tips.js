export const DAILY_TIPS = [
  {
    title: 'Pay yourself first',
    body: 'Move a fixed share of income to savings the day it arrives, before discretionary spending starts.',
    action: 'Set aside 10% today'
  },
  {
    title: 'The 24-hour pause',
    body: 'Delay non-essential purchases for one day. Most impulse buys lose their urgency overnight.',
    action: 'Park one cart item'
  },
  {
    title: 'Cap eating out',
    body: 'Cook at home for five meals this week. Food is usually the fastest leak in a monthly budget.',
    action: 'Plan three home meals'
  },
  {
    title: 'Audit subscriptions',
    body: 'List every recurring charge. Cancel anything unused in the last 30 days.',
    action: 'Review one bill'
  },
  {
    title: 'Use the 50/30/20 split',
    body: 'Needs 50%, wants 30%, savings 20%. If savings slip below 20%, cut wants first.',
    action: 'Check this month’s mix'
  },
  {
    title: 'One-category freeze',
    body: 'Pick the highest spend category and freeze it for 48 hours except true essentials.',
    action: 'Choose a freeze category'
  },
  {
    title: 'Round-up transfers',
    body: 'Round each expense up to the next 50 or 100 and move the difference to a goal.',
    action: 'Add a round-up amount'
  },
  {
    title: 'Cash envelope for extras',
    body: 'Give entertainment a weekly cash limit. When it is gone, stop until next week.',
    action: 'Set a weekly cap'
  },
  {
    title: 'Negotiate one bill',
    body: 'Call internet, mobile, or insurance once a quarter. A 10-minute call often beats a new side hustle.',
    action: 'Pick one provider'
  },
  {
    title: 'No-spend evening',
    body: 'Keep tonight spend-free: no delivery, no quick commerce, no browsing store apps.',
    action: 'Lock the apps at 8pm'
  }
]

export function dailyTipSet() {
  const start = Math.floor(Date.now() / 86400000) % DAILY_TIPS.length
  return {
    featured: DAILY_TIPS[start],
    more: [1, 2, 3].map((offset) => DAILY_TIPS[(start + offset) % DAILY_TIPS.length])
  }
}
