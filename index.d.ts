
declare module 'liveconfig' {

    class EventEmitter {
        emit(event: string | symbol, ...args: any[]): boolean;
    }

    /**
     * Name list for emitted event:
     * 1. config.error
     * 2. config.updated
     * 3. config.allUpdated
     * 
     * Receive below event to stop config watching
     * 1. config.stop
     */

    export default function (configDir: string, eventEmitter?: EventEmitter): any
}