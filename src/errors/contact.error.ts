export class ContactError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ContactError";
  }
}

export class ContactNotFoundError extends ContactError {
  constructor(id: string) {
    super(`Contact with ID ${id} not found`, 404, "CONTACT_NOT_FOUND");
    this.name = "ContactNotFoundError";
  }
}

export class ContactValidationError extends ContactError {
  constructor(
    message: string,
    code = "VALIDATION_ERROR",
    name = "ContactValidationError"
  ) {
    super(message, 400, code);
    this.name = name;
  }
}

export class ContactCreationError extends ContactError {
  constructor(
    message: string,
    code = "CONTACT_CREATION_ERROR",
    name = "ContactCreationError"
  ) {
    super(message, 500, code);
    this.name = name;
  }
}

export class ContactUpdateError extends ContactError {
  constructor(
    message: string,
    code = "CONTACT_UPDATE_ERROR",
    name = "ContactUpdateError"
  ) {
    super(message, 500, code);
    this.name = name;
  }
}

export class ContactDeletionError extends ContactError {
  constructor(
    message: string,
    code = "CONTACT_DELETION_ERROR",
    name = "ContactDeletionError"
  ) {
    super(message, 500, code);
    this.name = name;
  }
}
