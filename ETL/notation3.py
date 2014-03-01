#!/usr/local/bin/python
"""
$Id: notation3.py,v 1.203 2012/09/10 20:16:51 timbl Exp $


This module implements a Nptation3 parser, and the final
part of a notation3 serializer.

See also:

Notation 3
http://www.w3.org/DesignIssues/Notation3

Closed World Machine - and RDF Processor
http://www.w3.org/2000/10/swap/cwm

To DO: See also "@@" in comments

- Clean up interfaces
______________________________________________

Module originally by Dan Connolly, includeing notation3
parser and RDF generator. TimBL added RDF stream model
and N3 generation, replaced stream model with use
of common store/formula API.  Yosi Scharf developped
the module, including tests and test harness.

"""


# Python standard libraries
import types, sys
import string
import codecs # python 2-ism; for writing utf-8 in RDF/xml output
import urllib
import re
from warnings import warn

from sax2rdf import XMLtoDOM # Incestuous.. would be nice to separate N3 and XML

# SWAP http://www.w3.org/2000/10/swap
from diag import verbosity, setVerbosity, progress
from uripath import refTo, join
import uripath
import RDFSink
from RDFSink import CONTEXT, PRED, SUBJ, OBJ, PARTS, ALL4
from RDFSink import  LITERAL, XMLLITERAL, LITERAL_DT, LITERAL_LANG, ANONYMOUS, SYMBOL
from RDFSink import Logic_NS
import diag
from xmlC14n import Canonicalize

from why import BecauseOfData, becauseSubexpression

N3_forSome_URI = RDFSink.forSomeSym
N3_forAll_URI = RDFSink.forAllSym

# Magic resources we know about


from RDFSink import RDF_type_URI, RDF_NS_URI, DAML_sameAs_URI, parsesTo_URI
from RDFSink import RDF_spec, List_NS, uniqueURI
from local_decimal import Decimal

ADDED_HASH = "#"  # Stop where we use this in case we want to remove it!
# This is the hash on namespace URIs

RDF_type = ( SYMBOL , RDF_type_URI )
DAML_sameAs = ( SYMBOL, DAML_sameAs_URI )

from RDFSink import N3_first, N3_rest, N3_nil, N3_li, N3_List, N3_Empty

LOG_implies_URI = "http://www.w3.org/2000/10/swap/log#implies"

INTEGER_DATATYPE = "http://www.w3.org/2001/XMLSchema#integer"
FLOAT_DATATYPE = "http://www.w3.org/2001/XMLSchema#double"
DECIMAL_DATATYPE = "http://www.w3.org/2001/XMLSchema#decimal"
BOOLEAN_DATATYPE = "http://www.w3.org/2001/XMLSchema#boolean"

option_noregen = 0   # If set, do not regenerate genids on output

# @@ I18n - the notname chars need extending for well known unicode non-text
# characters. The XML spec switched to assuming unknown things were name
# characaters.
# _namechars = string.lowercase + string.uppercase + string.digits + '_-'
_notQNameChars = "\t\r\n !\"#$%&'()*.,+/;<=>?@[\\]^`{|}~" # else valid qname :-/
_notNameChars = _notQNameChars + ":"  # Assume anything else valid name :-/
_rdfns = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'


N3CommentCharacter = "#"     # For unix script #! compatabilty

########################################## Parse string to sink
#
# Regular expressions:
eol = re.compile(r'[ \t]*(#[^\n]*)?\r?\n')      # end  of line, poss. w/comment
eof = re.compile(r'[ \t]*(#[^\n]*)?$')          # end  of file, poss. w/comment
ws = re.compile(r'[ \t]*')                      # Whitespace not including NL
signed_integer = re.compile(r'[-+]?[0-9]+')     # integer
number_syntax = re.compile(r'(?P<integer>[-+]?[0-9]+)(?P<decimal>\.[0-9]+)?(?P<exponent>e[-+]?[0-9]+)?')
digitstring = re.compile(r'[0-9]+')             # Unsigned integer      
interesting = re.compile(r'[\\\r\n\"]')
langcode = re.compile(r'[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?')
#"



