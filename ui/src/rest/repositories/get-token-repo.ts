import { RestClient } from '../rest-client';
import AWS from 'aws-sdk';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { KaiUserPool } from '../../../../infrastructure/lib/authentication/user-pool';

export class LoginRepo {
    public isAuthorised(username: string, password: string) {
        const authenticationData = {
            Username: username,
            Password: password,
        };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const poolData = {
            UserPoolId: KaiUserPool.prototype.userPoolId,
            ClientId: KaiUserPool.prototype.userPoolClientId,
        };
        const userPool = new CognitoUserPool(poolData);
        const userData = {
            Username: username,
            Pool: userPool,
        };
        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getAccessToken().getJwtToken();

                /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
                const idToken = result.getIdToken().getJwtToken();
                return true;
            },

            onFailure: function (err) {
                alert(err);
                return false;
            },
        });
    }
}