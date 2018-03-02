const Recurly = require('recurly-js')
const uuid = require('node-uuid')
const fetch = require('node-fetch')
const js2xmlparser = require('js2xmlparser')
const xml2js = require('xml2js')
const base64 = require('base-64')
const randomWord = require('random-word')
const jsesc = require('jsesc')

const recurlyConfig = {
    RECURLY_PUBLIC_KEY: process.env.RECURLY_PUBLIC_KEY,
    API_KEY: process.env.API_KEY,
    SUBDOMAIN: process.env.SUBDOMAIN
}

class RecurlyHelper {

    static init() {
        this.recurly = new Recurly({
            SUBDOMAIN: recurlyConfig.SUBDOMAIN,
            API_KEY: recurlyConfig.API_KEY
        })
    }

    static createAccount(config) {

        const {account_code, billing_info} = config
        console.log('CONFIG:',config)
        return new Promise(resolve => {

            try {

                this.recurly.accounts.create({
                    account_code,
                    billing_info
                }, (err, response) => {
                    // error
                    if (err) {
                        console.error('createAccount error: ', JSON.stringify(err))
                        resolve(false)
                    }

                    // success
                    resolve(true)
                })


            } catch (err) {
                console.error('createAccount error: ', err)
                resolve(false)
            }
        })
    }

    static getUser(accountCode){
        return new Promise(resolve => {
            try {
                this.recurly.accounts.get(accountCode,result => {

                    if (result.status === 'ok' && !!result.data && !!result.data.user) {
                        resolve(result.data.user)
                    } else {
                        resolve(false)
                    }
                })
            } catch (err) {
                console.error('getUser error:', err)
                resolve(false)
            }
        })
    }

    static removeAllPlans() {

        return new Promise(resolve => {
            this.recurly.plans.list(result => {

                console.log('resilt: ', result)

                if (result.status === 'ok' && !!result.data && !!result.data.plans) {

                    const promises = []

                    result.data.plans.plan.forEach(plan => {


                        promises.push(new Promise(resolve => {
                            try {
                                this.recurly.plans.remove(plan.plan_code, (err, response) => {
                                    console.log('err,resp:', err, response)
                                    // error
                                    if (err) {
                                        console.error('removeAllPlans error: ', JSON.stringify(err))
                                        resolve(false)
                                    }
                                    // success
                                    if (response.statusCode === 204) {
                                        resolve(true)
                                    }
                                    else {
                                        console.error('removeAllPlans error. See response: ', response)
                                        resolve(false)
                                    }
                                })

                            } catch (err) {
                                console.error('removeAllPlans error: ', err)
                                resolve(false)
                            }
                        }))
                    })

                    Promise.all(promises).then(results => {
                        console.log('removeAllPlans results:', results)
                        resolve()
                    })


                } else {
                    console.log('nothing to delete')
                    resolve()
                }

            })
        })


    }

    static seedPlans(rangeLength) {

        const promises = []

        const range = Array.from(Array(rangeLength).keys())

        range.forEach(el => {

            const name = randomWord()

            const data = {
                plan_code: `${name}-${uuid()}`.slice(0,50),
                name: `${name}-tile`,
                // add_on_type: 'fixed',
                unit_amount_in_cents: {
                    USD: 100,
                },
                setup_fee_in_cents: {
                    USD: 100,
                },
                plan_interval_length: 1,
                plan_interval_unit: 'months',
                tax_exempt: false
            }

            console.log('plan data:', data)

            promises.push(new Promise(resolve => {
                try {
                    this.recurly.plans.create(data, (err, response) => {
                        console.log('err,resp:', err, response)
                        // error
                        if (err) {
                            console.error('seedPlans error: ', JSON.stringify(err))
                            resolve(false)
                        }
                        // success
                        if (response.statusCode === 201 && response.data.plan) {
                            resolve(response.data.plan)
                        }
                        else {
                            console.error('seedPlansn error. See response: ', response)
                            resolve(false)
                        }
                    })

                } catch (err) {
                    console.error('seedPlans error: ', err)
                    resolve(false)
                }
            }))
        })


        return new Promise(resolve => {
            Promise.all(promises).then(results => {
                console.log('Seed results:', results)
                resolve(results)
            })

        })

    }

