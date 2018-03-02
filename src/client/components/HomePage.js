import React, {Component} from 'react'
import Registration from './Registration'
import Subscriptions from './Subscriptions'
import Plans from './Plans'
import Login from './Login'
import Cart from './Cart'
import fetchHelper from '../../helpers/fetchHelper'
import update from 'immutability-helper'

import PromiseSeries from 'promise-series'

export default class HomePage extends Component {
    constructor(props) {
        super()
        this.state = {
            ...props,
            loaded: false,
            subscriptions: [],
            plans: [],
            products: []
        }
    }

    async componentWillMount() {
        await this.start()
    }

    componentDidMount() {
        log('this.state: ', this.state)
    }

    componentDidUpdate() {
        log('updated this.state: ', this.state)
    }

    async start(){
        await this.fetchProfile()
        await this.fetchSubscriptions()
        await this.fetchPlans()
        this.setState({loaded: true})
    }

    fetchSubscriptions() {
        const {profile} = this.state

        return new Promise(async resolve => {
            if (!!profile && !!profile.recurlyAccount) {
                const result = await fetchHelper(`/api/subscriptions/list:${profile.recurlyAccount}`)

                this.setState({subscriptions: result.subscriptions}, () => resolve(result.subscriptions))
            }
        })
    }

    fetchPlans() {

        const {subscriptions} = this.state

        return new Promise(async resolve => {
            const result = await fetchHelper(`/api/plans`)

            //set subscription flag for each plan
            const plans = !!result.plans ? result.plans.map(plan => {
                    plan.subscribed = !!subscriptions && !!subscriptions.length && !!subscriptions.find(s => s.plan.plan_code === plan.plan_code)
                    return plan
                }) : result.plans

            this.setState({plans}, () => resolve(plans))
        })
    }

    fetchProfile() {
        return new Promise(async resolve => {
            const response = await fetchHelper('/profile')

            if (response.status === 200) {
                this.setState({profile: response.user}, () => resolve(response.user))
            } else {
                this.setState({loaded: true})
                resolve(false)
            }
        })
    }

    addProduct(planCode) {
        const {products, subscriptions, plans} = this.state

        const isSubscribedOrAdded = (!!subscriptions && !!subscriptions.length) && (subscriptions.find(s => s.plan.plan_code === planCode) || products.find(p => p.plan_code === planCode) )

        const planIndex = plans.findIndex(plan => plan.plan_code === planCode)
        plans[planIndex].added = true

        const product = isSubscribedOrAdded ? false : {...plans.find(p => p.plan_code === planCode)}

        if (product) {
            this.setState({
                products: update(products, {$push: [product]}),
                plans: update(plans, {[planIndex]: {$set: plans[planIndex]}})
            })
        } else {
            alert('you have this one already')
        }
    }

    cancelProduct(planCode) {
        const {products, plans} = this.state

        log('planCode: ', planCode)

        const planIndex = plans.findIndex(plan => plan.plan_code === planCode)
        plans[planIndex].added = false

        this.setState({
            products: update(products, {$set: products.filter(p => p.plan_code !== planCode)}),
            plans: update(plans, {[planIndex]: {$set: plans[planIndex]}})
        })
    }


    purchaseProducts() {
        const {products, plans, subscriptions} = this.state

        return new Promise(async resolve => {
            if (products.length) {

                const subscriptionPromises = products.map(p => {
                    if (subscriptions) {
                        const subscribed = subscriptions.find(s => s.plan.plan_code === p.plan_code)
                        if (subscribed) {
                            return false
                        } else {
                            return this.subscribe.bind(this, p.plan_code, false)
                        }
                    } else {
                        return this.subscribe.bind(this, p.plan_code, false)
                    }

                }).filter(promise => !!promise)


                const purchasePromises = products.map(p => this.purchase.bind(this, p.plan_code, false))

                const queue = subscriptionPromises.concat(purchasePromises)

                const series = new PromiseSeries()
                queue.forEach(el => {
                    series.add(el)
                })
                series.run().then(function (res) {
                    log('All purchased:', res)
                })


                const planCodes = products.map(p => p.plan_code)

                const thosePlans = plans.filter(p => planCodes.indexOf(p.plan_code) !== -1)

                const newSubscriptions = subscriptions || []

                thosePlans.forEach(plan => {
                    newSubscriptions.push({plan})
                })

                this.setState({
                        subscriptions: newSubscriptions,
                        plans: plans.map(p => {
                            if (planCodes.indexOf(p.plan_code) !== -1) {
                                p.susbcribed = true
                            }
                            return p
                        }),
                        products: [],
                    },
                    () => resolve(planCodes)
                )

                this.setState({products: []})
            } else {
                resolve(false)
            }
        })
    }

