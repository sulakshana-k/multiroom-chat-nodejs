var socketio = require('socket.io')
var io;
var guestNumber = 1
var nickNames   = {}
var namesUsed   = []
var currentRoom = {}

exports.listenSocketIO 
            = function( argServer )
                {
                    io = socketio.listen( argServer )
                    io.set('log level', 1);

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
                                        handleMessageBroadcasting( argSocket, nicknames );

                                        // When the user attempts to change name, we have to see whether the name he has
                                        // chosen is already in use or now.
                                        handleNameChangeAttempts( argSocket, nickNames, namesUsed );

                                        // User may want to join the room of their choice, and leave the previous room.
                                        handleRoomJoining( argSocket );

                                        // 'socket' API has a facility for providing a list of rooms.
                                        socket.on( 'rooms', 
                                                    function()
                                                    {
                                                        socket.emit( 'rooms', io.sockets.manager.rooms );
                                                    }
                                                )

                                        handleClientDisconnection( argSocket, nickNames, namesUsed );
                                    }
                                )
                };










