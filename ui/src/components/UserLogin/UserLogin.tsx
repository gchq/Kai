import React from 'react';
import { Button, CssBaseline, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { AlertType, NotificationAlert } from '../Errors/NotificationAlert';
import { Notifications } from '../../domain/notifications';
import Toolbar from '@material-ui/core/Toolbar';
import { LoginRepo } from '../../rest/repositories/login-repo';
import { ResetTempPasswordRepo } from '../../rest/repositories/reset-temp-password-repo';


interface IState {
    username: string;
    username2: string;
    password: string;
    temppassword: string;
    newpassword: string;
    outcome: AlertType | undefined;
    outcomeMessage: string;
    errors: Notifications;
}

export default class UserLogin extends React.Component<{}, IState> {
    constructor(props: object) {
        super(props);
        this.state = {
            username: '',
            username2: '',
            password: '',
            temppassword: '',
            newpassword: '',
            outcome: undefined,
            outcomeMessage: '',
            errors: new Notifications(),
        };
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
                            Update User Password
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
                                value={this.state.temppassword}
                                margin="normal"
                                required
                                fullWidth
                                name="temppassword"
                                label="Temp Password"
                                type="password"
                                id="temppassword"
                                autoComplete="current-password"
                                onChange={(event) => {
                                    this.setState({
                                        temppassword: event.target.value,
                                    });
                                }}
                            />
                            <TextField
                                variant="outlined"
                                value={this.state.newpassword}
                                margin="normal"
                                required
                                fullWidth
                                name="newpassword"
                                label="New Password"
                                type="password"
                                id="newpassword"
                                autoComplete="current-password"
                                onChange={(event) => {
                                    this.setState({
                                        newpassword: event.target.value,
                                    });
                                }}
                            />
                            <Button
                                fullWidth
                                id="sign-in-button"
                                variant="contained"
                                color="primary"
                                style={{ marginTop: '10px' }}
                                // disabled={this.disableSignInButton()}
                                onClick={() => {
                                    const resetPassword = new ResetTempPasswordRepo();
                                    const { username, temppassword, newpassword } = this.state;
                                    resetPassword.setNewPassword(username, temppassword, newpassword);
                                }}
                            >
                                Update Password
                            </Button>
                        </form>
                    </div>
                </Container>
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
                                value={this.state.username2}
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
                                        username2: event.target.value,
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
                                fullWidth
                                id="sign-in-button"
                                variant="contained"
                                color="primary"
                                style={{ marginTop: '10px' }}
                                onClick={async () => {
                                    const userLogin = new LoginRepo();
                                    const { username2, password } = this.state;
                                    try {
                                        const blah = userLogin.login(username2, password);
                                    } catch (e) {
                                        console.log(JSON.stringify(e))
                                    }
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
