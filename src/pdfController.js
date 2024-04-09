import puppeteer from 'puppeteer';
import pdfMerger from 'pdf-merger-js';
import {OperationResult} from './utility/classes.js';

// WARNING!!
// Ungraceful shutdown of execution of this script can make it non-functional.
  //To fix it, try to execute the script again. If that does not work, reboot the host machine.

const eavisNextPageButtonSelector = "#screenNext";
const eavisPageIdSelector = "#page-Side";
const eavisPageClassSelector = ".eavis-Page";
const pdfFileBinaries = new Array();

export default async function generatePdf(request,response){

    const {eavisUrl} = request.body; //The eavisUrl of the eavis to generate a pdf from
    console.log(request.body)
    try{
        const webPage = await launchBrowser(eavisUrl);
        await startGeneration(webPage);
    }
    catch(err)
    {
        return new OperationResult(false,500,err.message,null);
    }

    console.log("done");
}






async function launchBrowser(eavisUrl){

  const browser = await puppeteer.launch({headless: true});
  const webPage = await browser.newPage();

  await webPage.setViewport({width: 793, height: 1123, deviceScaleFactor: 1});

  console.log("Navigating")
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

    for(let pageNumber = 1; pageNumber < 5; pageNumber++)
    {
    //   let pageFileName = String(pageIdSelector+pageNumber+"alpha.pdf");
      let currentPageSelector = String(eavisPageIdSelector+pageNumber); //Ie. #page-Side3

      await MoveToNextPage(webPage); 
      await EnsurePageScale(webPage,currentPageSelector);
      //consider using the buffer object when generating pdf instead of saving the pdf to disk
      let pageFileBinary = await GeneratePdf(webPage,currentPageSelector);
  
      //add to array
      //pdfFiles[pageNumber-1] = (pdfFilePath+pageFileName); 
      pdfFileBinaries[pageNumber-1] = pageFileBinary;
  
    }
  
    console.log(pdfFileBinaries);
  
    await MergePdfFiles(pdfFileBinaries);

}



async function GeneratePdf(webPage,pdfName){
    console.log("Generating PDF binary of page: "+pdfName);
   return await webPage.pdf(
    {
    //   path: "./LokalNytHorsensUge34/"+pdfName, 
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
    console.log("Ensuring page scale");
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
    }
  }


async function GetEavisLength(webPage){
    const result = await webPage.$$(eavisPageClassSelector)
    return result.length;
 }
 
 async function MergePdfFiles(pdfFileBinaries){
     console.log("Merging pdf files")
     const merger = new PDFMerger();
     await merger.add(pdfFileBinaries[0]);
     await merger.add(pdfFileBinaries[1]);
     await merger.save("mergedBinary.pdf");
 }