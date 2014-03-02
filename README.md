Deeply Connected
================

The concept of the semantic web & linked data has been around for many years. This project is our attempt to apply those ideas on the data.gc.ca open data repository.

* Our main efforts are a browser extension for Chrome (./extension), which can be loaded as an unpacked extension if devmode is enabled (chrome:extensions).
* Processing & indexing of the data.gc.ca data into Notation3 (N3) format was done with a concotion of ETL scripts (./ETL)
* An HMTL5 mobile website was used to make the linked data we indexed completely searchable. The data should adhear to the W3C semantic web standards for RDF and be searchable using the more powerful SPARQL language. 
* Lastly, a primary website was constructed for future enhancements to display a real-time stream annotations.


Installation
-----------
The dev version of our extension can be install by:
1. Clone or download this repository to your computer. 
2. Navigate to chrome://extensions/
3. Make sure the "Developer Mode" checkbox is enabled. 
4. Click the "Load Unpacked Extensions" button & navigate to the ./extensions folder
5. Now you can turn & article into a linked "hyperdata" like wikipedia page!

A new icon should appear next to the chrome settings button in the top left corner. You will also notice that a little black arrow will appear on the leftmost side of the page. Click this button to reveal the annotator!

As part of the 2014 Canadian Open Data Experience {CODE} 
