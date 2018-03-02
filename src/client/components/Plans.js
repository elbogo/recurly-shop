import React from 'react'
import css from './Plans.scss'

export default function Plans({plans, subscribe, purchase, addProduct}) {

    return <div className={css.Plans}>
        <h2>Plans available</h2>

        { !plans.length && <div className="no-plans">No plans yet.</div>}
        { !!plans.length && <ul className="plans__list">
            {plans.map((plan, i) => <li key={`plan-${i}`} className="plans__list__item item">
                    <span className="item__name">{JSON.stringify(plan.name)}</span>
                    <button
                        className="item__susbcribe"
                        onClick={ !plan.subscribed && !plan.added ? () => addProduct(plan.plan_code) : () => {
                            } }
                        disabled={plan.subscribed || plan.added}
                    >
                        Add to cart
                    </button>
                </li>
            )}
        </ul>}

    </div>
}
