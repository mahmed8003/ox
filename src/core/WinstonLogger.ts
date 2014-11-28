/// <reference path="../OX" />

module OX {

    export interface LoggerInstance extends NodeJS.EventEmitter {
        extend(target:any): LoggerInstance;

        log(level:string, msg:string, meta:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;
        log(level:string, msg:string, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        debug(msg:string, meta:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;
        debug(msg:string, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        info(msg:string, meta:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;
        info(msg:string, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        warn(msg:string, meta:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;
        warn(msg:string, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        error(msg:string, meta:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;
        error(msg:string, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        query(options:QueryOptions, callback?:(err:Error, results:any) => void): any;
        query(callback:(err:Error, results:any) => void): any;
        stream(options?:any): NodeJS.ReadableStream;
        close(): void;
        handleExceptions(...transports:TransportInstance[]): void;
        unhandleExceptions(...transports:TransportInstance[]): void;
        add(transport:TransportInstance, options?:TransportOptions, created?:boolean): LoggerInstance;
        addRewriter(rewriter:TransportInstance): TransportInstance[];
        clear(): void;
        remove(transport:TransportInstance): LoggerInstance;
        startTimer(): ProfileHandler;
        profile(id:string, msg?:string, meta?:any, callback?:(err:Error, level:string, msg:string, meta:any) => void): LoggerInstance;

        setLevels(target:any): any;
        cli(): LoggerInstance;
    }

    export interface LoggerOptions {
        transports?: TransportInstance[];
        rewriters?: TransportInstance[];
        exceptionHandlers?: TransportInstance[];
        handleExceptions?: boolean;

        /**
         * @type {(boolean|(err: Error) => void)}
         */
        exitOnError?: any;
    }

    export interface TransportStatic {
        new (options?:TransportOptions): TransportInstance;
    }

    export interface TransportInstance extends TransportStatic, NodeJS.EventEmitter {
        formatQuery(query:any): any;
        normalizeQuery(options:QueryOptions): QueryOptions;
        formatResults(results:any, options:any): any;
        logException(msg:string, meta:any, callback:() => void): void;
    }

    export interface ContainerStatic {
        new (options:LoggerOptions): ContainerInstance;
    }

    export interface ContainerInstance extends ContainerStatic {
        get(id:string, options?:LoggerOptions): LoggerInstance;
        add(id:string, options:LoggerOptions): LoggerInstance;
        has(id:string): boolean;
        close(id:string): void;
        options: LoggerOptions;
        loggers: any;
        default: LoggerOptions;
    }

    export interface Transports {
        File: TransportInstance;
        Console: TransportInstance;
        Loggly: TransportInstance;
        DailyRotateFile: TransportInstance;
        Http: TransportInstance;
        Memory: TransportInstance;
        Webhook: TransportInstance;
    }

    export interface TransportOptions {
        level?: string;
        silent?: boolean;
        raw?: boolean;
        name?: string;
        handleExceptions?: boolean;
    }

    export interface QueryOptions {
        rows?: number;
        limit?: number;
        start?: number;
        from?: Date;
        until?: Date;
        /**
         * 'asc' or 'desc'
         */
        order?: string;
        fields: any;
    }

    export interface ProfileHandler {
        logger: LoggerInstance;
        start: Date;
        done: (msg:string) => LoggerInstance;
    }


    export var Log:LoggerInstance;


    export class WinstonLogger {

        public createLogger(config:LoggerOptions) {
            var winston:any = require('winston');
            OX.Log = new winston.Logger(config);
        }

    }
}
