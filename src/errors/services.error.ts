


export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ServiceNotFoundError extends ServiceError {
  constructor(id: string) {
    super(`Service with ID ${id} not found`, 404, 'SERVICE_NOT_FOUND');
    this.name = 'ServiceNotFoundError';
  }
}

export class ServiceValidationError extends ServiceError {
  constructor(message: string , code = 'VALIDATION_ERROR'  , name = 'ServiceValidationError')   {
    super(message, 400, code ) 
    this.name = name
  }
}

export class ServiceCreationError extends ServiceError {
  constructor(message: string , code = 'SERVICE_CREATION_ERROR' , name = 'ServiceCreationError') {
    super(message, 500, code);
    this.name = name;
  } 
}
export class ServiceUpdateError extends ServiceError {
  constructor(message: string , code = 'SERVICE_UPDATE_ERROR'  , name = 'ServiceUpdateError') {
    super(message, 500 , code );
    this.name = name
  }
}
export class ServiceDeletionError extends ServiceError {
  constructor(message: string , code = 'SERVICE_DELETION_ERROR' , name = 'ServiceDeletionError') {
    super(message, 500, code );
    this.name = name;
  }
}

