exports.handler = async function(event, context) {
   try {
       const pathParams = event.pathParameters

       if (pathParams.graphUrl == null || pathParams.graphUrl == "") {
           return {
               statusCode: 400,
               headers: {},
               body: JSON.stringify("Unable to process request as the graph url was null")
           }
       }

       return {
           statusCode: 200,
           headers: {},
           body: JSON.stringify("Deleted graph with URL: \"" + pathParams.graphUrl + "\"")
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