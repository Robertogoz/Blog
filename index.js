const Express = require("express");
const connection = require("./database/database");
const app = Express();
const port = 3030;
const session = require('express-session')

// express-session
app.use(session({
    secret: 'password', cookie: {maxAge: 600000}
}))

// routers
const categoriesController = require("./controllers/categoriesController");
const articlesController = require("./controllers/articlesController");
const userController = require("./controllers/usersController");

// models
const Article = require('./models/Article');
const Category = require('./models/Category');

// ejs
app.set('view engine', 'ejs');

// static files/bootstrap
app.use(Express.static('public'));

// body-parser
app.use(Express.json())
app.use(Express.urlencoded({ extended: true}))

// sequelize
connection
    .authenticate()
    .then(() => {
        console.log("Connection between server and database successful")
    })
    .catch((error) => {
        console.log(error);
    })


// routes    
app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', userController);

app.get('/', (req, res) => {
    Article.findAll({
        order:[
            ['id','DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', {articles: articles, categories: categories});
        })
    });    
});

app.get('/:slug', (req,res) => {
    let slug = req.params.slug;

    Article.findOne({
        where: {
            slug:slug
        }
    }).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', {article: article, categories: categories});
            })
        } else {
            res.redirect('/');
        }
    }).catch(err => {
        res.redirect('/');
    });
});

app.get('/category/:slug', (req,res) =>{
    let slug = req.params.slug;

    Category.findOne({
        where:{
            slug:slug
        },
        include: [{model:Article}]
    }).then(category => {
        if(category != undefined) {
            Category.findAll().then(categories => {
                res.render('category', {categories:categories, articles: category.articles, slug: slug});
            })
        } else {
            res.redirect('/');
        }
    }).catch(err => {
        res.redirect('/');
    });
});

// Server running 
app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
})