    static getPlans() {
        return new Promise(resolve => {
            try {
                this.recurly.plans.list(result => {

                    if (result.status === 'ok' && !!result.data && !!result.data.plans) {
                        resolve(result.data.plans)
                    } else {
                        resolve(false)
                    }
                })
            } catch (err) {
                console.error('getPlans error:', err)
                resolve(false)
            }
        })
    }

    static getTransactions() {
        return new Promise(resolve => {
            try {
                this.recurly.transactions.list(() => {
                    return true
                }, result => {

                    if (result.status === 'ok' && !!result.data && !!result.data.transactions) {
                        resolve(result.data.transactions)
                    } else {
                        resolve(false)
                    }
                })
            } catch (err) {
                console.error('getTransaction error:', err)
                resolve(false)
            }
        })
    }

    static getSubscriptionsByAccount(accountCode) {

        return new Promise(resolve => {
            try {
                this.recurly.subscriptions.listByAccount(encodeURIComponent(accountCode), result => {

                    if (result.status === 'ok' && !!result.data && !!result.data.subscriptions) {
                        resolve(result.data.subscriptions)
                    } else {
                        resolve(false)
                    }
                })
            } catch (err) {
                console.error('getSubscriptionsByAccount error: ', err)
                resolve(false)
            }
        })
    }


    static createCharge(config) {

        return new Promise(resolve => {
            try {
                recurly.adjustments.create(config, (err, response) => {
                    // error
                    if (err) {
                        console.error('createCharge error: ', err)
                        resolve(false)
                    }
                    // success
                    if (response.statusCode === 201 && response.data.adjustment) {
                        resolve(response.data.adjustment)
                    }
                    else {
                        console.error('createCharge error. See response: ', response)
                        resolve(false)
                    }
                })


            } catch (err) {
                console.error('createCharge error: ', err)
                resolve(false)
            }
        })

    }

    static createPurchase(config) {


        return new Promise(resolve => {
            try {

                fetch("https://" + recurlyConfig.SUBDOMAIN + ".recurly.com/v2/purchases", {
                    method: "POST",
                    headers: {
                        'X-Api-Version': '2.10', "Authorization": "Basic " + base64.encode(recurlyConfig.API_KEY),
                    },
                    body: js2xmlparser.parse('purchase', config)
                }).then(res => res.text())
                    .catch(error => {
                        console.error('createPurchase error: ', error)
                        resolve(false)
                    })
                    .then(response => {
                        const result = xml2js.parseString(response)
                        if (!result.errors) {
                            console.log('Purchase result:', JSON.stringify(result))
                            resolve(result)
                        } else {
                            console.error('createPurchase error: ', JSON.stringify(result.errors))
                            resolve(false)
                        }
                    })


            } catch (err) {
                console.error('createPurchase error: ', err)
                resolve(false)
            }
        })

    }

    static createSubscription(config) {

        const {planCode, currency, account} = config

        const data = {
            plan_code: planCode,
            currency,
            account
        }

        return new Promise(resolve => {
            try {
                this.recurly.subscriptions.create(data, (err, response) => {
                    // error
                    if (err) {
                        console.error('createSubscription error: ', JSON.stringify(err))
                        resolve(false)
                    }
                    // success
                    if (response.statusCode === 201 && response.data.subscription) {
                        resolve(response.data.subscription)
                    }
                    else {
                        console.error('createSubscription error. See response: ', response)
                        resolve(false)
                    }
                })


            } catch (err) {
                console.error('createSubscription error: ', err)
                resolve(false)
            }
        })

    }

}

module.exports = RecurlyHelper