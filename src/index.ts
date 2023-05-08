import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
const logger = require('./config/logger');
const bookRoutes = require('./api/book/router');
const userRoutes = require('./api/user/router');

export const server = fastify({ logger });

server.register(fastifyJwt, {
	secret: "asdu8hg43ujgjntngjinjg45g9349"
})

declare module 'fastify' {
	interface FastifyInstance {
		auth(request: FastifyRequest, reply: FastifyReply, done: () => void): void;
	}
}

server.decorate('auth', async (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
	try {
		await request.jwtVerify();
	} catch(e) {
		reply.code(403).send('You do not have access to this resource');
	}
});

server.register(bookRoutes);
server.register(userRoutes);

server.listen({ port: 8080 }, (err, address) => {
	if(err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${ address }`);
});