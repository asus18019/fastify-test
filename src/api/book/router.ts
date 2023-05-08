import { FastifyPluginCallback } from 'fastify';
import { deleteBookSchemas, getBooksSchemas, insertBookSchemas, updateBookSchemas } from './schema';

const bookController = require('./controller');

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
	fastify.get(
		'/books',
		{ schema: getBooksSchemas },
		bookController.getAllBooks
	);

	fastify.post<
		{ Body: InsertBookBody }
	>(
		'/book',
		{ schema: insertBookSchemas, preHandler: [fastify.auth] },
		bookController.insertBook
	);

	fastify.delete<
		{ Querystring: DeleteBookParams }
	>(
		'/book/:id',
		{ schema: deleteBookSchemas, preHandler: [fastify.auth] },
		bookController.deleteBookById
	);

	fastify.put<
		{ Body: UpdateBook }
	>(
		'/book',
		{ schema: updateBookSchemas, preHandler: [fastify.auth] },
		bookController.updateBook);

	done();
};

module.exports = bookRoutes;