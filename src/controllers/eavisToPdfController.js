import puppeteer from 'puppeteer';
import pdfMerger from 'pdf-merger-js';
import {OperationResult} from '../classes/operationResult.js';

// WARNING!!
// Ungraceful shutdowns during execution can make the script non-functional on subsequent requests.
  //To fix it, try to execute the script again. If that does not work, reboot the host machine.

const eavisNextPageButtonSelector = "#screenNext";
const eavisPageIdSelector = "#page-Side";
const eavisPageClassSelector = ".eavis-Page";
// const linuxChromeExecuteablePath = "../root/.cache/puppeteer/chrome/linux-123.0.6312.105/chrome-linux64/chrome_sandbox" //Specific path to the chrome executeable used by Puppeteer, on the host machine.
const pdfFileBinaries = new Array();

export default async function generatePdf(request){

    const {eavisUrl} = request.body; //The eavisUrl of the eavis to generate a pdf from
    console.log("Request for PDF generation of url: "+eavisUrl+", has been recieved")
    if(eavisUrl === undefined || eavisUrl === null){
      return new OperationResult(false,400,"Could not find attribute 'eavisUrl' in request body",null);
    }
    try{
        const webPage = await launchBrowser(eavisUrl);
        const pdfBinaryResult = await startGeneration(webPage);

        console.log("Done.PDF generation was sucessfull. Returning PDF file to client");
        return new OperationResult(true,200,null,pdfBinaryResult);
    }
    catch(err)
    {
        return new OperationResult(false,500,err.message,null);
    }

}


async function launchBrowser(eavisUrl){

  console.log("Launching browser");
  const browser = await puppeteer.launch({headless: true});
  const webPage = await browser.newPage();

  await webPage.setViewport({width: 793, height: 1123, deviceScaleFactor: 1});

  console.log("Navigating browser to url: "+eavisUrl);
  try{
    const [response] = await Promise.all([
      webPage.waitForNavigation({waitUntil: "domcontentloaded"}),
      webPage.goto(eavisUrl)
    ]);
    console.log("Setting media type");
    await webPage.emulateMediaType('print');
    return webPage;
  }
  catch(err){
      //terminate the browser instance
      browser.close();
      throw new Error("Puppeteer error: "+err);
  }

}

async function startGeneration(webPage){

    const eavisLength = await GetEavisLength(webPage);

    //For each page on the eavis, generate a pdf, move to the next page, repeat untill at the end of the eavis.
    for(let pageNumber = 1; pageNumber < 5; pageNumber++)
    {

      let currentPageSelector = String(eavisPageIdSelector+pageNumber); //Ie. #page-Side3
      await MoveToNextPage(webPage); 
      await EnsurePageScale(webPage,currentPageSelector);

      let pageFileBinary = await GeneratePdf(webPage,currentPageSelector);
  
      //add pdf binary to array
      pdfFileBinaries[pageNumber-1] = pageFileBinary;

    }
    console.log("Finished generating PDF file binaries of all pages")
  
    //return the merged pdf binary files
    return await MergePdfFiles(pdfFileBinaries);

}



async function GeneratePdf(webPage,pdfName){
    console.log("Generating PDF binary of page: "+pdfName);
   return await webPage.pdf(
    {
    //   path: "./LokalNytHorsensUge34/"+pdfName, //saves file to disk if this option is specified explicitly
      printBackground: true, 
      displayHeaderFooter: false,
      format: "A4"
    });
}

async function MoveToNextPage(webPage){
    console.log("Moving on to next page");
    await webPage.evaluate((eavisNextPageButtonSelector) => {
        const nextPageButton = document.querySelector(eavisNextPageButtonSelector);
        nextPageButton.click();
      },eavisNextPageButtonSelector)
}

async function EnsurePageScale(webPage,currentPageSelector){

    //Ensuring that the CSS transform property on the pages have applied to scale to 1x before generating a PDF
    console.log("Ensuring eavis-page scale");
    try{
      await webPage.evaluate((currentPageSelector) => {
        let pageElement = document.querySelector(currentPageSelector);
        if(pageElement !== undefined && pageElement !== null)
        {
          let inlineStyleOfElement = pageElement.getAttribute("style");
          let newStyle = inlineStyleOfElement.slice(0,-1); //Removing the last single ' mark of the style attribute value
          newStyle += "transition: none; transform: scale(1.0);'" //Overriding style attributes to ensure correct scaling for PDF generation
          pageElement.setAttribute("style", newStyle);
        }
    },currentPageSelector);
    }catch(err)
    {
      console.log("Something went wrong trying to change the style attribute of element: "+currentPageSelector+" Possible cause: Missing style attribute on the element");
      throw new Error("Puppeteer error: "+err+". Something went wrong trying to change the style attribute of element: "+currentPageSelector+" Possible cause: Missing style attribute on the element")
    }
  }


async function GetEavisLength(webPage){
    const result = await webPage.$$(eavisPageClassSelector)
    if(result.length === undefined){
      throw new Error("Could not determine length of eavis")
    }
    return result.length;
 }
 
 async function MergePdfFiles(pdfFileBinaries){
     console.log("Merging PDF binary files")
     const merger = new pdfMerger();
     await merger.add(pdfFileBinaries[0]);
     await merger.add(pdfFileBinaries[1]);
     return await merger.saveAsBuffer();
 }