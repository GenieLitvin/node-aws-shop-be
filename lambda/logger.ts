export class Logger{
    static log(event:any){
        console.log({
            path: event.path,
            method:event.httpMethod,
            header:event.headers,
            body:event.body
        })
    }
}