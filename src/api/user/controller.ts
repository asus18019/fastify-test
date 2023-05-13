import { FastifyReply, FastifyRequest } from 'fastify';
import { InsertUserBody, LoginBody, UpdateUserBody } from './router';
import { server } from '../../index';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { assets, PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import { insertUserSchemas, updateMeSchemas } from './schema';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { DecodedData } from '../book/controller';

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
	const ajv = new Ajv({ allErrors: true });
	const validate = ajv.compile(insertUserSchemas.body as any);
	const isValid = validate(request.body);

	if(!isValid) {
		const errorMessage = validate.errors?.length && validate.errors[0].message;
		return reply.status(400).send({
			message: 'Invalid form data', errorMessage
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
		reply.code(409).send({
			meta: {
				code: 409,
				message: `This login has already been taken`
			}
		});
	}

	const { hash, salt } = hashPassword(password);

	let asset: UploadApiResponse | undefined;

	if(typeof image === 'object') {
		const supportedImageExtensions = ['jpeg', 'png'];
		const isValidFileExtension = supportedImageExtensions.map(e => 'image/' + e).includes(image.mimetype);

		if(!isValidFileExtension) {
			const formatterExtensions = supportedImageExtensions.map(e => '.' + e.toUpperCase()).join(', ');
			return reply.code(400).send({
				message: `Incorrect file extension. Supported file extensions: ${ formatterExtensions }`
			});
		}

		asset = await uploadToCloudinary(image);
	}

	try {
		let asset_id: number | undefined;

		if(asset) {
			delete asset['api_key'];
			const res = await prisma.assets.create({
				data: asset
			});
			asset_id = res.id;
		}

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
	const ajv = new Ajv({ allErrors: true });
	const validate = ajv.compile(updateMeSchemas.body as any);
	const isValid = validate(request.body);

	if(!isValid) {
		const errorMessage = validate.errors?.length && validate.errors[0].message;
		return reply.status(400).send({
			message: 'Invalid form data', errorMessage
		});
	}

	const image: Express.Multer.File | undefined = await request.file;

	let asset: UploadApiResponse | undefined;

	if(typeof image === 'object') {
		const supportedImageExtensions = ['jpeg', 'png'];
		const isValidFileExtension = supportedImageExtensions.map(e => 'image/' + e).includes(image.mimetype);

		if(!isValidFileExtension) {
			const formatterExtensions = supportedImageExtensions.map(e => '.' + e.toUpperCase()).join(', ');
			return reply.code(400).send({
				message: `Incorrect file extension. Supported file extensions: ${ formatterExtensions }`
			});
		}

		asset = await uploadToCloudinary(image);
		delete asset["api_key"];
	}

	const { id } = await request.jwtVerify() as DecodedData;
	const { login, password, fullname, country, dob } = request.body;

	const userToDelete = await prisma.user.findUniqueOrThrow({
		where: {
			id
		}
	});

	let createAssetRes: assets | undefined;

	if(asset) {
		createAssetRes = await prisma.assets.create({
			data: asset
		});
	}

	const updateRes = await prisma.user.update({
		data: {
			login,
			fullname,
			country,
			dob,
			...(createAssetRes && { image_id: createAssetRes.id })
		},
		where: {
			id
		}
	});

	if(asset && userToDelete.image_id) {
		const { public_id } = await prisma.assets.delete({
			where: {
				id: userToDelete.image_id
			}
		});

		if(!public_id) throw Error("An error happened. Public_id is not provided")
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