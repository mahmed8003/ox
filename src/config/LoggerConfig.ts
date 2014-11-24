/// <reference path="../OX" />

module OX {


    export enum LoggerStreamType {
        STREAM,
        FILE,
        ROTATING_FILE
    }

    export enum LoggerLevel {
        DEBUG,
        ERROR,
        FATAL,
        INFO,
        TRACE,
        WARN
    }

    export interface LoggerStreamInfo {
        type:LoggerStreamType;
        level:LoggerLevel;
        path?:String;
        period?:String;
        count?:Number;
        name?:String
    }

    export interface LoggerInfo {
        name: string;
        streamsInfo: Array<LoggerStreamInfo>;
    }

    export interface EnvLoggerInfo {
        development: LoggerInfo;
        test: LoggerInfo;
        production: LoggerInfo;
    }

    export interface LoggerConfig {
        config(loggerInfo:EnvLoggerInfo):void;
    }

}
