//================================================================================
//
// Copyright: M.Nelson - technische Informatik
// Die Software darf unter den Bedingungen 
// der APGL ( Affero Gnu Public Licence ) genutzt werden
//
// datei: js/basic/mutex.mjs
//================================================================================
class MneMutex {

    constructor() {
        this._locking = Promise.resolve();
        this._locks = 0;
    }

    isLocked() {
        return this._locks > 0;
    }

    async lock() {
        this._locks += 1;
        let unlockNext;
        let willLock = new Promise(resolve => unlockNext = () => {
            this._locks -= 1;
            resolve();
        });

        let willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}

export default MneMutex;
