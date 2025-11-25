// backend/routes/productRoute.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// NOTE: import must include the .js extension for ESM
import { createProduct, deleteProduct, getProducts } from '../controllers/productController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const itemRouter = express.Router();

// MULTER SETUP (writes into backend/uploads)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ROUTES
itemRouter.get('/', getProducts);
itemRouter.post('/', upload.single('image'), createProduct);
itemRouter.delete('/:id', deleteProduct);

export default itemRouter;
