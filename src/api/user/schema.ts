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

export const getMeSchemas: FastifySchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				...metaSchema,
				data: {
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