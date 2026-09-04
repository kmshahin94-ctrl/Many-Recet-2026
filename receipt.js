const sectors = [
    'যাকাত', 'সাদাকাহ', 'সাধারণ দান', 'লিল্লাহ ফান্ড', 'অন্ধ এতিম ফান্ড',
    'একজন এতিম বাচ্চার মাসিক খরচ', '২ জন বাচ্চার মাসিক খরচ', 'একদিক বাচ্চার মাসিক খরচ',
    'এক বেলা খাবারের খরচ', 'মাসিক দান', 'মসজিদ মাদ্রাসার উন্নয়ন কাজের ফান্ড', 'কোরবানী ফান্ড',
    'মাসিক বাজারের খরচ ফান্ড', 'দুই বেলা খাবারের খরচ', 'ইফতার', 'মানত', 'কুরআন শরীফ হাদীয়া',
    'অন্ধদের হাদীয়া', 'শীতের পোষাক কেনার খরচ'
];
const bengaliDigits = '০১২৩৪৫৬৭৮৯';
const ids = ['receiptNumber', 'date', 'donorName', 'mobile', 'address', 'amount', 'sector', 'note', 'collector'];
const archiveKey = 'mduSavedReceipts';
const get = id => document.getElementById(id);
const toBengali = value => String(value).replace(/[0-9]/g, digit => bengaliDigits[digit]);
const cleanAmount = value => String(value).replace(/[০-৯,\s]/g, char => bengaliDigits.indexOf(char) > -1 ? bengaliDigits.indexOf(char) : '').replace(/[^0-9.]/g, '');
const formatAmount = value => { const number = Number(cleanAmount(value)); return Number.isFinite(number) && number ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number) : '০.০০'; };
const savedReceipts = () => JSON.parse(localStorage.getItem(archiveKey) || '[]');
const saveReceipts = receipts => localStorage.setItem(archiveKey, JSON.stringify(receipts));
const collectForm = () => Object.fromEntries(ids.map(id => [id, get(id).value]));
const numberWords = value => {
    const number = Math.floor(Number(cleanAmount(value)) || 0);
    if (number === 0) return 'শূন্য টাকা মাত্র';
    const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
    const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    const underHundred = n => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
    const underThousand = n => n < 100 ? underHundred(n) : `${ones[Math.floor(n / 100)]} শত${n % 100 ? ' ' + underHundred(n % 100) : ''}`;
    let words = number >= 1000 ? `${underThousand(Math.floor(number / 1000))} হাজার ` : '';
    words += underThousand(number % 1000);
    return `${words.trim()} টাকা মাত্র`;
};
sectors.forEach(sector => get('sector').add(new Option(sector, sector)));
get('date').value = new Date().toISOString().slice(0, 10);
get('receiptNumber').value = `MDU-${String(Number(localStorage.getItem('mduReceiptCount') || 0) + 1).padStart(6, '0')}`;
function updatePreview() {
    get('previewNumber').textContent = get('receiptNumber').value || '—';
    get('previewDate').textContent = get('date').value ? new Date(`${get('date').value}T00:00:00`).toLocaleDateString('bn-BD') : '—';
    get('previewDonor').textContent = get('donorName').value || 'আপনার নাম';
    get('previewMobile').textContent = get('mobile').value || '—';
    get('previewAddress').textContent = get('address').value || '—';
    get('previewSector').textContent = get('sector').value || '—';
    get('previewAmount').textContent = toBengali(formatAmount(get('amount').value));
    get('previewWords').textContent = numberWords(get('amount').value);
    get('previewNote').textContent = get('note').value || 'আল্লাহ আপনার দান কবুল করুন';
    get('previewCollector').textContent = get('collector').value || 'আদায়কারীর নাম';
}
function renderArchive() {
    const receipts = savedReceipts();
    get('archiveCount').textContent = `${toBengali(receipts.length)}টি`;
    get('archiveList').innerHTML = '';
    if (!receipts.length) {
        get('archiveList').innerHTML = '<p class="empty-archive">এখনো কোনো রসিদ সংরক্ষণ করা হয়নি।</p>';
        return;
    }
    receipts.forEach(receipt => {
        const item = document.createElement('div');
        item.className = 'archive-item';
        item.innerHTML = '<div class="archive-main"><strong></strong><span></span></div><div class="archive-meta"><strong></strong><span></span></div><div class="archive-actions"><button class="archive-button" data-action="view" data-id="' + receipt.id + '">দেখুন</button><button class="archive-button delete" data-action="delete" data-id="' + receipt.id + '">মুছুন</button></div>';
        item.querySelector('.archive-main strong').textContent = receipt.donorName || 'নাম নেই';
        item.querySelector('.archive-main span').textContent = `${receipt.receiptNumber} · ${receipt.sector || 'খাত নেই'}`;
        item.querySelector('.archive-meta strong').textContent = `৳ ${toBengali(formatAmount(receipt.amount))}`;
        item.querySelector('.archive-meta span').textContent = receipt.date || 'তারিখ নেই';
        get('archiveList').appendChild(item);
    });
}
ids.forEach(id => get(id).addEventListener('input', updatePreview));
get('receiptForm').addEventListener('submit', event => { event.preventDefault(); const receipt = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...collectForm() }; const receipts = savedReceipts().filter(item => item.receiptNumber !== receipt.receiptNumber); receipts.unshift(receipt); saveReceipts(receipts); localStorage.setItem('mduReceiptCount', Math.max(Number(localStorage.getItem('mduReceiptCount') || 0), Number(receipt.receiptNumber.replace(/\D/g, '')) || 0)); renderArchive(); updatePreview(); });
get('printButton').addEventListener('click', () => { updatePreview(); window.print(); });
get('clearButton').addEventListener('click', () => { get('receiptForm').reset(); get('date').value = new Date().toISOString().slice(0, 10); get('receiptNumber').value = `MDU-${String(Number(localStorage.getItem('mduReceiptCount') || 0) + 1).padStart(6, '0')}`; updatePreview(); });
get('archiveList').addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (!button) return; const receipts = savedReceipts(); const receipt = receipts.find(item => item.id === button.dataset.id); if (button.dataset.action === 'delete') { saveReceipts(receipts.filter(item => item.id !== button.dataset.id)); renderArchive(); return; } if (receipt) { ids.forEach(id => { get(id).value = receipt[id] || ''; }); updatePreview(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
updatePreview();
renderArchive();