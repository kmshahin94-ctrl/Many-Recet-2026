const sectors = [
    'যাকাত', 'সাদাকাহ', 'সাধারণ দান', 'লিল্লাহ ফান্ড', 'অন্ধ এতিম ফান্ড',
    'একজন এতিম বাচ্চার মাসিক খরচ', '২ জন বাচ্চার মাসিক খরচ', 'একদিক বাচ্চার মাসিক খরচ',
    'এক বেলা খাবারের খরচ', 'মাসিক দান', 'মসজিদ মাদ্রাসার উন্নয়ন কাজের ফান্ড', 'কোরবানী ফান্ড',
    'মাসিক বাজারের খরচ ফান্ড', 'দুই বেলা খাবারের খরচ', 'ইফতার', 'মানত', 'কুরআন শরীফ হাদীয়া',
    'অন্ধদের হাদীয়া', 'শীতের পোষাক কেনার খরচ'
];
const bengaliDigits = '০১২৩৪৫৬৭৮৯';
const ids = ['receiptNumber', 'date', 'donorName', 'mobile', 'address', 'amount', 'sector', 'note', 'collector'];
const get = id => document.getElementById(id);
const toBengali = value => String(value).replace(/[0-9]/g, digit => bengaliDigits[digit]);
const cleanAmount = value => String(value).replace(/[০-৯,\s]/g, char => bengaliDigits.indexOf(char) > -1 ? bengaliDigits.indexOf(char) : '').replace(/[^0-9.]/g, '');
const formatAmount = value => { const number = Number(cleanAmount(value)); return Number.isFinite(number) && number ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number) : '০.০০'; };
const numberWords = value => {
    const number = Math.floor(Number(cleanAmount(value)) || 0);
    if (number === 0) return 'শূন্য টাকা মাত্র';
    const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
    const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    const underHundred = n => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
    let words = number >= 1000 ? `${underHundred(Math.floor(number / 1000))} হাজার ` : '';
    words += underHundred(number % 1000);
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
ids.forEach(id => get(id).addEventListener('input', updatePreview));
get('receiptForm').addEventListener('submit', event => { event.preventDefault(); localStorage.setItem('mduReceiptCount', Math.max(Number(localStorage.getItem('mduReceiptCount') || 0), Number(get('receiptNumber').value.replace(/\D/g, '')) || 0)); updatePreview(); });
get('printButton').addEventListener('click', () => { updatePreview(); window.print(); });
get('clearButton').addEventListener('click', () => { get('receiptForm').reset(); get('date').value = new Date().toISOString().slice(0, 10); get('receiptNumber').value = `MDU-${String(Number(localStorage.getItem('mduReceiptCount') || 0) + 1).padStart(6, '0')}`; updatePreview(); });
updatePreview();
