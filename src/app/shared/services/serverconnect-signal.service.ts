import { Injectable, signal } from "@angular/core";

@Injectable()
export class ServerConnectSignalService {
  private _serverConnect = signal<boolean>(true);

  constructor() { }

  public ServerConnect = this._serverConnect.asReadonly();

  public onServerConnect(isConnected): void {
    this._serverConnect.set(isConnected)
  }

  public onDesServerConnect(isConnected): void {
    this._serverConnect.set(isConnected)
  }
}
