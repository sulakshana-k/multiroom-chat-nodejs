function divEscapedContentElement(message) 
{
    return $('<div></div>').text(message);
}

function divSystemContentElement(message) 
{
    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) 
{
    var message = $('#send-message').val();
    var systemMessage;

    if( message )
    {
        console.log('In processUserInput', message)
        if (message.charAt(0) == '/') 
        {
            console.log('processUserInput if--- chat_ui.js')
            systemMessage = chatApp.processCommand(message);
            if (systemMessage) 
            {
                console.log('inside systemMessage --- chat_ui.js')
                $('#messages').append(divSystemContentElement(systemMessage));
            }
        } 
        else 
        {
            console.log('processUserInput else--- chat_ui.js')
            chatApp.sendMessage($('#room').text(), message);
            $('#messages').append(divEscapedContentElement(message));
            $('#messages').scrollTop($('#messages').prop('scrollHeight'));            
        }
    }
    else
    {
        console.log('processUserInput: received null')
    }
    
    $('#send-message').val('');
}

var socket = io.connect();

$(document).ready( function() 
                    {
                        console.log('ready --- chat_ui.js')
                        var chatApp = new Chat( socket );
                        socket.on('nameResult', function(result) 
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
                                                    $('#messages').append(divSystemContentElement(message));
                                                }
                                );
                    
                        socket.on('joinResult', function(result) 
                                                {
                                                    $('#room').text(result.room);
                                                    $('#messages').append(divSystemContentElement('Room changed.'));
                                                }
                                );
                        
                        socket.on('message', function (message) 
                                            {
                                                var newElement = $('<div></div>').text(message.text);
                                                $('#messages').append(newElement);
                                            }
                                );
                        socket.on('rooms', function(rooms) 
                                            {
                                                $('#room-list').empty();
                                                for(var room in rooms) 
                                                {
                                                    room = room.substring(1, room.length);
                                                    if (room != '') 
                                                    {
                                                        $('#room-list').append(divEscapedContentElement(room));
                                                    }
                                                }
                                                $('#room-list div').click(function() 
                                                                            {
                                                                                chatApp.processCommand('/join ' + $(this).text());
                                                                                $('#send-message').focus();
                                                                            }
                                                                        );
                                            }
                                );
                        setInterval(function() 
                                    {
                                        socket.emit('rooms');
                                    }, 1000);

                        $('#send-message').focus();

                        $('#send-form').submit(function() 
                                                {
                                                    console.log('send-form submit --- chat_ui.js')
                                                    console.log( 'send-message value: from ready function: ', $('#send-message').val());

                                                    processUserInput(chatApp, socket);
                                                    return false;
                                                }
                                              );
                    }                    
                )
