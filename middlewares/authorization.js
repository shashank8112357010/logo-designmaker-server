module.exports = function (reqdRole) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Access denied. No token is provided!!"
            })
        }

        // checking role:
        if (req.user.role !== reqdRole) {
            return res.status(403).json({
                message: "Access denied. Not authorized!"
            })
        }

        next();
    }
}