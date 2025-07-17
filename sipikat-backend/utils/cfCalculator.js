const calculateCF = (selectedSymptomsWithCF, allSymptomsData, solutionsFromDb) => {
  if (!selectedSymptomsWithCF || selectedSymptomsWithCF.length === 0) {
    const noAddictionSolution = solutionsFromDb.find(sol => sol.kategori === 'Tidak Ada Kecanduan');
    return {
      total_cf: 0,
      kategori: 'Tidak Ada Kecanduan',
      solusi: noAddictionSolution ? noAddictionSolution.solusi : 'Anda tidak menunjukkan tanda-tanda kecanduan gadget. Tetaplah menjaga pola penggunaan yang sehat.'
    };
  }

  const expertCFMap = new Map(allSymptomsData.map(symptom => [symptom.id, symptom.mb]));

  const calculatedSymptomsCF = selectedSymptomsWithCF.map(userSymptom => {
    const cf_pakar = expertCFMap.get(userSymptom.id) || 0;
    return userSymptom.cf_user * cf_pakar;
  });

  if (calculatedSymptomsCF.length === 0) {
    const normalDefaultSolution = solutionsFromDb.find(sol => sol.kategori === 'Normal');
    return {
      total_cf: 0,
      kategori: 'Normal',
      solusi: normalDefaultSolution ? normalDefaultSolution.solusi : 'Berdasarkan jawaban Anda, tidak ada indikasi yang mengarah pada kecanduan gadget. Pertahankan kebiasaan baik Anda.'
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

  if (totalCF > 0.70) {
    kategori = 'Kecanduan';
  } else if (totalCF > 0.40) {
    kategori = 'Waspada';
  } else {
    kategori = 'Normal';
  }

  const foundSolution = solutionsFromDb.find(sol => sol.kategori === kategori);
  solusi = foundSolution ? foundSolution.solusi : 'Solusi tidak ditemukan.';

  return { total_cf: totalCF.toFixed(4), kategori, solusi };
};

module.exports = calculateCF;