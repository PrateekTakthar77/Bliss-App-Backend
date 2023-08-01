const router = require('express').Router()
const Category = require('../../models/Category')


router.get('/categories', async (req, res, next) => {
    try {
        const category = await Category.find({})
        res.status(200).json({
            ok: "true",
            data: category
        })
    }
    catch (err) {
        next(err)
    }
})
module.exports = router