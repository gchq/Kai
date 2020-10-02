import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { RestClient } from '../rest-client';

export class LoginRepo {
    public isAuthorised(username: string, password: string) {

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
        // cognitoUser.changePassword('Password123!', 'Password456!', (result) => {alert(result)})
        // cognitoUser.sendMFACode()
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                // const accessToken = result.getAccessToken().getJwtToken();
                const idToken = result.getIdToken().getJwtToken();
                RestClient.setJwtToken(idToken);

                /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
                // const idToken = result.getIdToken().getJwtToken();
                alert(JSON.stringify(idToken))
                return result;
            },

            onFailure: function (err) {
                alert(JSON.stringify(err));
                return err;
            },
     
            // newPasswordRequired: function(userAttributes, requiredAttributes) {
            //     // User was signed up by an admin and must provide new
            //     // password and required attributes, if any, to complete
            //     // authentication.
     
            //     // the api doesn't accept this field back
            //     delete userAttributes.email_verified;
     
            //     // Get these details and call
            //     cognitoUser.completeNewPasswordChallenge('Password456!', userAttributes, this);
            // }
        });
    }
}