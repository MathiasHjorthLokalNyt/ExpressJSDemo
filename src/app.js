import express from "express"
import { CreateRoutes } from "./routes.js";

//App options
export const app = express();
const port = 8050;

//Create routes
CreateRoutes();


app.listen(port, () => {
  console.log(`Server started listening on port: ${port}`)
})