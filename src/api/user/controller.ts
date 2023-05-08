import { FastifyReply, FastifyRequest } from 'fastify';
import { InsertUserBody, LoginBody } from './router';
import { server } from '../../index';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function insertUser(
	request: FastifyRequest<{ Body: InsertUserBody }>,
	reply: FastifyReply
) {
	const { login, password, fullname, country, dob } = request.body;

	const { hash, salt } = hashPassword(password);

	try {
		const user = await prisma.user.findFirst({
			where: {
				login
			}
		});

		if(user) {
			reply.code(409).send({
				meta: {
					code: 409,
					message: `This login has already been taken`
				}
			});
		}

		await prisma.user.create({
			data: {
				login,
				password: hash,
				salt,
				fullname,
				country,
				dob: new Date(dob)
			}
		});

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

async function login(
	request: FastifyRequest<{ Body: LoginBody }>,
	reply: FastifyReply
) {
	const { login, password } = request.body;

	const user = await prisma.user.findFirst({
		where: {
			login
		}
	})

	if(!user) {
		return reply.code(400).send({
			meta: {
				code: 400,
				message: `Invalid login or password`
			}
		});
	}

	const correctPassword = verifyPassword({
		password,
		salt: user.salt,
		hash: user.password
	});

	if(correctPassword) {
		const { password, salt, ...rest } = user;
		reply.code(200).send({
			meta: {
				code: 200,
				message: `Authenticated`
			},
			data: {
				accessToken: server.jwt.sign(rest)
			}
		});
	}

	reply.code(400).send({
		meta: {
			code: 400,
			message: `Invalid login or password`
		}
	});
}

module.exports = {
	insertUser,
	login
};