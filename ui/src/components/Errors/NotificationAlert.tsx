import React from 'react';
import Alert from '@material-ui/lab/Alert';

export interface INotificationAlertProps {
    alertType: AlertType;
    message: string;
}

export enum AlertType {
    SUCCESS = 'success',
    FAILED = 'error',
}

export class NotificationAlert extends React.Component<INotificationAlertProps> {
    constructor(props: INotificationAlertProps) {
        super(props);
    }

    public render() {
        return (
            <Alert id="notification-alert" severity={this.props.alertType}>
                {this.props.message}
            </Alert>
        );
    }
}
