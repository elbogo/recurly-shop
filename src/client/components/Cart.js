import React, {Component} from 'react'
import css  from './Cart.scss'

export default function Cart ({products, cancelProduct, purchaseProducts}) {

        log('products: ', products)

        const sum = products.map(p=>p.setup_fee_in_cents.USD._).reduce((a,b) => { return parseInt(a) + parseInt(b) }, 0)/100

        return <div className={css.Cart}>
            <div id="cart_details">
                <div className="cart_btn">
                    <span className="icon"><i className="fa fa-shopping-cart"></i></span>
                </div>
                <div className="details">
                    { products.length && products.map( (product,i) => {
                        const price = parseInt(product.setup_fee_in_cents.USD._)/100
                        return  <div className="product_row" key={`cart-item${i}`}>
                            <div className="image">
                                <img src={"https://dummyimage.com/600x400/23dcds/fff&text="+product.name}/>
                            </div>
                            <div className="info">
                                <span className="title">name: {product.name}</span>
                                <span className="price">price: {price}$</span>
                                <div className="remove" onClick={() => cancelProduct(product.plan_code)}><i className="fa fa-times-circle"></i></div>
                            </div>
                        </div>

                    })}

                    <div className="bottom">
                        <span className="sub">Subtotal</span><span className="total">{sum}$</span>
                        <div className="checkout" onClick={ async () => { await purchaseProducts() } }>Checkout</div>
                    </div>
                </div>
            </div>
        </div>
}