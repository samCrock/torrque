import { Component, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { TorrentService } from './services/torrent.service';
import { Observable } from 'rxjs';

export interface Torrent {
  name: string;
  seeds: number;
  magnetURI: string;
  verified: boolean;
}

export interface CacheInterface {
  searchString?: string;
  results?: Torrent[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  loading = false;
  noResults = false;
  searchResults: Observable<object>;
  syncResults: Torrent[] = [];
  searchString = '';
  cache: CacheInterface;

  constructor(private torrentService: TorrentService, private cdRef: ChangeDetectorRef) { }


  ngOnInit() {
    this.torrentService.genericResult$.subscribe(items => {
      console.log('Results', items);
      if (items.length === 0) { this.noResults = true; }
    });
    if (!sessionStorage.getItem('torrque_cache')) {
      this.cache = {};
    } else {
      this.cache = JSON.parse(sessionStorage.getItem('torrque_cache'));
      console.log('Cache ->', typeof this.cache, this.cache);
      this.searchString = this.cache.searchString;
      this.syncResults = this.cache.results;
      this.cdRef.detectChanges();
    }

  }

  search() {
    if (this.searchString === '') {
      sessionStorage.removeItem('torrque_cache');
      this.syncResults = [];
      return;
    }

    this.cache.searchString = this.searchString;
    this.loading = true;
    this.noResults = false;
    this.syncResults = [];

    this.torrentService.search(this.searchString)
      .subscribe((result?: Torrent) => {
        console.log('result', result);
        this.syncResults.push(result);
        this.syncResults.sort((a: any, b: any) => {
          if (+a.seeds > +b.seeds) { return - 1; } else if (+a.seeds < +b.seeds) { return 1; } else { return 0; }
        });
        console.log('syncResults', this.syncResults);
        this.cache.results = this.syncResults;
        sessionStorage.setItem('torrque_cache', JSON.stringify(this.cache));
        this.loading = false;
        this.cdRef.detectChanges();
      }, () => {
        console.log('no results');
        sessionStorage.removeItem('torrque_cache');
        this.syncResults = [];
        this.loading = false;
        this.noResults = true;
        this.cdRef.detectChanges();
      });
  }

  openMagnet(magnet) {
    console.log(magnet);
    window.open(magnet);
  }


}
