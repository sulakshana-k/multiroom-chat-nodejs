var socketio = require('socket.io')
var io;
var guestNumber = 1
var nickNames   = {}
var namesUsed   = []
var currentRoom = {}

exports.listen 
            = function( argServer )
                {
                    console.log('listenSocketIO from chat_server.js')
                    io = socketio.listen( argServer )
                    io.set('log level', 0);

                    // 'on' is a slot.
                    // This slot is waiting for the event 'connection'.
                    // On receiving the event 'connection' the corresponding
                    // callback function will be called.
                    io.sockets.on( 'connection', 
                                    function( argSocket )
                                    {
                                        // When we receive a new connection from a new user through the browser,
                                        // we are supposed to assign the user a guest name.

                                        // Return: Guest number.
                                        guestNumber = assignGuestName( argSocket, 
                                                                       guestNumber,
                                                                       nickNames,
                                                                       namesUsed);
                                        
                                        // After assigning the guest a number, we make the guest sit in the lobby room.
                                        joinRoom( argSocket, 'Lobby');

                                        // We need to inform other people in the room that this new user has joined.
                                        handleMessageBroadcasting( argSocket, nickNames );

                                        // When the user attempts to change name, we have to see whether the name he has
                                        // chosen is already in use or now.
                                        handleNameChangeAttempts( argSocket, nickNames, namesUsed );

                                        // User may want to join the room of their choice, and leave the previous room.
                                        handleRoomJoining( argSocket );

                                        // 'socket' API has a facility for providing a list of rooms.
                                        argSocket.on( 'rooms', 
                                                    function()
                                                    {
                                                        argSocket.emit( 'rooms', io.sockets.manager.rooms );
                                                    }
                                                )

                                        handleClientDisconnection( argSocket, nickNames, namesUsed );
                                    }
                                )
                };

function assignGuestName(   argSocket, 
                            argGuestNumber,
                            argNickNames,
                            argNamesUsed)
{
    console.log('assignGuestName')
    	// Generate new guest name.
	var name = 'Guest' + argGuestNumber;

	// Associate guest name with client connection id.
	// socket.id will be unique each time a new guest opens a new browser tab.
	// 'argNickNames' is a {}, so it will have pairs of { qjm7ISGCc9UImzua_Bie, Guest1 }
	argNickNames[argSocket.id] = name;

	// Let user know their guest name.

	// 'socket.emit' 			- send events to sender client only.
	// 'io.emit' 				- send to all clients including the sender.
	// 'socket.broadcast.emit' 	- send to all clients excluding the sender.

	// 1st argument: 			'nameResult' is the event name.
	// Nth argument(s): 		data of any type
	//							Example: 1, '2', { 3: '4', 5: new Buffer(6) }
	// 3rd argument (optional): callback function
	argSocket.emit('nameResult', { success: true, name: name } )

	// Note that this guest name now comes under used category.
	// 'argNamesUsed' is an array.
	argNamesUsed.push( name );

	// Increment counter used to generate new guest names.
	return argGuestNumber + 1;
}

function joinRoom( argSocket, argRoom)
{
    console.log('joinRoom')
    	// Make user join the room.

	// Adds the client to the room and fires the 2nd optional argument
	// i.e callback with error if any.
	// 1st argument: string room
	argSocket.join( argRoom );

	// Note that user is now in this room.
	// currentRoom is a {}
	currentRoom[argSocket.id] = argRoom;

	// Let user know that they are now in this room.
	// arg1: event name
	// arg2: parameters
	// arg3 (optional): callback function	
	argSocket.emit( 'joinResult', {room: argRoom} );

	// Sending to all clients in the room except the sender:
	// Let other users in the room know that this new user has joined.
	argSocket.broadcast.to( argRoom ).emit( 'message', {
													text: nickNames[argSocket.id] + ' has joined ' + argRoom + '.'		
												 }
									);


	// Returns an array of all connected clients:
	// Determine whether other users are in the same room as this new user.
	var usersInRoom = io.sockets.clients( argRoom );

	// If other users exist, summarize who they are.
	if( usersInRoom.length > 1 )
	{
		var usersInRoomSummary = 'Users currently in ' + argRoom + ': ';

		for( var index in usersInRoom )
		{
			var userSocketId = usersInRoom[index].id;

			if( userSocketId != argSocket.id )
			{
				if( index > 0 )
				{
					usersInRoomSummary += ', ';
				}

				usersInRoomSummary += nickNames[userSocketId];
			}
		}

		usersInRoomSummary += '.';

		// Send summary of other users in the room to this user.
		argSocket.emit( 'message', {text: usersInRoomSummary});
	}
}

function handleMessageBroadcasting( socket, nickNames )
{
    console.log('handleMessageBroadcasting')
    socket.on( 'message', 
                function (message) 
                {
                    socket.broadcast.to(message.room).emit('message', 
                                                            {
                                                                text: nickNames[socket.id] + ': ' + message.text
                                                            });
                }
            );
}

function handleNameChangeAttempts( socket, nickNames, namesUsed )
{
    console.log('handleNameChangeAttempts')
    socket.on('nameAttempt', 
                function(name) 
                {
                    if (name.indexOf('Guest') == 0) 
                    {
                        socket.emit('nameResult', 
                                    {
                                        success: false,
                                        message: 'Names cannot begin with "Guest".'
                                    });
                    } 
                    else 
                    {
                        if (namesUsed.indexOf(name) == -1) 
                        {
                            var previousName = nickNames[socket.id];
                            var previousNameIndex = namesUsed.indexOf(previousName);
                            namesUsed.push(name);
                            nickNames[socket.id] = name;
                            delete namesUsed[previousNameIndex];
                                                
                            socket.emit('nameResult', 
                                        {
                                            success: true,
                                            name: name
                                        });
                                                    
                            socket.broadcast.to(currentRoom[socket.id]).emit('message', 
                                                                            {
                                                                                text: previousName + ' is now known as ' + name + '.'
                                                                            });
                        } 
                        else 
                        {
                            socket.emit('nameResult', 
                                        {
                                            success: false,
                                            message: 'That name is already in use.'
                                        });
                        }
                    }
                });
}

function handleRoomJoining( socket )
{
    console.log('handleRoomJoining')
    socket.on( 'join', 
                function( room ) 
                {
                    socket.leave(currentRoom[socket.id]);
                    joinRoom( socket, room.newRoom );
                }
            );
}

function handleClientDisconnection( socket, nickNames, namesUsed )
{
    console.log('handleClientDisconnection')
    socket.on('disconnect', 
                function() 
                {
                    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
                    delete namesUsed[nameIndex];
                    delete nickNames[socket.id];
                }
            );
}

