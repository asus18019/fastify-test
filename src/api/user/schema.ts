import { FastifySchema } from 'fastify';

const userResponseSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		fullname: { type: 'string' },
		dob: { type: 'string' },
		country: { type: 'string' },
		login: { type: 'string' },
		image_id: { type: ['number', 'null'] }
	}
}

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
				message: { type: 'string' },
				data: userResponseSchema
			}
		},
		409: {
			type: 'object',
			properties: {
				message: { type: 'string' }
			}
		}
	}
};

const detailedUserInfo = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		fullname: { type: 'string' },
		dob: { type: 'string' },
		country: { type: 'string' },
		login: { type: 'string' },
		assets: {
			type: ['object', 'null'],
			properties: {
				asset_id: { type: 'string' },
				format: { type: 'string' },
				resource_type: { type: 'string' },
				created_at: { type: 'string' },
				url: { type: 'string' }
			}
		}
	}
}

export const getMeSchemas: FastifySchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: detailedUserInfo
			}
		}
	}
};

export const updateMeSchemas: FastifySchema = {
	body: {
		type: 'object',
		properties: {
			login: { type: 'string' },
			password: { type: 'string' },
			fullname: { type: 'string' },
			country: { type: 'string' },
			dob: { type: 'string' }
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: detailedUserInfo
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
				message: { type: 'string' },
				data: {
					accessToken: { type: 'string' }
				}
			}
		}
	}
}