import { AuthService, EnvironmentService } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { ServerConnectSignalService } from '../serverconnect-signal.service';

@Injectable({
  providedIn: 'root', // Ensures this is a singleton service
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  hubUrl = ""
  constructor(private environment: EnvironmentService, private _AuthService: AuthService,
    private _signalService: ServerConnectSignalService) {
  }
  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected || this.hubConnection?.state === 'Connecting'
  }
  // Create and initialize the connection
  async connect(): Promise<void> {
    this.hubUrl = this.environment.getEnvironment().apis.default.url + '/signalr'

    if (this.hubConnection && (this.hubConnection.state === HubConnectionState.Connected || this.hubConnection?.state === 'Connecting')) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl, {
      accessTokenFactory: () => this._AuthService.getAccessToken(),
    }).withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        // Retry after 5 seconds, for example
        return 5000;
      }
    }).build();

    // Registering connection events


    this.hubConnection.onreconnecting((error) => {
      if (error) {
        this._signalService.onServerConnect(false)
      } else {
        this._signalService.onServerConnect(true)
      }
    });

    this.hubConnection.onreconnected((connectionId) => {
      this._signalService.onServerConnect(true)
    });

    this.hubConnection.onclose((error) => {
      this._signalService.onServerConnect(false)
    });
    try {
      await this.hubConnection.start();

    } catch (err) {

    }
  }

  // Disconnect the connection
  async disconnect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
      await this.hubConnection.stop();
    }
  }

  // Generic on<T>
  on<T>(eventName: string, callback: (data: T) => void): void {
    this.hubConnection?.on(eventName, callback);
  }

  // Generic off<T>
  off<T>(eventName: string): void {
    this.hubConnection?.off(eventName);
  }

  // Generic invoke<T>
  async invoke<T>(methodName: string, ...args: any[]): Promise<T | void> {
    if (this.hubConnection?.state === HubConnectionState.Connected || this.hubConnection?.state === 'Connecting') {
      try {
        return await this.hubConnection.invoke<T>(methodName, ...args);
      } catch (err) {
        console.error(`Error invoking method ${methodName}`, err);
      }
    } else {
      console.warn(`Cannot invoke method ${methodName}, SignalR not connected`);
    }
  }
  // Reconnect logic for page reloads
  public async reconnectIfNeeded(): Promise<void> {
    this.hubUrl = this.environment.getEnvironment().apis.default.url + '/signalr'

    if (this.hubUrl && (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected || this.hubConnection?.state.toString() !== 'Connecting')) {
      await this.connect();
    }
  }
}
