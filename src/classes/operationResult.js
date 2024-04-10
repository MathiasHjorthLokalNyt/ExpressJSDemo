export class OperationResult{
    constructor(isSucess, statusCode, message, data){
        this.isSucess = isSucess;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}