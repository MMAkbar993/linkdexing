// ---------------------------------------------------------------------------
// Editable content for the public pages.
// Everything here was carried over from the previous WordPress site. Change
// the values in this file rather than editing the page components.
// ---------------------------------------------------------------------------

export const company = {
  name: "Linkdexing",
  supportEmail: "support@linkdexing.com",
  addressLines: ["GG1-130C, Vikas Puri", "New Delhi 110018, India"],
  gstin: "07BUNPS8068N1ZH",
  parent: "Economical Network",
  supportHours: "Replies within 24 working hours. Closed on weekends.",
};

export const pricing = {
  perCreditUsd: 0.05,
  perCreditInr: 4.125,
  freeCredits: 10,
  maxDripfeedDays: 30,
};

// credits: links you can submit. bonus: extra credits included free.
export const packages = [
  { credits: 200, price: 10 },
  { credits: 500, price: 25 },
  { credits: 1000, price: 50 },
  { credits: 2000, price: 100 },
  { credits: 5000, price: 250, bonus: 250, bonusPct: 5 },
  { credits: 10000, price: 500, bonus: 1000, bonusPct: 10 },
  { credits: 15000, price: 750, bonus: 2250, bonusPct: 15 },
];

export const checkout = {
  // TODO: URL of the UPI / net-banking checkout for customers in India. The
  // old WordPress page linked to one; the banner is hidden while this is empty.
  indiaUrl: "",
};

export const nonPerformingDomains = {
  updatedOn: "2025-12-02",
  domains: ["penzu.com", "blurb.com", "storymaps.arcgis.com", "unblog.fr"],
};

export const faqs = [
  {
    q: "What's the smallest package I can try?",
    a: "You can start with the 200-link package for $10. New accounts also get 10 free credits, so you can test the service on real links before paying anything.",
  },
  {
    q: "How long does it take to index the links?",
    a: "Indexing is done manually and works over time. Allow around two weeks to see the best indexing rate for a submission, though many links are picked up within the first few days.",
  },
  {
    q: "Do you guarantee a 100% indexing rate?",
    a: "No. Pages with a noindex tag, pages blocked by robots.txt, redirects and similar cases will never index no matter who submits them. A small number of domains also don't respond well to our method; we publish those on the Non-Performing Domains page so you don't waste credits on them.",
  },
  {
    q: "Why are your prices higher than other indexers?",
    a: "Most indexers sell a set-and-forget automated system. Those stopped working as Google got better at ignoring them. Our method is entirely manual and uses resources that cost money, which is reflected in the price. In return you get a service that actually works.",
  },
  {
    q: "Can Linkdexing index every type of link?",
    a: "Over the last three years we have indexed more than five million links of every type, including the most difficult and spammy ones. The exceptions are the technical cases above and the domains on our non-performing list.",
  },
];

// Transcribed from the review screenshots on the previous site.
// Check the wording against the originals before launch.
export const reviews = [
  {
    quote:
      "Received 25 credits for a sample a few days ago and have had excellent results. This service is as advertised, 90%+ success rate; I've had 100% so far with profile links. I will be stocking up on credits in the near future for some upcoming projects.",
    who: "G3rvase",
    where: "Forum review",
  },
  {
    quote:
      "All the links which I submitted got indexed within 4 days. Would recommend the service.",
    who: "Forum member",
    where: "Forum review",
  },
  {
    quote:
      "Indexed within a week for a brand new domain with about 5 AI articles.",
    who: "Forum member",
    where: "Forum review",
  },
];
