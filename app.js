const $ = (selector) => document.querySelector(selector);
const storageKey = 'cepten-expenses-v1';
let expenses = JSON.parse(localStorage.getItem(storageKey) || '[]');
const now = new Date();
const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
$('#monthPicker').value = today.slice(0, 7);
$('#expenseForm').elements.date.value = today;

const money = value => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
const safe = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function render() {
  const month = $('#monthPicker').value;
  const category = $('#categoryFilter').value;
  const monthItems = expenses.filter(item => item.date.startsWith(month));
  const shown = monthItems.filter(item => category === 'all' || item.category === category).sort((a, b) => b.date.localeCompare(a.date));
  const total = monthItems.reduce((sum, item) => sum + item.amount, 0);
  const byCategory = monthItems.reduce((groups, item) => ({ ...groups, [item.category]: (groups[item.category] || 0) + item.amount }), {});
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  $('#total').textContent = money(total);
  $('#count').textContent = monthItems.length;
  $('#topCategory').textContent = top ? top[0] : '—';
  $('#topAmount').textContent = top ? money(top[1]) : 'henüz kayıt yok';
  $('#listSubtitle').textContent = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T12:00:00`));
  $('#expenseRows').innerHTML = shown.map(item => `<tr><td>${safe(item.description)}</td><td><span class="pill">${safe(item.category)}</span></td><td>${new Intl.DateTimeFormat('tr-TR').format(new Date(`${item.date}T12:00:00`))}</td><td class="amount">${money(item.amount)}</td><td><button class="delete" data-delete="${item.id}" aria-label="Kaydı sil">×</button></td></tr>`).join('');
  $('#empty').style.display = shown.length ? 'none' : 'block';
}
$('#expenseForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  expenses.push({ id: crypto.randomUUID(), description: data.get('description').trim(), amount: Number(data.get('amount')), category: data.get('category'), date: data.get('date') });
  localStorage.setItem(storageKey, JSON.stringify(expenses));
  form.elements.description.value = '';
  form.elements.amount.value = '';
  render();
});
$('#monthPicker').addEventListener('change', render);
$('#categoryFilter').addEventListener('change', render);
$('#expenseRows').addEventListener('click', event => {
  const id = event.target.dataset.delete;
  if (!id) return;
  expenses = expenses.filter(item => item.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(expenses));
  render();
});
render();
