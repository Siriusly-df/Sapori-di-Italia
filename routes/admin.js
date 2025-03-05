const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin')
const { categoryModel } = require('../db/categoryModel');
const { productModel } = require('../db/productModel');
const prisma = require('../db/prisma');

router.get('/cat', admin, async function(req, res) {
  try {
    const categories = await categoryModel.getAll();
    res.render('admin_pages/admin', { data: categories });
  } catch (error) {
    res.status(500).send(`Error fetching categories: ${error.message}`);
  }
});


router.get('/cat/:category=:categoryId', admin, async function(req, res) {
  let { categoryId } = req.params;

  try {
    const category = await categoryModel.getById(categoryId);
    if (!category) {
      return res.status(404).send('Category not found');
    }
    const products = await productModel.getAllByCategory(category.id);
    res.render('admin_pages/admin_single_cat', {
      title: category.title,
      categoryId: category.id,
      data: products,
    });
  } catch (error) {
    res.status(500).send(`Error fetching category or products: ${error.message}`);
  }
});


router.get('/cat/category=:categoryId/add-product', admin, async function(req, res) {
  const { categoryId } = req.params;
  const category = await categoryModel.getById(categoryId);

  if (!category) {
    return res.status(404).send('Category not found');
  }

  res.render('admin_pages/admin_add_product', {
    categoryId: category.id,
    title: category.title
  });
});


router.get('/cat/category=:categoryId/product=:productId/manage-product', admin, async function(req, res) {
  console.log("req.params:", req.params);

  const { categoryId, productId } = req.params;
  console.log("categoryId:", categoryId);
  console.log("productId:", productId);

  const productIdNumber = parseInt(productId, 10);

  if (isNaN(productIdNumber)) {
      return res.status(400).send(`Invalid product ID: ${productId}`);
  }

      const category = await categoryModel.getById(categoryId);
      const product = await productModel.getById(productIdNumber); 

      if (!category || !product) {
          return res.status(404).send('Not found');
      }

      res.render('admin_pages/admin_manage_product', {
          id: product.id,
          title: product.name,
          titlCat: category.title,
          catname: categoryId,
          name: product.name,
          weight: product.weight,
          ingredients: product.ingredients,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: category.id,
      });
});


router.post('/add-product-db',  admin, async (req, res) => {
  const { name, description, price, weight, ingredients, image, categoryId } = req.body;

  console.log('Запит отримано:', req.body);  
  console.log('Отримані дані для створення продукту:', {name, description, price, weight, ingredients, image, categoryId});
  if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Необхідні дані відсутні.' });
  }
  try {
      const weightAsString = String(weight);

      const newProduct = await prisma.product.create({
          data: {
            name,
            description,
            price: Number(price),
            weight: weightAsString, 
            ingredients,
            image,
            category: {
              connect: { id: Number(categoryId) },
            },
          },
      });
      res.status(201).json(newProduct);
  } catch (error) {
      console.error('Помилка при створенні продукту:', error);
      res.status(500).json({ error: 'Не вдалося додати продукт', details: error.message });
  }
});


router.delete('/delete-product-db', admin, async (req, res) => {
  // console.log('Request body:', req.body); 
  const { categoryId, productId } = req.body;

  const parsedCategoryId = parseInt(categoryId, 10);
  const parsedProductId = parseInt(productId, 10);

  if (isNaN(parsedCategoryId) || isNaN(parsedProductId)) {
    return res.status(400).json({ success: false, message: 'Invalid categoryId or productId' });
  }

  try {
    const category = await categoryModel.getById(parsedCategoryId);
    const product = await productModel.getById(parsedProductId);

    if (!category || !product) {
      return res.status(404).json({ success: false, message: 'Category or product not found' });
    } else {
      await productModel.delete(parsedProductId);
      return res.status(200).json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});


router.post('/update-product',  admin, async (req, res) => {
  // console.log('Received data:', req.body); 
  const { name, description, price, weight, ingredients, image, id } = req.body;
  try {
      const updatedProduct = await productModel.update(parseInt(id), {
          name,
          description,
          price: parseFloat(price),
          weight,
          ingredients,
          image,
      });

      res.status(200).send('Product updated successfully');
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Error updating product');
  }
});


module.exports = router;
