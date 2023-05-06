import { FastifyPluginCallback } from 'fastify';

const bookController = require('../controller/bookController');

export interface InsertBookBody {
	title: string,
	author_id: number,
	release: string,
	description: string
}

export interface DeleteBookParams {
	id: number;
}

export interface UpdateBook {
	id: number,
	title?: string,
	author_id?: number,
	release?: string,
	description?: string
}

const bookRoutes: FastifyPluginCallback = (fastify, opts, done) => {
	fastify.get('/books', bookController.getAllBooks);

	fastify.post<
		{ Body: InsertBookBody }
	>('/book', {
		schema: {
			body: {
				type: 'object',
				required: ['title', 'release', 'description'],
				properties: {
					title: { type: 'string' },
					release: { type: 'string' },
					description: { type: 'string' }
				}
			}
		},
		preHandler: [fastify.auth]
	}, bookController.insertBook);

	fastify.delete<
		{ Querystring: DeleteBookParams }
	>('/book/:id', {
		schema: {
			params: {
				type: 'object',
				properties: {
					id: { type: 'number' }
				}
			}
		},
		preHandler: [fastify.auth]
	}, bookController.deleteBookById);

	fastify.put<
		{ Body: UpdateBook }
	>('/book', {
		schema: {
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
			}
		},
		preHandler: [fastify.auth]
	}, bookController.updateBook);

	done();
};

module.exports = bookRoutes;