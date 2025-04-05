import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { defer } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  private _client!: OpenAI;
  constructor() {
    this.createOpenAIClient();
  }
  private createOpenAIClient() {
    this._client = new OpenAI({
      apiKey: environment.OPEN_AI_SECRET_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  create(instructions: string, input: string) {
    return defer(() =>
      this._client.responses.create({
        model: 'gpt-4o-mini',
        instructions: instructions,
        input: input,
      })
    );
  }
}
