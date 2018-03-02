const express = require('express')
const router = express.Router()
const path = require('path')
const User = require('../models/user')
const RecurlyHelper = require('../../helpers/RecurlyHelper')
const uuid = require('node-uuid')

RecurlyHelper.init()

router.use('/', express.static(`${__dirname}/../../../public`))
router.use('/public/js', express.static(`${__dirname}/../../../public/js`))

// GET route for reading data
router.get('/', (req, res, next) => res.sendFile(path.join(`${__dirname}/../../../public/index.html`)))


router.post('/login', async(req, res, next) => {

    if (req.body.username && req.body.password) {
        User.authenticate(req.body.username, req.body.password, (error, user) => {
            if (error || !user) {
                const err = new Error('Wrong email or password.')
                const error = {status: 401, error: JSON.stringify(err)}
                return res.json(error)
            } else {
                req.session.userId = user._id
                req.session.accountCode = user.accountCode
                return res.redirect('/')
            }
        })
    } else {
        console.log('req.body: ', req.body)
        const error = {status: 400, error: JSON.stringify(err)}
        return res.json(error)
    }
})

//POST route for updating data
router.post('/user', async(req, res, next) => {
    // confirm that user typed same password twice

    const {
        email,
        username,
        password,
        passwordConf,
        address1,
        city,
        country,
        firstName,
        lastName,
        cardNumber,
        zip
    } = req.body


    if (password !== passwordConf) {
        const err = new Error('Passwords do not match.')
        const error = {status: 400, error: JSON.stringify(err)}
        return res.json(error)
    }

    if (email &&
        username &&
        password &&
        passwordConf &&
        address1 &&
        city &&
        country &&
        firstName &&
        lastName &&
        cardNumber &&
        zip

    ) {


        const accountCode = `${username}-${uuid()}`.slice(0, 50)

        const account = await RecurlyHelper.createAccount({
            account_code: accountCode,
            billing_info: {
                address1,
                city,
                country,
                first_name: firstName,
                last_name: lastName,
                number: cardNumber,
                zip
            }
        })

        if (!!account) {

            const userData = {
                email: email,
                username: username,
                firstName,
                lastName,
                password,
                passwordConf,
                recurlyAccount: accountCode
            }

            User.create(userData, (error, user) => {
                if (error) {
                    const err = {status: 500, error: JSON.stringify(error)}
                    return res.json(error)
                } else {
                    req.session.userId = user._id
                    req.session.accountCode = user.accountCode
                    return res.redirect('/')
                }
            })
        } else {
            console.error('error when creating user')
        }

    }
})

// GET route after registering
router.get('/profile', (req, res, next) => {
    User.findById(req.session.userId)
        .exec((error, user) => {
            if (error) {
                const err = {status: 500, error: JSON.stringify(error)}
                return res.json(err)
            } else {
                if (user === null) {
                    return res.json({user: false, status: 401})
                } else {
                    return res.json({user, status: 200})
                }
            }
        })
})

// GET for logout logout
router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(err => {
            if (err) {
                const error = {status: 500, error: JSON.stringify(err)}
                return res.json(error)
            } else {
                return res.json({status: 401})
            }
        })
    }
})


router.post('/api/purchases/new', async(req, res) => {

    const user = await RecurlyHelper.getUser(req.session.accountCode)
    // const user = await getUser(User, req.session.userId)

    const data = {
        account: {
            account_code: user.recurlyAccount,
            billing_info: {
                first_name: user.first_name,
                last_name: user.last_name,
                number: user.number,
            }
        },
        collection_method: 'automatic',
        currency: req.body['currency'],
        customer_notes: 'Some notes for the customer.',
        subscriptions: {
            subscription: {'plan_code': req.body['planCode']}
        },
        terms_and_conditions: 'Our company terms and conditions.',
        vat_reverse_charge_notes: 'Vat reverse charge notes.'
    }

    const purchase = await RecurlyHelper.createPurchase(data)

    return res.json({purchase, status: !!purchase ? 200 : 500})

})

router.post('/api/subscriptions/new', async(req, res) => {

    const subscription = await RecurlyHelper.createSubscription({
        planCode: req.body.planCode,
        currency: req.body.currency,
        account: {
            account_code: req.body.accountCode
        }
    })

    return res.json({subscription, status: !!subscription ? 201 : 500})

})

router.get('/api/subscriptions/list:account_code', async(req, res) => {

    const accountCode = req.params.account_code.replace(/^:/, '')

    const result = await RecurlyHelper.getSubscriptionsByAccount(accountCode)

    if (!result.subscription) {
        res.json({subscriptions: false})
    } else {
        res.json({subscriptions: (result.subscription.length ? result.subscription : [result.subscription]) || []})
    }

})

router.get('/api/plans/removeAll', async(req, res) => {

    const result = await RecurlyHelper.removeAllPlans()

    res.json({result})
})

router.get('/api/plans/seed:range', async(req, res) => {
    const rangeLength = parseInt(req.params.range.replace(/^:/, ''))

    const result = await RecurlyHelper.seedPlans(rangeLength)

    res.json({result})
})

router.get('/api/plans', async(req, res) => {

    const result = await RecurlyHelper.getPlans()

    if (!result.plan) {
        res.json({plans: false})
    } else {
        res.json({plans: (result.plan.length ? result.plan : [result.plan]) || []})
    }

})

router.get('/api/transactions', async(req, res) => {

    const result = await RecurlyHelper.getTransactions()

    if (!result.transaction) {
        res.json({transactions: false})
    } else {
        res.json({transactions: (result.transaction.length ? result.transaction : [result.transaction]) || []})
    }

})

module.exports = router