import { PluginInstancePipe } from './plugin-instance.pipe';
import { AuthenticationService } from '../services/authentication.service'
import { inject } from '@angular/core/testing';

describe('PluginInstancePipe', () => {
  it('create an instance', inject([AuthenticationService], (authService: AuthenticationService) => {
    const pipe = new PluginInstancePipe(authService);
    expect(pipe).toBeTruthy();
  }));
});