    purchase(planCode, shouldUpdateState) {
        log('purchasing: ', planCode)
        const {subscriptions, plans} = this.state

        const data = {method: 'POST', planCode, currency: 'USD'}

        return new Promise(async resolve => {
            const response = await fetchHelper('/api/purchases/new', data)

            if (response.status === 200) {

                if (shouldUpdateState) {

                    const planIndex = plans.findIndex(plan => plan.plan_code === planCode)
                    plans[planIndex].subscribed = true

                    const subscription = {plan: plans[planIndex]}

                    this.setState({
                            subscriptions: !!subscriptions ? update(subscriptions, {$push: [subscription]}) : update(subscriptions, {$set: [subscription]}),
                            plans: update(plans, {[planIndex]: {$set: plans[planIndex]}})
                        },
                        () =>
                            resolve(planCode)
                    )
                } else {
                    resolve(planCode)
                }


            } else {
                console.error('something went wrong while purchase: ', response)
                resolve(false)
            }
        })
    }

    subscribe(planCode, shouldUpdateState) {
        log('subscribing: ', planCode)

        const {profile, subscriptions, plans} = this.state

        const data = {planCode, currency: 'USD', accountCode: profile.recurlyAccount}

        return new Promise(async resolve => {
            const response = await fetchHelper('/api/subscriptions/new', data)

            if (response.status === 201) {

                const planIndex = plans.findIndex(plan => plan.plan_code === response.subscription.plan.plan_code)
                plans[planIndex].subscribed = true

                if (shouldUpdateState) {
                    this.setState({
                            subscriptions: !!subscriptions ? update(subscriptions, {$push: [response.subscription]}) : update(subscriptions, {$set: [response.subscription]}),
                            plans: update(plans, {[planIndex]: {$set: plans[planIndex]}})
                        },
                        () => resolve(response.subscription))
                } else {
                    resolve(response.subscription)
                }

            } else {
                console.error('something went wrong while subscribing: ', response)
                resolve(false)
            }
        })
    }

    render() {

        const {loaded, profile, subscriptions, plans, products} = this.state

        const guest = loaded && !profile

        return <div className="main">
            <h1>Test Recurly</h1>

            { !!profile && <div>
                <h2>Welcome, {profile.firstName} {profile.lastName}</h2>
                <h2>({profile.recurlyAccount})</h2>
            </div>}

            { guest && <div className="signin-form profile">
                <Login/>
                <Registration/>
            </div>
            }

            { !!products.length &&
            <Cart products={products} cancelProduct={::this.cancelProduct} purchaseProducts={::this.purchaseProducts}/>}

            { loaded && !guest && <button className="logout"
                                          onClick={ async() => {
                                              const response  = await fetchHelper(`/logout`)
                                              if(response.status === 401){
                                                  window.location.reload()
                                              }
                                          } }
            >
                Log out
            </button>}

            <div className="test-bar">
                <button onClick={async() => {
                    const seeded = await fetchHelper('/api/plans/seed:10')
                    if(seeded){
                        this.start() ///TODO: normal handling
                    }
                    log('seeded:', seeded)
                }}>Add 10 plans
                </button>

                <button className="delete" onClick={async() => {
                    const removed = await fetchHelper('/api/plans/removeAll')
                    log('removed:', removed)
                    if(removed){
                        this.start() ///TODO: normal handling
                    }
                }}>Remove all plans
                </button>
            </div>

            { loaded && !guest && <Subscriptions subscriptions={subscriptions}/>}
            { loaded && !guest && <Plans plans={plans} subscribe={::this.subscribe} purchase={::this.purchase}
                                         addProduct={::this.addProduct}/>}

            <div className="clear"></div>
        </div>
    }
}


