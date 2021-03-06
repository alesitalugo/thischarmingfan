/**
 * Create the store with asynchronously loaded reducers
 */

import { createStore, applyMiddleware, compose } from 'redux'
import { fromJS } from 'immutable'
import { routerMiddleware } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import sagas from './sagas'
import createReducer from './reducers'
const sagaMiddleware = createSagaMiddleware()

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const createStoreWithMiddleware = compose(
    applyMiddleware(routerMiddleware(history), sagaMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore)
  const store = createStoreWithMiddleware(createReducer(), fromJS(initialState))

  // Add all sagas to the saga middleware
  for (let i = 0; i < sagas.length; i++) {
    sagaMiddleware.run(sagas[i])
  }

  // Make reducers hot reloadable
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer)
    })
  }

  // Initialize it with no other reducers
  store.asyncReducers = {}
  return store
}

/**
 * Inject an asynchronously loaded reducer
 */
export function injectAsyncReducer(store, name, asyncReducer) {
  store.asyncReducers[name] = asyncReducer // eslint-disable-line
  store.replaceReducer(createReducer(store.asyncReducers))
}
