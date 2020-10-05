import React from 'react';
import { Button, CssBaseline, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
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
        };
    }

    public render() {
        return (
            <main>
                {this.state.outcome && (
                    <NotificationAlert alertType={AlertType.FAILED} message={this.state.outcomeMessage} />
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
                                id="update-button"
                                variant="contained"
                                color="primary"
                                style={{ marginTop: '10px' }}
                                onClick={() => {
                                    const resetPassword = new ResetTempPasswordRepo();
                                    const { username, temppassword, newpassword } = this.state;
                                    const onSuccess = () => {
                                        this.setState({ outcome: AlertType.SUCCESS, outcomeMessage: `Login successful: Hi ${username}`})
                                    }
                                    const onError = (err: any) => {
                                        this.setState({ outcome: AlertType.FAILED ,outcomeMessage: `Login failed: ${err.message}` });
                                    };
                                    resetPassword.setNewPassword(username, temppassword, newpassword, onSuccess, onError);
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
                                onClick={() => {
                                    const userLogin = new LoginRepo();
                                    const { username2, password } = this.state;
                                    const onSuccess = () => {
                                        this.setState({ outcome: AlertType.SUCCESS, outcomeMessage: `Login successful: Hi ${username2}`})
                                    }
                                    const onError = (err: any) => {
                                        this.setState({ outcome: AlertType.FAILED ,outcomeMessage: `Login failed: ${err.message}` });
                                    };
                                    userLogin.login(username2, password, onSuccess, onError);
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
