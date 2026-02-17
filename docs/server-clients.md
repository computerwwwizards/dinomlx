## Client Land vs Server Land
Another important model is to understand that the client platforms are not the same eviroments as the servers.

At high level a client is anything that can request somehting form a server, and in web developent  by default that client is a very powerfull paltform called web browser.

As the server side, it needs to return data so the client can use taht to shos something to the users, but multiple clients can ask the same server for information and the server can response diferently to each Request depding on several factors like who is the user, where is located, has the user benn authethicated or not, etc.

Understanding the boundaries is crucial to get a good idea of the limits and capabilities of each enviroment to address requriemtns in the best way talking about for excmaple price, user percieved perfromance and security. 
 
## Server land
Essentially is a computer that is waiting for a HTTP conection called Request to enter from a net.

You may say that usually form the internet but that is only the case for public web servers. A web server can act as a client by asking another server to comply wit some request and that HTTP connection is not convenient to happen at a public level. It is true that HTTPS encripts data nevertheless if there is no reason (and budget) servers can talk to each other with a private network and also genreally private networks are more fast.

<!-- TODO: in progress -->