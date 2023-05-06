import { FastifyPluginCallback } from 'fastify';
const userController = require('../controller/userController');

export interface InsertUserBody {
	login: string,
	password: string,
	fullname: string,
	country: string,
	dob: string,
}

const userRouter: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.post<
		{ Body: InsertUserBody }
	>('/user', {
		schema: {
			body: {
				type: 'object',
				required: ['login', 'password', 'fullname', 'country', 'dob'],
				additionalProperties: false,
				properties: {
					login: { type: 'string' },
					password: { type: 'string' },
					fullname: { type: 'string' },
					country: { type: 'string' },
					dob: { type: 'string' }
				}
			}
		}
	}, userController.insertUser);

	done();
}

module.exports = userRouter;