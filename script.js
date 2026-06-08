let kriteria = [];
let alternatif = [];

function renderKriteria() {
    const container = document.getElementById('kriteria-list');
    if (kriteria.length === 0) {
        container.innerHTML = '<div class="pesan-kosong">Belum ada kriteria. Klik "Tambah Kriteria" untuk mulai.</div>';
        return;
    }
    container.innerHTML = '';
    kriteria.forEach((k, i) => {
        const div = document.createElement('div');
        div.className = 'kriteria-item';
        div.innerHTML = `
            <input type="text" placeholder="Nama Kriteria" value="${escapeHtml(k.nama)}" style="width:140px" onchange="updateKriteria(${i}, 'nama', this.value)">
            <input type="number" placeholder="Bobot" value="${k.bobot}" style="width:85px" onchange="updateKriteria(${i}, 'bobot', parseFloat(this.value))">
            <select onchange="updateKriteria(${i}, 'jenis', this.value)">
                <option value="benefit" ${k.jenis === 'benefit' ? 'selected' : ''}>Benefit</option>
                <option value="cost" ${k.jenis === 'cost' ? 'selected' : ''}>Cost</option>
            </select>
            <button class="btn-hapus" onclick="hapusKriteria(${i})">Hapus</button>
        `;
        container.appendChild(div);
    });
}

