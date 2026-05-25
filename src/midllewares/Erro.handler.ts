import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";


// Interface para erros personalizados
interface CustomError extends Error {
    code?: number;
    statusCode?: number;
}


export const globalErrorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const safeMessage = (err.message || String(err)).replace(/\r|\n/g, ' ');
    console.error('[Error Log]:', safeMessage);



// Erros de validação do Zod
if (err instanceof ZodError) {
    return res.status(400).json({
        message: 'Validation Error',
        errors: err.issues.map((issue: any) => ({
            path: issue.path.join('.'),
            message: issue.message
        }))
    });
}

//Erro do banco de dados
if (err.code === 11000) {
    return res.status(409).json({
        message: 'Conflict Error',
        errors: [{
            path: [],
            message: 'Email já cadastrado'
        }]
    });
}

// Erros de regras de negocio
const conflictMessages = [
    'Email já cadastrado',
    'Email já cadastrado por outro usuário',
    'Refresh token inválido'
];

if (conflictMessages.includes(err.message)) {
    return res.status(409).json({
        message: 'Conflict Error',
        errors: [{
            path: [],
            message: err.message
        }]
    });
}

const notFoundMessages = [
    'Usuário não encontrado',
    'Tarefa não encontrada',
    'Projeto não encontrado'
];

if (notFoundMessages.includes(err.message)) {
    return res.status(404).json({
        message: 'Not Found Error',
        errors: [{
            path: [],
            message: err.message
        }]
    });
}

const statusCode = err.statusCode || 500;
res.status(statusCode).json({
    message: err.message || "Erro interno do servidor",
});
};