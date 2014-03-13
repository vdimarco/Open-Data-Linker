Deeply Connected
================

Semantically turn any web page into a wikipedia page. You will see the following annotations: 

* links (%)
* ~~tags (#)~~
* ~~comments (!)~~
* ~~questions (?)~~
* ~~content notes (@)~~

Bookmarklet
-------------

The kind people working on DBpedia Spotlight created a great bookmarklet to showcase the power of Spotlight. 

Select and drag the "Spotlight" javascript function below into your bookmarks bar. Then you can select any text, click on your new Spotlight bookmarklet and it will be dynamically annotated with linked data.

```javascript
javascript:function Spotlight(d){return d.selection?d.selection.createRange().text:d.getSelection()} s=se(document);for(i=0;i<frames.length&&!s;i++)s=se(frames[i].document);if(!s||s=='')s=prompt('Enter text to annotate with DBpedia Spotlight',''); open("http://dbpedia-spotlight.github.com/demo/index.html"+(s?"?execute=yes&client=bookmarklet&text="+encodeURIComponent(s):"")).focus();
```

The Canadian Open Data Experience
-------------------------------

The concepts of the semantic web & linked data have been around for many years. This project is our attempt to apply those ideas to the http://data.gc.ca open data repository. 

* Our main efforts resulted in a browser extension for Chrome, powered by the DBpedia spotlight project, lucene & sample data sets indexed from the Canadian open data portal. 
* __{in progress}__ ~~Processing & indexing of the data.gc.ca data into Notation3 (N3) format was done with a concoction of ETL scripts in the ETL folder.~~ 
* __{in progress}__ ~~An HMTL5 mobile optimized website was used to make the linked data we indexed completely searchable. The data should adhere to the W3C semantic web standards for RDF and be searchable using the more powerful SPARQL language.~~
* __{in progress}__ ~~Lastly, a web app was constructed in Node.js (MEAN stack & socket.io) to vizualize a stream of annotation meta-data & user feedback taking place in real-time across the web.~~


Installation
-----------
The dev version of our extension can be installed by doing the following:
  1. Clone or download this repository `git clone https://github.com/vdimarco/Open-Data-Linker`
  2. Navigate your Chrome browser to `chrome://extensions/`
  3. Make sure the "Developer Mode" checkbox is enabled. 
  4. Click the "Load Unpacked Extensions" button & navigate to the ./extensions folder in this repo.
  5. Feel the power coursing through your veins, with your newly acquired superhuman ability to turn any article into a semantically annotated page filled with linked data connections! 

The UI is intended to be minimal, and we would love feedback on how we can strike a balance between an augmentation tool that stays out of your way until the minute you need it. An icon for the extension should have appeared next to the chrome settings button in the top left corner, next to the right edge of the omnibar. You will also notice that a little black arrow on the leftmost side of any webpage. Click this button to reveal... the annotator!

As part of the 2014 Canadian Open Data Experience {CODE} 
