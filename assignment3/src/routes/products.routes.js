import { Router } from 'express';
import mongoose from 'mongoose';

import { Product } from '../models/product.model.js';

export const productsRouter = Router();

productsRouter.post('/', async (req, res, next) => {
  try {
    const { name, price, category, description } = req.body ?? {};

    if (!name || price === undefined || price === null || !category || !description) {
      return res.status(400).json({
        message: 'Validation error',
        details: {
          required: ['name', 'price', 'category', 'description']
        }
      });
    }

    const created = await Product.create({ name, price, category, description });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

productsRouter.get('/', async (req, res, next) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (err) {
    return next(err);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const item = await Product.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Not Found' });
    }

    return res.status(200).json(item);
  } catch (err) {
    return next(err);
  }
});

productsRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const { name, price, category, description } = req.body ?? {};

    if (!name || price === undefined || price === null || !category || !description) {
      return res.status(400).json({
        message: 'Validation error',
        details: {
          required: ['name', 'price', 'category', 'description']
        }
      });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price, category, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Not Found' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Not Found' });
    }

    return res.status(200).json({ message: 'Deleted', id });
  } catch (err) {
    return next(err);
  }
});