class SinkParser:
    def __init__(self, store, openFormula=None, thisDoc="", baseURI=None,
                 genPrefix = "", metaURI=None, flags="",
                 why=None):
        """ note: namespace names should *not* end in #;
        the # will get added during qname processing """

        self._bindings = {}
        self._flags = flags
        if thisDoc != "":
            assert ':' in thisDoc, "Document URI not absolute: <%s>" % thisDoc
            self._bindings[""] = thisDoc + "#"  # default

        self._store = store
        if genPrefix: store.setGenPrefix(genPrefix) # pass it on
        
        self._thisDoc = thisDoc
        self.lines = 0              # for error handling
        self.startOfLine = 0        # For calculating character number
        self._genPrefix = genPrefix
        self.keywords = ['a', 'this', 'bind', 'has', 'is', 'of', 'true', 'false' ]
        self.keywordsSet = 0    # Then only can others be considerd qnames
        self._anonymousNodes = {} # Dict of anon nodes already declared ln: Term
        self._variables  = {}
        self._parentVariables = {}
        self._reason = why      # Why the parser was asked to parse this

        self._reason2 = None    # Why these triples
        if diag.tracking: self._reason2 = BecauseOfData(
                        store.newSymbol(thisDoc), because=self._reason) 

        if baseURI: self._baseURI = baseURI
        else:
            if thisDoc:
                self._baseURI = thisDoc
            else:
                self._baseURI = None

        assert not self._baseURI or ':' in self._baseURI

        if not self._genPrefix:
            if self._thisDoc: self._genPrefix = self._thisDoc + "#_g"
            else: self._genPrefix = uniqueURI()

        if openFormula ==None:
            if self._thisDoc:
                self._formula = store.newFormula(thisDoc + "#_formula")
            else:
                self._formula = store.newFormula()
        else:
            self._formula = openFormula
        

        self._context = self._formula
        self._parentContext = None
        
        if metaURI:
            self.makeStatement((SYMBOL, metaURI), # relate doc to parse tree
                            (SYMBOL, PARSES_TO_URI ), #pred
                            (SYMBOL, thisDoc),  #subj
                            self._context)                      # obj
            self.makeStatement(((SYMBOL, metaURI), # quantifiers - use inverse?
                            (SYMBOL, N3_forSome_URI), #pred
                            self._context,  #subj
                            subj))                      # obj

    def here(self, i):
        """String generated from position in file
        
        This is for repeatability when refering people to bnodes in a document.
        This has diagnostic uses less formally, as it should point one to which 
        bnode the arbitrary identifier actually is. It gives the
        line and character number of the '[' charcacter or path character
        which introduced the blank node. The first blank node is boringly _L1C1.
        It used to be used only for tracking, but for tests in general
        it makes the canonical ordering of bnodes repeatable."""

        return "%s_L%iC%i" % (self._genPrefix , self.lines,
                                            i - self.startOfLine + 1) 
        
    def formula(self):
        return self._formula
    
    def loadStream(self, stream):
        return self.loadBuf(stream.read())   # Not ideal

    def loadBuf(self, buf):
        """Parses a buffer and returns its top level formula"""
        self.startDoc()
        self.feed(buf)
        return self.endDoc()    # self._formula


    def feed(self, octets):
        """Feed an octet stream tothe parser
        
        if BadSyntax is raised, the string
        passed in the exception object is the
        remainder after any statements have been parsed.
        So if there is more data to feed to the
        parser, it should be straightforward to recover."""
        str = octets.decode('utf-8')
        i = 0
        while i >= 0:
            j = self.skipSpace(str, i)
            if j<0: return

            i = self.directiveOrStatement(str,j)
            if i<0:
                print "# next char: ", `str[j]` 
                raise BadSyntax(self._thisDoc, self.lines, str, j,
                                    "expected directive or statement")

    def directiveOrStatement(self, str,h):
    
            i = self.skipSpace(str, h)
            if i<0: return i   # EOF

            j = self.directive(str, i)
            if j>=0: return  self.checkDot(str,j)
            
            j = self.statement(str, i)
            if j>=0: return self.checkDot(str,j)
            
            return j


    #@@I18N
    global _notNameChars
    #_namechars = string.lowercase + string.uppercase + string.digits + '_-'
        
    def tok(self, tok, str, i):
        """Check for keyword.  Space must have been stripped on entry and
        we must not be at end of file."""
        
        assert tok[0] not in _notNameChars # not for punctuation
        # was: string.whitespace which is '\t\n\x0b\x0c\r \xa0' -- not ascii
        whitespace = '\t\n\x0b\x0c\r ' 
        if str[i:i+1] == "@":
            i = i+1
        else:
            if tok not in self.keywords:
                return -1   # No, this has neither keywords declaration nor "@"

        if (str[i:i+len(tok)] == tok
            and (str[i+len(tok)] in  _notQNameChars )): 
            i = i + len(tok)
            return i
        else:
            return -1

    def directive(self, str, i):
        j = self.skipSpace(str, i)
        if j<0: return j # eof
        res = []
        
        j = self.tok('bind', str, i)        # implied "#". Obsolete.
        if j>0: raise BadSyntax(self._thisDoc, self.lines, str, i,
                                "keyword bind is obsolete: use @prefix")

        j = self.tok('keywords', str, i)
        if j>0:
            i = self.commaSeparatedList(str, j, res, self.bareWord)
            if i < 0:
                raise BadSyntax(self._thisDoc, self.lines, str, i,
                    "'@keywords' needs comma separated list of words")
            self.setKeywords(res[:])
            if diag.chatty_flag > 80: progress("Keywords ", self.keywords)
            return i


        j = self.tok('forAll', str, i)
        if j > 0:
            i = self.commaSeparatedList(str, j, res, self.uri_ref2)
            if i <0: raise BadSyntax(self._thisDoc, self.lines, str, i,
                        "Bad variable list after @forAll")
            for x in res:
                #self._context.declareUniversal(x)
                if x not in self._variables or x in self._parentVariables:
                    self._variables[x] =  self._context.newUniversal(x)
            return i

        j = self.tok('forSome', str, i)
        if j > 0:
            i = self. commaSeparatedList(str, j, res, self.uri_ref2)
            if i <0: raise BadSyntax(self._thisDoc, self.lines, str, i,
                    "Bad variable list after @forSome")
            for x in res:
                self._context.declareExistential(x)
            return i


        j=self.tok('prefix', str, i)   # no implied "#"
        if j>=0:
            t = []
            i = self.qname(str, j, t)
            if i<0: raise BadSyntax(self._thisDoc, self.lines, str, j,
                                "expected qname after @prefix")
            j = self.uri_ref2(str, i, t)
            if j<0: raise BadSyntax(self._thisDoc, self.lines, str, i,
                                "expected <uriref> after @prefix _qname_")
            ns = self.uriOf(t[1])

            if self._baseURI:
                ns = join(self._baseURI, ns)
            elif ":" not in ns:
                 raise BadSyntax(self._thisDoc, self.lines, str, j,
                    "With no base URI, cannot use relative URI in @prefix <"+ns+">")
            assert ':' in ns # must be absolute
            self._bindings[t[0][0]] = ns
            self.bind(t[0][0], hexify(ns))
            return j

        j=self.tok('base', str, i)      # Added 2007/7/7
        if j >= 0:
            t = []
            i = self.uri_ref2(str, j, t)
            if i<0: raise BadSyntax(self._thisDoc, self.lines, str, j,
                                "expected <uri> after @base ")
            ns = self.uriOf(t[0])

            if self._baseURI:
                ns = join(self._baseURI, ns)
            elif ':' not in ns:
                raise BadSyntax(self._thisDoc, self.lines, str, j,
                    "With no previous base URI, cannot use relative URI in @base  <"+ns+">")
            assert ':' in ns # must be absolute
            self._baseURI = ns
            return i

        return -1  # Not a directive, could be something else.

    def bind(self, qn, uri):
        assert isinstance(uri,
                    types.StringType), "Any unicode must be %x-encoded already"
        if qn == "":
            self._store.setDefaultNamespace(uri)
        else:
            self._store.bind(qn, uri)

    def setKeywords(self, k):
        "Takes a list of strings"
        if k == None:
            self.keywordsSet = 0
        else:
            self.keywords = k
            self.keywordsSet = 1


    def startDoc(self):
        self._store.startDoc()

    def endDoc(self):
        """Signal end of document and stop parsing. returns formula"""
        self._store.endDoc(self._formula)  # don't canonicalize yet
        return self._formula

    def makeStatement(self, quadruple):
        #$$$$$$$$$$$$$$$$$$$$$
#        print "# Parser output: ", `quadruple`
        self._store.makeStatement(quadruple, why=self._reason2)



    def statement(self, str, i):
        r = []

        i = self.object(str, i, r)  #  Allow literal for subject - extends RDF 
        if i<0: return i

        j = self.pr