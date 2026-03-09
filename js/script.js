// Portfolio UI behavior + medical billing search and FAQ rendering.
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn?.addEventListener('click', () => {
  const isOpen = navLinks?.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => navLinks?.classList.remove('open'));
});

const fallbackCptCodes = [
  { code: '99213', title: 'Office/outpatient established patient visit', description: 'Low complexity evaluation and management visit for established patients.' },
  { code: '93000', title: 'Electrocardiogram (ECG)', description: 'Routine ECG with interpretation and report.' }
];

const fallbackIcdCodes = [
  { code: 'E11.9', title: 'Type 2 diabetes mellitus without complications', description: 'Type 2 diabetes documented without listed complication.' },
  { code: 'I10', title: 'Essential (primary) hypertension', description: 'Primary hypertension diagnosis.' }
];

const faqData = [
  ['What is Revenue Cycle Management?', 'RCM is the complete financial process from patient registration through final payment collection.'],
  ['What is AR Follow-Up?', 'AR Follow-Up is tracking and resolving unpaid claims by coordinating with payers.'],
  ['What causes claim denials?', 'Common causes include coding errors, eligibility issues, missing documentation, and timely filing misses.'],
  ['What is the difference between CPT and ICD-10?', 'CPT represents procedures/services, while ICD-10 represents diagnoses.']
];

function renderFAQ() {
  const container = document.getElementById('faqContainer');
  if (!container) return;
  container.innerHTML = '';

  faqData.forEach(([question, answer]) => {
    const item = document.createElement('article');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-question">${question}</button>
      <div class="faq-answer"><p>${answer}</p></div>
    `;
    item.querySelector('.faq-question')?.addEventListener('click', () => item.classList.toggle('open'));
    container.appendChild(item);
  });
}

function renderCards(list, container, typeLabel) {
  if (!container) return;
  container.innerHTML = '';
  list.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<h3>${typeLabel} ${entry.code} — ${entry.title}</h3><p>${entry.description}</p>`;
    container.appendChild(card);
  });
}

function attachSearch(data) {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  const draw = (items) => {
    results.innerHTML = '';
    if (!items.length) {
      results.innerHTML = '<article class="card"><p>No matching content found.</p></article>';
      return;
    }
    items.slice(0, 24).forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<small>${item.type}</small><h3>${item.code} ${item.title}</h3><p>${item.description}</p>`;
      results.appendChild(card);
    });
  };

  draw(data.slice(0, 6));
  input.oninput = (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return draw(data.slice(0, 6));
    draw(data.filter((item) => `${item.code} ${item.title} ${item.description}`.toLowerCase().includes(q)));
  };
}

async function loadDataAndBindSearch() {
  let cpt = fallbackCptCodes;
  let icd = fallbackIcdCodes;

  try {
    const [cptRes, icdRes] = await Promise.all([
      fetch('data/cpt-codes.json'),
      fetch('data/icd10-codes.json')
    ]);

    if (!cptRes.ok || !icdRes.ok) throw new Error('JSON fetch failed');

    cpt = await cptRes.json();
    icd = await icdRes.json();
  } catch (error) {
    console.warn('Using fallback code data.', error.message);
  }

  renderCards(cpt, document.getElementById('cptList'), 'CPT');
  renderCards(icd, document.getElementById('icdList'), 'ICD-10');

  const searchable = [
    ...cpt.map((x) => ({ ...x, type: 'CPT' })),
    ...icd.map((x) => ({ ...x, type: 'ICD-10' })),
    ...faqData.map(([q, a]) => ({ code: 'FAQ', title: q, description: a, type: 'Medical Billing Q&A' }))
  ];
  attachSearch(searchable);
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('visible', entry.isIntersecting));
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
}

renderFAQ();
loadDataAndBindSearch();
