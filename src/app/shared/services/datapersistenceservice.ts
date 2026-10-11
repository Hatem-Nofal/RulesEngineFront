// import { Injectable } from "@angular/core";
// import { IDBPDatabase, openDB } from "idb";
// import { BehaviorSubject, Observable, from, map, tap } from "rxjs";
// import { PersistedData } from "../models/persisteddata";

// @Injectable({ providedIn: 'root' })
// export class DataPersistenceService<T> {
//   private dbPromise: Promise<IDBPDatabase<any>>;
//   private formState$ = new BehaviorSubject<PersistedData<T> | null>(null);
 
//   constructor() {
//     this.dbPromise = openDB('forms-db', 2, {   // bump version to 2
//         upgrade(db) {
//           if (!db.objectStoreNames.contains('forms')) {
//             db.createObjectStore('forms', { keyPath: 'id' });
//           }
//         },
//       });
//   }

  
//   saveState(state: PersistedData<T>): Observable<void> {
//     return from(this.dbPromise.then(db => db.put("forms", state))).pipe(
//       map(() => void 0),
//       tap(() => this.formState$.next(state))
//     );
//   }

//   loadState(id: string): Observable<PersistedData<T> | undefined> {
//     return from(this.dbPromise.then(db => db.get("forms", id))).pipe(
//       tap(state => { if (state) this.formState$.next(state); })
//     );
//   }

//   get state$(): Observable<PersistedData<T> | null> {
//     return this.formState$.asObservable();
//   }

//   removeState(id: string): Observable<void> {
//     return from(
//       this.dbPromise.then(db => db.delete('forms', id))
//     ).pipe(
//       map(() => void 0),
//       tap(() => {
//         // Optionally clear BehaviorSubject if this was the active state
//         const current = this.formState$.value;
//         if (current && current.id === id) {
//           this.formState$.next(null);
//         }
//       })
//     );
//   }
  
// }
