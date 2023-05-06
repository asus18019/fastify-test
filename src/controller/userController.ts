import { FastifyReply, FastifyRequest } from 'fastify';
import { InsertUserBody } from '../routes/userRouter';
import { hashPassword } from '../utils/hash';

const db = require('../config/database');

async function insertUser(
	request: FastifyRequest<{ Body: InsertUserBody }>,
	reply: FastifyReply
) {
	const { login, password, fullname, country, dob } = request.body;

	const { hash, salt } = hashPassword(password);

	try {
		await db.insert({ login, password: hash, salt, fullname, country, dob }).into('user');

		reply.code(201).send({
			meta: {
				code: 201,
				message: `Created`
			}
		});
	} catch(error) {
		console.log(error);
		reply.code(400).send({
			meta: {
				code: 400,
				message: `Something went wrong`
			}
		});
	}
}

module.exports = {
	insertUser
};