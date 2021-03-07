function divEscapedContentElement( message ) 
{
    // Put the arg message in this div.
    return $('<div></div>').text( message );
}

function divSystemContentElement( message ) 
{
    // Put the arg message in html form in this div.
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput( chatApp, socket )
{
    // Fetch the input value of the div with id 'send-message'. 
    var message = $('#send-message').val();
    var systemMessage;

    // If the string 'message' is not empty.
    if( message )
    {
        console.log('In processUserInput', message)

        // If the string 'message' starts with a '/' that means it is a 
        // command that has to be processed.
        if (message.charAt(0) == '/')
        {
            console.log('processUserInput if--- chat_ui.js')
            // 'chatApp' is the object of the 'chat.js' file.
            // 'chat.js' has the function 'processCommand' which splits the string and
            // and finds the command and its corresponding value given by the user.
            systemMessage = chatApp.processCommand( message );
            if( systemMessage )
            {
                console.log('inside systemMessage --- chat_ui.js')

                // This will append the message in the div id 'messages' with a system font.
                $( '#messages' ).append( divSystemContentElement( systemMessage ));
            }
        }
        // If it doesn't start with a '/' that means it is not a command, it is a 
        // simple message which user posted to interact with others.  
        else 
        {
            console.log('processUserInput else--- chat_ui.js')

            // so, function 'sendMessage' has to be called with 'room' div' text which
            // will tell the room name, and the message input by user.
            // 'sendMessage' of 'chat.js' function will emit an appropriate signal.
            chatApp.sendMessage( $('#room').text(), message );

            // This will append the message in the div id 'messages' with html format.
            $( '#messages' ).append( divEscapedContentElement( message ));

            // This is for scrolling the messages so that the latest message remains 
            // visible in the div.
            $( '#messages' ).scrollTop( $( '#messages' ).prop( 'scrollHeight' ));            
        }
    }
    else
    {
        console.log('processUserInput: received null')
    }
    
    // Clear the user input box after the message is sent.
    $('#send-message').val('');
}

// Client's socket API.
var socket = io.connect();

// When DOM has loaded fully.
// $ represents jquery.
$(document).ready( function() 
                    {
                        console.log('ready --- chat_ui.js')
                        var chatApp = new Chat( socket );

                        // This is a slot which will listen for 'nameResult' event. 
                        // 'nameResult' event will be emitted by 'chat_server.js'. 
                        socket.on('nameResult', function( result ) 
                                                {
                                                    var message;
                                                    if (result.success) 
                                                    {
                                                        message = 'You are now known as ' + result.name + '.';
                                                    } 
                                                    else 
                                                    {
                                                        message = result.message;
                                                    }
                                                    // We will append the result in the HTML element.
                                                    $('#messages').append( divSystemContentElement( message ) );
                                                }
                                );
                    
                        socket.on('joinResult', function( result )
                                                {
                                                    // This resultant text will be appended in div id 'room'.
                                                    $('#room').text( result.room );
                                                    // Corresponding message will be appended in div id 'messages'.
                                                    $('#messages').append(divSystemContentElement('Room changed.'));
                                                }
                                );
                        
                        socket.on('message', function( message )
                                             {
                                                var newElement = $('<div></div>').text( message.text );
                                                $('#messages').append( newElement );
                                             }
                                );
                        socket.on('rooms', function( rooms )
                                            {
                                                // '.empty()' method clears out the content of the div id 'room-list'.
                                                // It keeps on getting filled up with same information repeatedly.
                                                // Perhaps a signal is continiously emiting. This signal below this code.
                                                $('#room-list').empty();
                                                for( var room in rooms )
                                                {
                                                    room = room.substring( 1, room.length );
                                                    if ( room != '' )
                                                    {
                                                        $('#room-list').append( divEscapedContentElement( room ) );
                                                    }
                                                }
                                                $('#room-list div').click( function()
                                                                            {
                                                                                chatApp.processCommand('/join ' + $(this).text());
                                                                                $('#send-message').focus();
                                                                            }
                                                                        );
                                            }
                                );

                        // Why is this emitting 'rooms' repeatedly?
                        setInterval(function() 
                                    {
                                        socket.emit('rooms');
                                    }, 1000);

                        // Set focus to div id 'send-message'.
                        $('#send-message').focus();

                        // This will call the button submit which will bring the form information.
                        $('#send-form').submit(function() 
                                                {
                                                    console.log('send-form submit --- chat_ui.js')
                                                    console.log( 'send-message value: from ready function: ', $('#send-message').val());

                                                    processUserInput( chatApp, socket );
                                                    return false;
                                                }
                                              );
                    }                    
                )
