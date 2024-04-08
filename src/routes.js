import express from "express"
import {app} from "./app.js"


//Routes
export function CreateRoutes(){
    
    try{
        //:GET
        app.get("/", (req, res) => {
            res.send("Hello World!");
        });

        app.get("/generatepdf/:url", (req, res) => {
            res.send("Hello World!");
        });


        //:POST
        //:PUT
        //:DELETE
        console.log("Routes created succesfully...")
    }
    catch(err){
        console.log(`ERROR: Could not create routes... Message: ${err}`)
    }
    finally{
        app
    }

};
