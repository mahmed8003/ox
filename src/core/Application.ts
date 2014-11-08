/// <reference path="../OX" />

module OX {

    export interface AppContext {
        root:string;
        env:string;
        port:number;
        dbConfig:DBConfig;
        db?:any;
        getModel(name:typeof Model): Model;
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
        private uRoutesConfig:IRoutesConfig;

        //
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

        public setDatabaseConfig(config:DatabaseConfig):void {
            this.uDatabaseConfig = config;
        }

        public setExpressConfig(config:ExpressConfig):void {
            this.uExpressConfig = config;
        }

        public setGlobalFiltersConfig(config:GlobalFiltersConfig):void {
            this.uGlobalFiltersConfig = config;
        }

        public setRoutesConfig(config:IRoutesConfig):void {
            this.uRoutesConfig = config;
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
            this.configDatabase();
            this.buildExpress();
            this.configExpress();
            this.configGlobalFilters();
            this.configRoutes();
            this.buildRoutes();

            this.express.listen(this.port);
            console.log('OX is running at port ' + this.port + ' in ' + this.env + ' environment');
        }

        public addModel(model:typeof Model):void {
            model.configure();
            this.models.push(model);
        }

        public getModel(model:typeof Model):Model {
            this.models.forEach((m) => {
                if (model == m) {
                    var modelObj:Model = new m();
                    modelObj.init(this);
                    return modelObj;
                }
            });
            return null;
        }


        private buildExpress() {
            var express = require('express');
            this.express = express();

            this.express.set('env', this.env);
            this.express.set('port', this.port);
            this.express.set('views', this.path.join(this.root, './application/views'));
            this.express.set('view engine', 'ejs');
            // Showing stack errors
            this.express.set('showStackError', true);

            var logger:any = require('morgan');
            // Environment dependent middleware
            if (this.env === 'development') {
                // Enable logger (morgan)
                this.express.use(logger('dev'));
                // Disable views cache
                this.express.set('view cache', false);
            } else if (this.env === 'production') {
                // Enable logger (morgan)
                this.express.use(logger('tiny'));
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
            this.express.use(express.static(this.path.join(this.root, './public')));
        }

        private buildRoutes() {
            return this.router.routes.forEach((route) => {

                var controller:typeof Controller = route.routeData.controller;
                if (!controller.isConfigured) {
                    controller.configure();
                    controller.isConfigured = true;
                    console.log('i am configured');
                }

                console.log(controller);


                var method:string = route.method;
                var action:string = route.routeData.action;
                var handlers:any = this.getRequestHandlersForAction(controller, action);

                var finalAction = function (req:Express.Request, res:Express.Response) {
                    var controllerObj = new controller();
                    controllerObj.init(this);
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

            var _:any = require('underscore');
            requestHandlers = _.flatten(requestHandlers);

            return requestHandlers;
        }
    }

    export interface RequestHandler {
        (req: Request, res: Response, next: Function): any;
    }
}
