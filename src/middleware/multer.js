import createHttpError from 'http-errors';
import multer from 'multer';

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(createHttpError(400, 'Only images allowed'));
    return;
  }

  callback(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});
