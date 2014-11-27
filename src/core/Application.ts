/// <reference path="../OX" />

module OX {

    export interface AppContext {
        root:string;
        env:string;
        port:number;
        dbConfig:DBConfig;
        db?:any;
        getModel(name:typeof Model): typeof Model;
    }

    export class Application implements AppContext {

        // app config
        root:string;
        env:string;
        port:number;
        dbConfig:DBConfig;
        db:any;

        //private stuff
        private router:Router;
        private models:Array<typeof Model>;
        private controllers:Array<typeof Controller>;
        private globalFiltersTypes:Array<typeof ActionFilter>;
        private express;

        // u = User configurations
        private uDatabaseConfig:DatabaseConfig;
        private uExpressConfig:ExpressConfig;
        private uGlobalFiltersConfig:GlobalFiltersConfig;
        private uRoutesConfig:RoutesConfig;
        private uLoggerConfig:LoggerConfig;

        //
        private _:any = require('underscore');
        private path:any = require('path');

        constructor(root:string, env:string, port:number) {
            this.root = root;
            this.env = env;
            this.port = port;

            this.router = new OX.Router();
            this.models = [];
            this.controllers = [];
            this.globalFiltersTypes = [];
        }

        public setLoggerConfig(config:LoggerConfig):void {
            this.uLoggerConfig = config;
        }

        public setDatabaseConfig(config:DatabaseConfig):void {
            this.uDatabaseConfig = config;
        }

        public setExpressConfig(config:ExpressConfig):void {
            this.uExpressConfig = config;
        }

        public setGlobalFiltersConfig(config:GlobalFiltersConfig):void {
            this.uGlobalFiltersConfig = config;
        }

        public setRoutesConfig(config:RoutesConfig):void {
            this.uRoutesConfig = config;
        }

        private configLogger():void {
            var cfg = {
                development: null,
                test: null,
                production: null
            };
            this.uLoggerConfig.config(cfg);

            var loggerInfo:LoggerInfo = cfg[this.env];
            var logger = new BunyanLogger();
            logger.createLogger(loggerInfo);
        }

        private configDatabase():void {
            var cfg = {
                development: null,
                test: null,
                production: null
            };
            var needToConnect:boolean = this.uDatabaseConfig.config(cfg);
            this.dbConfig = cfg[this.env];
            if (needToConnect) {
                this.db = this.uDatabaseConfig.connect(this.dbConfig);
            }
        }

        private configModels():void {
            this.models.forEach((m) => {
                m.configure();
            });
        }

        private configExpress():void {
            this.uExpressConfig.config(this.express);
        }

        private configGlobalFilters():void {
            this.uGlobalFiltersConfig.config(this.globalFiltersTypes);
        }

        private configRoutes():void {
            this.uRoutesConfig.config(this.router);
        }

        public giddup() {
            this.configLogger();
            this.configDatabase();
            this.configModels();
            this.buildExpress();
            this.configExpress();
            this.configGlobalFilters();
            this.configRoutes();
            this.buildRoutes();

            var self = this;
            var http:any = require('http');
            http.createServer(this.express).listen(this.port, function() {
                Log.info('OX is running at port ' + self.port + ' in ' + self.env + ' environment');
            });
        }

        public addModel(model:typeof Model):void {
            this.models.push(model);
        }

        public getModel(model:typeof Model):typeof Model {
            var modelClass = this._.find(this.models, function(m){ return m == model});
            return modelClass;
        }

