import { UploadApiResponse } from 'cloudinary';
import crypto from 'crypto';
import stream, { Readable } from 'stream';
import util from 'util';
import { server } from '../index';

export const uploadToCloudinary = async (file: Express.Multer.File) =>{
	const pipeline = util.promisify(stream.pipeline);

	const randomFilename = crypto.randomBytes(30).toString('hex');

	const readableStream = new Readable();
	readableStream.push(file.buffer);
	readableStream.push(null);

	return new Promise<UploadApiResponse>((resolve, reject) => {
		pipeline(
			readableStream,
			server.cloudinary.uploader.upload_stream(
				{ public_id: randomFilename, folder: 'library' },
				(error, result) => {
					if(result) {
						console.log(result);
						resolve(result);
					} else {
						reject(error);
					}
				})
		);
	});
}
