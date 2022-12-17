import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NgWaveformService {

  constructor(private http: HttpClient) { }

  /**
   * Fetches Blod from Url
   * @param srcUrl Audio Blob Url
   */
  loadTrack(srcUrl: string) {
    return this.http.get(srcUrl, {responseType: 'arraybuffer'});
  }

  /**
   * Removes unnecessary nodes according to widget width
   * @param data audio buffer
   * @param length number of neccessary nodes
   */
  filterRaw(data: Float32Array, length: number): Float32Array {
    const blockSize = Math.floor(data.length / length);
    const result: number[] = [];
    for (let i = 0; i < length; i++) {
      const sample = data.slice(blockSize * i, blockSize * i + blockSize);
      const avg = sample.reduce((prev, curr) => Math.abs(prev) + Math.abs(curr), 0) / sample.length;
      result.push(avg);
    }
    return this.normalize(new Float32Array(result));
  }

  /**
   * Normalizes data to 1
   * @param data audio buffer
   */
  normalize(data: Float32Array): Float32Array {
    const multiplier = Math.pow(Math.max(...data), -1);
    return data.map(item => item * multiplier);
  }
}
