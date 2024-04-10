import express from "express"
import { createRoutes } from "./routes.js";

//App options
export const app = express();
export const baseUrl = "/api/v1"
const port = 8050;


//Middelware
//Only accept incoming requests with content-type set to application/json
app.use(express.json()) 


//Create routes
createRoutes();


const server = app.listen(port, () => {
  console.log(`Server started listening on port: ${port}`)
})


