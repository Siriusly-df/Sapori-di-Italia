const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { categoryModel } = require('../db/categoryModel');
const { productModel } = require('../db/productModel');

dotenv.config();

router.get('/', async function(req, res) {
  try {
    const categories = await categoryModel.getAll();
    // res.render('pages/cat', { data: categories, isAdmin: false });
    res.render('pages/cat', { 
      data: categories, 
      isAuth: req.session.isAuthenticated || false,
      isAdmin: req.session.isAdmin || false 
    });
    
    
  } catch (error) {
    res.status(500).send(`Error fetching categories: ${error.message}`);
  }
});

// router.get('/:catname', async function (req, res) {
//   const { catname } = req.params;
//   try {
//     const category = await categoryModel.getByKey(catname);
//     if (!category) {
//       return res.status(404).send('Category not found');
//     }
//     const products = await productModel.getAllByCategory(category.id); 
//     res.render('pages/single_cat', {
//       catname,
//       title: category.title,
//       data: products,
//     });
//   } catch (error) {
//     res.status(500).send(`Error fetching category or products: ${error.message}`);
//   }
// });


router.get('/:catname', async function (req, res) {
  const { catname } = req.params;
  const page = parseInt(req.query.page) || 1;  
  const pageSize = 2; 

  try {
    const category = await categoryModel.getByKey(catname);
    if (!category) {
      return res.status(404).send('Category not found');
    }

    const totalProducts = await productModel.getCountByCategory(category.id);
    const totalPages = Math.ceil(totalProducts / pageSize); 

    const products = await productModel.getAllByCategory(category.id, page, pageSize);

    res.render('pages/single_cat', {
      catname,
      title: category.title,
      data: products,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    res.status(500).send(`Error fetching category or products: ${error.message}`);
  }
});


router.get('/:catname/:productId', async function (req, res) {
  const { catname, productId } = req.params;
  const productIdNumber = parseInt(productId, 10);
  if (isNaN(productIdNumber)) {
    return res.status(400).send('Invalid product ID');
  }
  try {
    const category = await categoryModel.getByKey(catname);
    const product = await productModel.getById(productIdNumber); 
    if (!category || !product) {
      return res.status(404).send('Not found');
    }
    res.render('pages/single_goods', {
      id: product.id,
      title: product.name,
      titlCat: category.title,
      catname: catname,
      name: product.name,
      weight: product.weight,
      ingredients: product.ingredients,
      description: product.description,
      price: product.price,
      image: product.image,
    });
  } catch (error) {
    res.status(500).send(`Error fetching product: ${error.message}`);
  }
});

module.exports = router;