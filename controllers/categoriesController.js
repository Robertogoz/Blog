const Express = require('express');
const router = Express.Router();
const Category = require('../models/Category');
const slugify = require('slugify')
const adminAuth = require('../middleware/adminAuth');

router.get('/admin/categories', adminAuth,(req,res) => {
	Category.findAll().then(categories => {
		if(categories != undefined) {
			res.render("admin/categories/index", {categories: categories});
		} else {
			res.redirect('/admin/categories');
		}
	});
});

router.get('/admin/categories/new', adminAuth,(req,res) => {
	res.render('admin/categories/new');
})

router.post('/category/save', adminAuth,(req,res) => {
	let title = req.body.title;

	Category.create({
		title: title,
		slug: slugify(title)
	}).then(() => {
		res.redirect('/admin/categories');
	});
});

router.delete('/category/delete', adminAuth,(req,res) => {
	let id = req.body.id;

	if(id != undefined){
		if(!isNaN(id)) {
			Category.destroy({
				where: {
					id:id
				}
			}).then(() => {
				res.redirect('/admin/categories');
			});
		} else {
			res.redirect('/admin/categories');
		}
	} else {
		res.redirect('/admin/categories');
	}
});

router.get('/admin/categories/edit/:id', adminAuth,(req,res) => {

	let id = req.params.id;

	if(isNaN(id)) {
		res.redirect('/admin/categories');
	}

	Category.findByPk(id).then( categories => {
		if(id != undefined) {
			res.render('admin/categories/edit', {categories: categories});
		} else {
			res.redirect('/admin/categories');
		}
	}).catch((error) => {
		res.redirect('/admin/categories');
	})
})

router.put('/category/edit', adminAuth,(req,res) => {
	let id = req.body.id;
	let title = req.body.title;

	Category.update({title:title, slug: slugify(title)}, {
		where: {
			id:id
		}
	}).then(() => {
		res.redirect('/admin/categories');
	})
})

module.exports = router;