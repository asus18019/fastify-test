import Ajv from 'ajv';

export const validateFileExtension = (
	file: Express.Multer.File,
	supportedExtensions: string[]
): void => {
	const isValidFileExtension = supportedExtensions
		.map(e => 'image/' + e)
		.includes(file.mimetype);

	if(!isValidFileExtension) {
		const formatterExtensions = supportedExtensions
			.map(e => '.' + e.toUpperCase())
			.join(', ');

		const error = `Incorrect file extension. Supported file extensions: ${formatterExtensions}`;
		throw new Error(error);
	}
}

export const validateBody = (
	schemaBody: any,
	body: any
) => {
	const ajv = new Ajv({ allErrors: true });
	const validate = ajv.compile(schemaBody);
	const isValid = validate(body);

	if(!isValid) {
		const errorMessage = validate.errors?.length && validate.errors[0].message;
		throw new Error('Invalid form data' + errorMessage);
	}
};