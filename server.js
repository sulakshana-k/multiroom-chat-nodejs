
var http 	= require('http')
var fs 		= require('fs')
var path 	= require('path')

// To determine mime type based on file extension. 
var mime 	= require('mime')

// Contents of cached files.
// This will contain path of the file and its data.
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

/* * This function will check whether the file requested by the browser 
   	is already in the cache or not.
   * If it is then we will fetch its data from the cache object and send it 
   	across.
   * If not then it will read the file from the harddisk and then store its path
   	and its data in the cache object and then send its data across.
*/
function serveStatic( argResponse, argFilePath )
{
	// cache is supposed to contain: [path, data]

	// If the path exists in cache object, then fetch its corresponding data and 
	// send it across.
	if( cache[ argFilePath ] )
	{
		// cache is an object. When we write cache[argAbsPath], its data is accessed.
		sendFile( argResponse, argFilePath, cache[ argFilePath ] )
	}
	else
	{
		// Read the file from the harddisk
		// fs.exists is deprecated

		// fs.constants.F_OK: Checks the existence of file.
		// fs.constants.R_OK: Checks if the file is readable.
		// fs.constants.W_OK: Checks if the file is writable.

		fs.access( argFilePath, 
				   fs.constants.F_OK | fs.constants.R_OK, 
				   (argError) => 
				   			{
								   console.log(argFilePath)
								if( !argError )
								{
									fs.readFile( argFilePath, function( argError, argData )
															 {
																if( argError )
																{
																	send404( argResponse )
																}
																else
																{
																	cache[argFilePath] = argData
																	sendFile( argResponse, argFilePath, argData )
																}
															 }
												)
								}
								else
								{
									send404( argResponse )
								}
							}
				 )
	}
}

var server = http.createServer( function( argRequest, argResponse )
								{
									// Find the file which the browser is requesting:
									// If the user has typed '/' then by default we will send index.html.
									// If it is something else then we will find that file and then send it.
									var filePath = ""
									if( argRequest.url === '/')
									{
										filePath = './public/index.html'
									}
									else
									{
										filePath = './public/' + argRequest.url
									}

									// This function is going to check whether the file is cached or not.
									// If not, then it will attempt to find the file, cache it, and then
									// send it across.
									// IF yes, then it will find the file in cache and send it from there.
									serveStatic( argResponse, filePath )
								}
							)

server.listen( 3000, function()
					 {
						console.log("Server listening on port 3000!")
					 }
			 )


























