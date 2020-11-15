import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root'})
export class EventService {

  getEventById(eventId: string): Observable<Event>{

    //TODO find user by id
    return of({url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', duration: 60 });
  }
}

export interface Event {
  url: string,
  duration: number;
}
