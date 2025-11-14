// app.js

const API_BASE_URL = 'http://127.0.0.1:5000'; 
const outputElement = document.getElementById('output');
const otpInputElement = document.getElementById('otp-input');
const buyInputElement = document.getElementById('buy-input');
const packagesListElement = document.getElementById('packages-list');

// --- UTILITY FUNCTIONS ---

function updateOutput(message, isError = false) {
    outputElement.textContent = (isError ? 'ERROR: ' : 'SUCCESS: ') + JSON.stringify(message, null, 2);
    outputElement.style.color = isError ? 'red' : 'green';
}

async function apiFetch(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const json = await response.json();
        
        if (!response.ok || json.status === 'error') {
            throw new Error(json.message || `API Error: ${response.status}`);
        }
        return json;
    } catch (error) {
        updateOutput(error.message, true);
        throw error;
    }
}

// --- LOGIN FLOW ---

async function requestOtp() {
    const msisdn = document.getElementById('msisdn').value;
    if (!msisdn) return updateOutput('Nomor MSISDN wajib.', true);

    try {
        const response = await apiFetch('/login', 'POST', { msisdn });
        updateOutput(response.message);
        otpInputElement.classList.remove('hidden');
    } catch (e) {
        // Handled by apiFetch
    }
}

async function submitOtp() {
    const code = document.getElementById('otp-code').value;
    if (!code) return updateOutput('Kode OTP wajib.', true);

    try {
        const response = await apiFetch('/submit_otp', 'POST', { code });
        updateOutput(response.message + '. Anda sekarang login.');
        otpInputElement.classList.add('hidden');
    } catch (e) {
        // Handled by apiFetch
    }
}

// --- ACCOUNT & BALANCE ---

async function checkSaldo() {
    try {
        const response = await apiFetch('/saldo');
        const data = response.data;
        const msg = `Nomor: ${data.phone_number}\nPulsa: Rp ${data.remaining_balance}\nMasa Aktif: ${data.balance_expired_at}`;
        updateOutput(msg);
    } catch (e) {
        // Handled by apiFetch
    }
}

// --- PACKAGE FLOW ---

async function listPackages() {
    try {
        const response = await apiFetch('/list_xut');
        const packages = response.packages;
        
        let html = '<h3>Daftar Paket:</h3><ol>';
        packages.forEach(pkg => {
            html += `<li>[${pkg.number}] ${pkg.name} - Rp ${pkg.price} (Kode: ${pkg.code})</li>`;
        });
        html += '</ol>';
        
        packagesListElement.innerHTML = html;
        buyInputElement.classList.remove('hidden');
        updateOutput("Paket berhasil dimuat. Pilih nomor untuk membeli.");
    } catch (e) {
        packagesListElement.innerHTML = '';
        // Handled by apiFetch
    }
}

async function buyPackage() {
    const packageNum = parseInt(document.getElementById('package-num').value);
    if (isNaN(packageNum)) return updateOutput('Nomor paket tidak valid.', true);

    try {
        const response = await apiFetch('/buy_xut', 'POST', { package_number: packageNum });
        updateOutput(`Pembelian berhasil diproses: ${response.message}\nDetail Hasil: ${JSON.stringify(response.result)}`);
    } catch (e) {
        // Handled by apiFetch
    }
}
