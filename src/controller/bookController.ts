import { FastifyReply, FastifyRequest } from 'fastify';
import { DeleteBookParams, InsertBookBody, UpdateBook } from '../routes/bookRouter';

const db = require('../config/database');

async function getAllBooks(request: FastifyRequest, reply: FastifyReply) {
	try {
		const response = await db.select('*').into('book');

		reply.code(200).send({
			meta: {
				code: 200
			},
			data: response
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

async function insertBook(
	request: FastifyRequest<{ Body: InsertBookBody }>,
	reply: FastifyReply
) {
	const { title, author_id, release, description } = request.body;

	try {
		await db.insert({ title, author_id, release, description }).into('book');

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

async function deleteBookById(
	request: FastifyRequest<{ Params: DeleteBookParams }>,
	reply: FastifyReply
) {
	const bookId = request.params.id;

	try {
		const rowsDeleted = await db('book').where('id', bookId).delete();

		if(rowsDeleted === 0) {
			reply.code(404).send({
				meta: {
					code: 404,
					message: `Book not found`
				}
			});
		} else {
			reply.code(200).send({
				meta: {
					code: 200,
					message: `Deleted`
				}
			});
		}
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

async function updateBook(
	request: FastifyRequest<{ Body: UpdateBook }>,
	reply: FastifyReply
) {
	const bookId = request.body.id;

	try {
		await db('book').where('id', bookId).update(request.body);

		reply.code(200).send({
			meta: {
				code: 200,
				message: `Updated`
			}
		});
	} catch(error) {
		console.log(error);
		reply.code(400).send({
			meta: {
				code: 400,
				error
			}
		});
	}
}

module.exports = {
	getAllBooks,
	deleteBookById,
	updateBook,
	insertBook
};