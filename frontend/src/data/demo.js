/* ==========================================================================
   Canonical fictional demo data for the landing-page visualizations.
   Fictional names ONLY — the developer's real name must never appear.

   These numbers are predetermined (not computed at runtime) and are
   internally consistent, so they hold up to inspection:
     - nets sum to exactly zero:  −900 + 2100 − 1200 = 0
     - payments clear the nets exactly: 900 + 1200 = 2100 (Rahul's credit)
     - two debtors means two payments is the true minimum — no fewer
       payments can settle this group.
   ========================================================================== */

export const DEMO = {
  group: 'Goa Trip',

  people: {
    maya: { name: 'Maya', initials: 'MA', grad: 'from-fuchsia-500 to-purple-500' },
    rahul: { name: 'Rahul', initials: 'RA', grad: 'from-amber-400 to-orange-500' },
    priya: { name: 'Priya', initials: 'PR', grad: 'from-sky-500 to-blue-500' },
  },

  expenses: [
    { key: 'dinner', label: 'Dinner', amountLabel: '₹1,500', payer: 'maya' },
    { key: 'hotel', label: 'Hotel', amountLabel: '₹3,000', payer: 'rahul' },
    { key: 'cab', label: 'Cab', amountLabel: '₹600', payer: 'priya' },
  ],
  totalLabel: '₹5,100',

  nets: {
    maya: { label: '−₹900', sign: -1 },
    rahul: { label: '+₹2,100', sign: 1 },
    priya: { label: '−₹1,200', sign: -1 },
  },

  payments: [
    { from: 'maya', to: 'rahul', amountLabel: '₹900' },
    { from: 'priya', to: 'rahul', amountLabel: '₹1,200' },
  ],
  paymentsLabel: '2 payments',
};
