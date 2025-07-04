import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

//convert URL to directory path (Es Modules fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
}) ;

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if(ext != '.pdf') {
        return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
};

//Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export default upload;