function renderAlternatif() {
    const container = document.getElementById('alternatif-list');
    if (alternatif.length === 0) {
        container.innerHTML = '<div class="pesan-kosong">Belum ada alternatif. Klik "Tambah Alternatif" untuk mulai.</div>';
        return;
    }
    container.innerHTML = '';
    alternatif.forEach((alt, i) => {
        const div = document.createElement('div');
        div.className = 'alternatif-item';
        let nilaiInputs = '';
        if (kriteria.length === 0) {
            nilaiInputs = '<span style="color:#8a8f9e; font-size:12px; padding-left:8px;">Tambahkan kriteria dulu</span>';
        } else {
            kriteria.forEach((k, j) => {
                const nilai = (alt.nilai && alt.nilai[j] !== undefined) ? alt.nilai[j] : 0;
                nilaiInputs += `<input type="number" step="any" placeholder="${escapeHtml(k.nama)}" value="${nilai}" style="width:100px" onchange="updateNilaiAlternatif(${i}, ${j}, parseFloat(this.value))">`;
            });
        }
        div.innerHTML = `
            <input type="text" placeholder="Nama Alternatif" value="${escapeHtml(alt.nama)}" style="width:120px" onchange="updateAlternatif(${i}, 'nama', this.value)">
            ${nilaiInputs}
            <button class="btn-hapus" onclick="hapusAlternatif(${i})">Hapus</button>
        `;
        container.appendChild(div);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function updateKriteria(index, field, value) {
    kriteria[index][field] = value;
    alternatif.forEach(alt => {
        if (!alt.nilai) alt.nilai = [];
        while (alt.nilai.length < kriteria.length) alt.nilai.push(0);
        while (alt.nilai.length > kriteria.length) alt.nilai.pop();
    });
    renderAlternatif();
}

function updateAlternatif(index, field, value) {
    alternatif[index][field] = value;
    renderAlternatif();
}

function updateNilaiAlternatif(altIndex, kriteriaIndex, value) {
    if (!alternatif[altIndex].nilai) alternatif[altIndex].nilai = [];
    alternatif[altIndex].nilai[kriteriaIndex] = isNaN(value) ? 0 : value;
}

function hapusKriteria(index) {
    kriteria.splice(index, 1);
    alternatif.forEach(alt => {
        if (alt.nilai) alt.nilai.splice(index, 1);
    });
    renderKriteria();
    renderAlternatif();
}

function hapusAlternatif(index) {
    alternatif.splice(index, 1);
    renderAlternatif();
}

function tambahKriteria() {
    kriteria.push({ nama: "Kriteria Baru", bobot: 1, jenis: "benefit" });
    alternatif.forEach(alt => {
        if (!alt.nilai) alt.nilai = [];
        alt.nilai.push(0);
    });
    renderKriteria();
    renderAlternatif();
}

function tambahAlternatif() {
    const nilaiBaru = new Array(kriteria.length).fill(0);
    alternatif.push({ nama: "Alternatif Baru", nilai: nilaiBaru });
    renderAlternatif();
}

function normalisasiBobot() {
    let totalBobot = kriteria.reduce((sum, k) => sum + (k.bobot || 0), 0);
    if (totalBobot === 0) return kriteria.map(() => 0);
    return kriteria.map(k => (k.bobot || 0) / totalBobot);
}

function hitungSAW() {
    if (kriteria.length === 0) {
        alert("Tambahkan minimal satu kriteria terlebih dahulu!");
        return;
    }
    if (alternatif.length === 0) {
        alert("Tambahkan minimal satu alternatif!");
        return;
    }

    for (let i = 0; i < kriteria.length; i++) {
        if (!kriteria[i].nama || kriteria[i].nama.trim() === "") {
            alert(`Kriteria ke-${i+1} belum diisi namanya!`);
            return;
        }
        if (kriteria[i].bobot === 0 || isNaN(kriteria[i].bobot) || kriteria[i].bobot <= 0) {
            alert(`Bobot kriteria "${kriteria[i].nama}" harus lebih dari 0!`);
            return;
        }
    }

    for (let i = 0; i < alternatif.length; i++) {
        if (!alternatif[i].nama || alternatif[i].nama.trim() === "") {
            alert(`Alternatif ke-${i+1} belum diisi namanya!`);
            return;
        }
        for (let j = 0; j < kriteria.length; j++) {
            let nilai = alternatif[i].nilai?.[j];
            if (nilai === undefined || isNaN(nilai) || nilai === null) {
                alert(`Nilai untuk ${alternatif[i].nama} pada kriteria "${kriteria[j].nama}" belum diisi!`);
                return;
            }
        }
    }

    const bobotNormal = normalisasiBobot();
    
    let maxValues = new Array(kriteria.length).fill(-Infinity);
    let minValues = new Array(kriteria.length).fill(Infinity);
    
    alternatif.forEach(alt => {
        alt.nilai.forEach((nilai, j) => {
            if (nilai > maxValues[j]) maxValues[j] = nilai;
            if (nilai < minValues[j]) minValues[j] = nilai;
        });
    });

    for (let j = 0; j < kriteria.length; j++) {
        if (maxValues[j] === -Infinity) maxValues[j] = 0;
        if (minValues[j] === Infinity) minValues[j] = 0;
    }

    let hasilPerAlternatif = alternatif.map((alt, idx) => {
        let totalSkor = 0;
        let normalisasiR = [];
        for (let j = 0; j < kriteria.length; j++) {
            let nilai = alt.nilai[j];
            let r_ij = 0;
            if (kriteria[j].jenis === 'benefit') {
                r_ij = maxValues[j] === 0 ? 0 : nilai / maxValues[j];
            } else {
                if (nilai === 0) {
                    r_ij = 0;
                } else {
                    r_ij = minValues[j] / nilai;
                }
            }
            normalisasiR.push(r_ij);
            totalSkor += r_ij * bobotNormal[j];
        }
        return {
            nama: alt.nama,
            skor: totalSkor,
            normalisasi: normalisasiR,
            asliIdx: idx
        };
    });

    hasilPerAlternatif.sort((a, b) => b.skor - a.skor);
    tampilkanHasil(hasilPerAlternatif, bobotNormal);
}

function tampilkanHasil(hasilSorted, bobotNormal) {
    const container = document.getElementById('hasil');
    if (!container) return;
    
    let html = `<h3>Hasil Perhitungan SAW (Normalisasi & Skor)</h3>`;
    html += `<table>`;
    html += `<thead><tr><th>Alternatif</th>`;
    kriteria.forEach(k => {
        html += `<th>${escapeHtml(k.nama)}<br><span style="font-size:10px;">(${k.jenis === 'benefit' ? 'Benefit' : 'Cost'})</span></th>`;
    });
    html += `<th>Skor Akhir</th>`;
    html += `</tr></thead><tbody>`;
    
    const mapNilai = new Map();
    hasilSorted.forEach(h => {
        mapNilai.set(h.nama, h);
    });
    
    alternatif.forEach(alt => {
        const data = mapNilai.get(alt.nama);
        if (data) {
            html += `<tr>`;
            html += `<td style="font-weight:600;">${escapeHtml(alt.nama)}</td>`;
            data.normalisasi.forEach(n => {
                html += `<td>${n.toFixed(4)}</td>`;
            });
            html += `<td style="background:#1a2a1a; font-weight:bold;">${(data.skor * 100).toFixed(2)}</td>`;
            html += `</tr>`;
        } else {
            html += `<tr><td>${escapeHtml(alt.nama)}</td>${'<td>-</td>'.repeat(kriteria.length)}<td>0</td></tr>`;
        }
    });
    
    html += `</tbody>`;
    html += `</table>`;
    
    html += `<hr><h3>Peringkat (Tertinggi -> Terendah)</h3>`;
    html += `<table><thead><tr><th>Peringkat</th><th>Alternatif</th><th>Skor (0-100)</th>`;
    html += `</tr></thead><tbody>`;
    
    hasilSorted.forEach((h, idx) => {
        html += `<tr style="${idx === 0 ? 'background:#2a3a2a; border-left:4px solid #7fff7f;' : ''}">`;
        html += `<td><strong>${idx + 1}</strong></td>`;
        html += `<td>${escapeHtml(h.nama)}</td>`;
        html += `<td><strong>${(h.skor * 100).toFixed(2)}</strong></td>`;
        html += `</tr>`;
    });
    html += `</tbody>`;
    html += `</table>`;
    html += `<div style="margin-top: 18px; background:#121212; padding: 10px 12px; border-radius: 20px; font-size: 12px; color: #b9c7d9;">`;
    html += `Bobot ternormalisasi: ${bobotNormal.map(b => b.toFixed(3)).join(' , ')} &nbsp;&nbsp;| Total bobot = 1`;
    html += `</div>`;
    
    container.innerHTML = html;
}

function resetData() {
    kriteria = [];
    alternatif = [];
    renderKriteria();
    renderAlternatif();
    const hasilDiv = document.getElementById('hasil');
    if (hasilDiv) {
        hasilDiv.innerHTML = '<h3>Hasil Perhitungan</h3><div style="color:#8a8f9e; font-size:14px;">Tambahkan kriteria dan alternatif terlebih dahulu, lalu klik "Hitung & Ranking"</div>';
    }
}

function updateDateTime() {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = now.toLocaleString('id-ID', { month: 'long' });
    const tanggal = now.getDate();
    const jam = now.getHours().toString().padStart(2,'0');
    const menit = now.getMinutes().toString().padStart(2,'0');
    const detik = now.getSeconds().toString().padStart(2,'0');
    const hari = now.toLocaleString('id-ID', { weekday: 'short' });
    
    const displayElement = document.getElementById('liveDateTime');
    if (displayElement) {
        displayElement.innerHTML = `${tanggal} ${bulan} ${tahun}  |  ${jam}:${menit}:${detik} (${hari})`;
    }
}

function initRunningTextContent() {
    const runningTrackDiv = document.getElementById('runningTextTrack');
    if (runningTrackDiv) {
        // Hanya nama Raihan yang tersisa
        const teks = "Raihan Nur Hidayat | NIM: 231011402418";
        // Duplikasi agar animasi looping seamless
        runningTrackDiv.innerHTML = `
            <span>${teks}</span>
            <span>${teks}</span>
            <span>${teks}</span>
            <span>${teks}</span>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    initRunningTextContent();
    resetData();
});

window.tambahKriteria = tambahKriteria;
window.tambahAlternatif = tambahAlternatif;
window.hitungSAW = hitungSAW;
window.resetData = resetData;
window.updateKriteria = updateKriteria;
window.updateAlternatif = updateAlternatif;
window.updateNilaiAlternatif = updateNilaiAlternatif;
window.hapusKriteria = hapusKriteria;
window.hapusAlternatif = hapusAlternatif;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderKriteria();
        renderAlternatif();
    });
} else {
    renderKriteria();
    renderAlternatif();
}