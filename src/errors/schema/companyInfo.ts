



export class CompanyInfoError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'CompanyInfoError';
  }
}

export class CompanyInfoNotFoundError extends CompanyInfoError {
  constructor(id: string) {
    super(`CompanyInfo with ID ${id} not found`, 404, 'CompanyInfo_NOT_FOUND');
    this.name = 'CompanyInfoNotFoundError';
  }
}
export class CompanyInfoIsAlreadyExist extends CompanyInfoError {
  constructor() {
    super(`CompanyInfo with  is already exist`, 400, 'CompanyInfo_ALREADY_EXIST');
    this.name = 'CompanyInfoIsAlreadyExist';
  }
}

export class CompanyInfoValidationError extends CompanyInfoError {
  constructor(message: string , code = 'VALIDATION_ERROR'  , name = 'CompanyInfoValidationError')   {
    super(message, 400, code ) 
    this.name = name
  }
}

export class CompanyInfoCreationError extends CompanyInfoError {
  constructor(message: string , code = 'CompanyInfo_CREATION_ERROR' , name = 'CompanyInfoCreationError') {
    super(message, 500, code);
    this.name = name;
  } 
}
export class CompanyInfoUpdateError extends CompanyInfoError {
  constructor(message: string , code = 'CompanyInfo_UPDATE_ERROR'  , name = 'CompanyInfoUpdateError') {
    super(message, 500 , code );
    this.name = name
  }
}
export class CompanyInfoDeletionError extends CompanyInfoError {
  constructor(message: string , code = 'CompanyInfo_DELETION_ERROR' , name = 'CompanyInfoDeletionError') {
    super(message, 500, code );
    this.name = name;
  }
}

