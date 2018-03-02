import 'regenerator-runtime/runtime'
import 'core-js/web'
import 'core-js/es6/promise'
import 'core-js/es6/symbol'
import 'core-js/es6/string'
import 'isomorphic-fetch'
import 'core-js/fn/array/map'

import React from 'react'
import ReactDOM from 'react-dom'
import HomePage from './components/HomePage'


document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('#main')
    ReactDOM.render(<HomePage />, root)
})