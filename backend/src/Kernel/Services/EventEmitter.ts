import EventEmitter from 'events';

/**
 *
 * Thanks from https://blog.makerx.com.au/a-type-safe-event-emitter-in-node-js/
 * For creating this elegant wrapper around events in typescript.
 * Now you simply define an interface at the top of your class/module containing
 * all events and their corresponding arguments/types.
 *
 * @example
 *   interface LoginEvents {
 *       'login': []
 *       'logout': [arg1: number, arg2: string]
 *   }
 *
 *   const emitter = new TypedEventEmitter<LoginEvents>();
 *   emitter.emit('logout', 3, 'bar');
 *   emitter.on('logout', async (arg1, arg2) => {
 *       console.log(arg1, arg2);
 *   });
 */
export class TypedEventEmitter<TEvents extends Record<string, any>> {
    private readonly emitter = new EventEmitter();

    emit<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        ...eventArg: TEvents[TEventName]
    ): void {
        this.emitter.emit(eventName, ...(eventArg as []));
    }

    on<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void | Promise<void>
    ): void {
        this.emitter.on(eventName, handler as any);
    }

    off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void | Promise<void>
    ): void {
        this.emitter.off(eventName, handler as any);
    }
}
