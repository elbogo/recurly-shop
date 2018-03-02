import React from 'react'
import css from './Subscriptions.scss'

export default function Subscriptions({subscriptions}) {

    return <div className={css.Subscriptions}>
        <h2>Subscriptions</h2>

        { !subscriptions.length && <div className="no-subscriptions">No subscriptions yet.</div>}
        { !!subscriptions.length && <ul className="subscriptions__list">
            {
                subscriptions.map((subscription, i) => <li key={`subscription-${i}`}
                                                           className="subscriptions__list__item">
                        you are subscribed to - {JSON.stringify(subscription.plan.name)}
                    </li>
                )}
        </ul>}

    </div>
}
