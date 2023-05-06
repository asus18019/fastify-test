import fastify from 'fastify';
const logger = require('./config/logger');
const bookRoutes = require('./routes/bookRouter');
const userRoutes = require('./routes/userRouter');

const server = fastify({ logger });

server.register(bookRoutes);
server.register(userRoutes);

server.listen({ port: 8080 }, (err, address) => {
	if(err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${ address }`);
});