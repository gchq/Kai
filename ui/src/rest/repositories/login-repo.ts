import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { RestClient } from '../rest-client';

export class ResetTempPasswordRepo {
    public setPassword(username: string, password: string) {
        const authenticationData = {
            Username: username,
            Password: password,
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);

        const poolData = {
            UserPoolId: 'eu-west-2_fHebUkQCI',
            ClientId: '2rfhe1vn13858riolrtnv2vakl',
        };

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
            },

            onFailure: function (err) {
                alert(JSON.stringify(err));
                return err;
            },
        });
    }
}
