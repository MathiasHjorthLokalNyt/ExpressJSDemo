# PDF Generator web API

### Known issues
Upon generating a PDF from an E-avis, images will often appear either completely missing or appear half loaded in the PDF output.
<br>
<br>
This is due to there being nothing awaiting the loading of the images, before the PDF file is generated. 
Because Javascript is single-threaded, there is no immediate way to write a function that would await the full load of the images and at the same time execute the "behind-the-curtain" code that loads them in.
<br>
<br>

