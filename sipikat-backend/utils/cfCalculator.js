const calculateCF = (selectedSymptomsWithCF, allSymptomsData, solutionsFromDb) => {
  if (!selectedSymptomsWithCF || selectedSymptomsWithCF.length === 0) {
    const noAddictionSolution = solutionsFromDb.find(sol => sol.kategori === 'Tidak Ada Kecanduan');
    return {
      total_cf: 0,
      kategori: 'Tidak Ada Kecanduan',
      solusi: noAddictionSolution ? noAddictionSolution.solusi : 'Anda tidak menunjukkan tanda-tanda kecanduan gadget. Tetaplah menjaga pola penggunaan yang sehat.'
    };
  }

  // === UPDATED: Support for String IDs ('G1', 'G2', 'G3') ===
  // Map now uses string IDs as keys
  const expertCFMap = new Map(allSymptomsData.map(symptom => [symptom.id, symptom.mb]));

  // Calculate CF for each selected symptom
  const calculatedSymptomsCF = selectedSymptomsWithCF.map(userSymptom => {
    // Get expert CF value using string ID
    const cf_pakar = expertCFMap.get(userSymptom.id) || 0;
    
    // Log for debugging (optional - can be removed in production)
    if (cf_pakar === 0) {
      console.warn(`Warning: Gejala dengan ID '${userSymptom.id}' tidak ditemukan dalam database.`);
    }
    
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

  // Combine CF values using Certainty Factor formula
  let cf_combine = calculatedSymptomsCF[0];

  for (let i = 1; i < calculatedSymptomsCF.length; i++) {
    const cf_new = calculatedSymptomsCF[i];
    cf_combine = cf_combine + cf_new * (1 - cf_combine);
  }

  const totalCF = cf_combine;

  // Determine category based on CF value
  let kategori = '';
  let solusi = '';

  if (totalCF > 0.70) {
    kategori = 'Kecanduan';
  } else if (totalCF > 0.40) {
    kategori = 'Waspada';
  } else {
    kategori = 'Normal';
  }

  // Find solution based on category
  const foundSolution = solutionsFromDb.find(sol => sol.kategori === kategori);
  solusi = foundSolution ? foundSolution.solusi : 'Solusi tidak ditemukan.';

  return { 
    total_cf: parseFloat(totalCF.toFixed(4)), 
    kategori, 
    solusi 
  };
};

module.exports = calculateCF;