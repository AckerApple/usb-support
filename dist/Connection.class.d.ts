import { Subject, Subscription } from 'rxjs';
export declare class Connection {
    retryInterval: number;
    $connect: Subject<void>;
    $connected: Subject<void>;
    $down: Subject<Error>;
    $closed: Subject<void>;
    $failed: Subject<void>;
    subs: Subscription;
    private restartProcessId;
    constructor();
    close(): void;
    connect(): void;
}
