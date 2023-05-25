import { FastifySchema } from 'fastify';

const bookResponseSchema = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		title: { type: 'string' },
		author_id: { type: 'number' },
		release: { type: 'string' },
		description: { type: 'string' }
	}
}

export const getBooksSchemas: FastifySchema = {
	response: {
		200: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: bookResponseSchema
				}
			}
		}
	}
};

export const insertBookSchemas: FastifySchema = {
	body: {
		type: 'object',
		required: ['title', 'release', 'description'],
		properties: {
			title: { type: 'string' },
			release: { type: 'string' },
			description: { type: 'string' }
		}
	},
	response: {
		201: {
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: bookResponseSchema
			}
		}
	}
};

export const deleteBookSchemas: FastifySchema = {
	params: {
		type: 'object',
		properties: {
			id: { type: 'number' }
		}
	},
	response: {
		200: {
			type: 'object',
			properties: {
				message: { type: 'string' }
			}
		},
		404: {
			type: 'object',
			properties: {
				message: { type: 'string' }
			}
		}
	}
};

export const updateBookSchemas: FastifySchema = {
	body: {
		type: 'object',
		minProperties: 2,
		required: ['id'],
		additionalProperties: false,
		properties: {
			id: { type: 'number' },
			title: { type: 'string' },
			author_id: { type: 'number' },
			release: { type: 'string' },
			description: { type: 'string' }
		}
	},
	response: {
		200: {
			message: { type: 'string' },
			data: bookResponseSchema
		}
	}
};