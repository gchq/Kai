// Enter the generated IDs after cdk deploymeny and User Pool has been created.
// If running in production mode the .env variables are defined and will be used.
// The following config details can be found at:
export const poolData = {
    // Cognito > User Pools > KaiUserPool... > (on homepage) Pool Id: e.g. eu-west-2_aBc123
    UserPoolId: process.env.REACT_APP_COGNITO_USERPOOLID ?? 'eu-west-2_aBc123',
    // Cognito > User Pools > KaiUserPool... > (left nav column) General Settings > App Clients > App client Id
    ClientId: process.env.REACT_APP_COGNITO_CLIENTID ?? 'aBc123',
};
