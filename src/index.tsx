import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { store } from './store/store';
import { Provider } from 'react-redux';
import { Auth0Provider } from "@auth0/auth0-react";
import * as serviceWorker from './serviceWorker';
import { Toaster } from 'react-hot-toast';

ReactDOM.render(
    <React.StrictMode>
        <Auth0Provider
            domain={process.env.REACT_APP_AUTH0_DOMAIN as string}
            clientId={process.env.REACT_APP_AUTH0_ID as string}
            redirectUri={window.location.origin}
            audience={process.env.REACT_APP_AUTH0_AUDIENCE as string}
        >
            <Provider store={store}>
                <div><Toaster position='top-center' /></div>
                <App />
            </Provider>
        </Auth0Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
