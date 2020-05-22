exports.handler = async function(event, context) {
   try {
       body = [
           "graph1",
           "graph2"
       ]

       return {
           statusCode: 200,
           headers: {},
           body: JSON.stringify(body)
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