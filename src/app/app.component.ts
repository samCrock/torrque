import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
export class AppComponent implements AfterViewInit {

  loading = false;
  noResults = false;
  searchResults: Observable<object>;
  syncResults: Torrent[] = [];
  searchString;
  cache: CacheInterface;


  constructor(private torrentService: TorrentService, private cdRef: ChangeDetectorRef) { }


  ngAfterViewInit() {
    this.torrentService.genericResult$.subscribe(items => {
      console.log('Results', items);
      if (items.length === 0) { this.noResults = true; }
    });
    if (!localStorage.getItem('cache')) {
      this.cache = {};
    } else {
      this.cache = JSON.parse(localStorage.getItem('cache'));
      console.log('Cache ->', typeof this.cache, this.cache);
      this.searchString = this.cache.searchString;
      this.syncResults = this.cache.results;
      this.cdRef.detectChanges();
    }
  }

  search() {
    if (this.searchString.length === 0) {
      localStorage.removeItem('cache');
      this.syncResults = [];
      return;
    }

    this.cache.searchString = this.searchString;
    this.loading = true;
    this.noResults = false;
    this.searchResults = this.torrentService.search(this.searchString);
    this.syncResults = [];

    this.searchResults.subscribe((result: Torrent) => {
      this.syncResults.push(result);
      this.syncResults.sort((a: any, b: any) => {
        if (+a.seeds > +b.seeds) { return - 1; } else if (+a.seeds < +b.seeds) { return 1; } else { return 0; }
      });
      // console.log('syncResults', this.syncResults);
      this.cache.results = this.syncResults;
      localStorage.setItem('cache', JSON.stringify(this.cache));
      this.loading = false;
      this.cdRef.detectChanges();
    });
  }

  openMagnet(magnet) {
    console.log(magnet);
    const magnetTab = window.open(magnet);
  }


}
