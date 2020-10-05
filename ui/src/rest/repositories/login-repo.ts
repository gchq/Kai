import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { RestClient } from '../rest-client';
import { poolData } from '../../../cognito-config';

export class LoginRepo {
    public login(username: string, password: string, onSuccess: Function, onError: Function) {
        const authenticationData = {
            Username: username,
            Password: password,
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
                onError(error);
            },
        });
    }
}
