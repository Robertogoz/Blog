const Express = require('express');
const Article = require('./Article');
const Category = require('../Categories/Category');
const slugify = require('slugify');
const adminAuth = require('../middleware/adminAuth');
const router = Express.Router();

router.get('/admin/articles', adminAuth,(req,res) => {
	Article.findAll({
		include: [{model: Category}]
	}).then((articles) => {
		res.render("admin/articles/index", {articles:articles});
	})
	
});

router.get('/admin/articles/new', adminAuth, (req,res) => {
	Category.findAll().then((categories) => {
		res.render('admin/articles/new', {categories:categories});
	})
});

router.post('/article/save', adminAuth, (req,res) => {
	let title = req.body.title;
	let body = req.body.body;
	let categoryId = req.body.category;

	Article.create({
		title:title,
		slug:slugify(title),
		body:body,
		categoryId: categoryId 
	}).then(() => {
		res.redirect('/admin/articles');
	})
})

router.delete('/article/delete', adminAuth, (req,res) => {
	let id = req.body.id;

	if(id != undefined){
		if(!isNaN(id)) {
			Article.destroy({
				where: {
					id:id
				}
			}).then(() => {
				res.redirect('/admin/articles');
			});
		} else {
			res.redirect('/admin/articles');
		}
	} else {
		res.redirect('/admin/articles');
	}
});

router.get('/admin/articles/edit/:id', adminAuth, (req,res) => {
	let id = req.params.id;

	if(isNaN(id)) {
		res.redirect('/admin/articles');
	}

	Article.findByPk(id).then(articles => {
		if(articles != undefined) {
			Category.findAll().then(categories => {
				res.render('admin/articles/edit', {articles: articles, categories:categories});
			});
		} else {
			res.redirect('/admin/articles');
		}
	}).catch((error) => {
		res.redirect('/admin/articles');
	});
});

router.put('/article/edit', adminAuth,(req,res) => {
	let id = req.body.id;
	let title = req.body.title;
	let body = req.body.body;
	let category = req.body.category

	Article.update({title:title, categoryId:category, body:body, slug: slugify(title)}, {
		where: {
			id:id
		}
	}).then(() => {
		res.redirect('/admin/articles');
	}).catch(err => {
		res.redirect('/admin/articles');
	});
});

//pagination

router.get('/articles/page/:num', (req,res) => {
	let page = req.params.num;
	let itensPerPage = 4;
	let offset

	if(isNaN(page) || page <= 1) {
		offset = 0;
	} else {
		offset = (parseInt(page)-1) * itensPerPage;
	}

	Article.findAndCountAll({
		limit: itensPerPage,
		offset: offset,
		order: [['id','DESC']]
	}).then(articles => {
		let next;

		if(offset + itensPerPage >= articles.count) {
			next = false;
		} else {
			next = true;
		}

		let result = {
			page: parseInt(page),
			next: next,
			articles: articles
		}

		Category.findAll().then(categories => {
			res.render('page', {result: result,categories: categories})
		});
	});
});

module.exports = router;