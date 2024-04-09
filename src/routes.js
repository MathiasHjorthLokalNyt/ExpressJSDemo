import {app, baseUrl} from "./app.js"
import generatePdf from "./pdfController.js";


//Routes
export function createRoutes(){
    
    try{

        //:GET /
        app.get("/", (request, response) => {
            response.contentType("application/json")
            response.send("Hello World!");
        });

        //:GET generatepdf/{url}
        app.get(String(baseUrl+"/generatepdf"), async (request, response) => 
        {
            const result = await generatePdf(request);
            if(!result.isSucess){

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






        //:POST
        //:PUT
        //:DELETE
        console.log("Routes created succesfully...")
    }
    catch(err){
        console.log(`ERROR: Could not create routes... Message: ${err}`);
    }

};
