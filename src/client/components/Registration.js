import React, {Component} from 'react'
import faker from 'faker'

export default class Registration extends Component {
    constructor(props) {
        super()
        this.state = {}
    }


    render() {


        return <div className="agile registration">
            <h3>Register</h3>

            <div className="login-form">
                <form action="/user" method="post">
                    <input type="text" name="firstName" placeholder="First Name" defaultValue={faker.name.firstName()}
                           required=""/>
                    <input type="text" name="lastName" placeholder="Last Name" defaultValue={faker.name.lastName()}
                           required=""/>
                    <input type="text" name="country" placeholder="Country" defaultValue={faker.address.country()}
                           required=""/>
                    <input type="text" name="city" placeholder="City" defaultValue={faker.address.city()} required=""/>
                    <input type="text" name="address1" placeholder="Address"
                           defaultValue={faker.address.streetAddress()} required=""/>
                    <input type="text" name="zip" placeholder="Zip code" defaultValue={faker.address.zipCode()}
                           required=""/>
                    <input type="text" name="cardNumber" placeholder="Credit card number"
                           defaultValue="4111-1111-1111-1111" required=""/>
                    <input type="text" name="email" placeholder="E-mail" defaultValue={faker.internet.email()}
                           required=""/>
                    <input type="text" name="username" placeholder="Username" defaultValue={faker.internet.userName()}
                           required=""/>
                    <input type="password" name="password" placeholder="Password" defaultValue={'test'} required=""/>
                    <input type="password" name="passwordConf" placeholder="Confirm Password" defaultValue={'test'}
                           required=""/>
                    <input type="submit" value="REGISTER"/>
                </form>
            </div>
            <p><a href="#">By clicking register, I agree to completely everything :)</a></p>
        </div>
    }
}


