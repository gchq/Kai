import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { RestClient } from '../rest-client';
import { poolData } from './pool-data';

export class LoginRepo {
    public login(username: string, password: string) {
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

        return new Promise(() =>
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    // Use the idToken for Logins Map when Federating User Pools with identity pools or when
                    // passing through an Authorization Header to an API Gateway Authorizer
                    const idToken = result.getIdToken().getJwtToken();
                    RestClient.setJwtToken(idToken);
                },

                onFailure: function (err) {
                    throw new Error(err.message);
                },
            })
        ).catch((e) => {
            throw new Error(e.message);
        });
    }
}
