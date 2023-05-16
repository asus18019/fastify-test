import { FastifyReply, FastifyRequest } from 'fastify';
import { InsertUserBody, LoginBody, UpdateUserBody } from './router';
import { server } from '../../index';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { assets, PrismaClient } from '@prisma/client';
import { insertUserSchemas, updateMeSchemas } from './schema';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinary';
import { DecodedData } from '../book/controller';
import { validateBody, validateFileExtension } from '../../utils/validators';

const prisma = new PrismaClient();

interface InsertUserMulterReq extends FastifyRequest<{ Body: InsertUserBody }> {
	file?: Express.Multer.File;
}

interface UpdateMeMulterReq extends FastifyRequest<{ Body: UpdateUserBody }> {
	file?: Express.Multer.File;
}

async function insertUser(
	request: InsertUserMulterReq,
	reply: FastifyReply
) {
	try {
		validateBody(insertUserSchemas.body, request.body);
	} catch(e) {
		return reply.status(400).send({
			message: `Invalid form data. ${ (e as Error).message }`
		});
	}

	const image: Express.Multer.File | undefined = await request.file;
	const { login, password, fullname, country, dob } = request.body;

	const user = await prisma.user.findFirst({
		where: {
			login
		}
	});

	if(user) {
		return reply.code(409).send({
			meta: {
				code: 409,
				message: `This login has already been taken`
			}
		});
	}

	const { hash, salt } = hashPassword(password);

	let asset_id: number | undefined;

	if(image) {
		try {
			const supportedImageExtensions = ['jpeg', 'png'];
			validateFileExtension(image, supportedImageExtensions);
		} catch(e) {
			return reply.code(400).send({
				message: (e as Error).message
			});
		}

		const { api_key, ...asset } = await uploadToCloudinary(image);

		const res = await prisma.assets.create({
			data: asset
		});

		asset_id = res.id;
	}

	try {
		await prisma.user.create({
			data: {
				login,
				password: hash,
				salt,
				fullname,
				country,
				dob: new Date(dob),
				image_id: asset_id
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

async function getMe(
	request: FastifyRequest,
	reply: FastifyReply
) {
	try {
		const { id } = await request.jwtVerify() as DecodedData;
		const user = await prisma.user.findUnique({
			where: {
				id
			},
			include: {
				assets: true
			}
		});

		reply.code(200).send({
			meta: {
				code: 200,
				message: `Successfully fetched`
			},
			data: user
		});
	} catch(e) {
		reply.code(400).send({
			meta: {
				code: 400,
				message: `Something went wrong`
			}
		});
	}
}

async function updateMe(
	request: UpdateMeMulterReq,
	reply: FastifyReply
) {
	try {
		validateBody(updateMeSchemas.body, request.body);
	} catch(e) {
		return reply.status(400).send({
			message: `Invalid form data. ${ (e as Error).message }`
		});
	}

	const image: Express.Multer.File | undefined = await request.file;

	let createAssetRes: assets | undefined;

	if(image) {
		try {
			const supportedImageExtensions = ['jpeg', 'png'];
			validateFileExtension(image, supportedImageExtensions);

			const { api_key, ...asset } = await uploadToCloudinary(image);

			createAssetRes = await prisma.assets.create({
				data: asset
			});
		} catch(e) {
			return reply.code(400).send({
				message: (e as Error).message
			});
		}
	}

	const { id } = await request.jwtVerify() as DecodedData;
	const { login, password, fullname, country, dob } = request.body;

	const userToUpdate = await prisma.user.findUniqueOrThrow({
		where: {
			id
		}
	});

	const updateRes = await prisma.user.update({
		data: {
			login,
			fullname,
			country,
			...(dob && { dob: new Date(dob) }),
			...(createAssetRes && { image_id: createAssetRes.id })
		},
		where: {
			id
		}
	});

	if(createAssetRes && userToUpdate.image_id) {
		const { public_id } = await prisma.assets.delete({
			where: {
				id: userToUpdate.image_id
			}
		});

		if(!public_id) throw Error('An error happened. Public_id is not provided');
		await deleteFromCloudinary(public_id);
	}

	reply.code(200).send({
		meta: {
			code: 202,
			message: `Updated`,
			updateRes
		}
	});
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
	});

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
	login,
	getMe,
	updateMe
};