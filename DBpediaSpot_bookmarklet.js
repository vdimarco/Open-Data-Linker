javascript: function se(d) {
    return d.selection ? d.selection.createRange().text : d.getSelection()
}
s = se(document);
for (i = 0; i < frames.length && !s; i++) s = se(frames[i].document);
if (!s || s == '') s = prompt('Enter text to annotate with DBpedia Spotlight', '');
open('http://dbpedia-spotlight.github.com/demo/index.html' + (s ? '?execute=yes&client=bookmarklet&text=' + encodeURIComponent(s) : '')).focus();