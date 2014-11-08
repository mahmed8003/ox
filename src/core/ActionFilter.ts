/// <reference path="../OX" />

module OX {

    export interface AFContext {
        request: Request;
        response: Response;
        next: () => void;
    }

    export class ActionFilter {
        before(context:AFContext): void {
            context.next();
        }
        after(context:AFContext): void {

        }
    }

}
