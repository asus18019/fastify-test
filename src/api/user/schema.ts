import { FastifySchema } from 'fastify';

export const metaSchema = {
	meta: {
		type: 'object',
		properties: {
			code: { type: 'number' },
			message: { type: 'string' }
		}
	}
};

export const insertUserSchemas: FastifySchema = {
	body: {
		type: 'object',
		required: ['login', 'password', 'fullname', 'country', 'dob'],
		properties: {
			login: { type: 'string' },
			password: { type: 'string' },
			fullname: { type: 'string' },
			country: { type: 'string' },
			dob: { type: 'string' }
		}
	},
	response: {
		201: {
			type: 'object',
			properties: {
				...metaSchema
			}
		},
		409: {
			type: 'object',
			properties: {
				...metaSchema
			}
		}
	}
};

export const authorizeUserSchemas: FastifySchema = {
	body: {
		type: 'object',
		required: ['login', 'password'],
		properties: {
			login: { type: 'string' },
			password: { type: 'string' }
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				...metaSchema,
				data: {
					accessToken: { type: 'string' }
				}
			}
		}
	}
}