import { FastifyPluginCallback } from 'fastify';
import { authorizeUserSchemas } from './schema';
import multer from 'fastify-multer';

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

const upload = multer();

const router: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.post<
		{ Body: InsertUserBody }
	>(
		'/user',
		{ preHandler: upload.single('image') },
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