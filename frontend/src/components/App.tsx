import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { history } from '../services/axiosConfigurer';
import { theme } from '../theme';
import { SnackbarProvider } from 'notistack';
import MainView from './MainView';
import LoginView from './LoginView';
import { CssBaseline, ThemeProvider } from '@mui/material';

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider
                maxSnack={1}
                domRoot={
                    document.getElementById('main-view-content') || undefined
                }
                anchorOrigin={{
                    horizontal: 'center',
                    vertical: 'bottom'
                }}
            >
                <div id="app">
                    <Router history={history}>
                        <Switch>
                            <Route path="/login">
                                <LoginView />
                            </Route>
                            <Route path="/">
                                <MainView />
                            </Route>
                        </Switch>
                    </Router>
                </div>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
