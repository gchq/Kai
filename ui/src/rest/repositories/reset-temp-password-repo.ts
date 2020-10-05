import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { RestClient } from '../rest-client';
import { poolData } from '../cognito-config';

export class ResetTempPasswordRepo {
    public setNewPassword(username: string, tempPassword: string, newPassword: string, onSuccess: Function, onError: Function) {
        const authenticationData = {
            Username: username,
            Password: tempPassword,
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        const userPool = new CognitoUserPool(poolData);
        const userData = {
            Username: username,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                // Use the idToken for Logins Map when Federating User Pools with identity pools or when
                // passing through an Authorization Header to an API Gateway Authorizer
                const idToken = result.getIdToken().getJwtToken();
                RestClient.setJwtToken(idToken);
                onSuccess();
            },

            onFailure: function (error) {
                onError(error.message);
            },
            
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                // Get these details and call
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            },
        });
    }
}
