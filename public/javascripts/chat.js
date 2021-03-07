// Aim of this file is to receive the client side 'socket' object
// which is passed from 'chat_ui.js'. 
// 'chat_ui.js' calls the functions of this file based on what user inputs in html.

// From here those functions emit particular signals which are received by server side 
// socket in 'chat_server.js'.
// 'chat_server.js' server socket processes these signals and emits corresponding 
// results which are received in 'chat_ui.js' and the results are filled in the html DOM.

// Client side socket passed here by 'chat_ui.js' ready function.
var Chat = function( socket ) 
            {
                console.log('Chat --- chat.js')
                this.socket = socket;
            };

// By 'prototype' keyword we are adding 'sendMessage' function to the 'Chat' object.
// We are just passing room and text to the client side socket and emitting the socket.
Chat.prototype.sendMessage = function(room, text) 
                            {
                                console.log('sendMessage --- chat.js')
                                var message = {
                                                room: room,
                                                text: text
                                              };
                                this.socket.emit('message', message);
                            };

// By 'prototype' keyword we are adding 'changeRoom' function to the 'Chat' object.
// 'join' is a signal which will be emitted when we have a new room.
Chat.prototype.changeRoom = function(room) 
                            {
                                console.log('changeRoom --- chat.js')
                                
                                this.socket.emit('join', {
                                                            newRoom: room
                                                         }
                                                );
                            };

// By 'prototype' keyword we are adding 'processCommand' function to the 'Chat' object.
// Idea here is just to taken the command the user has entered and then dephicer it.
// If the command is about changing the room, then call the 'changeRoom' function.
// If the command is about changing the name, then call the 'changeName' function.
Chat.prototype.processCommand = function( command )
                                {
                                    console.log('processCommand --- chat.js')
                                
                                    var words = command.split(' ');
                                    var command = words[0].substring( 1, words[0].length ).toLowerCase();
                                    var message = false;
                                    switch( command ) 
                                    {
                                        case 'join':
                                            console.log('/join received in chat.js')
                                            words.shift();
                                            var room = words.join(' ');
                                            this.changeRoom(room);
                                        break;

                                        case 'nick':
                                            console.log('/nick received in chat.js')
                                            words.shift();
                                            var name = words.join(' ');
                                            this.socket.emit('nameAttempt', name);
                                        break;
                                
                                        default:
                                            message = 'Unrecognized command.';
                                        break;
                                    }

                                    return message;
                                };


