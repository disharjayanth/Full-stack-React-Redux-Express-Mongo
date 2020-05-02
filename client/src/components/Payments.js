import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { connect } from 'react-redux'
import * as actions from '../actions'

class Payments extends Component {
    render() {
        return (
            <StripeCheckout
            name="Emaily"
            description="Rs5 for 5 Email Creddits." 
            amount={500} //number inside this is denoted by cents so 100 cents = 1$. So, 500 = 5$ //IN INDIA INR
            token={token => this.props.handleToken(token)} //its an object which represents entire charge, Executes only after customer submits form details correctly
            stripeKey={process.env.REACT_APP_STRIPE_KEY}
            >
                <button className="btn">Add Credits</button>
            </StripeCheckout>
        )
    }
}

export default connect(null, actions)(Payments)
