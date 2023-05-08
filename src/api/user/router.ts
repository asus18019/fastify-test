import { FastifyPluginCallback } from 'fastify';
import { authorizeUserSchemas, insertUserSchemas } from './schema';

const userController = require('./controller');

export interface InsertUserBody {
	login: string,
	password: string,
	fullname: string,
	country: string,
	dob: string,
}

export interface LoginBody {
	login: string,
	password: string
}

const router: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.post<
		{ Body: InsertUserBody }
	>(
		'/user',
		{ schema: insertUserSchemas },
		userController.insertUser
	);

	fastify.post<
		{ Body: LoginBody }
	>(
		'/login',
		{ schema: authorizeUserSchemas },
		userController.login
	);

	done();
};

module.exports = router;