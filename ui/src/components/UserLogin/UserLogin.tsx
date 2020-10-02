import React from 'react';
import { Button, CssBaseline, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { AlertType, NotificationAlert } from '../Errors/NotificationAlert';
import { Notifications } from '../../domain/notifications';
import Toolbar from '@material-ui/core/Toolbar';
import { LoginRepo } from '../../rest/repositories/get-token-repo';

interface IState {
    username: string;
    password: string;
    outcome: AlertType | undefined;
    outcomeMessage: string;
    errors: Notifications;
}

export default class UserLogin extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            username: '',
            password: '',
            outcome: undefined,
            outcomeMessage: '',
            errors: new Notifications(),
        };
    }
    private disableSignInButton(): boolean {
        const username = this.state.username;
        const password = this.state.password;
        return !username || !password;
    }

    public render() {
        return (
            <main>
                {this.state.outcome && (
                    <NotificationAlert alertType={this.state.outcome} message={this.state.outcomeMessage} />
                )}
                {!this.state.errors.isEmpty() && (
                    <NotificationAlert
                        alertType={AlertType.FAILED}
                        message={`Error(s): ${this.state.errors.errorMessage()}`}
                    />
                )}
                <Toolbar />
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <form
                            style={{
                                width: '100%',
                                marginTop: '30px',
                            }}
                            noValidate
                        >
                            <TextField
                                variant="outlined"
                                value={this.state.username}
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                onChange={(event) => {
                                    this.setState({
                                        username: event.target.value,
                                    });
                                }}
                            />
                            <TextField
                                variant="outlined"
                                value={this.state.password}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={(event) => {
                                    this.setState({
                                        password: event.target.value,
                                    });
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                id="sign-in-button"
                                variant="contained"
                                color="primary"
                                style={{ margin: '10px' }}
                                // disabled={this.disableSignInButton()}
                                onClick={()=> {
                                    const r = new LoginRepo().isAuthorised('ashleyf2','Password456!')
                                }}
                            >
                                Sign In
                            </Button>
                        </form>
                    </div>
                </Container>
            </main>
        );
    }
}
