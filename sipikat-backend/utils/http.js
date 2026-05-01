const isProduction = process.env.NODE_ENV === 'production';

const DEFAULT_ERROR_MESSAGE = 'Terjadi kesalahan server.';
const NO_STORE_VALUE = 'no-store, no-cache, must-revalidate, private';

const sendErrorResponse = (res, error, options = {}) => {
  const {
    status = 500,
    publicMessage = DEFAULT_ERROR_MESSAGE,
    includeStack = process.env.NODE_ENV === 'development',
    extra = {},
  } = options;

  const payload = {
    message: publicMessage,
    ...extra,
  };

  if (!isProduction && error?.message && publicMessage !== error.message) {
    payload.debug = error.message;
  }

  if (includeStack && error?.stack) {
    payload.stack = error.stack;
  }

  return res.status(status).json(payload);
};

const applyNoStore = (res) => {
  res.set({
    'Cache-Control': NO_STORE_VALUE,
    Pragma: 'no-cache',
    Expires: '0',
  });
};

const noStore = (req, res, next) => {
  applyNoStore(res);
  next();
};

module.exports = {
  applyNoStore,
  noStore,
  sendErrorResponse,
};
