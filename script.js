const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const faqData = {
  'CPT Coding': [
    ['What are CPT codes?', 'CPT codes describe medical, surgical, and diagnostic services for billing and reimbursement.'],
    ['How often are CPT codes updated?', 'Typically annually by the AMA, with periodic guidance updates.']
  ],
  'ICD-10 Diagnosis Codes': [
    ['What is ICD-10 used for?', 'ICD-10 identifies diagnoses and supports medical necessity for billed services.'],
    ['Why is specificity important in ICD-10?', 'Specific diagnosis coding reduces claim rejections and supports accurate payment.']
  ],
  'AR Follow-Up': [
    ['What is AR follow-up?', 'It is the process of tracking unpaid claims and contacting payers for status and resolution.']
  ],
  'Denial Management': [
    ['What is denial management?', 'A systematic process to analyze denied claims, correct issues, and resubmit or appeal.']
  ],
  'Payment Posting': [
    ['Why is payment posting important?', 'It reconciles payer and patient payments and reveals denial and underpayment trends.']
  ],
  'Insurance Verification': [
    ['What is insurance verification?', 'Validating coverage, eligibility, and benefits before services are rendered.']
  ],
  Credentialing: [
    ['What is provider credentialing?', 'Enrollment and validation of providers with payers to enable claim reimbursement.']
  ],
  'Revenue Cycle Management': [
    ['What is RCM?', 'RCM is the full financial workflow from patient registration to final payment collection.']
  ]
};

function renderFAQ() {
  const container = document.getElementById('faqContainer');
  Object.entries(faqData).forEach(([category, items]) => {
    const categoryEl = document.createElement('article');
    categoryEl.className = 'faq-category card';
    categoryEl.innerHTML = `<h3>${category}</h3>`;

    items.forEach(([q, a]) => {
      const item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML = `
        <button class="faq-question">${q}</button>
        <div class="faq-answer"><p>${a}</p></div>
      `;
      item.querySelector('.faq-question').addEventListener('click', () => item.classList.toggle('open'));
      categoryEl.appendChild(item);
    });

    container.appendChild(categoryEl);
  });
}

async function loadCodeData() {
  const [cptRes, icdRes] = await Promise.all([
    fetch('data/cpt-codes.json'),
    fetch('data/icd10-codes.json')
  ]);
  const cptCodes = await cptRes.json();
  const icdCodes = await icdRes.json();
  renderCodeCards(cptCodes, document.getElementById('cptList'), 'CPT');
  renderCodeCards(icdCodes, document.getElementById('icdList'), 'ICD-10');

  const searchSource = [
    ...cptCodes.map((i) => ({ ...i, type: 'CPT' })),
    ...icdCodes.map((i) => ({ ...i, type: 'ICD-10' })),
    ...Object.entries(faqData).flatMap(([category, qa]) =>
      qa.map(([question, answer]) => ({ code: category, title: question, description: answer, type: 'Q&A' }))
    ),
    { code: 'Insurance Terms', title: 'Copay, Deductible, Coinsurance', description: 'Common patient responsibility and payer-sharing terms.', type: 'Insurance' },
    { code: 'RCM Concept', title: 'Clean Claim Rate', description: 'Percentage of claims accepted on first submission without edits.', type: 'RCM' }
  ];

  attachSearch(searchSource);
}

function renderCodeCards(items, container, label) {
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${label} ${item.code} — ${item.title}</h3><p>${item.description}</p>`;
    container.appendChild(card);
  });
}

function attachSearch(data) {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const render = (items) => {
    results.innerHTML = '';
    if (!items.length) {
      results.innerHTML = '<article class="card"><p>No matching results found.</p></article>';
      return;
    }
    items.slice(0, 20).forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<small>${item.type}</small><h3>${item.code} ${item.title}</h3><p>${item.description}</p>`;
      results.appendChild(card);
    });
  };

  render(data.slice(0, 8));
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return render(data.slice(0, 8));
    render(data.filter((item) => `${item.code} ${item.title} ${item.description}`.toLowerCase().includes(q)));
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle('visible', entry.isIntersecting));
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('formStatus').textContent = 'Thank you. Your message has been captured (demo mode).';
  e.target.reset();
});

renderFAQ();
loadCodeData();
