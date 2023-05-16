import { FastifyPluginCallback } from 'fastify';
import { authorizeUserSchemas, getMeSchemas } from './schema';
import multer from 'fastify-multer';

const userController = require('./controller');

export interface InsertUserBody {
	login: string,
	password: string,
	fullname: string,
	country: string,
	dob: string,
}

export interface UpdateUserBody extends Partial<InsertUserBody> {}

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

	fastify.get(
		'/me',
		{ preHandler: [fastify.auth], schema: getMeSchemas },
		userController.getMe
	);

	fastify.put<
		{ Body: UpdateUserBody }
	>(
		'/me',
		{ preHandler: [upload.single('image'), fastify.auth] },
		userController.updateMe
	);

	done();
};

module.exports = router;