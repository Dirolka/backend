import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: [2, 'name must be at least 2 characters']
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price must be >= 0']
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true,
      minlength: [2, 'category must be at least 2 characters']
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
      minlength: [5, 'description must be at least 5 characters']
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
