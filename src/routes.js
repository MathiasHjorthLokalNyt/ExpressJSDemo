import {app, baseUrl} from "./app.js"
import generatePdf from "./controllers/eavisToPdfController.js";
import { RouteDescriptor } from "./classes/routeDescriptor.js";


//Routes
export function createRoutes(){
    
    //Document the endpoints of the API, to serve as documentation.
    const apiEndpoints = [
        new RouteDescriptor("/","GET","Returns the available endpoints of the API"),
        new RouteDescriptor(baseUrl+"/","GET","Returns the available endpoints of the API"),
        new RouteDescriptor(baseUrl+"/generatepdf","POST","Returns a PDF file generated from the provided eavisUrl","Request body must be json and have an attribute of 'eavisUrl' with the value of a fully qualified eavis url")
    ]

    try{

        //:GET
            //:GET /
            app.get(String("/"), (request, response) => {
                response.type("json");
                response.send(JSON.stringify(apiEndpoints));
            });

            //:GET /api/v1
            app.get(String(baseUrl+"/"), (request, response) => {
                response.type("json");
                response.send(JSON.stringify(apiEndpoints));
            });


        //:POST
          //:POST /api/v1/generatepdf
          app.post(String(baseUrl+"/generatepdf"), async (request, response) => 
          {
              const result = await generatePdf(request);
              if(!result.isSucess){
                  console.log(result.message);
                  response.type("json");
                  response.statusCode = result.statusCode;
                  response.send(JSON.stringify(result));
              }
              else{
                  response.type("application/octet-stream");
                  response.statusCode = result.statusCode;
                  response.send(result.data);
              }
          }
          );

          
        //:PUT
        //:DELETE
        console.log("Routes created succesfully")
    }
    catch(err){
        console.log(`ERROR: Could not create routes... Message: ${err}`);
    };

};
