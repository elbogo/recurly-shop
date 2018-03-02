import React, {Component} from 'react'

export default class Login extends Component {
    constructor(props) {
        super()
        this.state = {}
    }


    render() {
        return <div className="w3">
            <div className="signin-form profile">
                <h3>Login</h3>

                <div className="login-form">
                    <form action="/login" method="post">
                        <input type="text" name="username" placeholder="E-mail" required=""/>
                        <input type="password" name="password" placeholder="Password" required=""/>
                        <div className="tp">
                            <input type="submit" value="LOGIN NOW"/>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    }
}