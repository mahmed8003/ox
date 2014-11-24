/// <reference path="../OX" />

module OX {

    export class Log {

        private static log:any;

        public static _configLogger(config:LoggerInfo) {

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
            this.log = bunyan.createLogger({
                name: config.name,
                streams: streams
            });
        }


        public static debug(obj:any, message:string):void {
            this.log.debug(obj, message);
        }

        public static debug(message:string):void {
            this.log.debug(message);
        }

        public static error(obj:any, message:string):void {
            this.log.error(obj, message);
        }

        public static error(message:string):void {
            this.log.error(message);
        }

        public static fatal(obj:any, message:string):void {
            this.log.fatal(obj, message);
        }

        public static fatal(message:string):void {
            this.log.fatal(message);
        }

        public static info(obj:any, message:string):void {
            this.log.info(obj, message);
        }

        public static info(message:string):void {
            this.log.info(message);
        }

        public static trace(obj:any, message:string):void {
            this.log.trace(obj, message);
        }

        public static trace(message:string):void {
            this.log.trace(message);
        }

        public static warn(obj:any, message:string):void {
            this.log.warn(obj, message);
        }

        public static warn(message:string):void {
            this.log.warn(message);
        }


    }
}
