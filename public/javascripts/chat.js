var Chat = function(socket) 
            {
                console.log('Chat --- chat.js')
                this.socket = socket;
            };

Chat.prototype.sendMessage = function(room, text) 
                            {
                                console.log('sendMessage --- chat.js')
                                var message = {
                                                room: room,
                                                text: text
                                              };
                                this.socket.emit('message', message);
                            };

Chat.prototype.changeRoom = function(room) 
                            {
                                console.log('changeRoom --- chat.js')
                                
                                this.socket.emit('join', {
                                                            newRoom: room
                                                         }
                                                );
                            };

Chat.prototype.processCommand = function(command) 
                                {
                                    console.log('processCommand --- chat.js')
                                
                                    var words = command.split(' ');
                                    var command = words[0].substring(1, words[0].length).toLowerCase();
                                    var message = false;
                                    switch(command) 
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


