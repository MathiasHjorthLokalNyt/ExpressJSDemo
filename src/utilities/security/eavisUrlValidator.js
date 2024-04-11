import fetch from "node-fetch"

const lokalNytDomainsEndpoint = "https://dashboard.lokal-nyt.dk/wp-json/mainwp/v1/sites/all-sites?consumer_key=ck_82c74a08f960bd85ac8eb34da34fe293dd56a066&consumer_secret=cs_d1e7e700c72708d62fc2491585a37a1fb3c7897c"
const eavisHtmlPath = "/e-avis"; //The path to the html version of the Eavis

export async function validateUrl(eavisUrl){
    
    //For security reasons, make sure the URL provided is not malicious.
    //Compare incoming URL to the list of domains that LokalNyt has by calling the URL below:
    // Call https://dashboard.lokal-nyt.dk/wp-json/mainwp/v1/sites/all-sites?consumer_key=ck_82c74a08f960bd85ac8eb34da34fe293dd56a066&consumer_secret=cs_d1e7e700c72708d62fc2491585a37a1fb3c7897c
    // Incoming URLs must match one of lokalnyts domains
    
    console.log("Started validation process for url: "+eavisUrl);
    let response = await getLokalNytDomains();

    let urlArr = await parseResponse(response);

    urlArr.push(["https://alpha.lokal-nyt.dk","https://beta.lokal-nyt.dk"]); //Adding the alpha and beta

    //Checking if incoming eavisUrl matches any of the LokalNytDomains
    let isValid = urlArr.map((value) => {
        if(eavisUrl === value+eavisHtmlPath || eavisUrl === value+eavisHtmlPath+"/"){
            return true; //Is valid
        } 
        else{
            return false; //Not valid
        }
    })

    return isValid;

   }

   async function getLokalNytDomains(){
    console.log("Fetching LokalNyt domains for validation at: "+lokalNytDomainsEndpoint);
    try{
        const response = await fetch(lokalNytDomainsEndpoint);
        const body = await response.text();
        console.log(body);
        if(body === undefined || body === null) throw new Error("Body of response was empty or null");
        else return body;
    }
    catch(err){
        throw new Error("Could not use data from "+lokalNytDomainsEndpoint+"Additional error information: "+err)
    }
   }

   async function parseResponse(response){
    console.log("Parsing domain response");
    try{
        const parseResult = JSON.parse(response, (key, value) => {
            if(key === "url") return value;
        });
        console.log(parseResult);
    }
    catch(err){
        throw new Error(err);
    }
   }