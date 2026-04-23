const MIN_PASSWORD_LENGTH = 8;

const getPasswordValidationError = (password) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }

  if (!/[a-z]/.test(password)) {
    return 'Password harus mengandung minimal 1 huruf kecil.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password harus mengandung minimal 1 huruf besar.';
  }

  if (!/\d/.test(password)) {
    return 'Password harus mengandung minimal 1 angka.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password harus mengandung minimal 1 karakter spesial.';
  }

  return null;
};

module.exports = {
  MIN_PASSWORD_LENGTH,
  getPasswordValidationError
};
