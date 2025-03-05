module.exports = function (req, res, next) {
    if (!req.session.isAdmin) {
        res.status(403).send("Доступ заборонено");
        return res.redirect('/auth');
    }
    next();
};
