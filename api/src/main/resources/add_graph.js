exports.handler = async function(event, context) {
   try {
       const requestBody = event.body != null ? JSON.parse(event.body) : null;

       if (requestBody == null || requestBody.name == null) {
           return {
               statusCode: 400,
               headers: {},
               body: JSON.stringify("Request body was malformed. Should be object containing field: name")
           }
       }

       return {
           statusCode: 201,
           headers: {},
           body: JSON.stringify("Added graph: " + requestBody.name)
       }
   } catch (error) {
       var body = error.stack || JSON.stringify(error, null, 2);

       return {
       statusCode: 400,
           headers: {},
           body: JSON.stringify(body)
       }
   }
}