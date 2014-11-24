/// <reference path="../OX" />

module OX {

    export var Log:Logger;

    export interface Logger {
        trace(error:Error, format?:any, ...params:any[]):void;
        trace(buffer:Buffer, format?:any, ...params:any[]):void;
        trace(obj:Object, format?:any, ...params:any[]):void;
        trace(format:string, ...params:any[]):void;
        debug(error:Error, format?:any, ...params:any[]):void;
        debug(buffer:Buffer, format?:any, ...params:any[]):void;
        debug(obj:Object, format?:any, ...params:any[]):void;
        debug(format:string, ...params:any[]):void;
        info(error:Error, format?:any, ...params:any[]):void;
        info(buffer:Buffer, format?:any, ...params:any[]):void;
        info(obj:Object, format?:any, ...params:any[]):void;
        info(format:string, ...params:any[]):void;
        warn(error:Error, format?:any, ...params:any[]):void;
        warn(buffer:Buffer, format?:any, ...params:any[]):void;
        warn(obj:Object, format?:any, ...params:any[]):void;
        warn(format:string, ...params:any[]):void;
        error(error:Error, format?:any, ...params:any[]):void;
        error(buffer:Buffer, format?:any, ...params:any[]):void;
        error(obj:Object, format?:any, ...params:any[]):void;
        error(format:string, ...params:any[]):void;
        fatal(error:Error, format?:any, ...params:any[]):void;
        fatal(buffer:Buffer, format?:any, ...params:any[]):void;
        fatal(obj:Object, format?:any, ...params:any[]):void;
        fatal(format:string, ...params:any[]):void;
    }

    export class BunyanLogger {

        public createLogger(config:LoggerInfo) {

            var streams = [];
            config.streamsInfo.forEach((streamInfo)=> {
                var streamItem:any = {};
                streamItem.name = streamInfo.name || config.name;

                if (streamInfo.type == LoggerStreamType.STREAM) {
                    streamItem.stream = process.stdout;
                    streamItem.type = 'stream';
                } else if (streamInfo.type == LoggerStreamType.FILE) {
                    streamItem.type = 'file';
                    streamItem.path = streamInfo.path;
                } else if (streamInfo.type == LoggerStreamType.ROTATING_FILE) {
                    streamItem.type = 'rotating-file';
                    streamItem.path = streamInfo.path;
                    streamItem.period = streamInfo.period;
                    streamItem.count = streamInfo.count;
                }

                if (streamInfo.level == LoggerLevel.DEBUG) {
                    streamItem.level = 'debug'
                } else if (streamInfo.level == LoggerLevel.ERROR) {
                    streamItem.level = 'error'
                } else if (streamInfo.level == LoggerLevel.FATAL) {
                    streamItem.level = 'fatal'
                } else if (streamInfo.level == LoggerLevel.INFO) {
                    streamItem.level = 'info'
                } else if (streamInfo.level == LoggerLevel.TRACE) {
                    streamItem.level = 'trace'
                } else if (streamInfo.level == LoggerLevel.WARN) {
                    streamItem.level = 'warn'
                }

                streams.push(streamItem);
            });


            var bunyan:any = require('bunyan');
            OX.Log = bunyan.createLogger({
                name: config.name,
                streams: streams
            });
        }

    }
}
