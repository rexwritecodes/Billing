document.addEventListener('DOMContentLoaded', () => {
    const invoiceDateElement = document.getElementById('invoice-date');
    if (invoiceDateElement) {
        const today = new Date();
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        invoiceDateElement.textContent = `${today.toLocaleDateString('en-GB', options)}`;
    }

    const printInvoiceButton = document.getElementById('printInvoice');
    if (printInvoiceButton) {
        printInvoiceButton.addEventListener('click', function () {
            window.print();
        });
    }

    const savePdfButton = document.getElementById('savePdf');
    if (savePdfButton) {
        savePdfButton.addEventListener('click', function () {
            window.print();
        });
    }

    let GST_RATE = 0.0; // Default GST Rate

    function getGSTRate() {
        const gstRateInput = document.getElementById('gst-rate-input');
        let rate = 0.0;
        if (gstRateInput) {
            rate = parseFloat(gstRateInput.textContent) / 100 || 0.0;
        }
        return rate;
    }

    function calculateItemTotals(row) {
        const rateElement = row.querySelector('.item-rate');
        const qtyElement = row.querySelector('.item-qty');
        const netAmtElement = row.querySelector('.item-net-amt');
        const taxAmtElement = row.querySelector('.item-tax-amt');
        const totalAmtElement = row.querySelector('.item-total-amt');

        let rate = parseFloat(rateElement.textContent.replace(/,/g, '')) || 0;
        let qty = parseFloat(qtyElement.textContent.replace(/,/g, '')) || 0;

        let netAmt = rate * qty;
        GST_RATE = getGSTRate();
        let taxAmt = netAmt * GST_RATE;
        let totalAmt = netAmt + taxAmt;

        netAmtElement.textContent = netAmt.toFixed(2);
        taxAmtElement.innerHTML = `${taxAmt.toFixed(2)} (${(GST_RATE * 100).toFixed(0)}%)`;
        totalAmtElement.textContent = totalAmt.toFixed(2);

        updateOverallTotals();
    }

    function updateOverallTotals() {
        let overallTotal = 0;
        let totalQty = 0;
        let totalItems = 0;

        document.querySelectorAll('.items-table tbody tr').forEach(row => {
            const totalAmtElement = row.querySelector('.item-total-amt');
            const qtyElement = row.querySelector('.item-qty');

            overallTotal += parseFloat(totalAmtElement.textContent) || 0;
            totalQty += parseFloat(qtyElement.textContent.replace(/,/g, '')) || 0;
            totalItems++;
        });

        document.getElementById('overall-total').textContent = `₹${overallTotal.toFixed(2)}`;
        document.getElementById('overall-total-inr').textContent = `Amount Payable:₹${overallTotal.toFixed(2)}`;
        document.getElementById('amount-in-words').textContent = `Total amount (in words): INR ${convertNumberToWords(overallTotal)} Rupees Only.`;
        document.getElementById('total-items-count').textContent = totalItems;
        document.getElementById('total-qty-count').textContent = totalQty;
    }

    function setupEventListeners(row) {
        row.querySelectorAll('.item-rate, .item-qty').forEach(element => {
            element.addEventListener('input', () => calculateItemTotals(row));
        });
    }

    // Setup for existing rows
    document.querySelectorAll('.items-table tbody tr').forEach(row => {
        setupEventListeners(row);
        calculateItemTotals(row);
    });

    const gstRateElement = document.getElementById('gst-rate-input');
    if (gstRateElement) {
        ['blur', 'keyup'].forEach(evt => {
            gstRateElement.addEventListener(evt, () => {
                GST_RATE = getGSTRate();
                document.querySelectorAll('.items-table tbody tr').forEach(row => {
                    calculateItemTotals(row);
                });
            });
        });
    }

    const addItemButton = document.getElementById('addItem');
    if (addItemButton) {
        addItemButton.addEventListener('click', function () {
            const tbody = document.querySelector('.items-table tbody');
            const newRow = document.createElement('tr');
            const itemCount = tbody.children.length + 1;

            newRow.innerHTML = `
                <td contenteditable="true" class="item-sl">${itemCount}</td>
                <td contenteditable="true" class="item-description"></td>
                <td contenteditable="true" class="item-hsn-sac"></td>
                <td contenteditable="true" class="item-rate">0.00</td>
                <td contenteditable="true" class="item-qty">0</td>
                <td contenteditable="true" class="item-net-amt">0.00</td>
<td contenteditable="false" class="item-tax-amt">0.00 (${(getGSTRate() * 100).toFixed(0)}%)</td>
                <td contenteditable="true" class="item-total-amt">0.00</td>
            `;
            tbody.appendChild(newRow);
            setupEventListeners(newRow);
            calculateItemTotals(newRow);
        });
    }

    function convertNumberToWords(amount) {
        const words = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (amount === 0) return 'Zero';

        function convertLessThanOneThousand(num) {
            let result = '';
            if (num % 100 < 20) {
                result = words[num % 100];
                num = Math.floor(num / 100);
            } else {
                result = tensWords[Math.floor(num % 100 / 10)] + ' ' + words[num % 10];
                num = Math.floor(num / 100);
            }
            if (num > 0) {
                result = words[num] + ' Hundred ' + result;
            }
            return result.trim();
        }

        let result = '';
        let num = Math.floor(amount);

        if (num >= 10000000) {
            result += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
            num %= 10000000;
        }
        if (num >= 100000) {
            result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
            num %= 100000;
        }
        if (num >= 1000) {
            result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
            num %= 1000;
        }
        result += convertLessThanOneThousand(num);

        return result.trim();
    }

    // Initial calculation
    updateOverallTotals();
});