        private buildExpress() {
            var bunyan:any = require('bunyan');
            var express = require('express');
            this.express = express();

            this.express.set('env', this.env);
            this.express.set('port', this.port);
            this.express.set('views', this.path.join(this.root, '../application/views'));
            this.express.set('view engine', 'ejs');
            // Showing stack errors
            this.express.set('showStackError', true);

            this.express.use(function(req, res, next){
                var modelCacheMgr = new ModelCacheManager(this);
                req._modelCacheMgr = modelCacheMgr;
                next();
            });

            this.express.use(function(req, res, next){
                Log.info({ req: bunyan.stdSerializers.req(req) }, 'start');
                next();
            });


            // Environment dependent middleware
            if (this.env === 'development') {
                // Disable views cache
                this.express.set('view cache', false);
            } else if (this.env === 'production') {
                // Enable views cache
                this.express.locals.cache = 'memory';
            }

            var bodyParser:any = require('body-parser');
            var methodOverride:any = require('method-override');
            // Request body parsing middleware should be above methodOverride
            this.express.use(bodyParser.urlencoded({
                extended: true
            }));
            this.express.use(bodyParser.json());
            this.express.use(methodOverride());
            // Enable jsonp
            this.express.enable('jsonp callback');
            // CookieParser should be above session
            var cookieParser:any = require('cookie-parser');
            this.express.use(cookieParser());
            // connect flash for flash messages
            var flash:any = require('connect-flash');
            this.express.use(flash());
            // Use helmet to secure Express headers
            var helmet:any = require('helmet');
            this.express.use(helmet.xframe());
            this.express.use(helmet.xssFilter());
            this.express.use(helmet.nosniff());
            this.express.use(helmet.ienoopen());
            this.express.disable('x-powered-by');
            // Should be placed before express.static
            var compress:any = require('compression');
            this.express.use(compress());
            // Setting the this.express router and static folder
            var favicon:any = require('serve-favicon');
            this.express.use(favicon(this.path.join(this.root, '../public/images/favicon.ico')));
            this.express.use(express.static(this.path.join(this.root, '../public')));
        }

        private buildRoutes() {
            return this.router.routes.forEach((route) => {

                var controller:typeof Controller = route.routeData.controller;
                if (!controller.isConfigured) {
                    controller.configure();
                    controller.isConfigured = true;

                }


                var method:string = route.method;
                var action:string = route.routeData.action;
                var handlers:any = this.getRequestHandlersForAction(controller, action);

                var finalAction = function (req, res) {
                    var controllerObj = new controller();
                    controllerObj.init(this, req._modelCacheMgr);
                    controllerObj[action](req, res);
                }

                if (method == 'GET') {
                    this.express.get(route.path, handlers, finalAction);
                } else if (method == 'POST') {
                    this.express.post(route.path, handlers, finalAction);
                } else if (method == 'PUT') {
                    this.express.put(route.path, handlers, finalAction);
                } else if (method == 'DELETE') {
                    this.express.delete(route.path, handlers, finalAction);
                }
            });
        }

        private getFilterTypesForAction(controller:typeof Controller, action:string):Array<typeof ActionFilter> {
            var filterTypes:Array<typeof ActionFilter> = [];
            controller.filtersInfo.forEach((info) => {
                if (info.contains(action)) {
                    filterTypes.push(info.filterType);
                }
            });
            return filterTypes;
        }


        private getRequestHandlersForFilterType(filterType:typeof ActionFilter):RequestHandler {

            var requestHandler = function (req:Request, res:Response, next:any) {
                var ctx = {
                    request: req,
                    response: res,
                    next: next
                };
                // create object of filter type and call before function
                var filterObj = new filterType();
                var treq:any = req; // just fooling the editor, otherwise it starts to highlight _modelCacheMgr
                filterObj.init(this, treq._modelCacheMgr);
                filterObj.before(ctx);

                var onFinished:any = require('on-finished');
                onFinished(res, function (err) {
                    var ctx = {
                        request: req,
                        response: res,
                        next: null
                    };
                    filterObj.after(ctx);
                });
            };
            return requestHandler;
        }

        private getRequestHandlersForFilterTypes(filterTypes:Array<typeof ActionFilter>):RequestHandler[] {
            var requestHandlers:RequestHandler[] = [];
            filterTypes.forEach((filterType) => {
                var reqHand = this.getRequestHandlersForFilterType(filterType);
                requestHandlers.push(reqHand);
            });
            return requestHandlers;
        }

        private getRequestHandlersForAction(controller:typeof Controller, action:string):RequestHandler[] {
            var requestHandlers:RequestHandler[] = [];
            var t = this.getRequestHandlersForFilterTypes(this.globalFiltersTypes);//this.getRequestHandlersForFilters(this.globalFilters);
            requestHandlers = requestHandlers.concat(t);

            var filterTypes = this.getFilterTypesForAction(controller, action);
            t = this.getRequestHandlersForFilterTypes(filterTypes);
            requestHandlers.concat(t);


            requestHandlers = this._.flatten(requestHandlers);

            return requestHandlers;
        }
    }

    export interface RequestHandler {
        (req: Request, res: Response, next: Function): any;
    }
}
