const keys = require('../config/keys')
const stripe = require('stripe')(keys.stripeSecretKey)
const requireLogin = require('../middlewares/requireLogin')

module.exports = (app) => {
    app.post('/api/stripe', requireLogin, async (req, res) => { //requireLogin *not* requireLogin() since we dont want to invoke we
        const charge = await stripe.charges.create({            //want express to call it internally also in middleware calling next()
            amount: 5000,                                       //will pass it to next middleware, so next()
            currency: 'inr',
            description: 'Rs5 for 5 email credits',
            source: req.body.id
        })
        //every request handler is embeded with req.user by passport via(deseializeUser passport method) so
        //we can access user data from User model(collection) then can update/overwrite and then save
        req.user.credits += 5 
        const user = await req.user.save()
        res.send(user)
    })
}