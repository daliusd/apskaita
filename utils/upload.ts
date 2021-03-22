import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const uploadPromise = (name: string, req) => {
  return new Promise<{
    files: Express.Multer.File[];
    body: Record<string, string>;
  }>((resolve, reject) => {
    upload.fields([{ name, maxCount: 1 }])(req, undefined, (err) => {
      if (err) {
        reject();
      } else {
        resolve({ files: req.files, body: req.body });
      }
    });
  });
};
