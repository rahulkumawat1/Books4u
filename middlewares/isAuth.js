exports.isAdmin = (req, res ,next) => {

    if(!req.session.loggedIn || !req.session.user_t=='admin')
        return res.status(404).render('404', {pageTitle: "Not Found"});

    next();
}

exports.isCustomer = (req, res ,next) => {

    if(!req.session.loggedIn || !req.session.user_t=='customer')
        return res.status(404).render('404', {pageTitle: "Not Found"});

    next();
}