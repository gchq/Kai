import { RestClient } from '../rest-client';

export class LoginRepo {
    public isAuthorised(username: string, password: string): boolean {

        // Handle the Cognito calls in here and let the React presentation layer know if a user has successfully logged
        // by returning a boolean true/false

        // You can call the COGNITO service directly in here, then we can refactor it 

        // build the request to login
        const requestBody = {
            username: username,
            password: password,
        }

        // Send the request
        const response = RestClient.post(URL.COGNITO, requestBody);


        if (response.isOK) { // Get token successfully and response says User is valid
            return true;
        } else {
            return false;
        }
    }
}
