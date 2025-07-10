const calculateCF = (selectedSymptomsWithCF, allSymptomsData) => {
  if (!selectedSymptomsWithCF || selectedSymptomsWithCF.length === 0) {
    return {
      total_cf: 0,
      kategori: 'Tidak Ada Kecanduan',
      solusi: 'Anda tidak menunjukkan tanda-tanda kecanduan gadget. Tetaplah menjaga pola penggunaan yang sehat.'
    };
  }

  const expertCFMap = new Map(allSymptomsData.map(symptom => [symptom.id, symptom.mb]));

  const calculatedSymptomsCF = selectedSymptomsWithCF.map(userSymptom => {
    const cf_pakar = expertCFMap.get(userSymptom.id) || 0; 
    return userSymptom.cf_user * cf_pakar;
  });

  if (calculatedSymptomsCF.length === 0) {
    return {
      total_cf: 0,
      kategori: 'Normal',
      solusi: 'Berdasarkan jawaban Anda, tidak ada indikasi yang mengarah pada kecanduan gadget. Pertahankan kebiasaan baik Anda.'
    };
  }

  let cf_combine = calculatedSymptomsCF[0]; 

  for (let i = 1; i < calculatedSymptomsCF.length; i++) {
    const cf_new = calculatedSymptomsCF[i];
    cf_combine = cf_combine + cf_new * (1 - cf_combine);
  }

  const totalCF = cf_combine;

  let kategori = '';
  let solusi = '';

  if (totalCF > 0.75) {
    kategori = 'Kecanduan';
    solusi = "Hasil diagnosa menunjukkan adanya indikasi kuat ke arah 'Kecanduan'. Sangat penting untuk mengambil langkah serius untuk mengatasinya. Pertimbangkan hal berikut:\n\n- **Cari Dukungan**: Bicaralah dengan teman tepercaya, keluarga, atau mempertimbangkan untuk berkonsultasi dengan psikolog atau konselor. Anda tidak sendirian dalam hal ini.\n- **Tetapkan Batasan Tegas**: Gunakan aplikasi untuk membatasi waktu penggunaan aplikasi tertentu.\n- **Ganti dengan Hobi Nyata**: Secara sadar alokasikan waktu yang biasanya untuk gadget ke hobi lain seperti olahraga, membaca buku fisik, atau bertemu teman.";
  } else if (totalCF > 0.40) {
    kategori = 'Waspada';
    solusi = "Hasil menunjukkan Anda berada di tingkat 'Waspada'. Ini bukan berarti Anda kecanduan, tetapi ini adalah momen yang baik untuk merefleksikan kebiasaan penggunaan gadget Anda. Cobalah beberapa langkah proaktif seperti:\n\n- **Digital Detox Ringan**: Tentukan satu hari dalam seminggu untuk mengurangi penggunaan media sosial secara signifikan.\n- **Atur Notifikasi**: Matikan notifikasi yang tidak penting untuk mengurangi gangguan.\n- **Ciptakan 'Zona Bebas Gadget'**: Misalnya, tidak ada gadget di meja makan atau di kamar tidur 1 jam sebelum tidur.";
  } else { 
    kategori = 'Normal';
    solusi = 'Penggunaan gadget Anda saat ini berada dalam tingkat yang sehat dan normal. Ini sangat baik. Terus pertahankan kesadaran (`mindfulness`) dalam menggunakan teknologi dan pastikan Anda tetap menyeimbangkan waktu antara aktivitas online dan offline.';
  }

  return { total_cf: totalCF.toFixed(4), kategori, solusi };
};

module.exports = calculateCF;
