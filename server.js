
var http 	= require('http')
var fs 		= require('fs')
var path 	= require('path')

// To determine mime type based on file extension. 
var mime 	= require('mime')

// Contents of cached files.
var cache = {}

// : called when the file requested by browser does not exist. 
function send404( argResponse )
{
	// args: statuscode, type of response.
	argResponse.writeHead( 404, {'Content-Type': 'text/plain'})

	// arg: message
	argResponse.write( 'Error 404: resource not found!' )

	// after this nothing will be sent.
	// arg: optional: string message
	argResponse.end()
}

function sendFile( argResponse, argFilePath, argFileContents )
{
	// Here we have to find the content type of the file to be sent to the browser.

	// path.basename: arg: file path, return: file name with extension (file name is opetional).
	// Example: arg: /home/xyz/t.txt, return: t.txt
 
	// mime.getType: arg: file name including extension: return: mime type
	// Example: arg: t.txt, return: 'text/plain' 
	argResponse.writeHead( 200, {'Content-Type': mime.getType( path.basename( argFilePath )) })

	// Instead of using 'write', we are using 'end' to send the data because we have to write little.
	argResponse.end( argFileContents )
}










