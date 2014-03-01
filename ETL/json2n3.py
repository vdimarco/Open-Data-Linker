#!/usr/bin/python
""" Converts JSON to N3
	
	N3 uses the concept of subject, verb and object.
	In JSON all items are attribute value(s) pairs.
	This script will take one attribute from the JSON object as the subject and use the remaining atttibute value pairs as verb object pairs

	-i <JSON file> 			The location of the (i)nput JSON file
	-o <N3 file>   			The location of the (o)output N3 file
	-s <subject attribute>	The attribute from the JSON object to act as the subject for N3
	-f 						Skips a JSON Object if the subject attribute does not exist

"""
import json
"""
	Functions
"""
def printVal (values):
	if isinstance(values, dict):
		for attr in values.keys():
			print "<#{}> ".format(attr)
			printVal (values[attr])		
	elif isinstance(values, list):
		first = True		
		for value in values:
			if first:
				first = False
			else:
				print ","
			printVal (value)
	else:
		print values

"""
	Main
"""
subjectAttribute = "id"
inFile = open ("/home/vdimarco/row1-od-do-canada.jl", "r")

for line in inFile:
	jsonRow = json.loads (line)
	if subjectAttribute in jsonRow:
		print "<#{}> ".format(jsonRow[subjectAttribute])
		del jsonRow[subjectAttribute]
		first = True
		for attr in jsonRow.keys():
			if first:
				first = False
			else:
				print ";"
			
			print "<#{}> ".format(attr)
			printVal (jsonRow[attr])
	
		print "."
	else:
		print "Error the following row does not contain the attribute", subjectAttribute
		print json.dumps(jsonRow, sort_keys=True, indent=4, separators=(',', ': '))

inFile.close()
print "Done"