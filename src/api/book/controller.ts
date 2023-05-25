import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { DeleteBookParams, InsertBookBody, UpdateBook } from './router';

export interface DecodedData {
	id: number,
	fullname: string,
	dob: string,
	country: string,
	login: string
}

const prisma = new PrismaClient();

async function getAllBooks(request: FastifyRequest, reply: FastifyReply) {
	try {
		const response = await prisma.book.findMany();

		reply.code(200).send({
			data: response
		});
	} catch(error) {
		console.log(error);
		reply.code(400).send({
			message: `Something went wrong`
		});
	}
}

async function insertBook(
	request: FastifyRequest<{ Body: InsertBookBody }>,
	reply: FastifyReply
) {
	const { title, release, description } = request.body;

	const { id } = await request.jwtVerify() as DecodedData;

	try {
		const newBook = await prisma.book.create({
			data: {
				title,
				release: new Date(release),
				author_id: id,
				description
			}
		});

		reply.code(201).send({
			message: `Created`,
			data: newBook
		});
	} catch(error) {
		console.log(error);
		reply.code(400).send({
			message: `Something went wrong`
		});
	}
}

async function deleteBookById(
	request: FastifyRequest<{ Params: DeleteBookParams }>,
	reply: FastifyReply
) {
	const bookId = request.params.id;

	try {
		await prisma.book.delete({
			where: {
				id: bookId
			}
		});

		reply.code(200).send({
			message: `Deleted`
		});
	} catch(e) {
		console.log(e);
		const error = e as any;
		reply.code(400).send({
			message: error?.meta?.cause || e
		});
	}
}

async function updateBook(
	request: FastifyRequest<{ Body: UpdateBook }>,
	reply: FastifyReply
) {
	const bookId = request.body.id;

	try {
		const updatedBook = await prisma.book.update({
			where: {
				id: bookId
			},
			data: request.body
		});

		reply.code(200).send({
			message: `Updated`,
			data: updatedBook
		});
	} catch(e: unknown) {
		const error = e as any;
		console.log(error);

		reply.code(400).send({
			message: error?.meta?.cause || e
		});
	}
}

module.exports = {
	getAllBooks,
	deleteBookById,
	updateBook,
	insertBook
};