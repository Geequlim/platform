class Exception extends Error {
	constructor(message?: string, readonly code = 0) {
		super(message);
	}
}

export class NotImplementedException extends Exception {
	constructor(message: string = 'Not impemented', readonly code = 0) {
		super(message, code);
	}
}

export class NotSupportedException extends Exception {
	constructor(message: string = 'Not supported', readonly code = 0) {
		super(message, code);
	}
}

export class OperateFailedException extends Exception {
	constructor(message: string = 'opertation failed', readonly code = 0) {
		super(message, code);
	}
}
