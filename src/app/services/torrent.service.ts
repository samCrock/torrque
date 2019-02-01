
import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import * as cheerio from 'cheerio';
import { environment } from '../../environments/environment';

@Injectable()
export class TorrentService {
  baseUrl = environment.production ? 'https://thepiratebay10.org/search/' : 'http://localhost:1337/https://thepiratebay10.org/search/';
  public genericResult$: EventEmitter<any>;

  constructor(private http: HttpClient) {
    this.genericResult$ = new EventEmitter();
  }

  search(searchString: string): Observable<Object> {
    // let result = {};
    return this.searchGeneric(searchString)
      .pipe(
        switchMap((genericResult) => {
          console.log('genericResult', genericResult);
          return genericResult;
        }));
  }

  searchGeneric(searchString: string): Observable<Object[]> {
    return this.http.get(this.baseUrl + '/s/?q=' + searchString + '&page=0&orderby=99', { responseType: 'text' })
      .pipe(
        map(response => {
          const $ = cheerio.load(response, { _useHtmlParser2: true });
          const result = [];
          const results = $('#main-content tr');
          for (let i = 1; i < results.length && i < 6; i++) {
            const name = results[i].children[3].children[1].children[1].children[0].data;
            const link = results[i].children[3].children[3].attribs.href;
            const seeds = results[i].children[5].children[0].data;
            const verified = results[i].children[3].children.length === 9;

            result.push({
              name,
              seeds,
              link,
              verified
            });
          }
          return result;
        }, error => {
          return observableThrowError(error || 'Server error');
        }));
  }


}
