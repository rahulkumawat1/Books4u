module.exports = (req, res, next) => {
    res.status(404).render('404.ejs', {pageTitle: '404', path: req.url});
}